"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ManifestoCellProps {
    manifesto: {
        partyName: string;
        shortName: string;
        manifestoStatus: string;
        manifestoUrl?: string;
        keyPromises: string[];
    } | null | undefined;
}

export function ManifestoCell({ manifesto }: ManifestoCellProps) {
    const [isOpen, setIsOpen] = useState(false);

    const hasManifesto = manifesto?.manifestoStatus === 'released';
    const VISIBLE_PROMISES = 3;

    if (!hasManifesto || !manifesto?.keyPromises || manifesto.keyPromises.length === 0) {
        return (
            <div className="flex items-center gap-2 text-stone-400">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Not Released</span>
            </div>
        );
    }

    const hasMore = manifesto.keyPromises.length > VISIBLE_PROMISES;
    const remainingCount = manifesto.keyPromises.length - VISIBLE_PROMISES;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Key Promises</span>
            </div>
            <ul className="space-y-1 text-xs text-stone-700">
                {manifesto.keyPromises.slice(0, VISIBLE_PROMISES).map((promise, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{promise}</span>
                    </li>
                ))}
            </ul>
            {hasMore && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer hover:underline"
                >
                    +{remainingCount} more · View All
                </button>
            )}

            {/* Dialog for all promises */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogClose onClose={() => setIsOpen(false)} />
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            {manifesto.shortName} Key Promises
                        </DialogTitle>
                        <p className="text-sm text-stone-500 mt-1">
                            All {manifesto.keyPromises.length} promises from the party manifesto
                        </p>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 mt-4 overflow-y-auto pr-2">
                        {manifesto.keyPromises.map((promise, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center bg-stone-900 text-white text-[10px] px-3 py-1.5 rounded-md uppercase tracking-widest font-medium"
                            >
                                {promise}
                            </span>
                        ))}
                    </div>
                    {manifesto.manifestoUrl ? (
                        <a
                            href={manifesto.manifestoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Full Manifesto PDF
                        </a>
                    ) : (
                        <p className="mt-4 text-sm text-stone-400 italic">Full manifesto document not available</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
