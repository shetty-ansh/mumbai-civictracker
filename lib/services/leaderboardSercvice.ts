import { LeaderboardData } from "@/lib/types/candidate.type";

export async function fetchLeaderboardRatings(): Promise<{ data?: LeaderboardData[], error?: string }> {
    try {
        const res = await fetch(`/api/candidates/ratings`);

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return {
                error: body.error || "Failed to fetch ratings"
            };
        }

        const body = await res.json();

        return {
            data: body,
            error: undefined
        }

    } catch (error) {
        return {
            data: undefined,
            error: "Could not connect to server"
        }
    }
}
