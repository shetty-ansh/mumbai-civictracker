import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function generateKey(): { raw: string; hash: string; prefix: string } {
    const random = randomBytes(24).toString('hex')
    const raw = `mct_${random}`
    const hash = createHash('sha256').update(raw).digest('hex')
    const prefix = raw.slice(0, 12)  // first 12 chars for display e.g. mct_a7f3b9
    return { raw, hash, prefix }
}

export async function POST(request: NextRequest) {
    try {
        const { email, name, use_case } = await request.json()

        // Basic validation
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, error: 'A valid email address is required.' },
                { status: 400 }
            )
        }

        if (!use_case || use_case.trim().length < 10) {
            return NextResponse.json(
                { success: false, error: 'Please describe your use case (minimum 10 characters).' },
                { status: 400 }
            )
        }

        const supabase = getSupabase()

        // Check if this email already has a key
        const { data: existing } = await supabase
            .from('api_keys')
            .select('id, key_prefix, created_at')
            .eq('email', email.toLowerCase().trim())
            .single()

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'An API key already exists for this email.',
                    hint: `Your key starts with: ${existing.key_prefix}...`
                },
                { status: 409 }
            )
        }

        // Generate the key
        const { raw, hash, prefix } = generateKey()

        // Store in database — only the hash, never the raw key
        const { error: insertError } = await supabase
            .from('api_keys')
            .insert({
                key_hash: hash,
                key_prefix: prefix,
                email: email.toLowerCase().trim(),
                name: name?.trim() || null,
                use_case: use_case.trim(),
            })

        if (insertError) {
            console.error('[keys] Insert error:', insertError)
            return NextResponse.json(
                { success: false, error: 'Failed to generate key. Please try again.' },
                { status: 500 }
            )
        }

        // Return the raw key — this is the ONLY time it will ever be shown
        return NextResponse.json({
            success: true,
            message: 'API key generated successfully. Save this key — it will not be shown again.',
            key: raw,
            limits: {
                daily_requests: 1000,
                plan: 'free',
            },
            endpoints: {
                all_wards: 'GET /api/open/wards',
                ward_detail: 'GET /api/open/wards/:ward_no',
                all_winners: 'GET /api/open/winners',
            }
        })

    } catch (err) {
        console.error('[keys] Unexpected error:', err)
        return NextResponse.json(
            { success: false, error: 'Something went wrong. Please try again.' },
            { status: 500 }
        )
    }
}