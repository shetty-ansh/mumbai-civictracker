import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { User, AlertTriangle, Scale, Trophy, Vote, Star } from "lucide-react";
import manifestoData from "@/data/party-manifestos.json";
import wardAffidavits from "@/data/ward-affidavits.json";
import { CandidatePageToast } from "./candidate-toast";
import { PromisesManifestoToggle } from "./promises-manifesto-toggle";
import { BackButton } from "./back-button";
import { Special_Elite } from "next/font/google";
import { CandidateContact } from "./candidate-contact";
import { CandidateRating } from "./candidate-rating";

const specialElite = Special_Elite({
    weight: "400",
    subsets: ["latin"],
});

// Static generation - pre-build all candidate pages at build time
export const dynamic = 'force-static';

// Pre-generate all candidate pages at build time
export async function generateStaticParams() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    let allIds: { id: string }[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data } = await supabaseClient
            .from('bmc_candidates')
            .select('id')
            .range(from, from + pageSize - 1);

        if (data && data.length > 0) {
            allIds = [...allIds, ...data];
            from += pageSize;
            if (data.length < pageSize) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    return allIds.map((c) => ({ id: c.id }));
}

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

    const [{ data: candidateRaw, error }, { data: promisesData }, { data: contactData, error: contactError }, { data: ratingsData }] = await Promise.all([
        supabase
            .from('bmc_candidates')
            .select(`
                *,
                winnner,
                case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(education, active_cases, closed_cases),
                reservation_category:reservation_categories(category_code, category_name_marathi, category_name_english, total_seats, women_reserved_seats),
                votes:bmc_candidate_votes!bmc_candidate_votes_candidate_fkey(votes)
            `)
            .eq('id', id)
            .single(),
        supabase
            .from('candidate_promises')
            .select('promise_text, category')
            .eq('candidate_id', id),
        supabase
            .from('corporator_contact')
            .select('*')
            .eq('candidate_id', id),
        supabase
            .from('candidate_ratings')
            .select('rating')
            .eq('candidate_id', id)
            .eq('status', 'published')
    ]);

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
    const promises = promisesData || [];
    const contactInfo = contactData && contactData.length > 0 ? contactData[0] : null;
    const averageRating = ratingsData && ratingsData.length > 0
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
        : null;

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />
            <CandidatePageToast />

            <main className="max-w-5xl mx-auto p-4">
                {/* Back Button */}
                <BackButton />

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:min-h-[500px]">

                    {/* Left Column Container */}
                    <div className="lg:col-span-2 flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
                        {/* Candidate Info Card, styled as a local-train ticket */}
                        <div
                            className={`rounded-xl flex flex-col min-h-[700px] relative overflow-hidden ${specialElite.className}`}
                            style={{
                                backgroundImage: candidate.winnner
                                    ? "url('/images/local-train-ticket.svg')"
                                    : "none",
                                backgroundPosition: candidate.winnner ? "center" : "auto",
                                backgroundRepeat: candidate.winnner ? "no-repeat" : "auto",
                                backgroundColor: candidate.winnner ? undefined : "#000",
                            }}
                        >
                            {/* Stamp: reservation, inked & rotated top-right like a franking stamp */}
                            {candidate.is_women_reserved && (
                                <div
                                    className={`absolute top-[118px] right-5 rotate-[-9deg] border-2 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest select-none mix-blend-multiply ${candidate.winnner ? 'border-rose-700/60 text-rose-700/80' : 'border-pink-400/60 text-pink-300/80'
                                        }`}
                                >
                                    Women<br />Reserved
                                </div>
                            )}

                            {/* Stamp: winner, inked & rotated, opposite corner */}
                            {candidate.winnner && (
                                <div className="absolute top-[118px] left-5 rotate-[8deg] border-2 border-emerald-700/50 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700/70 select-none mix-blend-multiply">
                                    ✓ Elected
                                </div>
                            )}

                            {/* Main ticket body — sits below the printed banner/perforation art */}
                            <div className="flex-1 flex flex-col justify-center px-7 pt-[170px] pb-6">

                                <div className="space-y-4">
                                    {/* Passenger (candidate name) */}
                                    <div className="flex items-end gap-2">
                                        <span className={`text-[10px] uppercase tracking-widest whitespace-nowrap ${candidate.winnner ? 'text-stone-600' : 'text-stone-400'}`}>Passenger</span>
                                        <span className={`flex-1 border-b border-dotted mb-1 ${candidate.winnner ? 'border-stone-500/40' : 'border-stone-500/30'}`} />
                                    </div>
                                    <p className={`text-xl sm:text-2xl font-bold -mt-3 ${candidate.winnner ? 'text-stone-800' : 'text-white'}`}>
                                        {candidate.candidate_name}
                                    </p>

                                    {/* Party (issuing authority) */}
                                    <div className="flex items-end gap-2 pt-2">
                                        <span className={`text-[10px] uppercase tracking-widest whitespace-nowrap ${candidate.winnner ? 'text-stone-600' : 'text-stone-400'}`}>Issued By</span>
                                        <span className={`flex-1 border-b border-dotted mb-1 ${candidate.winnner ? 'border-stone-500/40' : 'border-stone-500/30'}`} />
                                    </div>
                                    <p className={`text-base font-medium -mt-3 ${candidate.winnner ? 'text-stone-700' : 'text-stone-200'}`}>
                                        {candidate.party_name}
                                    </p>

                                    {/* Ward no. / Rating — two-column ticket fields */}
                                    <div className="grid grid-cols-5 gap-3 pt-3">
                                        <div className="col-span-2">
                                            <p className={`text-[10px] uppercase tracking-widest ${candidate.winnner ? 'text-stone-600' : 'text-stone-400'}`}>Ward No.</p>
                                            <p className={`text-lg font-bold ${candidate.winnner ? 'text-stone-800' : 'text-amber-400'}`}>{candidate.ward_no}</p>
                                        </div>
                                        <div className="col-span-3">
                                            <p className={`text-[10px] uppercase tracking-widest ${candidate.winnner ? 'text-stone-600' : 'text-stone-400'}`}>Avg Rating</p>
                                            <p className={`text-lg font-bold flex items-center gap-1 ${candidate.winnner ? 'text-stone-800' : 'text-amber-400'}`}>
                                                {averageRating !== null ? (
                                                    <>
                                                        {averageRating.toFixed(1)} <Star className="w-4 h-4 fill-current" />
                                                    </>
                                                ) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Perforated tear line separating ticket from counterfoil */}
                                <div className="w-full flex items-center gap-2 my-6">
                                    <span className={`flex-1 border-t-2 border-dashed ${candidate.winnner ? 'border-stone-500/40' : 'border-stone-500/30'}`} />
                                    <span className={`text-xs ${candidate.winnner ? 'text-stone-500/60' : 'text-stone-400/50'}`}>✂</span>
                                    <span className={`flex-1 border-t-2 border-dashed ${candidate.winnner ? 'border-stone-500/40' : 'border-stone-500/30'}`} />
                                </div>

                                {/* Counterfoil — tear-tab style action row */}
                                <div className={`flex rounded-lg overflow-hidden border divide-x divide-dashed ${candidate.winnner ? 'border-stone-400/40 divide-stone-400/40 bg-white/40' : 'border-stone-500/30 divide-stone-500/30 bg-white/5'}`}>
                                    <a
                                        href="#promises"
                                        className={`flex-1 flex flex-col items-center justify-center gap-1 text-center text-xs font-semibold uppercase tracking-wide py-3 px-2 transition-colors ${candidate.winnner ? 'text-stone-800 hover:bg-white/60' : 'text-stone-100 hover:bg-white/10'}`}
                                    >
                                        View<br />Promises
                                    </a>
                                    <a
                                        href="#ratings"
                                        className={`flex-1 flex flex-col items-center justify-center gap-1 text-center text-xs font-semibold uppercase tracking-wide py-3 px-2 transition-colors ${candidate.winnner ? 'text-stone-800 hover:bg-white/60' : 'text-stone-100 hover:bg-white/10'}`}
                                    >
                                        <Star className="w-3.5 h-3.5" />
                                        View<br />Ratings
                                    </a>
                                </div>

                                {/* View Affidavit — the ticket's "boarding" strip, main CTA */}
                                <a
                                    href={wardAffidavits[candidate.ward_no.toString() as keyof typeof wardAffidavits] || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`mt-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest rounded-lg py-3.5 transition-colors ${candidate.winnner
                                        ? 'bg-stone-800 text-white hover:bg-stone-700'
                                        : 'bg-amber-400 text-stone-900 hover:bg-amber-300'
                                        }`}
                                >
                                    View Affidavit ↗
                                </a>

                                {/* Votes — printed like a ticket serial number */}
                                {candidate.votes !== null && (
                                    <div className={`mt-4 flex items-center justify-center text-[11px] tracking-widest ${candidate.winnner ? 'text-stone-500/70' : 'text-stone-400/60'}`}>
                                        <div className="flex items-center gap-1.5">
                                            <Vote className="w-3 h-3" />
                                            <span>{candidate.votes.toLocaleString('en-IN')} VOTES POLLED</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Compare Ward Candidates Card */}
                        <Link
                            href={`/candidates/compare/${candidate.ward_no}`}
                            className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between hover:border-amber-400 transition-colors group shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-stone-50 rounded-lg group-hover:bg-amber-50 transition-colors">
                                    <Scale className="w-5 h-5 text-stone-600 group-hover:text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-stone-800">Compare Ward</h3>
                                    <p className="text-xs text-stone-500">See other candidates in Ward {candidate.ward_no}</p>
                                </div>
                            </div>
                            <span className="text-stone-300 group-hover:text-amber-500 transition-colors px-2">→</span>
                        </Link>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3 flex flex-col gap-4">

                        {/* Top Row - Education & Legal History */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[200px]">
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

                        {/* Bottom - Promises / Party Manifesto Toggle */}
                        <div id="promises">
                            <PromisesManifestoToggle candidateName={candidate.candidate_name} promises={promises} manifesto={manifesto} />
                        </div>
                        <div>
                            <CandidateContact email={contactInfo?.email} mobile={contactInfo?.mobile} />
                        </div>
                        <div id="ratings">
                            <CandidateRating candidateId={id} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}