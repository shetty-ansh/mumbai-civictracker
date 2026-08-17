"use client";

import { useState } from "react";
import { PromisesSection } from "./promises-section";
import { ManifestoSection } from "./manifesto-section";

interface CandidatePromise {
    promise_text: string;
    category: string;
}

interface DetailedSection {
    title: string;
    points: string[];
}

interface PromisesManifestoToggleProps {
    candidateName: string;
    promises: CandidatePromise[];
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

export function PromisesManifestoToggle({ candidateName, promises, manifesto }: PromisesManifestoToggleProps) {
    const [activeTab, setActiveTab] = useState<"promises" | "manifesto">("promises");

    return (
        <div className="bg-white border border-stone-200 rounded-xl p-6 flex-1 flex flex-col">
            {/* Toggle Bar */}
            <div className="flex bg-stone-100 rounded-lg p-1 mb-5">
                <button
                    onClick={() => setActiveTab("promises")}
                    className={`flex-1 text-sm font-semibold uppercase tracking-wider py-2.5 rounded-md transition-all duration-200 cursor-pointer ${activeTab === "promises"
                        ? "bg-stone-900 text-white shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                        }`}
                >
                    Their Promises
                </button>
                <button
                    onClick={() => setActiveTab("manifesto")}
                    className={`flex-1 text-sm font-semibold uppercase tracking-wider py-2.5 rounded-md transition-all duration-200 cursor-pointer ${activeTab === "manifesto"
                        ? "bg-stone-900 text-white shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                        }`}
                >
                    Party Manifesto
                </button>
            </div>

            {/* Content */}
            <div className="flex-1">
                {activeTab === "promises" ? (
                    <PromisesSection candidateName={candidateName} promises={promises} />
                ) : (
                    <ManifestoSection manifesto={manifesto} />
                )}
            </div>
        </div>
    );
}
