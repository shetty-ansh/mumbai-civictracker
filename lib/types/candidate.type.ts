export interface CandidateRatingsData {
    rating: number,
    review_text?: string,
    status: "published" | "quarantined" | "removed",
    created_at: string
}

export interface RatingStatus {
    hasRated: boolean;
    rating?: number;
    review_text?: string;
    status?: "quarantined" | "published" | "removed";
    created_at?: string;
}