import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    try {
        const { candidateId } = await params;
        const admin = createAdminClient()

        if (!candidateId) {
            return NextResponse.json(
                { error: 'No valid candidate_id found' },
                { status: 400 }
            )
        }

        const { data: ratingsResponse, error: error } = await admin
            .from('candidate_ratings')
            .select('rating, review_text, status, created_at')
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Rating status query error:', error);
            return NextResponse.json(
                { error: 'Failed to check rating status' },
                { status: 500 }
            )
        }

        // if no error, return the response
        return NextResponse.json(ratingsResponse, { status: 200 })
    }
    catch (err) {
        console.error('Unexpected error in GET', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}