"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { AlertTriangle, GraduationCap, Scale, Users } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { WardPageToast } from "./ward-toast";
import categoryReservationData from "@/data/category-reservation.json";

function unslugify(slug: string): string {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

interface WardPageProps {
    params: Promise<{ wardId: string }>;
}

interface CandidateWithInfo {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    symbol: string;
    ward_name: string;
    is_women_reserved: boolean;
    case_info: { education: string; active_cases: number; closed_cases: number }[] | { education: string; active_cases: number; closed_cases: number } | null;
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

export default function WardDetailPage({ params }: WardPageProps) {
    const { wardId } = use(params);
    const wardName = unslugify(wardId);
    const [candidates, setCandidates] = useState<CandidateWithInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            // Try to fetch candidates with case_info - search by ward_name first
            let { data, error } = await supabase
                .from('bmc_candidates')
                .select(`
                    *,
                    case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(education, active_cases, closed_cases)
                `)
                .ilike('ward_name', `%${wardName}%`);

            if (error) {
                console.error('Error fetching candidates:', error);
                showToast('error', 'Failed to load ward data', 'Please check your connection and try again.');
                setLoading(false);
                return;
            }

            // If no results and wardName looks like it might have a number, try extracting it
            if ((!data || data.length === 0) && wardName) {
                const wardMatch = wardName.match(/\d+/);
                if (wardMatch) {
                    const wardNumber = parseInt(wardMatch[0]);
                    const result = await supabase
                        .from('bmc_candidates')
                        .select(`
                            *,
                            case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(education, active_cases, closed_cases)
                        `)
                        .eq('ward_no', wardNumber);

                    data = result.data;
                    error = result.error;
                }
            }

            if (data) {
                setCandidates(data as CandidateWithInfo[]);
            }
            setLoading(false);
        };

        fetchCandidates();
    }, [wardName]);

    // Calculate ward stats
    const wardNo = candidates.length > 0 ? candidates[0]?.ward_no : parseInt(wardId.replace(/\D/g, '')) || 0;
    const reservationInfo = categoryReservationData.find(r => r.ward_no === wardNo);
    const category = reservationInfo?.category || 'GEN';
    const isWomenReserved = reservationInfo?.women_reserved ?? false;
    const candidatesWithCases = candidates.filter(c => {
        const info = Array.isArray(c.case_info) ? c.case_info[0] : c.case_info;
        return info && (info.active_cases > 0 || info.closed_cases > 0);
    }).length;
    const uniqueParties = new Set(candidates.map(c => c.party_name)).size;

    return (
        <div className="min-h-screen bg-stone-50 overflow-x-hidden">
            <Navbar />
            <WardPageToast />

            <main className="max-w-5xl mx-auto px-4 py-8 overflow-x-hidden">
                {/* Back Button */}
                <Link
                    href="/map"
                    className="inline-flex items-center gap-2 text-sm text-black hover:text-stone-900 mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                    Back to Map
                </Link>

                {/* Ward Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-fraunces)] mb-2">
                                {candidates[0]?.ward_name || wardName}
                            </h1>
                            <p className="text-stone-500">
                                Ward {candidates[0]?.ward_no || wardId.replace(/\D/g, '')} • BMC Elections 2026
                            </p>
                        </div>
                        <Link
                            href={`/candidates/compare/${candidates[0]?.ward_no || wardId.replace(/\D/g, '')}`}
                            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
                        >
                            <Scale className="w-4 h-4" />
                            Compare Candidates
                        </Link>
                    </div>
                </div>

                {/* Ward Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-stone-900">{candidates.length}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Candidates</p>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-stone-900">{uniqueParties}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Parties</p>
                    </div>
                    <div className={`border rounded-xl p-4 text-center ${candidatesWithCases > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-200'}`}>
                        <p className={`text-3xl font-bold ${candidatesWithCases > 0 ? 'text-amber-600' : 'text-stone-900'}`}>{candidatesWithCases}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">With Known Cases</p>
                    </div>
                    <div className={`border rounded-xl p-4 text-center ${category === 'SC' ? 'bg-blue-50 border-blue-200' :
                        category === 'ST' ? 'bg-green-50 border-green-200' :
                            category === 'OBC' ? 'bg-amber-50 border-amber-200' :
                                'bg-white border-stone-200'
                        }`}>
                        <p className={`text-xl font-bold ${category === 'SC' ? 'text-blue-600' :
                            category === 'ST' ? 'text-green-600' :
                                category === 'OBC' ? 'text-amber-600' :
                                    'text-stone-900'
                            }`}>
                            {category}{isWomenReserved ? ' (W)' : ''}
                        </p>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Reservation</p>
                    </div>
                </div>

                {/* Candidates Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-stone-600" />
                        <h2 className="text-lg font-semibold">All Candidates</h2>
                    </div>

                    {loading ? (
                        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
                            <p className="text-sm text-stone-400">Loading candidates...</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 text-stone-200" />
                            <p className="text-sm text-stone-400">No candidates found for this ward</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {candidates.map((candidate) => {
                                const caseInfo = Array.isArray(candidate.case_info) ? candidate.case_info[0] : candidate.case_info;
                                const hasCases = caseInfo && (caseInfo.active_cases > 0 || caseInfo.closed_cases > 0);
                                const education = caseInfo?.education || 'N/A';

                                return (
                                    <Link
                                        key={candidate.id}
                                        href={`/candidates/${candidate.id}`}
                                        className="group bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            {/* Party Logo */}
                                            <Image
                                                src={getPartyLogo(candidate.party_name, candidate.is_women_reserved)}
                                                alt={candidate.party_name}
                                                width={56}
                                                height={56}
                                                className="w-14 h-14 object-contain border border-stone-200 rounded-full shrink-0 bg-white"
                                            />

                                            {/* Candidate Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium leading-tight truncate group-hover:text-stone-600 transition-colors font-[family-name:var(--font-fraunces)]">
                                                    {candidate.candidate_name}
                                                </h3>
                                                <p className="text-sm text-stone-500 truncate">
                                                    {candidate.party_name}
                                                </p>
                                            </div>

                                            {/* Quick Stats */}
                                            <div className="hidden sm:flex items-center gap-3">
                                                {/* Education */}
                                                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                                    <GraduationCap className="w-4 h-4" />
                                                    <span className="max-w-[80px] truncate">{education.toUpperCase()}</span>
                                                </div>

                                                {/* Legal History */}
                                                {hasCases && (
                                                    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        <span>{(caseInfo?.active_cases || 0) + (caseInfo?.closed_cases || 0)} known cases</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <svg className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>

                                        {/* Mobile Stats */}
                                        <div className="sm:hidden flex items-center gap-3 mt-3 pt-3 border-t border-stone-100">
                                            <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                                <GraduationCap className="w-4 h-4" />
                                                <span>{education.toUpperCase()}</span>
                                            </div>
                                            {hasCases && (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    <span>{(caseInfo?.active_cases || 0) + (caseInfo?.closed_cases || 0)} known cases</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="text-center py-6 border-t border-stone-200">
                    <p className="text-xs text-stone-400">
                        Data sourced from election commission public records
                    </p>
                </div>
            </main>
        </div>
    );
}
