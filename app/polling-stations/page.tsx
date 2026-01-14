"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { showToast } from "@/lib/toast";
import {
    MapPin,
    AlertTriangle,
    Building2,
    Info,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import pollingStationsData from "@/data/polling_stations.json";

interface PollingStation {
    name: string;
    pincode: string;
}

export default function PollingStationsPage() {
    const [pincode, setPincode] = useState("");
    const [searchedPincode, setSearchedPincode] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Transform the data into an array of objects
    const allStations: PollingStation[] = useMemo(() => {
        return Object.entries(pollingStationsData).map(([name, pin]) => ({
            name,
            pincode: pin as string
        }));
    }, []);

    // Filter stations by pincode
    const filteredStations = useMemo(() => {
        if (!searchedPincode) return [];
        return allStations.filter(station => station.pincode === searchedPincode);
    }, [searchedPincode, allStations]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
    const paginatedStations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredStations.slice(start, start + itemsPerPage);
    }, [filteredStations, currentPage, itemsPerPage]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchedPincode]);

    const handlePincodeChange = (value: string) => {
        if (value.length <= 6) {
            setPincode(value);

            // Auto-search on 6 digits
            if (value.length === 6) {
                const stationsForPincode = allStations.filter(s => s.pincode === value);

                if (stationsForPincode.length === 0) {
                    showToast(
                        "warning",
                        "No Stations Found",
                        `No polling stations found for pincode ${value}. This pincode may not be in Mumbai or our database.`
                    );
                    setSearchedPincode(null);
                } else {
                    setSearchedPincode(value);
                    showToast(
                        "success",
                        "Stations Found",
                        `Found ${stationsForPincode.length} polling station${stationsForPincode.length > 1 ? 's' : ''} for pincode ${value}.`
                    );
                }
            } else {
                // Clear results if user is typing/editing
                setSearchedPincode(null);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Prevent default form submission if any
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const handleClear = () => {
        setPincode("");
        setSearchedPincode(null);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    // Get unique pincodes for stats
    const uniquePincodes = useMemo(() => {
        return new Set(allStations.map(s => s.pincode)).size;
    }, [allStations]);

    return (
        <div className="min-h-screen bg-background text-stone-900">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-fraunces)]">Find Polling Stations</h1>
                    <p className="text-stone-600">
                        Search {allStations.length.toLocaleString()} polling stations across {uniquePincodes} pincodes in Mumbai
                    </p>
                </div>

                {/* Disclaimer Banner */}
                <div className="mb-6 bg-[#FEFCE8] border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-200">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-stone-900">Important Disclaimer</p>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            This data is for informational purposes only. Polling station locations may change before election day.
                            Please verify your assigned station through official BMC or Election Commission sources.
                        </p>
                    </div>
                </div>

                {/* Search Section */}
                <div className="mb-8 flex flex-col items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                            Your Pincode
                        </label>
                        <InputOTP
                            maxLength={6}
                            value={pincode}
                            onChange={handlePincodeChange}
                            onKeyDown={handleKeyDown}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} placeholder="0" className="h-16 w-14 text-3xl font-bold border-2 border-stone-300 shadow-sm" />
                                <InputOTPSlot index={1} placeholder="0" className="h-16 w-14 text-3xl font-bold border-2 border-stone-300 shadow-sm" />
                                <InputOTPSlot index={2} placeholder="0" className="h-16 w-14 text-3xl font-bold border-2 border-stone-300 shadow-sm" />
                            </InputOTPGroup>
                            <div className="w-6" />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} placeholder="0" className="h-16 w-14 text-3xl font-bold border-2 border-stone-300 shadow-sm" />
                                <InputOTPSlot index={4} placeholder="0" className="h-16 w-14 text-3xl font-bold border-2 border-stone-300 shadow-sm" />
                                <InputOTPSlot index={5} placeholder="0" className="h-16 w-14 text-3xl font-bold border-2 border-stone-300 shadow-sm" />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <div className="flex gap-3">
                        {pincode && (
                            <Button
                                onClick={handleClear}
                                variant="outline"
                                className="border-stone-200 text-stone-600 hover:bg-stone-50 px-6 py-4 h-auto"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info text */}
                <div className="mb-6 flex items-start gap-2 text-sm text-stone-500">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                    <span>
                        Enter your residential pincode to find polling stations in your area.
                        Mumbai pincodes typically start with 400.
                    </span>
                </div>

                {/* Results Count and Simple Pagination Info */}
                {searchedPincode && (
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-sm text-stone-600">
                            Showing <span className="font-medium text-stone-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredStations.length)}</span> to <span className="font-medium text-stone-900">{Math.min(currentPage * itemsPerPage, filteredStations.length)}</span> of <span className="font-medium text-stone-900">{filteredStations.length}</span> stations for pincode {searchedPincode}
                        </p>
                        {totalPages > 1 && (
                            <p className="text-xs text-stone-400">
                                Page {currentPage} of {totalPages}
                            </p>
                        )}
                    </div>
                )}

                {/* Results */}
                {searchedPincode ? (
                    <>
                        <div className="space-y-4">
                            {paginatedStations.map((station, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center flex-shrink-0 border border-stone-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                                            <Building2 className="h-6 w-6 text-stone-600 group-hover:text-amber-600 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-base text-stone-800 font-medium leading-snug">
                                                {station.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <MapPin className="h-4 w-4 text-amber-500" />
                                                <span className="text-sm font-medium text-stone-500">
                                                    Mumbai (Pincode: {station.pincode})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    variant="outline"
                                    className="w-full sm:w-auto border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 px-2 max-w-full">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                                                className={`w-10 h-10 flex-shrink-0 text-sm rounded-lg transition-all ${currentPage === pageNum
                                                    ? "bg-black text-white font-medium shadow-sm"
                                                    : "text-stone-500 hover:bg-stone-100 border border-transparent hover:border-stone-200"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    variant="outline"
                                    className="w-full sm:w-auto border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="bg-[#F9F9F7] border border-stone-200 p-16 text-center rounded-2xl shadow-sm">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
                            <MapPin className="w-10 h-10 text-stone-200" strokeWidth={1.5} />
                        </div>
                        <p className="text-xl font-bold text-stone-900 mb-2 font-[family-name:var(--font-fraunces)]">Search for Polling Stations</p>
                        <p className="text-stone-500 max-w-sm mx-auto leading-relaxed">
                            Enter your 6-digit pincode above to discover the exact polling booth locations assigned to your area.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-stone-100">
                    <p className="text-center text-xs text-stone-400">
                        Data sourced from public BMC records. For exact details, please check your <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Voter ID status</a> on the ECI portal.
                    </p>
                </div>
            </main>
        </div>
    );
}
