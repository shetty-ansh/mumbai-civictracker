"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map, Users, MessageSquare, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border px-4 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-xl font-semibold">
                        Mumbai Tracker
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/map" className="text-sm text-muted-foreground hover:text-foreground">
                            Map
                        </Link>
                        <Link href="/home" className="text-sm font-medium">
                            Home
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Welcome */}
                <section>
                    <h1 className="text-3xl font-semibold mb-2">
                        Welcome to Mumbai Tracker
                    </h1>
                    <p className="text-muted-foreground">
                        Your gateway to civic transparency in Mumbai
                    </p>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border p-4">
                        <p className="text-2xl font-semibold">24</p>
                        <p className="text-sm text-muted-foreground">Admin Wards</p>
                    </div>
                    <div className="bg-card border border-border p-4">
                        <p className="text-2xl font-semibold">227</p>
                        <p className="text-sm text-muted-foreground">Electoral Wards</p>
                    </div>
                    <div className="bg-card border border-border p-4">
                        <p className="text-2xl font-semibold">36</p>
                        <p className="text-sm text-muted-foreground">MLAs</p>
                    </div>
                    <div className="bg-card border border-border p-4">
                        <p className="text-2xl font-semibold">12M+</p>
                        <p className="text-sm text-muted-foreground">Population</p>
                    </div>
                </section>

                {/* Actions */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/map" className="bg-card border border-border p-5 hover:border-foreground transition-colors block">
                            <Map className="w-6 h-6 mb-3" />
                            <h3 className="font-medium mb-1">Explore the Map</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Find your ward and see who represents it
                            </p>
                            <span className="text-sm font-medium flex items-center gap-1">
                                Open Map <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>

                        <div className="bg-card border border-border p-5 opacity-60">
                            <Users className="w-6 h-6 mb-3" />
                            <h3 className="font-medium mb-1">Representatives</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Browse all elected officials
                            </p>
                            <span className="text-sm text-muted-foreground">Coming soon</span>
                        </div>

                        <div className="bg-card border border-border p-5 opacity-60">
                            <MessageSquare className="w-6 h-6 mb-3" />
                            <h3 className="font-medium mb-1">Community</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                See ratings and comments
                            </p>
                            <span className="text-sm text-muted-foreground">Coming soon</span>
                        </div>
                    </div>
                </section>

                {/* Info */}
                <section className="border border-border p-5">
                    <h2 className="text-lg font-semibold mb-3">About BMC Elections</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        The Brihanmumbai Municipal Corporation (BMC) is the governing civic body for Mumbai.
                        Elections for the 227 corporator seats are scheduled for January 2026. Since March 2022,
                        the BMC has been administered directly. This app helps you track accountability across
                        Mumbai's 24 administrative wards and 36 MLA constituencies.
                    </p>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted-foreground">
                <p>Open data for civic transparency</p>
            </footer>
        </div>
    );
}
