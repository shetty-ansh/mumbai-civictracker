"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, User, Star, MessageSquare } from "lucide-react";

function unslugify(slug: string): string {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

interface WardPageProps {
    params: Promise<{ wardId: string }>;
}

export default function WardDetailPage({ params }: WardPageProps) {
    const { wardId } = use(params);
    const wardName = unslugify(wardId);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border px-4 py-4 sticky top-0 bg-background z-10">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/map">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <p className="text-xs text-muted-foreground">Ward</p>
                        <h1 className="text-xl font-semibold">{wardName}</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Ward Info */}
                <section className="bg-card border border-border p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4" />
                        <h2 className="font-medium">Ward Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Ward Name</p>
                            <p className="font-medium">{wardName}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Ward ID</p>
                            <p className="font-mono">{wardId}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Admin Ward</p>
                            <p>—</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Population</p>
                            <p>—</p>
                        </div>
                    </div>
                </section>

                {/* Representatives */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <h2 className="font-medium">Representatives</h2>
                    </div>

                    <div className="bg-card border border-border p-5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">MLA</h3>
                            <span className="text-xs bg-secondary px-2 py-0.5">State</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            MLA data will be connected when backend is set up.
                        </p>
                    </div>

                    <div className="bg-card border border-border p-5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Corporator</h3>
                            <span className="text-xs bg-secondary px-2 py-0.5">BMC</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Elections scheduled for January 2026. Seat currently vacant.
                        </p>
                    </div>
                </section>

                {/* Ratings */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <h2 className="font-medium">Ratings</h2>
                    </div>
                    <div className="bg-card border border-border p-8 text-center">
                        <Star className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm text-muted-foreground">Ratings coming soon</p>
                    </div>
                </section>

                {/* Comments */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <h2 className="font-medium">Community Feedback</h2>
                    </div>
                    <div className="bg-card border border-border p-8 text-center">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm text-muted-foreground">Comments coming soon</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted-foreground mt-8">
                <p>Data sourced from public records</p>
            </footer>
        </div>
    );
}
