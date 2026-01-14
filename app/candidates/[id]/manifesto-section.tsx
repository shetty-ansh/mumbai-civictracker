"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DetailedSection {
    title: string;
    points: string[];
}

interface ManifestoSectionProps {
    manifesto: {
        partyName: string;
        shortName: string;
        manifestoStatus: string;
        manifestoUrl?: string;
        summary: string;
        keyPromises: string[];
        detailedSections?: DetailedSection[];
    } | null | undefined;
}

export function ManifestoSection({ manifesto }: ManifestoSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const VISIBLE_PROMISES = 6;

    if (!manifesto) {
        return <p className="text-stone-400 italic">No manifesto information available for this party</p>;
    }

    if (manifesto.manifestoStatus !== 'released') {
        return <p className="text-stone-400 italic">Manifesto not yet released</p>;
    }

    const hasMore = manifesto.keyPromises.length > VISIBLE_PROMISES;
    const remainingCount = manifesto.keyPromises.length - VISIBLE_PROMISES;

    return (
        <div className="flex flex-col h-full">
            <p className="text-stone-600 leading-relaxed text-sm mb-5">
                {manifesto.summary}
            </p>
            {manifesto.keyPromises.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {manifesto.keyPromises.slice(0, VISIBLE_PROMISES).map((promise, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center bg-stone-900 text-white text-[10px] px-3 py-1 rounded-md uppercase tracking-widest font-medium"
                        >
                            {promise}
                        </span>
                    ))}
                    {hasMore && (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="inline-flex items-center bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] px-3 py-1 rounded-md uppercase tracking-widest font-medium transition-colors cursor-pointer"
                        >
                            +{remainingCount} more · View All
                        </button>
                    )}
                </div>
            )}

            {/* View Full PDF Link - Moved outside Dialog for visibility */}
            {manifesto.manifestoUrl && (
                <div className="mt-auto">
                    <a
                        href={manifesto.manifestoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Download Full Manifesto PDF
                    </a>
                </div>
            )}

            {/* Dialog for all promises */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-bold font-[family-name:var(--font-fraunces)]">
                            {manifesto.shortName} Manifesto Highlights
                        </DialogTitle>
                        <p className="text-sm text-stone-500 mt-1">
                            {manifesto.summary}
                        </p>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 space-y-8 pr-2 custom-scrollbar">
                        {/* Render Detailed Sections if available */}
                        {manifesto.detailedSections && manifesto.detailedSections.length > 0 ? (
                            manifesto.detailedSections.map((section, idx) => (
                                <div key={idx} className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                        {section.title}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {section.points.map((point, pIdx) => (
                                            <div key={pIdx} className="bg-stone-50 border border-stone-100 rounded-lg p-3 text-sm text-stone-700 leading-relaxed shadow-sm">
                                                {point}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Fallback to Key Promises List */
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Key Promises</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {manifesto.keyPromises.map((promise, index) => (
                                        <div key={index} className="bg-stone-50 border border-stone-100 rounded-lg p-3 text-sm text-stone-700 shadow-sm font-medium">
                                            {promise}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center bg-white">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                            Official Manifesto Data
                        </p>
                        {manifesto.manifestoUrl && (
                            <a
                                href={manifesto.manifestoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-all uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View PDF
                            </a>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
