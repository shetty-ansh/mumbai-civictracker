import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  try {
    // --- Authenticate via cookie-based session ---
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to check rating status' },
        { status: 401 }
      )
    }

    // --- Validate query param ---
    const candidateId = request.nextUrl.searchParams.get('candidate_id')

    if (!candidateId || !UUID_RE.test(candidateId)) {
      return NextResponse.json(
        { error: 'candidate_id query parameter must be a valid UUID' },
        { status: 400 }
      )
    }

    // --- Query via service role client ---
    const admin = createAdminClient()

    const { data: existing, error: queryError } = await admin
      .from('candidate_ratings')
      .select('rating, review_text, status, created_at')
      .eq('candidate_id', candidateId)
      .eq('user_identifier', user.id)
      .maybeSingle()

    if (queryError) {
      console.error('Rating status query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to check rating status' },
        { status: 500 }
      )
    }

    if (!existing) {
      return NextResponse.json({ hasRated: false })
    }

    return NextResponse.json({
      hasRated: true,
      rating: existing.rating,
      review_text: existing.review_text,
      status: existing.status,
      created_at: existing.created_at,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/ratings/status:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
