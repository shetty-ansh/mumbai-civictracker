import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// UUID v4 format check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    // --- Authenticate via cookie-based session ---
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to rate a candidate' },
        { status: 401 }
      )
    }

    // --- Parse & validate body ---
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { candidate_id, rating, review_text } = body as {
      candidate_id?: string
      rating?: number
      review_text?: string
    }

    if (!candidate_id || !UUID_RE.test(candidate_id)) {
      return NextResponse.json(
        { error: 'candidate_id must be a valid UUID' },
        { status: 400 }
      )
    }

    if (rating == null || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    if (review_text !== undefined && review_text !== null) {
      if (typeof review_text !== 'string') {
        return NextResponse.json(
          { error: 'review_text must be a string' },
          { status: 400 }
        )
      }
      if (review_text.length > 1000) {
        return NextResponse.json(
          { error: 'review_text must be 1000 characters or fewer' },
          { status: 400 }
        )
      }
    }

    // --- Use service role client for all DB operations ---
    const admin = createAdminClient()

    // Verify candidate exists
    const { data: candidate, error: candidateError } = await admin
      .from('bmc_candidates')
      .select('id')
      .eq('id', candidate_id)
      .single()

    if (candidateError || !candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    // Insert rating — status defaults to 'quarantined' via DB default
    const { data: inserted, error: insertError } = await admin
      .from('candidate_ratings')
      .insert({
        candidate_id,
        user_identifier: user.id,
        rating,
        review_text: review_text?.trim() || null,
        is_verified: true,
      })
      .select('id, rating, status, created_at')
      .single()

    if (insertError) {
      // Unique constraint violation — user already rated this candidate
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: "You've already rated this candidate" },
          { status: 409 }
        )
      }
      console.error('Rating insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit rating' },
        { status: 500 }
      )
    }

    return NextResponse.json(inserted, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/ratings:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
