"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

interface CandidatePromise {
    promise_text: string;
    category: string;
}

interface PromisesSectionProps {
    candidateName: string;
    promises: CandidatePromise[];
}

const categoryLabels: Record<string, string> = {
    sanitation: "Sanitation",
    healthcare: "Healthcare",
    water: "Water Supply",
    infrastructure: "Infrastructure",
    electricity: "Electricity",
    public_transport: "Public Transport",
    education: "Education",
    employment: "Employment & Youth",
    women_empowerment: "Women Empowerment",
    senior_citizens: "Senior Citizens",
    environment: "Environment",
    other: "Other",
};

const categoryColors: Record<string, string> = {
    sanitation: "text-emerald-700 border-emerald-200",
    healthcare: "text-red-700 border-red-200",
    water: "text-blue-700 border-blue-200",
    infrastructure: "text-stone-700 border-stone-300",
    electricity: "text-yellow-700 border-yellow-200",
    public_transport: "text-violet-700 border-violet-200",
    education: "text-indigo-700 border-indigo-200",
    employment: "text-orange-700 border-orange-200",
    women_empowerment: "text-pink-700 border-pink-200",
    senior_citizens: "text-amber-700 border-amber-200",
    environment: "text-teal-700 border-teal-200",
    other: "text-stone-600 border-stone-200",
};

export function PromisesSection({ candidateName, promises }: PromisesSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!promises || promises.length === 0) {
        return <p className="text-stone-400 italic">No promises available for this candidate</p>;
    }

    // Group promises by category
    const grouped = promises.reduce<Record<string, string[]>>((acc, p) => {
        const cat = p.category || "other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p.promise_text);
        return acc;
    }, {});

    const categories = Object.keys(grouped);
    const VISIBLE_PROMISES = 6;
    const flatPromises = promises.map(p => p.promise_text);
    const hasMore = flatPromises.length > VISIBLE_PROMISES;
    const remainingCount = flatPromises.length - VISIBLE_PROMISES;

    // Get first N promises for the preview
    const visiblePromises = promises.slice(0, VISIBLE_PROMISES);

    return (
        <div className="flex flex-col h-full">
            <p className="text-stone-600 leading-relaxed text-sm mb-5">
                {promises.length} promises across {categories.length} categories
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                {visiblePromises.map((promise, index) => {
                    const colorClass = categoryColors[promise.category] || categoryColors.other;
                    return (
                        <span
                            key={index}
                            className={`inline-flex items-start text-[12px] px-3 py-1 tracking-widest font-medium ${colorClass}`}
                        >
                            <ChevronRight className="w-3 h-3 mt-[3px] mr-1 shrink-0 opacity-80" />

                            {promise.promise_text}
                        </span>
                    );
                })}
                {hasMore && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] px-3 py-1 rounded-md uppercase tracking-widest font-medium transition-colors cursor-pointer"
                    >
                        +{remainingCount} more · View All
                    </button>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-[calc(100%-2rem)] md:w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-bold font-[family-name:var(--font-fraunces)]">
                            {candidateName}&apos;s Promises
                        </DialogTitle>
                        <p className="text-sm text-stone-500 mt-1">
                            {promises.length} promises across {categories.length} categories
                        </p>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-2 space-y-6 pr-2 custom-scrollbar">
                        {categories.map((category) => (
                            <div key={category} className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    {categoryLabels[category] || category}
                                </h3>
                                <div className="grid grid-cols-1 gap-1">
                                    {grouped[category].map((text, pIdx) => {
                                        const colorClass = categoryColors[category] || categoryColors.other;
                                        return (
                                            <div
                                                key={pIdx}
                                                className={`py-1 px-2 text-sm leading-relaxed ${colorClass} flex items-start gap-1.5`}
                                            >
                                                <ChevronRight className="w-3.5 h-3.5 mt-1 shrink-0 opacity-80" />
                                                <span>{text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center bg-white">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                            Promises taken from their Election Affidavit</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
