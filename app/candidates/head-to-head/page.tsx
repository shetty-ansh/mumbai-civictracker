import { createClient } from '@supabase/supabase-js';
import HeadToHeadClient from './head-to-head-client';
import manifestoData from "@/data/party-manifestos.json";
import type { CorporatorForComparison } from './types';

// ISR - revalidate to pick up new data
export const revalidate = 0;

// Party to manifesto alliance mapping
const partyToManifestoMap: Record<string, string> = {
    'Indian National Congress': 'congress-vba',
    'Vanchit Bahujan Aghadi': 'congress-vba',
    'Bharatiya Janata Party': 'mahayuti',
    'Shiv Sena': 'mahayuti',
    'Nationalist Congress Party': 'mahayuti',
    'Republican Party of India (A)': 'mahayuti',
    'Republican Party of India': 'mahayuti',
    'Shiv Sena (Uddhav Balasaheb Thackeray)': 'shivsena-ubt-mns-ncpsp',
    'Maharashtra Navnirman Sena': 'shivsena-ubt-mns-ncpsp',
    'Nationalist Congress Party - Sharad Pawar': 'shivsena-ubt-mns-ncpsp',
    'Aam Aadmi Party': 'aap-manifesto',
};

function getPartyManifesto(partyName: string) {
    const manifestoId = partyToManifestoMap[partyName];
    if (manifestoId) {
        return manifestoData.find(m => m.id === manifestoId) || null;
    }
    return null;
}

export default async function HeadToHeadPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all winners with case info, votes, and promises
    let allCorporators: CorporatorForComparison[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('bmc_candidates')
            .select(`
                id, ward_no, candidate_name, party_name, ward_name, is_women_reserved,
                case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(education, active_cases, closed_cases),
                votes:bmc_candidate_votes!bmc_candidate_votes_candidate_fkey(votes),
                promises:candidate_promises(promise_text, category)
            `)
            .eq('winnner', true)
            .order('ward_no', { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) {
            console.error('Error fetching corporators:', error);
            break;
        }

        if (data && data.length > 0) {
            const transformed = data.map((c: any) => {
                const caseInfo = Array.isArray(c.case_info) ? c.case_info[0] : c.case_info;
                const manifesto = getPartyManifesto(c.party_name);
                return {
                    id: c.id,
                    ward_no: c.ward_no,
                    candidate_name: c.candidate_name,
                    party_name: c.party_name,
                    ward_name: c.ward_name,
                    is_women_reserved: c.is_women_reserved,
                    votes: Array.isArray(c.votes) && c.votes.length > 0 ? c.votes[0].votes : null,
                    education: caseInfo?.education || 'N/A',
                    active_cases: caseInfo?.active_cases || 0,
                    closed_cases: caseInfo?.closed_cases || 0,
                    promises: Array.isArray(c.promises) ? c.promises : [],
                    manifesto: manifesto ? {
                        shortName: manifesto.shortName,
                        keyPromises: manifesto.keyPromises,
                        manifestoUrl: manifesto.manifestoUrl,
                    } : null,
                };
            });
            allCorporators = [...allCorporators, ...transformed];
            from += pageSize;
            if (data.length < pageSize) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    return <HeadToHeadClient corporators={allCorporators} />;
}
