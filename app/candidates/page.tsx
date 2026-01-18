import { createClient } from '@supabase/supabase-js';
import CandidatesClient from './candidates-client';

// Enable ISR - revalidate set to 0 to show DB changes immediately during dev
export const revalidate = 0;

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    symbol: string;
    ward_name: string;
    is_women_reserved: boolean;
    winnner: boolean;
    votes: number | null;
}

async function getCandidates(): Promise<Candidate[]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let allCandidates: Candidate[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    // Fetch all candidates with pagination
    while (hasMore) {
        const { data, error } = await supabase
            .from('bmc_candidates')
            .select(`
                id, ward_no, candidate_name, party_name, symbol, ward_name, is_women_reserved, winnner,
                votes:bmc_candidate_votes!bmc_candidate_votes_candidate_fkey(votes)
            `)
            .order('ward_no', { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) {
            console.error('Error fetching candidates:', error);
            break;
        }

        if (data && data.length > 0) {
            // Transform votes from array to single value
            const transformedData = data.map(c => ({
                ...c,
                votes: Array.isArray(c.votes) && c.votes.length > 0 ? c.votes[0].votes : null
            }));
            allCandidates = [...allCandidates, ...transformedData];
            from += pageSize;

            // If we got less than pageSize, we've reached the end
            if (data.length < pageSize) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }

    return allCandidates;
}

export default async function CandidatesPage() {
    const candidates = await getCandidates();

    return <CandidatesClient initialCandidates={candidates} />;
}
