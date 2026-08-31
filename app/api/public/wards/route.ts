/**
 * app/api/v1/wards/route.ts
 * ==========================
 * GET /api/v1/wards               → all 227 wards
 * GET /api/v1/wards?party=BJP     → filter by party
 * GET /api/v1/wards?women=true    → filter by women reserved
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, rateLimitHeaders, errorResponse } from '@/lib/api-auth'
import { getAllWards, getCacheMeta } from '@/lib/ward-cache'

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
    const womenFilter = searchParams.get('women')

    // ── 3. Read from cache and apply filters ──────────────────────────────────
    const wards = getAllWards({
        party: partyFilter,
        is_women_reserved: womenFilter === 'true' ? true
            : womenFilter === 'false' ? false
                : undefined,
    })

    const meta = getCacheMeta()

    // ── 4. Return response ────────────────────────────────────────────────────
    return NextResponse.json(
        {
            success: true,
            meta: {
                total: wards.length,
                data_updated: meta.generated_at,
                api_version: 'v1',
            },
            data: wards.map(w => ({
                ward_number: w.ward_number,
                ward_name: w.ward_name,
                is_women_reserved: w.is_women_reserved,
                winner: {
                    name: w.winner.name,
                    party: w.winner.party,
                    votes: w.winner.votes,
                    education: w.winner.education,
                    pending_cases: w.winner.pending_cases,
                },
                promises_count: w.promises.length,
            })),
        },
        {
            status: 200,
            headers: rateLimitHeaders(auth.key),
        }
    )
}