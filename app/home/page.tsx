"use client";

import { useState } from "react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Navbar } from "@/components/ui/navbar";
import { Map, Users, MessageSquare, Newspaper, BarChart3, BookOpen, X } from "lucide-react";

export default function HomePage() {
    const [showHandbookToast, setShowHandbookToast] = useState(true);
    const features = [
        {
            Icon: Map,
            name: "Interactive Map",
            description: "Explore Mumbai's 24 administrative wards and 227 electoral wards. Find your representatives and ward statistics.",
            href: "/map",
            cta: "Explore Map",
            background: (
                <div className="absolute top-0 left-0 w-full h-full bg-[#e0e7ff] z-0">
                    <img
                        src="/images/mumbaimap.png"
                        alt="Mumbai Map"
                        className="absolute right-0 top-0 h-full object-cover opacity-60"
                    />
                </div>
            ),
            className: "md:col-span-2 md:row-span-1",
        },
        {
            Icon: Users,
            name: "Representatives",
            description: "Get detailed information about your Corporators, MLAs, and MPs. Hold them accountable.",
            href: "/candidates",
            cta: "View Leaders",
            background: <div className="absolute top-0 left-0 w-full h-full bg-[#ffedd5] z-0" />,
            className: "md:col-span-1 md:row-span-1",
        },
        {
            Icon: MessageSquare,
            name: "Ask Mumbai AI",
            description: "Get instant answers about wards, candidates, elections, and civic processes. Powered by AI.",
            href: "/chat",
            cta: "Chat Now",
            background: <div className="absolute top-0 left-0 w-full h-full bg-[#dcfce7] z-0" />,
            className: "md:col-span-1 md:row-span-1",
        },
        {
            Icon: Newspaper,
            name: "Local News",
            description: "Stay updated with the latest civic news and developments in your area.",
            href: "/news",
            cta: "Read News",
            background: (
                <div className="absolute top-0 left-0 w-full h-full bg-[#fee2e2] z-0">
                    <img
                        src="/images/news-illustrtion.png"
                        alt="News Illustration"
                        className="absolute right-0 top-0 h-full object-cover opacity-60"
                    />
                </div>
            ),
            className: "md:col-span-1 md:row-span-1",
        },
        {
            Icon: BarChart3,
            name: "Election Stats",
            description: "Analyze candidate distribution, ward categories, and reservation breakdowns across all parties.",
            href: "/stats",
            cta: "View Statistics",
            background: <div className="absolute top-0 left-0 w-full h-full bg-[#fef9c3] z-0" />,
            className: "md:col-span-1 md:row-span-1",
        },
    ];

    return (
        <div className="min-h-screen bg-white text-stone-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-3 py-6 flex flex-col items-center">
                {/* Header Section */}
                <div className="w-full text-center mb-6 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-semibold tracking-tight font-[var(--font-fraunces)]">
                        Know your Mumbai
                    </h1>
                    <p className="text-xl text-stone-500 font-light" suppressHydrationWarning>Waking up the city that never sleeps!</p>
                </div>

                {/* Bento Grid */}
                <div className="px-4 lg:px-20 w-full mb-20">
                    <BentoGrid className="lg:auto-rows-[17rem]">
                        {features.map((feature) => (
                            <BentoCard key={feature.name} {...feature} />
                        ))}
                    </BentoGrid>
                </div>

                {/* Stats Section */}
                <div className="w-full max-w-5xl px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-stone-200">
                        <div className="text-center space-y-2">
                            <p className="text-4xl font-semibold text-stone-800 font-[var(--font-fraunces)]">24</p>
                            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                                Admin Wards
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-4xl font-semibold text-stone-800 font-[var(--font-fraunces)]">227</p>
                            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                                Electoral Wards
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-4xl font-semibold text-stone-800 font-[var(--font-fraunces)]">1700+</p>
                            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                                Candidates
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-4xl font-semibold text-stone-800 font-[var(--font-fraunces)]">2 Crore+</p>
                            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                                Population
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-300 mt-12 py-8 px-6 text-center bg-[#F5F0E8]">
                <p className="text-sm text-stone-500 font-light">
                    Open data for civic transparency • <a href="/sources" className="hover:text-stone-800 underline underline-offset-4">Sources</a>
                </p>
            </footer>

            {/* Handbook Toast */}
            {showHandbookToast && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="bg-white border border-stone-200 rounded-xl shadow-lg p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900">Election Results are Live 🔴</p>
                            <a
                                href="/map"
                                className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                                Check your ward's winner →
                            </a>
                        </div>
                        <button
                            onClick={() => setShowHandbookToast(false)}
                            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4 text-stone-400" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
