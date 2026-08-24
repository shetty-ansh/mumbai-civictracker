"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboardRatings } from "@/lib/services/leaderboardSercvice";
import { LeaderboardData } from "@/lib/types/candidate.type";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Star, MapPin, User as UserIcon, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

export default function RankingsPage() {
    const [rankings, setRankings] = useState<LeaderboardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const loadRankings = async () => {
            const { data, error } = await fetchLeaderboardRatings();
            if (error) {
                setError(error);
            } else if (data) {
                setRankings(data);
            }
            setLoading(false);
        };
        loadRankings();
    }, []);

    // Compute absolute rank first
    const rankedCandidates = useMemo(() => {
        return rankings.map((c, idx) => ({ ...c, rank: idx + 1 }));
    }, [rankings]);

    // Filter by search query
    const filteredRankings = useMemo(() => {
        if (!searchQuery) return rankedCandidates;
        const lowerQuery = searchQuery.toLowerCase();
        return rankedCandidates.filter((candidate) =>
            (candidate.candidate_name?.toLowerCase() || "").includes(lowerQuery) ||
            (candidate.ward_no?.toString() || "").includes(lowerQuery)
        );
    }, [searchQuery, rankedCandidates]);

    // Reset to page 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredRankings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRankings = filteredRankings.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-amber-500" />
                            Corporator Rankings
                        </h1>
                        <p className="text-muted-foreground">
                            Top rated elected representatives based on citizen feedback and reviews.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                        <p className="text-muted-foreground mt-4 text-sm font-medium tracking-wide">Crunching the data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-6 rounded-xl text-center shadow-sm max-w-md mx-auto animate-in fade-in zoom-in-95">
                        <p className="font-medium text-base mb-1">Failed to load rankings</p>
                        <p className="text-sm opacity-80">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 transition-colors rounded-lg text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Search Bar */}
                        {rankings.length > 0 && (
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by corporator name or ward..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10 bg-background"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            {currentRankings.map((candidate, index) => {
                                const isTopThree = candidate.rank <= 3;
                                const actualRank = candidate.rank;

                                return (
                                    <Link
                                        key={candidate.id}
                                        href={`/candidates/${candidate.id}`}
                                        className="block group outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                                    >
                                        <div className={`relative flex items-center p-4 sm:p-5 rounded-xl border transition-all duration-300 shadow-sm
                                        ${isTopThree
                                                ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400 hover:shadow-md'
                                                : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5'}
                                    `}>

                                            {/* Rank Number / Medal */}
                                            <div className="flex-shrink-0 w-12 sm:w-16 flex justify-center">
                                                {actualRank === 1 ? (
                                                    <div className="relative transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 sm:w-12 sm:h-12">
                                                        <Image src="/images/components/firstplace.png" alt="1st Place" fill className="object-contain drop-shadow-md" />
                                                    </div>
                                                ) : actualRank === 2 ? (
                                                    <div className="relative transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 sm:w-12 sm:h-12">
                                                        <Image src="/images/components/secondplace.png" alt="2nd Place" fill className="object-contain drop-shadow-md" />
                                                    </div>
                                                ) : actualRank === 3 ? (
                                                    <div className="relative transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 sm:w-12 sm:h-12">
                                                        <Image src="/images/components/thirdplace.png" alt="3rd Place" fill className="object-contain drop-shadow-md" />
                                                    </div>
                                                ) : (
                                                    <span className="text-xl sm:text-2xl font-bold text-stone-300 group-hover:text-stone-400 transition-colors">
                                                        #{actualRank}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Candidate Details */}
                                            <div className="flex-1 min-w-0 ml-4 sm:ml-6">
                                                <h2 className="text-lg sm:text-xl font-semibold text-stone-900 truncate group-hover:text-stone-700 transition-colors">
                                                    {candidate.candidate_name}
                                                </h2>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-xs sm:text-sm text-stone-600 font-medium border border-stone-200">
                                                        <MapPin className="w-3.5 h-3.5 mr-1 text-stone-500" />
                                                        Ward {candidate.ward_no}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rating Score */}
                                            <div className="flex-shrink-0 ml-4 flex flex-col items-end">
                                                <div className="flex items-center justify-center bg-stone-900 text-white rounded-[4px] px-2 py-1 sm:px-4 sm:py-2 shadow-sm group-hover:bg-amber-600 transition-colors duration-300">
                                                    <span className="text-sm sm:text-[16px] font-semibold mr-1.5 tracking-tight">
                                                        {candidate.rating_avg !== null ? candidate.rating_avg.toFixed(1) : '-'}
                                                    </span>
                                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 group-hover:fill-white group-hover:text-white transition-colors" />
                                                </div>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-medium tracking-wide uppercase">
                                                    {candidate.rating_count} {candidate.rating_count === 1 ? 'Review' : 'Reviews'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}

                            {currentRankings.length === 0 && rankings.length > 0 && (
                                <div className="text-center py-16 bg-white border border-stone-200 rounded-xl shadow-sm">
                                    <Search className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-stone-800">No results found</h3>
                                    <p className="text-stone-500 text-sm mt-1">Try adjusting your search query.</p>
                                </div>
                            )}

                            {rankings.length === 0 && (
                                <div className="text-center py-20 bg-white border border-stone-200 rounded-xl shadow-sm">
                                    <div className="inline-flex items-center justify-center p-3 bg-stone-50 rounded-full mb-3">
                                        <UserIcon className="w-10 h-10 text-stone-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-stone-800">No ratings yet</h3>
                                    <p className="text-stone-500 text-sm mt-1 max-w-sm mx-auto">Be the first to rate a corporator and get them on the leaderboard!</p>
                                    <Link
                                        href="/candidates"
                                        className="inline-flex items-center justify-center mt-5 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                                    >
                                        Browse Candidates
                                    </Link>
                                </div>
                            )}

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
                        </div>
                    </>)}
            </main>
        </div>
    );
}
