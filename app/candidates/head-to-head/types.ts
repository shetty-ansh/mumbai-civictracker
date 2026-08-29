export interface CorporatorForComparison {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    ward_name: string;
    is_women_reserved: boolean;
    votes: number | null;
    education: string;
    active_cases: number;
    closed_cases: number;
    promises: { promise_text: string; category: string }[];
    manifesto: {
        shortName: string;
        keyPromises: string[];
        manifestoUrl?: string;
    } | null;
}
