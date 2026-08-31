/**
 * app/api/v1/winners/route.ts
 * ============================
 * GET /api/v1/winners              → all 227 winners (lighter payload)
 * GET /api/v1/winners?party=BJP    → filter by party
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, rateLimitHeaders, errorResponse } from '@/lib/api-auth'
import { getAllWinners, getAllWards, getCacheMeta } from '@/lib/ward-cache'

export async function GET(request: NextRequest) {

    // ── 1. Validate API key ───────────────────────────────────────────────────
    const auth = await validateApiKey(request)

    if (!auth.success) {
        const status =
            auth.error === 'MISSING_KEY' ? 401 :
                auth.error === 'INVALID_KEY' ? 401 :
                    auth.error === 'KEY_DISABLED' ? 403 :
                        auth.error === 'RATE_LIMIT_EXCEEDED' ? 429 : 500

        return NextResponse.json(
            errorResponse(auth.error, auth.message, auth.reset_at ? { reset_at: auth.reset_at } : {}),
            { status }
        )
    }

    // ── 2. Read query params ──────────────────────────────────────────────────
    const { searchParams } = new URL(request.url)
    const partyFilter = searchParams.get('party') || undefined

    // ── 3. Read from cache ────────────────────────────────────────────────────
    let winners = getAllWinners()
    const meta = getCacheMeta()

    // Apply party filter if provided
    if (partyFilter) {
        const p = partyFilter.toLowerCase()
        winners = winners.filter(w => w.party.toLowerCase().includes(p))
    }

    // ── 4. Return response ────────────────────────────────────────────────────
    return NextResponse.json(
        {
            success: true,
            meta: {
                total: winners.length,
                data_updated: meta.generated_at,
                api_version: 'v1',
            },
            data: winners.map(w => ({
                ward_number: w.ward_number,
                ward_name: w.ward_name,
                name: w.name,
                party: w.party,
                votes: w.votes,
            })),
        },
        {
            status: 200,
            headers: rateLimitHeaders(auth.key),
        }
    )
}