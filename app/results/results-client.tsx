"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Navbar } from "@/components/ui/navbar";
import { Trophy, Vote, Users, TrendingUp, Award, ExternalLink, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Winner {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    ward_name: string;
    is_women_reserved: boolean;
    votes: number | null;
}

interface ResultsClientProps {
    winners: Winner[];
}

// Party configurations
const PARTY_SHORT_NAMES: Record<string, string> = {
    "Indian National Congress": "Congress",
    "Bharatiya Janata Party": "BJP",
    "Shiv Sena": "Shiv Sena",
    "Shiv Sena (Uddhav Balasaheb Thackeray)": "SS (UBT)",
    "Maharashtra Navnirman Sena": "MNS",
    "Nationalist Congress Party": "NCP",
    "Nationalist Congress Party - Sharad Pawar": "NCP (SP)",
    "Aam Aadmi Party": "AAP",
    "Samajwadi Party": "SP",
    "Bahujan Samaj Party": "BSP",
    "Vanchit Bahujan Aghadi": "VBA",
    "Independent": "IND",
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
    "Independent": "#78716C",
    "Others": "#9CA3AF",
};

// Alliance groupings
const MAHAYUTI_PARTIES = ["Bharatiya Janata Party", "Shiv Sena"];
const MVA_PARTIES = ["Indian National Congress", "Shiv Sena (Uddhav Balasaheb Thackeray)", "Nationalist Congress Party - Sharad Pawar", "Maharashtra Navnirman Sena", "Vanchit Bahujan Aghadi"];

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

function formatVotes(votes: number): string {
    return votes.toLocaleString('en-IN');
}

export default function ResultsClient({ winners }: ResultsClientProps) {
    // Data Notice Popup
    const [showNotice, setShowNotice] = useState(false);

    useEffect(() => {
        // Check if notice has been dismissed in this session
        const hasDismissed = sessionStorage.getItem('results-notice-dismissed');
        if (!hasDismissed) {
            setShowNotice(true);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('results-notice-dismissed', 'true');
        setShowNotice(false);
    };

    // Calculate stats
    const stats = useMemo(() => {
        const totalVotes = winners.reduce((sum, w) => sum + (w.votes || 0), 0);
        const partyCounts: Record<string, { seats: number; votes: number }> = {};

        winners.forEach(w => {
            const party = w.party_name || "Independent";
            if (!partyCounts[party]) {
                partyCounts[party] = { seats: 0, votes: 0 };
            }
            partyCounts[party].seats++;
            partyCounts[party].votes += w.votes || 0;
        });

        // Sort by seats
        const sortedParties = Object.entries(partyCounts)
            .sort((a, b) => b[1].seats - a[1].seats);

        const leadingParty = sortedParties[0]?.[0] || "TBD";
        const leadingSeats = sortedParties[0]?.[1].seats || 0;

        // Alliance stats
        const mahayutiSeats = MAHAYUTI_PARTIES.reduce((sum, p) => sum + (partyCounts[p]?.seats || 0), 0);
        const mvaSeats = MVA_PARTIES.reduce((sum, p) => sum + (partyCounts[p]?.seats || 0), 0);
        const othersSeats = winners.length - mahayutiSeats - mvaSeats;

        return {
            totalWards: winners.length,
            totalVotes,
            leadingParty,
            leadingSeats,
            partyCounts,
            sortedParties,
            mahayutiSeats,
            mvaSeats,
            othersSeats,
        };
    }, [winners]);

    // Top vote getters
    const topVoteGetters = useMemo(() => {
        return [...winners]
            .filter(w => w.votes !== null)
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 10);
    }, [winners]);

    // Seats won pie chart data
    const seatsChartData = useMemo(() => {
        return stats.sortedParties.map(([party, data]) => ({
            name: PARTY_SHORT_NAMES[party] || party,
            y: data.seats,
            color: PARTY_COLORS[party] || PARTY_COLORS["Others"],
        }));
    }, [stats]);

    // Vote share bar chart data
    const voteShareData = useMemo(() => {
        return stats.sortedParties
            .filter(([, data]) => data.votes > 0)
            .slice(0, 10)
            .map(([party, data]) => ({
                name: PARTY_SHORT_NAMES[party] || party,
                y: data.votes,
                color: PARTY_COLORS[party] || PARTY_COLORS["Others"],
            }));
    }, [stats]);

    // Pie chart options
    const seatsChartOptions: Highcharts.Options = {
        chart: {
            type: "pie",
            backgroundColor: "transparent",
            height: 400,
            style: { fontFamily: "inherit" },
        },
        title: {
            text: "Seats Won by Party",
            style: { fontSize: "18px", fontWeight: "700", color: "#1C1917" },
        },
        tooltip: {
            headerFormat: "",
            pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b>: {point.y} seats ({point.percentage:.1f}%)',
            style: { fontSize: "14px" },
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: "pointer",
                size: "85%",
                borderWidth: 3,
                borderColor: "#FFFFFF",
                innerSize: "50%",
                dataLabels: {
                    enabled: true,
                    format: "<b>{point.name}</b><br/>{point.y}",
                    style: {
                        fontSize: "12px",
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
        series: [{ type: "pie", name: "Seats", data: seatsChartData }],
        credits: { enabled: false },
    };

    // Bar chart options for vote share
    const voteShareChartOptions: Highcharts.Options = {
        chart: {
            type: "bar",
            backgroundColor: "transparent",
            height: 400,
            style: { fontFamily: "inherit" },
        },
        title: {
            text: "Total Votes by Party",
            style: { fontSize: "18px", fontWeight: "700", color: "#1C1917" },
        },
        xAxis: {
            categories: voteShareData.map(d => d.name),
            labels: {
                style: { fontSize: "12px", fontWeight: "600", color: "#44403C" },
            },
        },
        yAxis: {
            title: { text: "Votes", style: { color: "#78716C" } },
            labels: {
                formatter: function () {
                    return (Number(this.value) / 1000).toFixed(0) + 'K';
                },
            },
        },
        tooltip: {
            headerFormat: "",
            pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b>: {point.y:,.0f} votes',
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return formatVotes(this.y as number);
                    },
                    style: { fontSize: "11px", fontWeight: "600" },
                },
            },
        },
        series: [{
            type: "bar",
            name: "Votes",
            data: voteShareData,
            colorByPoint: true,
        }],
        legend: { enabled: false },
        credits: { enabled: false },
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />

            {/* Custom Data Notice Modal */}
            {showNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white border-2 border-amber-500 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 p-2 rounded-full">
                                <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                            </div>
                            <h2 className="text-xl font-bold text-amber-700 leading-none">
                                Live Data Updates
                            </h2>
                        </div>

                        <div className="text-stone-600 text-base mb-6 space-y-2">
                            <p>Election results are currently being entered into our system.</p>
                            <p className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800">
                                <strong>Note:</strong> This is taking some time because we are adding detailed vote counts for every single candidate across all 227 wards. Please check back frequently for updates.
                            </p>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg py-3 px-6 transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            Got it, show me results
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                        <Trophy className="w-7 h-7 md:w-8 md:h-8 text-amber-500" />
                        BMC Election Results 2026
                    </h1>
                    <p className="text-stone-500">
                        Live results from {stats.totalWards} wards declared
                    </p>
                </div>

                {/* Hero Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 md:p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 opacity-80" />
                            <span className="text-xs md:text-sm font-medium opacity-90">Wards Declared</span>
                        </div>
                        <p className="text-3xl md:text-4xl font-bold">{stats.totalWards}</p>
                        <p className="text-xs opacity-75 mt-1">of 227 wards</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 md:p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Vote className="w-5 h-5 opacity-80" />
                            <span className="text-xs md:text-sm font-medium opacity-90">Total Votes</span>
                        </div>
                        <p className="text-3xl md:text-4xl font-bold">{(stats.totalVotes / 100000).toFixed(1)}L</p>
                        <p className="text-xs opacity-75 mt-1">{formatVotes(stats.totalVotes)} votes</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 md:p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 opacity-80" />
                            <span className="text-xs md:text-sm font-medium opacity-90">Leading Party</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold truncate">{PARTY_SHORT_NAMES[stats.leadingParty] || stats.leadingParty}</p>
                        <p className="text-xs opacity-75 mt-1">{stats.leadingSeats} seats won</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 md:p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 opacity-80" />
                            <span className="text-xs md:text-sm font-medium opacity-90">Majority Mark</span>
                        </div>
                        <p className="text-3xl md:text-4xl font-bold">114</p>
                        <p className="text-xs opacity-75 mt-1">seats needed</p>
                    </div>
                </div>

                {/* Alliance Comparison */}
                <div className="mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-semibold mb-4">Alliance Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Mahayuti */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5">
                            <h3 className="font-bold text-lg text-orange-800 mb-1">Mahayuti</h3>
                            <p className="text-xs text-orange-600 mb-3">BJP + Shiv Sena</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-orange-600">{stats.mahayutiSeats}</span>
                                <span className="text-stone-500">seats</span>
                            </div>
                            <div className="mt-3 h-2 bg-orange-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                                    style={{ width: `${(stats.mahayutiSeats / 227) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* MVA */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                            <h3 className="font-bold text-lg text-blue-800 mb-1">MVA</h3>
                            <p className="text-xs text-blue-600 mb-3">Congress + SS(UBT) + NCP(SP) + MNS + VBA</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-blue-600">{stats.mvaSeats}</span>
                                <span className="text-stone-500">seats</span>
                            </div>
                            <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                                    style={{ width: `${(stats.mvaSeats / 227) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Others */}
                        <div className="bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-200 rounded-xl p-5">
                            <h3 className="font-bold text-lg text-stone-800 mb-1">Others</h3>
                            <p className="text-xs text-stone-500 mb-3">Independents & Other Parties</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-stone-600">{stats.othersSeats}</span>
                                <span className="text-stone-500">seats</span>
                            </div>
                            <div className="mt-3 h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-stone-400 to-stone-500 rounded-full"
                                    style={{ width: `${(stats.othersSeats / 227) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Seats Chart */}
                    <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-6">
                        <HighchartsReact highcharts={Highcharts} options={seatsChartOptions} />
                    </div>

                    {/* Vote Share Chart */}
                    <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-6">
                        <HighchartsReact highcharts={Highcharts} options={voteShareChartOptions} />
                    </div>
                </div>

                {/* Top Vote Getters */}
                <div className="mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Top Vote Getters
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {topVoteGetters.map((winner, index) => (
                            <Link
                                key={winner.id}
                                href={`/candidates/${winner.id}`}
                                className="group bg-white border border-stone-200 rounded-xl p-4 hover:shadow-lg hover:border-amber-300 transition-all duration-300"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="relative">
                                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <Image
                                            src={getPartyLogo(winner.party_name, winner.is_women_reserved)}
                                            alt={winner.party_name}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full border border-stone-200 object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate group-hover:text-amber-700 transition-colors">
                                            {winner.candidate_name}
                                        </p>
                                        <p className="text-xs text-stone-500 truncate">
                                            {PARTY_SHORT_NAMES[winner.party_name] || winner.party_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-stone-400">Ward {winner.ward_no}</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {winner.votes ? formatVotes(winner.votes) : 'N/A'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* All Winners Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg md:text-xl font-semibold">All Winners ({winners.length})</h2>
                        <Link
                            href="/candidates"
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                        >
                            View All Candidates
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-stone-900 text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="text-left p-3 text-xs uppercase tracking-wider font-medium">Ward</th>
                                        <th className="text-left p-3 text-xs uppercase tracking-wider font-medium">Winner</th>
                                        <th className="text-left p-3 text-xs uppercase tracking-wider font-medium">Party</th>
                                        <th className="text-right p-3 text-xs uppercase tracking-wider font-medium">Votes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {winners.map((winner, index) => (
                                        <tr
                                            key={winner.id}
                                            className={`border-b border-stone-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}
                                        >
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-stone-900">Ward {winner.ward_no}</span>
                                                    <span className="text-xs text-stone-500 truncate max-w-[120px]">{winner.ward_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Link
                                                    href={`/candidates/${winner.id}`}
                                                    className="font-medium text-stone-900 hover:text-amber-600 transition-colors"
                                                >
                                                    {winner.candidate_name}
                                                </Link>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={getPartyLogo(winner.party_name, winner.is_women_reserved)}
                                                        alt={winner.party_name}
                                                        width={24}
                                                        height={24}
                                                        className="w-6 h-6 rounded-full border border-stone-200 object-contain"
                                                    />
                                                    <span className="text-sm text-stone-600">
                                                        {PARTY_SHORT_NAMES[winner.party_name] || winner.party_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className="font-semibold text-emerald-600">
                                                    {winner.votes ? formatVotes(winner.votes) : 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
