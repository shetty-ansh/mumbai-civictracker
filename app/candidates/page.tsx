"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Filter, User } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    symbol: string;
    ward_name: string;
}

// Party logo mapping - matches exact database values
function getPartyLogo(partyName: string): string {
    switch (partyName) {
        case 'Indian National Congress':
            return '/images/party-symbols/congress-logo.jpg';
        case 'Shiv Sena (Uddhav Balasaheb Thackeray)':
            return '/images/party-symbols/shivsena-ubt-logo.jpg';
        case 'Bharatiya Janata Party':
            return '/images/party-symbols/bjp-logo.jpg';
        case 'Shiv Sena':
            return '/images/party-symbols/shivsena-logo.jpg';
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
            return '/images/party-symbols/generic.jpg';
    }
}

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedParty, setSelectedParty] = useState<string>("all");
    const [parties, setParties] = useState<string[]>([]);
    const [partySearchQuery, setPartySearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

            // Extract unique parties
            const uniqueParties = Array.from(new Set(allCandidates.map((c: Candidate) => c.party_name))).sort();
            setParties(uniqueParties);
            setLoading(false);
        };

        fetchCandidates();
    }, []);

    // Filter candidates based on search and party
    useEffect(() => {
        let filtered = candidates;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (candidate) =>
                    candidate.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    candidate.ward_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    candidate.party_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by party
        if (selectedParty !== "all") {
            filtered = filtered.filter((candidate) => candidate.party_name === selectedParty);
        }

        setFilteredCandidates(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchQuery, selectedParty, candidates]);

    // Filter parties based on search query
    const filteredParties = parties.filter((party) =>
        party.toLowerCase().includes(partySearchQuery.toLowerCase())
    );

    const getSelectedPartyLabel = () => {
        if (selectedParty === "all") {
            return `All Parties (${candidates.length})`;
        }
        const count = candidates.filter((c) => c.party_name === selectedParty).length;
        return `${selectedParty} (${count})`;
    };

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

                    {/* Party Filter Dropdown */}
                    <div className="relative z-10">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-between w-full md:w-64 px-4 py-2 text-sm border border-border rounded-md bg-background hover:bg-muted transition-colors shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate">{getSelectedPartyLabel()}</span>
                            </div>
                            <svg
                                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-full md:w-80 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 flex flex-col">
                                {/* Search within dropdown */}
                                <div className="p-3 border-b border-border">
                                    <Input
                                        type="text"
                                        placeholder="Search parties..."
                                        value={partySearchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartySearchQuery(e.target.value)}
                                        className="h-9"
                                    />
                                </div>

                                {/* Dropdown options */}
                                <div className="overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            setSelectedParty("all");
                                            setIsDropdownOpen(false);
                                            setPartySearchQuery("");
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${selectedParty === "all" ? "bg-accent/10 font-medium" : ""
                                            }`}
                                    >
                                        All Parties ({candidates.length})
                                    </button>
                                    {filteredParties.map((party) => {
                                        const count = candidates.filter((c) => c.party_name === party).length;
                                        return (
                                            <button
                                                key={party}
                                                onClick={() => {
                                                    setSelectedParty(party);
                                                    setIsDropdownOpen(false);
                                                    setPartySearchQuery("");
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${selectedParty === party ? "bg-accent/10 font-medium" : ""
                                                    }`}
                                            >
                                                {party} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by candidate name, party, or ward..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="pl-10"
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
                        <div className="grid gap-2">
                            {currentCandidates.map((candidate) => (
                                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="py-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-[16px] font-bold shrink-0">
                                                    {candidate.ward_no}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-[18px] leading-tight truncate">
                                                        {candidate.candidate_name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-[14px] text-muted-foreground min-w-0">
                                                        <span className="truncate min-w-0 block">{candidate.party_name}</span>
                                                        <span className="text-muted-foreground/40 shrink-0">•</span>
                                                        <span className="truncate min-w-0 block">{candidate.ward_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Image
                                                src={getPartyLogo(candidate.party_name)}
                                                alt={candidate.party_name}
                                                width={56}
                                                height={56}
                                                className="w-14 h-14 object-contain border border-black rounded-full shrink-0"
                                            />
                                        </div>
                                    </CardHeader>
                                </Card>
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
