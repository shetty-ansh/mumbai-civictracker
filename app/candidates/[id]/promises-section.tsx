"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CandidatePromise {
    promise_text: string;
    category: string;
}

interface PromisesSectionProps {
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
    sanitation: "bg-emerald-50 text-emerald-700 border-emerald-200",
    healthcare: "bg-red-50 text-red-700 border-red-200",
    water: "bg-blue-50 text-blue-700 border-blue-200",
    infrastructure: "bg-stone-100 text-stone-700 border-stone-300",
    electricity: "bg-yellow-50 text-yellow-700 border-yellow-200",
    public_transport: "bg-violet-50 text-violet-700 border-violet-200",
    education: "bg-indigo-50 text-indigo-700 border-indigo-200",
    employment: "bg-orange-50 text-orange-700 border-orange-200",
    women_empowerment: "bg-pink-50 text-pink-700 border-pink-200",
    senior_citizens: "bg-amber-50 text-amber-700 border-amber-200",
    environment: "bg-teal-50 text-teal-700 border-teal-200",
    other: "bg-stone-50 text-stone-600 border-stone-200",
};

export function PromisesSection({ promises }: PromisesSectionProps) {
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
                            className={`inline-flex items-center text-[10px] px-3 py-1 rounded-md uppercase tracking-widest font-medium border ${colorClass}`}
                        >
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

            {/* Dialog for all promises grouped by category */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-bold font-[family-name:var(--font-fraunces)]">
                            Candidate Promises
                        </DialogTitle>
                        <p className="text-sm text-stone-500 mt-1">
                            {promises.length} promises across {categories.length} categories
                        </p>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2 custom-scrollbar">
                        {categories.map((category) => (
                            <div key={category} className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    {categoryLabels[category] || category}
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {grouped[category].map((text, pIdx) => {
                                        const colorClass = categoryColors[category] || categoryColors.other;
                                        return (
                                            <div
                                                key={pIdx}
                                                className={`border rounded-lg p-3 text-sm leading-relaxed shadow-sm ${colorClass}`}
                                            >
                                                {text}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center bg-white">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                            Candidate-Specific Promises
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
