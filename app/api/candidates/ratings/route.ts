import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
    request: NextRequest,
) {
    try {
        const admin = createAdminClient()

        const { data, error } = await admin
            .from("bmc_candidates")
            .select(`
                    id,
                    ward_no,
                    candidate_name,
                    rating_avg,
                    rating_count,
                    candidate_ratings (
                        rating,
                        review_text,
                        created_at,
                        status
                    )
                `)
            .eq("winnner", true)
            .eq("candidate_ratings.status", "published")
            .order("rating_avg", { ascending: false })
            .order("rating_count", { ascending: false })
            .order("candidate_name", { ascending: true });

        if (error) {
            console.error('Rating status query error:', error);
            return NextResponse.json(
                { error: 'Failed to check rating status' },
                { status: 500 }
            )
        }

        // if no error, return the response
        return NextResponse.json(data, { status: 200 })
    }
    catch (err) {
        console.error('Unexpected error in GET /candidates/ratings', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}