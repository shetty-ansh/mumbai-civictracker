import { createClient } from '@supabase/supabase-js';
import StatsClient from './stats-client';

// Static generation - data is fetched once at build time
export const dynamic = 'force-static';

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    is_women_reserved: boolean;
}

async function getCandidates(): Promise<Candidate[]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let allCandidates: Candidate[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from("bmc_candidates")
            .select("id, ward_no, candidate_name, party_name, is_women_reserved")
            .range(from, from + pageSize - 1);

        if (error) {
            console.error("Error fetching candidates:", error);
            break;
        }

        if (data && data.length > 0) {
            allCandidates = [...allCandidates, ...data];
            from += pageSize;
            if (data.length < pageSize) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    return allCandidates;
}

export default async function StatsPage() {
    const candidates = await getCandidates();

    return <StatsClient initialCandidates={candidates} />;
}
