import { createClient } from '@supabase/supabase-js';
import ResultsClient from './results-client';

// Static generation - data is fetched once at build time
export const dynamic = 'force-static';

interface Winner {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    ward_name: string;
    is_women_reserved: boolean;
    votes: number | null;
}

async function getWinners(): Promise<Winner[]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('bmc_candidates')
        .select(`
            id, ward_no, candidate_name, party_name, ward_name, is_women_reserved,
            votes:bmc_candidate_votes!bmc_candidate_votes_candidate_fkey(votes)
        `)
        .eq('winnner', true)
        .order('ward_no', { ascending: true });

    if (error) {
        console.error('Error fetching winners:', error);
        return [];
    }

    // Transform votes from array to single value
    const winners = (data || []).map(c => ({
        ...c,
        votes: Array.isArray(c.votes) && c.votes.length > 0 ? c.votes[0].votes : null
    }));

    return winners;
}

export default async function ResultsPage() {
    const winners = await getWinners();

    return <ResultsClient winners={winners} />;
}
