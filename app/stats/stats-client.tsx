"use client";

import { useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Navbar } from "@/components/ui/navbar";
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
    "Nationalist Congress Party - Sharad Pawar",
    "Aam Aadmi Party",
    "Samajwadi Party",
    "Bahujan Samaj Party",
    "Vanchit Bahujan Aghadi",
];

const PARTY_SHORT_NAMES: Record<string, string> = {
    "Indian National Congress": "Congress",
    "Bharatiya Janata Party": "BJP",
    "Shiv Sena": "Shiv Sena",
    "Shiv Sena (Uddhav Balasaheb Thackeray)": "Shiv Sena (UBT)",
    "Maharashtra Navnirman Sena": "MNS",
    "Nationalist Congress Party": "NCP",
    "Nationalist Congress Party - Sharad Pawar": "NCP (SP)",
    "Aam Aadmi Party": "AAP",
    "Samajwadi Party": "SP",
    "Bahujan Samaj Party": "BSP",
    "Vanchit Bahujan Aghadi": "VBA",
};

const PARTY_COLORS: Record<string, string> = {
    "Indian National Congress": "#00BFFF",
    "Bharatiya Janata Party": "#FF9933",
    "Shiv Sena": "#FF6600",
    "Shiv Sena (Uddhav Balasaheb Thackeray)": "#0066CC",
    "Maharashtra Navnirman Sena": "#FFCC00",
    "Nationalist Congress Party": "#008000",
    "Nationalist Congress Party - Sharad Pawar": "#1E40AF",
    "Aam Aadmi Party": "#0072B8",
    "Samajwadi Party": "#E53935",
    "Bahujan Samaj Party": "#1565C0",
    "Vanchit Bahujan Aghadi": "#6A1B9A",
    "Others": "#9CA3AF",
};

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    is_women_reserved: boolean;
}

interface StatsClientProps {
    initialCandidates: Candidate[];
}

export default function StatsClient({ initialCandidates }: StatsClientProps) {
    const [selectedParty, setSelectedParty] = useState<string>(MAJOR_PARTIES[0]);
    const candidates = initialCandidates;

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
    const getPieOptions = (title: string, data: { name: string; y: number; color: string }[], size = "90%"): Highcharts.Options => ({
        chart: {
            type: "pie",
            backgroundColor: "transparent",
            height: 380,
            style: {
                fontFamily: "inherit",
            },
        },
        title: {
            text: title,
            style: { fontSize: "18px", fontWeight: "700", color: "#1C1917" },
        },
        tooltip: {
            headerFormat: "",
            pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)',
            style: { fontSize: "14px" },
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: "pointer",
                size: size,
                borderWidth: 2,
                borderColor: "#FFFFFF",
                dataLabels: {
                    enabled: true,
                    format: "<b>{point.name}</b><br/>{point.y}",
                    style: {
                        fontSize: "13px",
                        fontWeight: "600",
                        textOutline: "2px contrast",
                        color: "#44403C",
                    },
                    distance: 20,
                    connectorWidth: 2,
                    connectorColor: "#A8A29E",
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
                        <p className="font-medium text-amber-800">For Educational Purposes Only</p>
                        <p className="text-sm text-amber-700 mt-1">
                            This data is compiled for civic awareness and should <strong>not be quoted or cited</strong> as official statistics.
                            We track 11 major parties including Congress, BJP, Shiv Sena, SS(UBT), MNS, NCP, NCP(SP), AAP, SP, BSP, and VBA.
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

                {/* Party Insights Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Party Insights</h2>
                    <p className="text-stone-500 text-sm mb-4">
                        Ward category and women reservation breakdown for each major party
                    </p>

                    {/* Mobile: Highlighted Dropdown */}
                    <div className="md:hidden mb-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                            Select a Party to View
                        </label>
                        <select
                            value={selectedParty}
                            onChange={(e) => setSelectedParty(e.target.value)}
                            className="w-full p-3 text-lg font-semibold border-2 border-amber-400 bg-amber-50 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                        >
                            {MAJOR_PARTIES.map((party) => {
                                const count = candidates.filter((c) => c.party_name === party).length;
                                if (count === 0) return null;
                                return (
                                    <option key={party} value={party}>
                                        {PARTY_SHORT_NAMES[party]} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Mobile: Single Party Card */}
                    <div className="md:hidden">
                        {(() => {
                            const party = selectedParty;
                            const partyCandidates = candidates.filter((c) => c.party_name === party);
                            if (partyCandidates.length === 0) return null;

                            return (
                                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-100">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: PARTY_COLORS[party] }}
                                        />
                                        <h3 className="text-lg font-bold text-stone-900">
                                            {PARTY_SHORT_NAMES[party]}
                                        </h3>
                                        <span className="ml-auto text-sm font-semibold text-stone-600">
                                            {partyCandidates.length} candidates
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={{
                                                ...getPieOptions("Ward Categories", getPartyWardCategoryData(party), "80%"),
                                                chart: { ...getPieOptions("", [], "80%").chart, height: 240 },
                                                title: { text: "Ward Categories", style: { fontSize: "14px", fontWeight: "700" } },
                                                plotOptions: {
                                                    pie: {
                                                        size: "80%",
                                                        borderWidth: 2,
                                                        borderColor: "#FFFFFF",
                                                        dataLabels: {
                                                            enabled: true,
                                                            format: "<b>{point.name}</b>: {point.y}",
                                                            style: { fontSize: "11px", fontWeight: "600", color: "#44403C" },
                                                            distance: 10,
                                                            connectorWidth: 1,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={{
                                            ...getPieOptions("Seat Reservation", getPartyWomenReservedData(party), "80%"),
                                            chart: { ...getPieOptions("", [], "80%").chart, height: 240 },
                                            title: { text: "Seat Type", style: { fontSize: "14px", fontWeight: "700" } },
                                            plotOptions: {
                                                pie: {
                                                    size: "80%",
                                                    borderWidth: 2,
                                                    borderColor: "#FFFFFF",
                                                    dataLabels: {
                                                        enabled: true,
                                                        format: "<b>{point.name}</b>: {point.y}",
                                                        style: { fontSize: "11px", fontWeight: "600", color: "#44403C" },
                                                        distance: 10,
                                                        connectorWidth: 1,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            );
                        })()}
                    </div>

                    {/* Desktop: Full Grid */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MAJOR_PARTIES.map((party) => {
                            const partyCandidates = candidates.filter((c) => c.party_name === party);
                            if (partyCandidates.length === 0) return null;

                            return (
                                <div key={party} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-100">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: PARTY_COLORS[party] }}
                                        />
                                        <h3 className="text-lg font-bold text-stone-900">
                                            {PARTY_SHORT_NAMES[party]}
                                        </h3>
                                        <span className="ml-auto text-sm font-semibold text-stone-600">
                                            {partyCandidates.length} candidates
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={{
                                                ...getPieOptions("Ward Categories", getPartyWardCategoryData(party), "80%"),
                                                chart: { ...getPieOptions("", [], "80%").chart, height: 240 },
                                                title: { text: "Ward Categories", style: { fontSize: "14px", fontWeight: "700" } },
                                                plotOptions: {
                                                    pie: {
                                                        size: "80%",
                                                        borderWidth: 2,
                                                        borderColor: "#FFFFFF",
                                                        dataLabels: {
                                                            enabled: true,
                                                            format: "<b>{point.name}</b>: {point.y}",
                                                            style: { fontSize: "11px", fontWeight: "600", color: "#44403C" },
                                                            distance: 10,
                                                            connectorWidth: 1,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={{
                                            ...getPieOptions("Seat Reservation", getPartyWomenReservedData(party), "80%"),
                                            chart: { ...getPieOptions("", [], "80%").chart, height: 240 },
                                            title: { text: "Seat Type", style: { fontSize: "14px", fontWeight: "700" } },
                                            plotOptions: {
                                                pie: {
                                                    size: "80%",
                                                    borderWidth: 2,
                                                    borderColor: "#FFFFFF",
                                                    dataLabels: {
                                                        enabled: true,
                                                        format: "<b>{point.name}</b>: {point.y}",
                                                        style: { fontSize: "11px", fontWeight: "600", color: "#44403C" },
                                                        distance: 10,
                                                        connectorWidth: 1,
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
