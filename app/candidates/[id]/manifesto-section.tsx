"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ManifestoSectionProps {
    manifesto: {
        partyName: string;
        shortName: string;
        manifestoStatus: string;
        summary: string;
        keyPromises: string[];
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
        <div>
            <p className="text-stone-600 leading-relaxed text-sm mb-5">
                {manifesto.summary}
            </p>
            {manifesto.keyPromises.length > 0 && (
                <div className="flex flex-wrap gap-2">
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

            {/* Dialog for all promises */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogClose onClose={() => setIsOpen(false)} />
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            {manifesto.shortName} Key Promises
                        </DialogTitle>
                        <p className="text-sm text-stone-500 mt-1">
                            All {manifesto.keyPromises.length} promises from the party manifesto
                        </p>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {manifesto.keyPromises.map((promise, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center bg-stone-900 text-white text-[10px] px-3 py-1.5 rounded-md uppercase tracking-widest font-medium"
                            >
                                {promise}
                            </span>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
