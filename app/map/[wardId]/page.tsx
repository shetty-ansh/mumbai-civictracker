"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, User, Star, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function unslugify(slug: string): string {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

interface WardPageProps {
    params: Promise<{ wardId: string }>;
}

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    symbol: string;
    ward_name: string;
}

// Party logo mapping - matches exact database values
function getPartyLogo(partyName: string): string {
    // Exact matches for database values
    switch (partyName) {
        case 'Indian National Congress':
            return '/images/party-symbols/congress-logo.jpg';
        case 'Shiv Sena (Uddhav Balasaheb Thackeray)':
            return '/images/party-symbols/shivsena-ubt-logo.jpg';
        case 'Bharatiya Janata Party':
            return '/images/party-symbols/bjp-logo.jpg';
        case 'Shiv Sena':
            return '/images/party-symbols/shivsena-logo.jpg';
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
            // Default generic logo for all others
            return '/images/party-symbols/generic.jpg';
    }
}

export default function WardDetailPage({ params }: WardPageProps) {
    const { wardId } = use(params);
    const wardName = unslugify(wardId);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            // Try to fetch candidates - search by ward_name first
            let { data, error } = await supabase
                .from('bmc_candidates')
                .select('*')
                .ilike('ward_name', `%${wardName}%`);

            if (error) {
                console.error('Error fetching candidates:', error);
                setLoading(false);
                return;
            }

            // If no results and wardName looks like it might have a number, try extracting it
            if ((!data || data.length === 0) && wardName) {
                const wardMatch = wardName.match(/\d+/);
                if (wardMatch) {
                    const wardNumber = parseInt(wardMatch[0]);
                    const result = await supabase
                        .from('bmc_candidates')
                        .select('*')
                        .eq('ward_no', wardNumber);

                    data = result.data;
                    error = result.error;
                }
            }

            if (data) {
                setCandidates(data as Candidate[]);
            }
            setLoading(false);
        };

        fetchCandidates();
    }, [wardName]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Ward Info */}
                <section className="bg-card border border-border p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <h2 className="text-lg font-semibold">Ward Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-muted-foreground font-light mb-1">Ward Name</p>
                            <p className="font-medium text-base">{wardName}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground font-light mb-1">Ward ID</p>
                            <p className="font-mono text-base">{wardId}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground font-light mb-1">Candidates</p>
                            <p className="font-semibold text-base text-accent">{candidates.length}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground font-light mb-1">Election</p>
                            <p className="text-base">BMC 2026</p>
                        </div>
                    </div>
                </section>

                {/* Candidates */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <h2 className="text-lg font-semibold">Candidates</h2>
                    </div>

                    {loading ? (
                        <div className="bg-card border border-border p-12 text-center">
                            <p className="text-sm text-muted-foreground font-light">Loading candidates...</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="bg-card border border-border p-12 text-center">
                            <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
                            <p className="text-sm text-muted-foreground/60 font-light">No candidates found for this ward</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {candidates.map((candidate, index) => (
                                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="py-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-[16px] font-bold shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-[18px] leading-tight truncate">{candidate.candidate_name}</h3>
                                                    <p className="text-[14px] text-muted-foreground truncate">{candidate.party_name}</p>
                                                </div>
                                            </div>
                                            <Image
                                                src={getPartyLogo(candidate.party_name)}
                                                alt={candidate.party_name}
                                                width={64}
                                                height={64}
                                                className="w-14 h-14 object-contain border border-black rounded-full shrink-0"
                                            />
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Ratings */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <h2 className="text-lg font-semibold">Ratings</h2>
                    </div>
                    <div className="bg-card border border-border p-12 text-center">
                        <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground/60 font-light">Ratings coming soon</p>
                    </div>
                </section>

                {/* Comments */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <h2 className="text-lg font-semibold">Community Feedback</h2>
                    </div>
                    <div className="bg-card border border-border p-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground/60 font-light">Comments coming soon</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 px-6 text-center mt-12">
                <p className="text-sm text-muted-foreground font-light">Data sourced from public records</p>
            </footer>
        </div>
    );
}
