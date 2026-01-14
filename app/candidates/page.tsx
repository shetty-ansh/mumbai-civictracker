"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, User, Scale, MapPin } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import categoryReservationData from "@/data/category-reservation.json";
import { MultiSelect, Option } from "@/components/ui/multi-select";

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    symbol: string;
    ward_name: string;
    is_women_reserved: boolean;
}

// Party logo mapping - matches exact database values
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

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Multi-select states
    const [selectedParties, setSelectedParties] = useState<string[]>([]);
    const [selectedWards, setSelectedWards] = useState<string[]>([]);

    // Options for MultiSelect
    const [partyOptions, setPartyOptions] = useState<Option[]>([]);
    const [wardOptions, setWardOptions] = useState<Option[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchCandidates = async () => {
            let allCandidates: Candidate[] = [];
            let from = 0;
            const pageSize = 1000;
            let hasMore = true;

            // Fetch all candidates with pagination
            while (hasMore) {
                const { data, error } = await supabase
                    .from('bmc_candidates')
                    .select('*')
                    .order('ward_no', { ascending: true })
                    .range(from, from + pageSize - 1);

                if (error) {
                    console.error('Error fetching candidates:', error);
                    showToast('error', 'Failed to load candidates', 'Please check your connection and try again.');
                    break;
                }

                if (data && data.length > 0) {
                    allCandidates = [...allCandidates, ...data];
                    from += pageSize;

                    // If we got less than pageSize, we've reached the end
                    if (data.length < pageSize) {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            }

            setCandidates(allCandidates as Candidate[]);
            setFilteredCandidates(allCandidates as Candidate[]);

            // Calculate counts
            const partyCounts: Record<string, number> = {};
            const wardCounts: Record<number, number> = {};

            allCandidates.forEach((c: Candidate) => {
                partyCounts[c.party_name] = (partyCounts[c.party_name] || 0) + 1;
                wardCounts[c.ward_no] = (wardCounts[c.ward_no] || 0) + 1;
            });

            // Extract unique parties for options
            const uniqueParties = Array.from(new Set(allCandidates.map((c: Candidate) => c.party_name))).sort();
            setPartyOptions(uniqueParties.map(party => ({
                label: party,
                value: party,
                count: partyCounts[party]
            })));

            // Extract unique wards for options
            const uniqueWards = Array.from(new Set(allCandidates.map(c => c.ward_no))).sort((a, b) => a - b);
            setWardOptions(uniqueWards.map(ward => ({
                label: `Ward ${ward}`,
                value: ward.toString(),
                count: wardCounts[ward]
            })));

            setLoading(false);
        };

        fetchCandidates();
    }, []);

    // Filter candidates based on search, party, and ward
    useEffect(() => {
        let filtered = candidates;

        // Filter by search query (name, party, and ward)
        if (searchQuery) {
            filtered = filtered.filter(
                (candidate) =>
                    (candidate.candidate_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                    (candidate.party_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                    (candidate.ward_no?.toString() || "").includes(searchQuery)
            );
        }

        // Filter by selected parties
        if (selectedParties.length > 0) {
            filtered = filtered.filter((candidate) => selectedParties.includes(candidate.party_name));
        }

        // Filter by selected wards
        if (selectedWards.length > 0) {
            filtered = filtered.filter((candidate) => selectedWards.includes(candidate.ward_no.toString()));
        }

        setFilteredCandidates(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchQuery, selectedParties, selectedWards, candidates]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">BMC Election Candidates 2026</h1>
                        <p className="text-muted-foreground">
                            Browse all {candidates.length} candidates standing for the upcoming BMC elections
                        </p>
                    </div>

                    {/* Party Filter - MultiSelect */}
                    <div className="w-full md:w-72">
                        <MultiSelect
                            options={partyOptions}
                            selected={selectedParties}
                            onChange={setSelectedParties}
                            placeholder="Select Parties..."
                            className="bg-background"
                        />
                    </div>
                </div>

                {/* Map CTA Section */}
                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-stone-900">Find your ward on the map</p>
                            <p className="text-sm text-stone-600">See all candidates in your area and compare them</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Link
                            href="/manifestos"
                            className="flex-1 sm:flex-none bg-white text-stone-900 border border-stone-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors text-center"
                        >
                            View Manifestos
                        </Link>
                        <Link
                            href="/map"
                            className="flex-1 sm:flex-none bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors text-center"
                        >
                            Explore Map
                        </Link>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    {/* Search - Name and Party only */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by candidate name or party..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10"
                        />
                    </div>

                    {/* Ward Filter - MultiSelect */}
                    <div className="w-full md:w-60">
                        <MultiSelect
                            options={wardOptions}
                            selected={selectedWards}
                            onChange={setSelectedWards}
                            placeholder="Select Wards..."
                            className="bg-background"
                        />
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredCandidates.length)} of {filteredCandidates.length} candidates
                    </p>
                    {totalPages > 1 && (
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </p>
                    )}
                </div>

                {/* Candidates Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading candidates...</p>
                    </div>
                ) : currentCandidates.length === 0 ? (
                    <div className="bg-card border border-border p-12 text-center">
                        <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground/60 font-light">No candidates found</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop: Grid layout | Mobile: List layout */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentCandidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className="flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                                >
                                    <Link
                                        href={`/candidates/${candidate.id}`}
                                        className="group block flex-1"
                                    >
                                        <div className="p-5 flex flex-col h-full">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <h3 className="text-xl font-normal leading-tight group-hover:text-stone-600 transition-colors font-[family-name:var(--font-fraunces)]">
                                                    {candidate.candidate_name}
                                                </h3>
                                                <Image
                                                    src={getPartyLogo(candidate.party_name, candidate.is_women_reserved)}
                                                    alt={candidate.party_name}
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 object-contain border border-stone-200 rounded-full shrink-0"
                                                />
                                            </div>

                                            <p className="text-stone-500 text-sm mb-4 line-clamp-1">
                                                {candidate.party_name}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
                                                <span className="inline-flex items-center bg-stone-900 text-white text-[10px] px-3 py-1 rounded-md uppercase tracking-widest font-medium">
                                                    Ward {candidate.ward_no}
                                                </span>
                                                {(() => {
                                                    const reservation = categoryReservationData.find(r => r.ward_no === candidate.ward_no);
                                                    const category = reservation?.category || 'GEN';
                                                    const isWomen = reservation?.women_reserved;
                                                    return (
                                                        <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${category === 'SC' ? 'bg-blue-100 text-blue-600' :
                                                            category === 'ST' ? 'bg-green-100 text-green-600' :
                                                                category === 'OBC' ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-stone-100 text-stone-600'
                                                            }`}>
                                                            {category}{isWomen ? ' (W)' : ''}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        href={`/candidates/compare/${candidate.ward_no}`}
                                        className="flex items-center justify-center gap-1 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-xs font-medium text-stone-600 border-t border-stone-200"
                                    >
                                        <Scale className="w-3 h-3" />
                                        Compare Ward
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Mobile: List layout */}
                        <div className="md:hidden space-y-2">
                            {currentCandidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className="bg-white border border-stone-200 rounded-lg overflow-hidden"
                                >
                                    <Link
                                        href={`/candidates/${candidate.id}`}
                                        className="block p-4 hover:bg-stone-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={getPartyLogo(candidate.party_name, candidate.is_women_reserved)}
                                                alt={candidate.party_name}
                                                width={44}
                                                height={44}
                                                className="w-11 h-11 object-contain border border-stone-200 rounded-full shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-base leading-tight truncate font-[family-name:var(--font-fraunces)]">
                                                    {candidate.candidate_name}
                                                </h3>
                                                <p className="text-xs text-stone-500 truncate">
                                                    {candidate.party_name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-amber-600 font-medium">
                                                        Ward {candidate.ward_no}
                                                    </span>
                                                    {(() => {
                                                        const reservation = categoryReservationData.find(r => r.ward_no === candidate.ward_no);
                                                        const category = reservation?.category || 'GEN';
                                                        const isWomen = reservation?.women_reserved;
                                                        return (
                                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${category === 'SC' ? 'bg-blue-100 text-blue-600' :
                                                                category === 'ST' ? 'bg-green-100 text-green-600' :
                                                                    category === 'OBC' ? 'bg-amber-100 text-amber-600' :
                                                                        'bg-stone-100 text-stone-600'
                                                                }`}>
                                                                {category}{isWomen ? ' (W)' : ''}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        href={`/candidates/compare/${candidate.ward_no}`}
                                        className="flex items-center justify-center gap-1 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-xs font-medium text-stone-600 border-t border-stone-200"
                                    >
                                        <Scale className="w-3 h-3" />
                                        Compare Ward Candidates
                                    </Link>
                                </div>
                            ))}
                        </div>


                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages <= 7 ? totalPages : 5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        const maxVisible = 5;

                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-md transition-colors ${currentPage === pageNum
                                                    ? "bg-accent text-white"
                                                    : "border border-border hover:bg-muted"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
