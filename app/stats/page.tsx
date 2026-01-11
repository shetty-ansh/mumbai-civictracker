"use client";

import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import { Info } from "lucide-react";
import categoryReservationData from "@/data/category-reservation.json";

// Major parties we have detailed data for
const MAJOR_PARTIES = [
    "Indian National Congress",
    "Bharatiya Janata Party",
    "Shiv Sena",
    "Shiv Sena (Uddhav Balasaheb Thackeray)",
    "Maharashtra Navnirman Sena",
    "Nationalist Congress Party",
];

const PARTY_SHORT_NAMES: Record<string, string> = {
    "Indian National Congress": "Congress",
    "Bharatiya Janata Party": "BJP",
    "Shiv Sena": "Shiv Sena",
    "Shiv Sena (Uddhav Balasaheb Thackeray)": "Shiv Sena (UBT)",
    "Maharashtra Navnirman Sena": "MNS",
    "Nationalist Congress Party": "NCP",
};

const PARTY_COLORS: Record<string, string> = {
    "Indian National Congress": "#00BFFF",
    "Bharatiya Janata Party": "#FF9933",
    "Shiv Sena": "#FF6600",
    "Shiv Sena (Uddhav Balasaheb Thackeray)": "#0066CC",
    "Maharashtra Navnirman Sena": "#FFCC00",
    "Nationalist Congress Party": "#008000",
    "Others": "#9CA3AF",
};

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    is_women_reserved: boolean;
}

export default function StatsPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            let allCandidates: Candidate[] = [];
            let from = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from("bmc_candidates")
                    .select("id, ward_no, candidate_name, party_name, is_women_reserved")
                    .range(from, from + pageSize - 1);

                if (error) {
                    console.error("Error fetching candidates:", error);
                    break;
                }

                if (data && data.length > 0) {
                    allCandidates = [...allCandidates, ...data];
                    from += pageSize;
                    if (data.length < pageSize) hasMore = false;
                } else {
                    hasMore = false;
                }
            }

            setCandidates(allCandidates);
            setLoading(false);
        };

        fetchCandidates();
    }, []);

    // Calculate party distribution
    const getPartyDistribution = () => {
        const partyCounts: Record<string, number> = {};
        let othersCount = 0;

        candidates.forEach((c) => {
            if (MAJOR_PARTIES.includes(c.party_name)) {
                partyCounts[c.party_name] = (partyCounts[c.party_name] || 0) + 1;
            } else {
                othersCount++;
            }
        });

        const data = MAJOR_PARTIES.map((party) => ({
            name: PARTY_SHORT_NAMES[party] || party,
            y: partyCounts[party] || 0,
            color: PARTY_COLORS[party],
        })).filter((d) => d.y > 0);

        if (othersCount > 0) {
            data.push({ name: "Others", y: othersCount, color: PARTY_COLORS["Others"] });
        }

        return data;
    };

    // Get party-wise ward category distribution
    const getPartyWardCategoryData = (partyName: string) => {
        const partyCandidates = candidates.filter((c) => c.party_name === partyName);
        const categoryCounts: Record<string, number> = { GEN: 0, OBC: 0, SC: 0, ST: 0 };

        partyCandidates.forEach((c) => {
            const wardRes = categoryReservationData.find((r) => r.ward_no === c.ward_no);
            if (wardRes) {
                categoryCounts[wardRes.category] = (categoryCounts[wardRes.category] || 0) + 1;
            }
        });

        return [
            { name: "General", y: categoryCounts.GEN, color: "#6B7280" },
            { name: "OBC", y: categoryCounts.OBC, color: "#F59E0B" },
            { name: "SC", y: categoryCounts.SC, color: "#3B82F6" },
            { name: "ST", y: categoryCounts.ST, color: "#10B981" },
        ].filter((d) => d.y > 0);
    };

    // Get party-wise women reserved distribution
    const getPartyWomenReservedData = (partyName: string) => {
        const partyCandidates = candidates.filter((c) => c.party_name === partyName);
        let womenReserved = 0;
        let general = 0;

        partyCandidates.forEach((c) => {
            const wardRes = categoryReservationData.find((r) => r.ward_no === c.ward_no);
            if (wardRes?.women_reserved) {
                womenReserved++;
            } else {
                general++;
            }
        });

        return [
            { name: "Women Reserved", y: womenReserved, color: "#EC4899" },
            { name: "General", y: general, color: "#6B7280" },
        ].filter((d) => d.y > 0);
    };

    // Pie chart options generator
    const getPieOptions = (title: string, data: { name: string; y: number; color: string }[], size = "100%"): Highcharts.Options => ({
        chart: {
            type: "pie",
            backgroundColor: "transparent",
            height: 280,
        },
        title: {
            text: title,
            style: { fontSize: "14px", fontWeight: "600", color: "#1C1917" },
        },
        tooltip: {
            pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)",
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: "pointer",
                size: size,
                dataLabels: {
                    enabled: true,
                    format: "{point.name}: {point.y}",
                    style: { fontSize: "11px", fontWeight: "normal" },
                },
            },
        },
        series: [
            {
                type: "pie",
                name: title,
                data: data,
            },
        ],
        credits: { enabled: false },
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50">
                <Navbar />
                <main className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-center py-20">
                        <p className="text-stone-500">Loading statistics...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Election Statistics</h1>
                    <p className="text-stone-500">
                        Insights and analysis of {candidates.length.toLocaleString()} candidates across 227 electoral wards
                    </p>
                </div>

                {/* Data Notice */}
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">Detailed Data Available</p>
                        <p className="text-sm text-amber-700 mt-1">
                            We have detailed candidate information for: <strong>Congress</strong>, <strong>BJP</strong>,{" "}
                            <strong>Shiv Sena</strong>, <strong>Shiv Sena (UBT)</strong>, <strong>MNS</strong>, and{" "}
                            <strong>NCP</strong>. Other parties are grouped as "Others" in the statistics below.
                        </p>
                    </div>
                </div>

                {/* Overall Party Distribution */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Candidates by Party</h2>
                    <div className="bg-white border border-stone-200 rounded-xl p-6">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={getPieOptions("Party-wise Candidate Distribution", getPartyDistribution(), "85%")}
                        />
                    </div>
                </div>

                {/* Party Insights Grid */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Party Insights</h2>
                    <p className="text-stone-500 text-sm mb-4">
                        Ward category and women reservation breakdown for each major party
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MAJOR_PARTIES.map((party) => {
                            const partyCandidates = candidates.filter((c) => c.party_name === party);
                            if (partyCandidates.length === 0) return null;

                            return (
                                <div key={party} className="bg-white border border-stone-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: PARTY_COLORS[party] }}
                                        />
                                        <h3 className="font-semibold text-stone-800">
                                            {PARTY_SHORT_NAMES[party]}
                                        </h3>
                                        <span className="ml-auto text-sm text-stone-500">
                                            {partyCandidates.length} candidates
                                        </span>
                                    </div>

                                    {/* Ward Category Pie */}
                                    <div className="mb-2">
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={{
                                                ...getPieOptions("Ward Categories", getPartyWardCategoryData(party), "70%"),
                                                chart: { ...getPieOptions("", [], "70%").chart, height: 200 },
                                                title: { text: "Ward Categories", style: { fontSize: "12px" } },
                                                plotOptions: {
                                                    pie: {
                                                        size: "70%",
                                                        dataLabels: {
                                                            enabled: true,
                                                            format: "{point.name}: {point.y}",
                                                            style: { fontSize: "9px" },
                                                            distance: 5,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>

                                    {/* Women Reserved Pie */}
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={{
                                            ...getPieOptions("Seat Reservation", getPartyWomenReservedData(party), "70%"),
                                            chart: { ...getPieOptions("", [], "70%").chart, height: 200 },
                                            title: { text: "Seat Type", style: { fontSize: "12px" } },
                                            plotOptions: {
                                                pie: {
                                                    size: "70%",
                                                    dataLabels: {
                                                        enabled: true,
                                                        format: "{point.name}: {point.y}",
                                                        style: { fontSize: "9px" },
                                                        distance: 5,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Overall Ward Category Distribution */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Overall Ward Category Distribution</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-stone-200 rounded-xl p-6">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={getPieOptions(
                                    "Candidates by Ward Category",
                                    (() => {
                                        const categoryCounts: Record<string, number> = { GEN: 0, OBC: 0, SC: 0, ST: 0 };
                                        candidates.forEach((c) => {
                                            const wardRes = categoryReservationData.find((r) => r.ward_no === c.ward_no);
                                            if (wardRes) {
                                                categoryCounts[wardRes.category] = (categoryCounts[wardRes.category] || 0) + 1;
                                            }
                                        });
                                        return [
                                            { name: "General", y: categoryCounts.GEN, color: "#6B7280" },
                                            { name: "OBC", y: categoryCounts.OBC, color: "#F59E0B" },
                                            { name: "SC", y: categoryCounts.SC, color: "#3B82F6" },
                                            { name: "ST", y: categoryCounts.ST, color: "#10B981" },
                                        ].filter((d) => d.y > 0);
                                    })(),
                                    "85%"
                                )}
                            />
                        </div>

                        <div className="bg-white border border-stone-200 rounded-xl p-6">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={getPieOptions(
                                    "Candidates by Seat Type",
                                    (() => {
                                        let womenReserved = 0;
                                        let general = 0;
                                        candidates.forEach((c) => {
                                            const wardRes = categoryReservationData.find((r) => r.ward_no === c.ward_no);
                                            if (wardRes?.women_reserved) {
                                                womenReserved++;
                                            } else {
                                                general++;
                                            }
                                        });
                                        return [
                                            { name: "Women Reserved", y: womenReserved, color: "#EC4899" },
                                            { name: "General", y: general, color: "#6B7280" },
                                        ];
                                    })(),
                                    "85%"
                                )}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
