/**
 * lib/api-auth.ts
 * ================
 * Validates API keys on every public API request.
 * Handles rate limiting, daily resets, and usage tracking.
 * Import validateApiKey() in every /api/v1/ route.
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest } from 'next/server'

// ─── Supabase client (server-side only) ──────────────────────────────────────

// Use service role key here — this runs server-side only, never in the browser
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiKeyRecord {
    id: string
    email: string
    plan: string
    daily_limit: number
    daily_count: number
    total_count: number
}

export type AuthError =
    | 'MISSING_KEY'
    | 'INVALID_KEY'
    | 'KEY_DISABLED'
    | 'RATE_LIMIT_EXCEEDED'
    | 'SERVER_ERROR'

export type AuthResult =
    | { success: true; key: ApiKeyRecord }
    | { success: false; error: AuthError; message: string; reset_at?: string }

// ─── Key hashing ──────────────────────────────────────────────────────────────

/**
 * Hash the raw API key using SHA-256.
 * The hash is what gets stored in the database — never the plain key.
 */
export function hashKey(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex')
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Extract the raw API key from the Authorization header.
 * Expects: "Authorization: Bearer mct_live_abc123"
 */
function extractKey(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null

    return parts[1].trim() || null
}

/**
 * Check if the daily count needs resetting (24 hours have passed).
 */
function shouldReset(lastReset: string): boolean {
    const last = new Date(lastReset).getTime()
    const now = Date.now()
    const hours = (now - last) / (1000 * 60 * 60)
    return hours >= 24
}

/**
 * Get the next reset time (midnight UTC or 24h from last reset).
 */
function getResetAt(lastReset: string): string {
    const last = new Date(lastReset)
    const resetAt = new Date(last.getTime() + 24 * 60 * 60 * 1000)
    return resetAt.toISOString()
}

/**
 * Main validation function — call this at the top of every /api/v1/ route.
 *
 * What it does:
 * 1. Reads the Authorization header
 * 2. Hashes the key and looks it up in the database
 * 3. Checks if the key is active
 * 4. Resets daily count if 24h have passed (lazy reset)
 * 5. Checks if rate limit is exceeded
 * 6. Increments usage counters
 * 7. Returns success or a typed error
 */
export async function validateApiKey(request: NextRequest): Promise<AuthResult> {
    // 1. Extract key from header
    const rawKey = extractKey(request)

    if (!rawKey) {
        return {
            success: false,
            error: 'MISSING_KEY',
            message: 'Missing Authorization header. Include your API key as: Authorization: Bearer <your_key>',
        }
    }

    // Basic format check — must start with "mct_"
    if (!rawKey.startsWith('mct_')) {
        return {
            success: false,
            error: 'INVALID_KEY',
            message: 'Invalid API key format.',
        }
    }

    try {
        const supabase = getSupabase()
        const keyHash = hashKey(rawKey)

        // 2. Look up the key in the database
        const { data: keyRecord, error: lookupError } = await supabase
            .from('api_keys')
            .select('id, email, plan, daily_limit, daily_count, total_count, last_reset, is_active')
            .eq('key_hash', keyHash)
            .single()

        if (lookupError || !keyRecord) {
            return {
                success: false,
                error: 'INVALID_KEY',
                message: 'Invalid API key.',
            }
        }

        // 3. Check if the key is active
        if (!keyRecord.is_active) {
            return {
                success: false,
                error: 'KEY_DISABLED',
                message: 'This API key has been disabled. Contact support@mumbaitracker.in.',
            }
        }

        // 4. Lazy reset — if 24 hours have passed, reset daily count
        let currentDailyCount = keyRecord.daily_count

        if (shouldReset(keyRecord.last_reset)) {
            const { error: resetError } = await supabase
                .from('api_keys')
                .update({ daily_count: 0, last_reset: new Date().toISOString() })
                .eq('id', keyRecord.id)

            if (!resetError) {
                currentDailyCount = 0
            }
        }

        // 5. Check rate limit
        if (currentDailyCount >= keyRecord.daily_limit) {
            return {
                success: false,
                error: 'RATE_LIMIT_EXCEEDED',
                message: `Daily limit of ${keyRecord.daily_limit} requests exceeded.`,
                reset_at: getResetAt(keyRecord.last_reset),
            }
        }

        // 6. Increment usage counters
        await supabase
            .from('api_keys')
            .update({
                daily_count: currentDailyCount + 1,
                total_count: keyRecord.total_count + 1,
            })
            .eq('id', keyRecord.id)

        // 7. Return success with key info
        return {
            success: true,
            key: {
                id: keyRecord.id,
                email: keyRecord.email,
                plan: keyRecord.plan,
                daily_limit: keyRecord.daily_limit,
                daily_count: currentDailyCount + 1,
                total_count: keyRecord.total_count + 1,
            },
        }

    } catch (err) {
        console.error('[api-auth] Unexpected error:', err)
        return {
            success: false,
            error: 'SERVER_ERROR',
            message: 'Internal server error. Please try again.',
        }
    }
}

// ─── Response helpers ─────────────────────────────────────────────────────────

/**
 * Build rate limit headers to include in every API response.
 * Follows the standard X-RateLimit-* convention used by GitHub, Stripe etc.
 */
export function rateLimitHeaders(key: ApiKeyRecord): Record<string, string> {
    return {
        'X-RateLimit-Limit': String(key.daily_limit),
        'X-RateLimit-Remaining': String(Math.max(0, key.daily_limit - key.daily_count)),
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 86400),
        'X-API-Version': 'v1',
    }
}

/**
 * Standard error response body shape.
 */
export function errorResponse(error: AuthError, message: string, extra?: object) {
    return {
        success: false,
        error: {
            code: error,
            message,
            ...extra,
        },
    }
}