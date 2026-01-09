"use client";

import Link from "next/link";
import { Map, Users, MessageSquare, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
                {/* Welcome */}
                <section className="text-center space-y-3">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                        Know Your City
                    </h1>
                    <p className="text-xl text-accent font-light">
                        Gateway to civic transparency in Mumbai
                    </p>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border p-6 hover:border-accent transition-colors">
                        <p className="text-4xl font-bold mb-2">24</p>
                        <p className="text-sm text-muted-foreground font-light">Admin Wards</p>
                    </div>
                    <div className="bg-card border border-border p-6 hover:border-accent transition-colors">
                        <p className="text-4xl font-bold mb-2 text-accent">227</p>
                        <p className="text-sm text-muted-foreground font-light">Electoral Wards</p>
                    </div>
                    <div className="bg-card border border-border p-6 hover:border-accent transition-colors">
                        <p className="text-4xl font-bold mb-2">2000+</p>
                        <p className="text-sm text-muted-foreground font-light">Candidates</p>
                    </div>
                    <div className="bg-card border border-border p-6 hover:border-accent transition-colors">
                        <p className="text-4xl font-bold mb-2">12M+</p>
                        <p className="text-sm text-muted-foreground font-light">Population</p>
                    </div>
                </section>

                {/* Actions */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/map" className="group bg-card border border-border p-8 hover:border-accent transition-all block">
                            <Map className="w-8 h-8 mb-4 text-accent" strokeWidth={1.5} />
                            <h3 className="font-semibold text-lg mb-2">Explore the Map</h3>
                            <p className="text-sm text-muted-foreground mb-4 font-light">
                                Find your ward and see who represents it
                            </p>
                            <span className="text-sm font-medium flex items-center gap-2 text-accent">
                                Open Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <div className="bg-card border border-border p-8 opacity-40">
                            <Users className="w-8 h-8 mb-4" strokeWidth={1.5} />
                            <h3 className="font-semibold text-lg mb-2">Representatives</h3>
                            <p className="text-sm text-muted-foreground mb-4 font-light">
                                Browse all elected officials
                            </p>
                            <span className="text-sm text-muted-foreground/60 font-light">Coming soon</span>
                        </div>

                        <div className="bg-card border border-border p-8 opacity-40">
                            <MessageSquare className="w-8 h-8 mb-4" strokeWidth={1.5} />
                            <h3 className="font-semibold text-lg mb-2">Community</h3>
                            <p className="text-sm text-muted-foreground mb-4 font-light">
                                See ratings and comments
                            </p>
                            <span className="text-sm text-muted-foreground/60 font-light">Coming soon</span>
                        </div>
                    </div>
                </section>

                {/* Info */}
                <section className="border border-border p-8">
                    <h2 className="text-xl font-semibold mb-4">About BMC Elections</h2>
                    <p className="text-muted-foreground leading-relaxed font-light">
                        The Brihanmumbai Municipal Corporation (BMC) is the governing civic body for Mumbai.
                        Elections for the 227 corporator seats are scheduled for January 2026. Since March 2022,
                        the BMC has been administered directly. This app helps you track accountability across
                        Mumbai's 24 administrative wards and 36 MLA constituencies.
                    </p>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 px-6 text-center">
                <p className="text-sm text-muted-foreground font-light">Open data for civic transparency</p>
            </footer>
        </div>
    );
}
