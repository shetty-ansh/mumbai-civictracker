import { CandidateRatingsData, RatingStatus } from "@/lib/types/candidate.type";

export async function fetchAllRatings(candidateId: string): Promise<{ status: number, data?: CandidateRatingsData[], error?: string }> {
    try {
        if (!candidateId) {
            return {
                status: 400,
                error: "No candidate ID was provided"
            }
        }

        const res = await fetch(`/api/candidates/${candidateId}/ratings`);

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return {
                status: res.status,
                error: body.error || "Failed to fetch ratings"
            };
        }

        const body = await res.json();

        return {
            status: 200,
            data: body // The route now returns the array directly
        }

    } catch (error) {
        return {
            status: 500,
            error: "Could not connect to server"
        }
    }
}

export async function fetchReviewStatus(candidateId: string): Promise<{ status: number; data?: RatingStatus; error?: string }> {
    try {
        const res = await fetch(
            `/api/ratings/status?candidate_id=${encodeURIComponent(candidateId)}`
        );

        if (res.status === 401) {
            return { status: 401 };
        }

        if (!res.ok) {
            return { status: res.status, error: "Failed to load rating status" };
        }

        const data: RatingStatus = await res.json();
        return { status: 200, data };
    } catch {
        return { status: 500, error: "Could not connect to server" };
    }
}

export async function submitReview(
    candidateId: string,
    rating: number,
    reviewText: string
): Promise<{ status: number; data?: any; error?: string }> {
    try {
        const res = await fetch("/api/ratings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                candidate_id: candidateId,
                rating,
                review_text: reviewText.trim() || undefined,
            }),
        });

        if (res.status === 401) {
            return { status: 401 };
        }

        if (res.status === 409) {
            return { status: 409 };
        }

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return { status: res.status, error: body.error || "Failed to submit rating" };
        }

        const data = await res.json();
        return { status: 201, data };
    } catch {
        return { status: 500, error: "Could not connect to server" };
    }
}
