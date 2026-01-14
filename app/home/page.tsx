"use client";

import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Navbar } from "@/components/ui/navbar";
import { Map, Users, MessageSquare, Newspaper, Heart } from "lucide-react";

export default function HomePage() {
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
            Icon: Heart,
            name: "Community",
            description: "Connect with fellow citizens, share issues, and build a better Mumbai together.",
            href: "/home", // Placeholder
            cta: "Join Community",
            background: <div className="absolute top-0 left-0 w-full h-full bg-[#fef9c3] z-0" />,
            className: "md:col-span-1 md:row-span-1",
            comingSoon: true,
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
        </div>
    );
}
