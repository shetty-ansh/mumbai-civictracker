import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Users, AlertTriangle, GraduationCap, FileText, Vote, Trophy } from "lucide-react";
import manifestoData from "@/data/party-manifestos.json";
import { ComparePageToast } from "./compare-toast";
import { ManifestoCell } from "./manifesto-cell";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

// Party logo mapping
function getPartyLogo(partyName: string, isWomenReserved?: boolean): string {
    switch (partyName) {
        case 'Indian National Congress':
            return '/images/party-symbols/congress-logo.jpg';
        case 'Shiv Sena (Uddhav Balasaheb Thackeray)':
            return '/images/party-symbols/shivsena-ubt-logo.jpg';
        case 'Bharatiya Janata Party':
            return '/images/party-symbols/bjp-logo.jpg';
        case 'Shiv Sena':
            return '/images/party-symbols/shivsena-logo.jpg';
        case 'Nationalist Congress Party - Sharad Pawar':
            return '/images/party-symbols/ncpsp-logo.png';
        case 'Nationalist Congress Party':
            return '/images/party-symbols/ncp-logo.jpg';
        case 'Bahujan Samaj Party':
            return '/images/party-symbols/bahujan-party.jpg';
        case 'Samajwadi Party':
            return '/images/party-symbols/samaajvadi-logo.png';
        case 'Aam Aadmi Party':
            return '/images/party-symbols/aap-logo.jpg';
        case 'Maharashtra Navnirman Sena':
            return '/images/party-symbols/mns-logo.jpg';
        default:
            return isWomenReserved
                ? '/images/party-symbols/generic-female.png'
                : '/images/party-symbols/generic.jpg';
    }
}

// Party to manifesto alliance mapping
const partyToManifestoMap: Record<string, string> = {
    // Congress + VBA Alliance
    'Indian National Congress': 'congress-vba',
    'Vanchit Bahujan Aghadi': 'congress-vba',
    // Mahayuti Alliance (BJP + Shiv Sena)
    'Bharatiya Janata Party': 'mahayuti',
    'Shiv Sena': 'mahayuti',
    // SS(UBT) + MNS + NCP(SP) Alliance
    'Shiv Sena (Uddhav Balasaheb Thackeray)': 'shivsena-ubt-mns-ncpsp',
    'Maharashtra Navnirman Sena': 'shivsena-ubt-mns-ncpsp',
    'Nationalist Congress Party - Sharad Pawar': 'shivsena-ubt-mns-ncpsp',
    // AAP Standalone
    'Aam Aadmi Party': 'aap-manifesto',
};

// Get manifesto for a party
function getPartyManifesto(partyName: string) {
    const manifestoId = partyToManifestoMap[partyName];
    if (manifestoId) {
        return manifestoData.find(m => m.id === manifestoId);
    }
    return null;
}

// Convert party name to initials (multi-word) or keep as-is (single word)
function getPartyInitials(partyName: string): string {
    // Known party abbreviations
    const knownAbbreviations: Record<string, string> = {
        'Indian National Congress': 'INC',
        'Bharatiya Janata Party': 'BJP',
        'Shiv Sena': 'SS',
        'Shiv Sena (Uddhav Balasaheb Thackeray)': 'SS(UBT)',
        'Nationalist Congress Party': 'NCP',
        'Bahujan Samaj Party': 'BSP',
        'Samajwadi Party': 'SP',
        'Aam Aadmi Party': 'AAP',
        'Maharashtra Navnirman Sena': 'MNS',
        'Communist Party of India': 'CPI',
        'Communist Party of India (Marxist)': 'CPI(M)',
    };

    if (knownAbbreviations[partyName]) {
        return knownAbbreviations[partyName];
    }

    const words = partyName.split(' ').filter(w => w.length > 0);
    if (words.length <= 1) return partyName;
    // Get first letter of each word (skip parentheses), uppercase
    return words.map(w => {
        const char = w.replace(/[()]/g, '')[0];
        return char ? char.toUpperCase() : '';
    }).filter(c => c).join('');
}

interface CandidateWithInfo {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    ward_name: string;
    is_women_reserved: boolean;
    winnner?: boolean;
    votes: number | null;
    case_info: { education: string; active_cases: number; closed_cases: number }[] | { education: string; active_cases: number; closed_cases: number } | null;
}

export default async function CompareWardPage({
    params,
}: {
    params: Promise<{ ward: string }>;
}) {
    const { ward } = await params;
    const wardNo = parseInt(ward);

    const { data: candidatesRawData, error } = await supabase
        .from('bmc_candidates')
        .select(`
            *,
            case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(education, active_cases, closed_cases),
            votes:bmc_candidate_votes!bmc_candidate_votes_candidate_fkey(votes)
        `)
        .eq('ward_no', wardNo)
        .order('party_name', { ascending: true });

    // Transform votes from array to single value
    const candidatesRaw = candidatesRawData?.map(c => ({
        ...c,
        votes: Array.isArray(c.votes) && c.votes.length > 0 ? c.votes[0].votes : null
    }));

    // Sort candidates: Independents go to the end
    const candidates = candidatesRaw?.sort((a, b) => {
        const aIsIndependent = a.party_name?.toLowerCase().includes('independent') ? 1 : 0;
        const bIsIndependent = b.party_name?.toLowerCase().includes('independent') ? 1 : 0;
        if (aIsIndependent !== bIsIndependent) return aIsIndependent - bIsIndependent;
        return (a.party_name || '').localeCompare(b.party_name || '');
    });

    if (error || !candidates || candidates.length === 0) {
        return (
            <div className="min-h-screen bg-stone-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                        <h1 className="text-2xl font-bold mb-2">No Candidates Found</h1>
                        <p className="text-stone-500 mb-6">No candidates found for Ward {wardNo}.</p>
                        <Link href="/candidates" className="text-amber-600 hover:underline">
                            ← Back to Candidates
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const wardName = candidates[0]?.ward_name || `Ward ${wardNo}`;

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />
            <ComparePageToast />

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                {/* Header */}
                <Link
                    href="/candidates"
                    className="inline-flex items-center gap-2 text-sm text-black hover:text-stone-900 mb-2 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Candidates
                </Link>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-fraunces)] mb-2">
                        Compare Candidates
                    </h1>
                    <p className="text-stone-600">
                        Ward {wardNo} • {wardName} • {candidates.length} candidates
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-stone-900 text-white">
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider sticky left-0 bg-stone-900 z-10">
                                        Candidate
                                    </th>
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" />
                                            Education
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Vote className="w-4 h-4" />
                                            Votes
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Legal History
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Party Manifesto
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(candidates as CandidateWithInfo[]).map((candidate, index) => {
                                    const caseInfo = Array.isArray(candidate.case_info)
                                        ? candidate.case_info[0]
                                        : candidate.case_info;
                                    const manifesto = getPartyManifesto(candidate.party_name);

                                    let education = caseInfo?.education || 'N/A';
                                    if (/^\d+$/.test(education.trim())) {
                                        education = `${education.trim()}th Pass`;
                                    }

                                    const eduNum = parseInt(education);
                                    const isLowEducation = !isNaN(eduNum) && eduNum <= 10;

                                    const hasCases = caseInfo && (caseInfo.active_cases > 0 || caseInfo.closed_cases > 0);

                                    return (
                                        <tr
                                            key={candidate.id}
                                            className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}
                                        >
                                            {/* Candidate Info - Sticky */}
                                            <td className={`p-4 sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
                                                <Link
                                                    href={`/candidates/${candidate.id}`}
                                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                                >
                                                    <Image
                                                        src={getPartyLogo(candidate.party_name, candidate.is_women_reserved)}
                                                        alt={candidate.party_name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 object-contain border border-stone-200 rounded-full"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-stone-900 font-[family-name:var(--font-fraunces)]">
                                                            <span className="hidden sm:inline">{candidate.candidate_name}</span>
                                                            <span className="sm:hidden">{candidate.candidate_name.split(' ')[0]}</span>
                                                        </p>
                                                        <p className="text-xs text-stone-500 truncate max-w-[150px]">
                                                            {getPartyInitials(candidate.party_name)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </td>

                                            {/* Education */}
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${education === 'N/A'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : isLowEducation
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {education.toUpperCase()}
                                                </span>
                                            </td>

                                            {/* Votes */}
                                            <td className="p-4">
                                                {candidate.votes !== null ? (
                                                    <div className={`flex items-center gap-2 ${candidate.winnner ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {candidate.winnner && <Trophy className="w-4 h-4 text-amber-500" />}
                                                        <span className="font-bold text-lg">{candidate.votes.toLocaleString('en-IN')}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-400 text-sm italic">N/A</span>
                                                )}
                                            </td>

                                            {/* Legal History */}
                                            <td className="p-4">
                                                {caseInfo ? (
                                                    <div className="space-y-1">
                                                        <div className={`flex items-center gap-2 ${caseInfo.active_cases > 0 ? 'text-red-600' : 'text-stone-400'}`}>
                                                            <span className="font-bold text-lg">{caseInfo.active_cases}</span>
                                                            <span className="text-xs">Active</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 ${caseInfo.closed_cases > 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                                                            <span className="font-bold text-lg">{caseInfo.closed_cases}</span>
                                                            <span className="text-xs">Convicted</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-400 text-sm italic">N/A</span>
                                                )}
                                            </td>

                                            {/* Manifesto */}
                                            <td className="p-4">
                                                <ManifestoCell manifesto={manifesto} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></span>
                        <span>Higher Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span>
                        <span>10th or Below</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold">N</span>
                        <span>Active legal cases</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">N</span>
                        <span>Prior convictions</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
