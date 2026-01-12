"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ExternalLink, FileText, ChevronRight, X } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import manifestoData from "@/data/party-manifestos.json";
import { cn } from "@/lib/utils";

interface DetailedSection {
    title: string;
    points: string[];
}

interface PartyManifesto {
    id: string;
    partyName: string;
    shortName: string;
    manifestoStatus: string;
    manifestoUrl?: string;
    summary: string;
    keyPromises?: string[];
    detailedSections?: DetailedSection[];
}

export default function ManifestosPage() {
    const [selectedParty, setSelectedParty] = useState<PartyManifesto | null>(null);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <Link
                        href="/candidates"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Candidates
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Party Manifestos</h1>
                    <p className="text-muted-foreground">
                        Read the official vision documents released by major political parties for BMC Elections 2026.
                    </p>
                </div>

                <div className="grid gap-6">
                    {(manifestoData as PartyManifesto[]).map((party) => (
                        <div
                            key={party.id}
                            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-semibold">{party.shortName}</h2>
                                            <span className={cn(
                                                "text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border",
                                                party.manifestoStatus === "released"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                            )}>
                                                {party.manifestoStatus === "released" ? "Released" : "Not Released"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{party.partyName}</p>
                                    </div>

                                    {party.manifestoStatus === "released" && party.manifestoUrl && (
                                        <a
                                            href={party.manifestoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-900 border border-stone-200 text-sm font-medium rounded-lg hover:bg-stone-200 transition-colors shrink-0"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Official PDF
                                            <ExternalLink className="w-3 h-3 opacity-50" />
                                        </a>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-stone-900 mb-2">Summary</h3>
                                        <p className="text-sm text-stone-600 leading-relaxed">
                                            {party.summary}
                                        </p>
                                    </div>

                                    {party.keyPromises && party.keyPromises.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-stone-900 mb-2">Key Promises</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {party.keyPromises.slice(0, 5).map((promise, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs border border-stone-200"
                                                    >
                                                        {promise}
                                                    </span>
                                                ))}
                                                {party.keyPromises.length > 5 && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-stone-50 text-stone-500 text-xs border border-stone-100 italic">
                                                        +{party.keyPromises.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-2 flex flex-wrap gap-3">
                                        {party.detailedSections && party.detailedSections.length > 0 && (
                                            <button
                                                onClick={() => setSelectedParty(party)}
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-stone-900 hover:text-amber-600 transition-colors"
                                            >
                                                Read Full Highlights
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Mobile only PDF button */}
                                        {party.manifestoStatus === "released" && party.manifestoUrl && (
                                            <a
                                                href={party.manifestoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="md:hidden inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Official PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Detailed Modal */}
            {selectedParty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-background w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-start justify-between bg-stone-50/50 rounded-t-2xl">
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">{selectedParty.shortName}</h2>
                                <p className="text-sm text-stone-500 mt-1">Detailed Manifesto Highlights</p>
                            </div>
                            <button
                                onClick={() => setSelectedParty(null)}
                                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-8">
                                {selectedParty.detailedSections?.map((section, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            {section.title}
                                        </h3>
                                        <ul className="space-y-2 pl-4 border-l-2 border-stone-100 ml-0.5">
                                            {section.points.map((point, pIdx) => (
                                                <li key={pIdx} className="text-stone-600 text-sm leading-relaxed">
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        {selectedParty.manifestoUrl && (
                            <div className="p-4 border-t border-border bg-stone-50/50 rounded-b-2xl flex justify-between items-center sm:flex-row flex-col gap-4">
                                <span className="text-xs text-stone-500 text-center sm:text-left">
                                    This is a summary. For complete details, refer to the official document.
                                </span>
                                <a
                                    href={selectedParty.manifestoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 w-full sm:w-auto justify-center"
                                >
                                    <FileText className="w-4 h-4" />
                                    Read Original PDF
                                    <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
