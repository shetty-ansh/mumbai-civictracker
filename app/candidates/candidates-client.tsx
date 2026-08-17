"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Scale, User, MapPin, Trophy, Vote, HeartHandshake } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Input } from "@/components/ui/input";
import categoryReservationData from "@/data/category-reservation.json";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";

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

// Format vote count with commas
function formatVotes(votes: number): string {
    return votes.toLocaleString('en-IN');
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

interface CandidatesClientProps {
    initialCandidates: Candidate[];
}

export default function CandidatesClient({ initialCandidates }: CandidatesClientProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Multi-select states
    const [selectedParties, setSelectedParties] = useState<string[]>([]);
    const [selectedWards, setSelectedWards] = useState<string[]>([]);
    const [showWinnersOnly, setShowWinnersOnly] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Calculate options from initial data
    const { partyOptions, wardOptions } = useMemo(() => {
        const partyCounts: Record<string, number> = {};
        const wardCounts: Record<number, number> = {};

        initialCandidates.forEach((c: Candidate) => {
            partyCounts[c.party_name] = (partyCounts[c.party_name] || 0) + 1;
            wardCounts[c.ward_no] = (wardCounts[c.ward_no] || 0) + 1;
        });

        const uniqueParties = Array.from(new Set(initialCandidates.map((c: Candidate) => c.party_name))).sort();
        const partyOpts: Option[] = uniqueParties.map(party => ({
            label: party,
            value: party,
            count: partyCounts[party]
        }));

        const uniqueWards = Array.from(new Set(initialCandidates.map(c => c.ward_no))).sort((a, b) => a - b);
        const wardOpts: Option[] = uniqueWards.map(ward => ({
            label: `Ward ${ward}`,
            value: ward.toString(),
            count: wardCounts[ward]
        }));

        return { partyOptions: partyOpts, wardOptions: wardOpts };
    }, [initialCandidates]);

    // Filter candidates based on search, party, and ward
    const filteredCandidates = useMemo(() => {
        let filtered = initialCandidates;

        // Filter for winners if toggle is active
        if (showWinnersOnly) {
            filtered = filtered.filter(candidate => candidate.winnner === true);
        }

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

        return filtered;
    }, [searchQuery, selectedParties, selectedWards, showWinnersOnly, initialCandidates]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedParties, selectedWards, showWinnersOnly]);

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
                        <h1 className="text-3xl font-bold mb-2">BMC Elections 2026</h1>
                        {/* <p className="text-muted-foreground">
                            Browse all {initialCandidates.length} candidates standing for the upcoming BMC elections
                        </p> */}
                        <p className="text-muted-foreground">
                            Browse all 227 corporators or the candidates who stood against them!
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
                            <p className="text-sm text-stone-600">See your corporator's details and <Link href="/manifestos" className="text-stone-900 font-bold underline">what they had promised</Link></p>
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
                    {/* View Toggle */}
                    <div className="flex bg-stone-100 p-1 rounded-lg shrink-0 w-full md:w-auto h-10 items-center">
                        <button
                            onClick={() => setShowWinnersOnly(true)}
                            className={`flex-1 md:flex-none px-4 h-8 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${showWinnersOnly ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            Corporators
                        </button>
                        <button
                            onClick={() => setShowWinnersOnly(false)}
                            className={`flex-1 md:flex-none px-4 h-8 rounded-md text-sm font-medium transition-all flex items-center justify-center ${!showWinnersOnly ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            All Candidates
                        </button>
                    </div>

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
                {currentCandidates.length === 0 ? (
                    <div className="bg-card border border-border p-12 text-center">
                        <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground/60 font-light">No candidates found</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop: Grid layout | Mobile: List layout */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentCandidates.map((candidate) => {
                                const isWinner = candidate.winnner === true;
                                return (
                                    <div
                                        key={candidate.id}
                                        className="flex flex-col rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 relative bg-white border border-stone-200"
                                    >
                                        <Link
                                            href={`/candidates/${candidate.id}`}
                                            className="group block flex-1"
                                        >
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <h3 className="text-xl font-normal leading-tight group-hover:text-stone-600 transition-colors ">
                                                        {candidate.candidate_name}
                                                    </h3>
                                                    <div className="relative">
                                                        <Image
                                                            src={getPartyLogo(candidate.party_name, candidate.is_women_reserved)}
                                                            alt={candidate.party_name}
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 object-contain rounded-full shrink-0 border border-stone-200"
                                                        />
                                                    </div>
                                                </div>

                                                <p className="text-stone-500 text-sm mb-2 line-clamp-1">
                                                    {candidate.party_name}
                                                </p>

                                                {/* Votes Display */}
                                                {candidate.votes !== null && (
                                                    <div className="flex items-center gap-1.5 mb-4 text-emerald-600">
                                                        <Vote className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">{formatVotes(candidate.votes)}</span>
                                                        <span className="text-xs text-stone-400">votes</span>
                                                    </div>
                                                )}

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
                                        {/* <Link
                                            href={`/candidates/compare/${candidate.ward_no}`}
                                            className="flex items-center justify-center gap-1 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-xs font-medium text-stone-600 border-t border-stone-200"
                                        >
                                            <Scale className="w-3 h-3" />
                                            Compare Ward
                                        </Link> */}
                                        <Button className="flex items-center justify-center gap-1 py-2 bg-stone-200 hover:bg-stone-200 transition-colors text-xs font-medium text-stone-600 border-t border-stone-200">
                                            <HeartHandshake className="w-4 h-4" />
                                            View Promises
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile: List layout */}
                        <div className="md:hidden space-y-2">
                            {currentCandidates.map((candidate) => {
                                const isWinner = candidate.winnner === true;
                                return (
                                    <div
                                        key={candidate.id}
                                        className="rounded-lg overflow-hidden relative bg-white border border-stone-200"
                                    >
                                        <Link
                                            href={`/candidates/${candidate.id}`}
                                            className="block p-4 hover:bg-stone-50/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Image
                                                        src={getPartyLogo(candidate.party_name, candidate.is_women_reserved)}
                                                        alt={candidate.party_name}
                                                        width={44}
                                                        height={44}
                                                        className="w-11 h-11 object-contain rounded-full shrink-0 border border-stone-200"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-base leading-tight truncate ">
                                                        {candidate.candidate_name}
                                                    </h3>
                                                    <p className="text-xs text-stone-500 truncate">
                                                        {candidate.party_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-s text-amber-600 font-medium">
                                                            Ward {candidate.ward_no}
                                                        </span>
                                                        {/* {candidate.votes !== null && (
                                                            <span className="text-xs font-semibold flex items-center gap-1 text-emerald-600">
                                                                <Vote className="w-3 h-3" />
                                                                {formatVotes(candidate.votes)}
                                                            </span>
                                                        )} */}
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
                                        {/* <Link
                                            href={`/candidates/compare/${candidate.ward_no}`}
                                            className="flex items-center justify-center gap-1 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-xs font-medium text-stone-600 border-t border-stone-200"
                                        >
                                            <Scale className="w-3 h-3" />
                                            Compare Ward Candidates
                                        </Link> */}
                                        <Link
                                            href={`/candidates/compare/${candidate.ward_no}`}
                                            className="flex items-center justify-center gap-1 py-2 bg-stone-200 hover:bg-stone-200 transition-colors text-xs font-medium text-stone-600 border-t border-stone-200"
                                        >
                                            <HeartHandshake className="w-4 h-4" />
                                            View Promises
                                        </Link>
                                    </div>
                                );
                            })}
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

