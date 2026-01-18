import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { User, AlertTriangle, Scale, Trophy, Vote } from "lucide-react";
import manifestoData from "@/data/party-manifestos.json";
import wardAffidavits from "@/data/ward-affidavits.json";
import { CandidatePageToast } from "./candidate-toast";
import { ManifestoSection } from "./manifesto-section";
import { BackButton } from "./back-button";

// Enable ISR - revalidate set to 0 to show DB changes immediately during dev
export const revalidate = 0;

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
    // Mahayuti Alliance (BJP + Shiv Sena + RPI)
    'Bharatiya Janata Party': 'mahayuti',
    'Shiv Sena': 'mahayuti',
    'Nationalist Congress Party': 'mahayuti',
    'Republican Party of India (A)': 'mahayuti',
    'Republican Party of India': 'mahayuti',
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

export default async function CandidatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const { data: candidateRaw, error } = await supabase
        .from('bmc_candidates')
        .select(`
            *,
            winnner,
            case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(education, active_cases, closed_cases),
            reservation_category:reservation_categories(category_code, category_name_marathi, category_name_english, total_seats, women_reserved_seats),
            votes:bmc_candidate_votes!bmc_candidate_votes_candidate_fkey(votes)
        `)
        .eq('id', id)
        .single();

    // Transform votes from array to single value
    const candidate = candidateRaw ? {
        ...candidateRaw,
        votes: Array.isArray(candidateRaw.votes) && candidateRaw.votes.length > 0 ? candidateRaw.votes[0].votes : null
    } : null;

    if (error || !candidate) {
        return (
            <div className="min-h-screen bg-stone-50">
                <Navbar />
                <main className="max-w-5xl mx-auto px-4 py-12">
                    <div className="text-center py-20">
                        <User className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                        <h1 className="text-2xl font-bold mb-2">Candidate Not Found</h1>
                        <p className="text-stone-500 mb-6">The candidate you're looking for doesn't exist.</p>
                        <Link href="/candidates" className="text-amber-600 hover:underline">
                            ← Back to Candidates
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const caseInfo = Array.isArray(candidate.case_info) ? candidate.case_info[0] : candidate.case_info;
    const manifesto = getPartyManifesto(candidate.party_name);

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />
            <CandidatePageToast />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Back Button */}
                <BackButton />

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:min-h-[500px]">

                    {/* Left Column - Candidate Info Card */}
                    <div className={`lg:col-span-2 text-white rounded-xl p-8 flex flex-col min-h-[400px] relative overflow-hidden ${candidate.winnner ? 'bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-500' : 'bg-black'
                        }`}>
                        {/* Winner Banner */}
                        {candidate.winnner && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                                <Trophy className="w-5 h-5 text-amber-600" />
                                <span className="text-stone-900 font-bold text-sm uppercase tracking-wider">Winner</span>
                            </div>
                        )}
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                            <Image
                                src={getPartyLogo(candidate.party_name, candidate.is_women_reserved)}
                                alt={candidate.party_name}
                                width={120}
                                height={120}
                                className={`w-28 h-28 object-contain bg-white rounded-full mb-8 ${candidate.winnner ? 'border-4 border-white shadow-xl' : 'border-4 border-white'
                                    }`}
                            />
                            <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${candidate.winnner ? 'text-stone-900' : 'text-white'}`}>{candidate.candidate_name}</h1>
                            <p className={`text-lg mb-2 ${candidate.winnner ? 'text-stone-700' : 'text-stone-300'}`}>{candidate.party_name}</p>
                            <p className={`font-medium text-lg ${candidate.winnner ? 'text-stone-800' : 'text-amber-400'}`}>Ward {candidate.ward_no} • {candidate.ward_name}</p>

                            {/* Votes Display */}
                            {candidate.votes !== null && (
                                <div className={`mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg ${candidate.winnner ? 'bg-white/30' : 'bg-white/10'}`}>
                                    <Vote className={`w-5 h-5 ${candidate.winnner ? 'text-stone-800' : 'text-emerald-400'}`} />
                                    <span className={`text-2xl font-bold ${candidate.winnner ? 'text-stone-900' : 'text-white'}`}>
                                        {candidate.votes.toLocaleString('en-IN')}
                                    </span>
                                    <span className={`text-sm ${candidate.winnner ? 'text-stone-700' : 'text-stone-300'}`}>votes</span>
                                </div>
                            )}

                            {candidate.is_women_reserved && (
                                <span className={`mt-4 inline-flex items-center text-xs px-4 py-1.5 rounded-md ${candidate.winnner ? 'bg-stone-800/20 text-stone-800' : 'bg-pink-500/20 text-pink-300'
                                    }`}>
                                    Women Reserved Seat
                                </span>
                            )}

                            {/* View Affidavit Button */}
                            <div className="mt-8 flex flex-row gap-2">
                                <a
                                    href={wardAffidavits[candidate.ward_no.toString() as keyof typeof wardAffidavits] || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center bg-white text-stone-800 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-stone-100 transition-colors"
                                >
                                    View Affidavit
                                </a>
                                <Link
                                    href={`/candidates/compare/${candidate.ward_no}`}
                                    className={`inline-flex items-center justify-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${candidate.winnner ? 'bg-white/20 hover:bg-white/30' : 'bg-stone-700 hover:bg-stone-600'
                                        }`}
                                >
                                    <Scale className="w-4 h-4" />
                                    Compare Ward
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3 flex flex-col gap-4">

                        {/* Top Row - Education & Legal History */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[200px]">
                            {/* Education Card */}
                            {/* Education Card */}
                            {(() => {
                                let education = caseInfo?.education || 'Not Available';
                                let isLowEducation = false;

                                // Format if it's purely a number
                                if (/^\d+$/.test(education.trim())) {
                                    education = `${education.trim()}th Pass`;
                                }

                                const eduNum = parseInt(education);
                                if (!isNaN(eduNum)) {
                                    if (eduNum <= 10) isLowEducation = true;
                                } else {
                                    const lower = education.toLowerCase();
                                    if (lower.includes('uneducated') || lower.includes('illiterate')) {
                                        isLowEducation = true;
                                    }
                                }

                                return (
                                    <div className={`rounded-xl flex flex-col border h-full ${isLowEducation ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>
                                        {/* Header - 30% */}
                                        <div className="basis-[30%] flex items-center justify-center p-4 border-b border-inherit">
                                            <p className={`text-[18px] font-medium uppercase tracking-widest ${isLowEducation ? 'text-red-400' : 'text-stone-500'}`}>Education</p>
                                        </div>
                                        {/* Content - 70% */}
                                        <div className="basis-[70%] flex items-center justify-center p-4">
                                            <p className={`text-xl font-semibold uppercase text-center ${isLowEducation ? 'text-red-600' : 'text-stone-800'}`}>
                                                {education.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Legal History Card */}
                            {(() => {
                                const hasCases = caseInfo && (caseInfo.active_cases > 0 || caseInfo.closed_cases > 0);
                                return (
                                    <div className={`rounded-xl flex flex-col border h-full ${hasCases ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-200'}`}>
                                        {/* Header - 30% */}
                                        <div className="basis-[30%] flex items-center justify-center p-4 border-b border-inherit">
                                            <div className="flex items-center gap-2">
                                                {hasCases && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                                                <p className={`text-[18px] font-medium uppercase tracking-widest ${hasCases ? 'text-amber-600' : 'text-black'}`}>Legal History</p>
                                            </div>
                                        </div>
                                        {/* Content - 70% */}
                                        <div className="basis-[70%] flex items-center justify-center p-4">
                                            {caseInfo ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-4xl font-bold min-w-[2rem] ${caseInfo.active_cases > 0 ? 'text-stone-900' : 'text-stone-300'}`}>
                                                            {caseInfo.active_cases}
                                                        </span>
                                                        <div className="text-sm text-stone-600 leading-snug">
                                                            <p>Pending cases that could</p>
                                                            <p>result in 2+ year sentence</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-4xl font-bold min-w-[2rem] ${caseInfo.closed_cases > 0 ? 'text-stone-900' : 'text-stone-300'}`}>
                                                            {caseInfo.closed_cases}
                                                        </span>
                                                        <div className="text-sm text-stone-600 leading-snug">
                                                            <p>Convicted with 1+ year</p>
                                                            <p>imprisonment</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-stone-400 text-sm italic">Data not available</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Bottom - Party Manifesto Card */}
                        <div className="bg-white border border-stone-200 rounded-xl p-6 flex-1 flex flex-col">
                            <p className="text-[18px] font-medium text-black uppercase tracking-widest mb-4">Party Manifesto</p>

                            <div className="flex-1">
                                <ManifestoSection manifesto={manifesto} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
