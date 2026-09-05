/**
 * app/api/v1/wards/[ward_no]/route.ts
 * =====================================
 * GET /api/v1/wards/47 → full data for ward 47 including all promises
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, rateLimitHeaders, errorResponse } from '@/lib/api-auth'
import { getWard, getCacheMeta } from '@/lib/ward-cache'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ ward_no: string }> }
) {
    const { ward_no } = await params
    const wardNo = parseInt(ward_no)

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

    // ── 2. Parse and validate ward number ─────────────────────────────────────

    if (isNaN(wardNo) || wardNo < 1 || wardNo > 227) {
        return NextResponse.json(
            errorResponse('INVALID_KEY', 'Ward number must be between 1 and 227.'),
            { status: 400, headers: rateLimitHeaders(auth.key) }
        )
    }

    // ── 3. Read from cache ────────────────────────────────────────────────────
    const ward = getWard(wardNo)

    if (!ward) {
        return NextResponse.json(
            errorResponse('INVALID_KEY', `No data found for ward ${wardNo}.`),
            { status: 404, headers: rateLimitHeaders(auth.key) }
        )
    }

    const meta = getCacheMeta()

    // ── 4. Return full ward data including all promises ───────────────────────
    return NextResponse.json(
        {
            success: true,
            meta: {
                data_updated: meta.generated_at,
                api_version: 'v1',
            },
            data: {
                ward_number: ward.ward_number,
                ward_name: ward.ward_name,
                is_women_reserved: ward.is_women_reserved,
                winner: {
                    name: ward.winner.name,
                    party: ward.winner.party,
                    symbol: ward.winner.symbol,
                    votes: ward.winner.votes,
                    education: ward.winner.education,
                    pending_cases: ward.winner.pending_cases,
                    closed_cases: ward.winner.closed_cases,
                },
                promises: ward.promises.map(p => ({
                    id: p.id,
                    text: p.text,
                    category: p.category,
                    upvotes: p.upvotes,
                    created_at: p.created_at,
                })),
            },
        },
        {
            status: 200,
            headers: rateLimitHeaders(auth.key),
        }
    )
}