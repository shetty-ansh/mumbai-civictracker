"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Input } from "@/components/ui/input";
import {
    Search, ArrowLeftRight, X, User, Trophy, Vote, GraduationCap,
    AlertTriangle, HeartHandshake, FileText, ChevronRight, ChevronDown, ChevronUp
} from "lucide-react";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import type { CorporatorForComparison } from "./types";

// Party logo mapping
function getPartyLogo(partyName: string, isWomenReserved?: boolean): string {
    switch (partyName) {
        case 'Indian National Congress':
            return '/images/party-symbols/congress-logo.jpg';
        case 'Shiv Sena (Uddhav Balasaheb Thackeray)':
            return '/images/party-symbols/shivsena-ubt-logo.jpg';
        case 'Bharatiya Janata Party':
            return '/images/party-symbols/bjp-logo.jpg';
        case 'Shiv Sena':
            return '/images/party-symbols/shivsena-logo.jpg';
        case 'Nationalist Congress Party - Sharad Pawar':
            return '/images/party-symbols/ncpsp-logo.png';
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
            return isWomenReserved
                ? '/images/party-symbols/generic-female.png'
                : '/images/party-symbols/generic.jpg';
    }
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
    sanitation: "text-emerald-700",
    healthcare: "text-red-700",
    water: "text-blue-700",
    infrastructure: "text-stone-700",
    electricity: "text-yellow-700",
    public_transport: "text-violet-700",
    education: "text-indigo-700",
    employment: "text-orange-700",
    women_empowerment: "text-pink-700",
    senior_citizens: "text-amber-700",
    environment: "text-teal-700",
    other: "text-stone-600",
};

interface HeadToHeadClientProps {
    corporators: CorporatorForComparison[];
}

// Selector dropdown component
function CorporatorSelector({
    label,
    selected,
    onSelect,
    onClear,
    corporators,
    otherId,
}: {
    label: string;
    selected: CorporatorForComparison | null;
    onSelect: (c: CorporatorForComparison) => void;
    onClear: () => void;
    corporators: CorporatorForComparison[];
    otherId: string | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = useMemo(() => {
        return corporators.filter(c => {
            if (c.id === otherId) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                c.candidate_name.toLowerCase().includes(q) ||
                c.party_name.toLowerCase().includes(q) ||
                c.ward_no.toString().includes(q)
            );
        });
    }, [corporators, search, otherId]);

    if (selected) {
        return (
            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 relative group">
                <Image
                    src={getPartyLogo(selected.party_name, selected.is_women_reserved)}
                    alt={selected.party_name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain rounded-full border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{selected.candidate_name}</p>
                    <p className="text-xs text-stone-500 truncate">{selected.party_name}</p>
                    <p className="text-xs text-amber-600 font-medium">Ward {selected.ward_no}</p>
                </div>
                <button
                    onClick={onClear}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                    <X className="w-3.5 h-3.5 text-stone-500" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
                className="w-full bg-white border-2 border-dashed border-stone-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer min-h-[100px]"
            >
                <User className="w-8 h-8 text-stone-300" />
                <span className="text-sm font-medium text-stone-400">{label}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[60vh] flex flex-col">
                    <div className="p-3 border-b border-stone-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                            <Input
                                type="text"
                                placeholder="Search by name, party, or ward..."
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filtered.length === 0 ? (
                            <div className="p-6 text-center text-sm text-stone-400">No corporators found</div>
                        ) : (
                            filtered.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { onSelect(c); setIsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-50 last:border-0"
                                >
                                    <Image
                                        src={getPartyLogo(c.party_name, c.is_women_reserved)}
                                        alt={c.party_name}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 object-contain rounded-full border border-stone-200 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-stone-900 truncate">{c.candidate_name}</p>
                                        <p className="text-xs text-stone-400 truncate">{c.party_name} · Ward {c.ward_no}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Comparison row component for mobile
function ComparisonCard({
    icon,
    label,
    leftContent,
    rightContent,
}: {
    icon: React.ReactNode;
    label: string;
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-stone-900 text-white px-4 py-2.5 flex items-center gap-2">
                {icon}
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-stone-100">
                <div className="p-4">{leftContent}</div>
                <div className="p-4">{rightContent}</div>
            </div>
        </div>
    );
}

// Promises comparison section with expand/collapse
function PromisesComparison({
    left,
    right,
}: {
    left: CorporatorForComparison;
    right: CorporatorForComparison;
}) {
    const [expandedLeft, setExpandedLeft] = useState(false);
    const [expandedRight, setExpandedRight] = useState(false);
    const VISIBLE = 4;

    const renderPromises = (promises: { promise_text: string; category: string }[], expanded: boolean, toggle: () => void) => {
        if (!promises || promises.length === 0) {
            return <p className="text-stone-400 italic text-sm">No promises available</p>;
        }

        // Group by category
        const grouped = promises.reduce<Record<string, string[]>>((acc, p) => {
            const cat = p.category || "other";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p.promise_text);
            return acc;
        }, {});

        const categories = Object.keys(grouped);
        const displayPromises = expanded ? promises : promises.slice(0, VISIBLE);
        const hasMore = promises.length > VISIBLE;

        return (
            <div className="space-y-2">
                <p className="text-xs text-stone-500 mb-2">
                    {promises.length} promises · {categories.length} categories
                </p>
                {displayPromises.map((promise, idx) => {
                    const colorClass = categoryColors[promise.category] || categoryColors.other;
                    return (
                        <div key={idx} className={`flex items-start gap-1.5 text-xs leading-relaxed ${colorClass}`}>
                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 opacity-80" />
                            <span>{promise.promise_text}</span>
                        </div>
                    );
                })}
                {hasMore && (
                    <button
                        onClick={toggle}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mt-1 cursor-pointer"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="w-3 h-3" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3 h-3" />
                                +{promises.length - VISIBLE} more
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-stone-900 text-white px-4 py-2.5 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Promises</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-stone-100">
                <div className="p-4">
                    {renderPromises(left.promises, expandedLeft, () => setExpandedLeft(!expandedLeft))}
                </div>
                <div className="p-4">
                    {renderPromises(right.promises, expandedRight, () => setExpandedRight(!expandedRight))}
                </div>
            </div>
        </div>
    );
}

// Manifesto comparison
function ManifestoComparison({
    left,
    right,
}: {
    left: CorporatorForComparison;
    right: CorporatorForComparison;
}) {
    const [expandedLeft, setExpandedLeft] = useState(false);
    const [expandedRight, setExpandedRight] = useState(false);
    const VISIBLE = 3;

    const renderManifesto = (manifesto: CorporatorForComparison["manifesto"], expanded: boolean, toggle: () => void) => {
        if (!manifesto) {
            return <p className="text-stone-400 italic text-sm">No manifesto available</p>;
        }

        const display = expanded ? manifesto.keyPromises : manifesto.keyPromises.slice(0, VISIBLE);
        const hasMore = manifesto.keyPromises.length > VISIBLE;

        return (
            <div className="space-y-2">
                <p className="text-xs text-stone-500 font-medium mb-2">{manifesto.shortName}</p>
                {display.map((p, idx) => (
                    <span
                        key={idx}
                        className="inline-flex items-center bg-stone-900 text-white text-[10px] px-2.5 py-1 rounded-md uppercase tracking-widest font-medium mr-1 mb-1"
                    >
                        {p}
                    </span>
                ))}
                {hasMore && (
                    <button
                        onClick={toggle}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mt-1 cursor-pointer"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="w-3 h-3" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3 h-3" />
                                +{manifesto.keyPromises.length - VISIBLE} more
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-stone-900 text-white px-4 py-2.5 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Party Manifesto</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-stone-100">
                <div className="p-4">
                    {renderManifesto(left.manifesto, expandedLeft, () => setExpandedLeft(!expandedLeft))}
                </div>
                <div className="p-4">
                    {renderManifesto(right.manifesto, expandedRight, () => setExpandedRight(!expandedRight))}
                </div>
            </div>
        </div>
    );
}

export default function HeadToHeadClient({ corporators }: HeadToHeadClientProps) {
    const [leftCorporator, setLeftCorporator] = useState<CorporatorForComparison | null>(null);
    const [rightCorporator, setRightCorporator] = useState<CorporatorForComparison | null>(null);

    const bothSelected = leftCorporator && rightCorporator;

    const handleSwap = () => {
        const temp = leftCorporator;
        setLeftCorporator(rightCorporator);
        setRightCorporator(temp);
    };

    const formatEducation = (edu: string) => {
        if (/^\d+$/.test(edu.trim())) {
            return `${edu.trim()}th Pass`;
        }
        return edu;
    };

    const isLowEducation = (edu: string) => {
        const eduNum = parseInt(edu);
        if (!isNaN(eduNum) && eduNum <= 10) return true;
        const lower = edu.toLowerCase();
        return lower.includes('uneducated') || lower.includes('illiterate');
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 md:px-8 py-4">
                {/* Back link */}
                <Link
                    href="/candidates"
                    className="inline-flex items-center gap-2 text-sm text-black hover:text-stone-900 mb-2 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Candidates
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-fraunces)] mb-2">
                        Compare Corporators
                    </h1>
                    <p className="text-stone-600">
                        Pick any two corporators and compare their profiles, promises, and party manifestos side by side.
                    </p>
                </div>

                {/* Selection Area */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start mb-8">
                    <CorporatorSelector
                        label="Select Corporator 1"
                        selected={leftCorporator}
                        onSelect={setLeftCorporator}
                        onClear={() => setLeftCorporator(null)}
                        corporators={corporators}
                        otherId={rightCorporator?.id || null}
                    />

                    {/* Swap Button */}
                    <div className="flex items-center justify-center pt-6">
                        <button
                            onClick={handleSwap}
                            disabled={!leftCorporator && !rightCorporator}
                            className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition-colors shadow-md"
                            title="Swap corporators"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                        </button>
                    </div>

                    <CorporatorSelector
                        label="Select Corporator 2"
                        selected={rightCorporator}
                        onSelect={setRightCorporator}
                        onClear={() => setRightCorporator(null)}
                        corporators={corporators}
                        otherId={leftCorporator?.id || null}
                    />
                </div>

                {/* Comparison Content */}
                {bothSelected ? (
                    <div className="space-y-4 pb-8">
                        {/* Column headers (sticky on mobile) */}
                        <div className="grid grid-cols-2 gap-4 sticky top-0 z-20 bg-stone-50 py-2 -mx-4 px-4">
                            <div className="flex items-center gap-2">
                                <Image
                                    src={getPartyLogo(leftCorporator.party_name, leftCorporator.is_women_reserved)}
                                    alt={leftCorporator.party_name}
                                    width={28}
                                    height={28}
                                    className="w-7 h-7 object-contain rounded-full border border-stone-200"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-stone-900 truncate">{leftCorporator.candidate_name}</p>
                                    <p className="text-[10px] text-stone-500 truncate">Ward {leftCorporator.ward_no}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Image
                                    src={getPartyLogo(rightCorporator.party_name, rightCorporator.is_women_reserved)}
                                    alt={rightCorporator.party_name}
                                    width={28}
                                    height={28}
                                    className="w-7 h-7 object-contain rounded-full border border-stone-200"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-stone-900 truncate">{rightCorporator.candidate_name}</p>
                                    <p className="text-[10px] text-stone-500 truncate">Ward {rightCorporator.ward_no}</p>
                                </div>
                            </div>
                        </div>

                        {/* Votes */}
                        <ComparisonCard
                            icon={<Vote className="w-4 h-4" />}
                            label="Votes Polled"
                            leftContent={
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    <span className="text-xl font-bold text-stone-900">
                                        {leftCorporator.votes !== null ? leftCorporator.votes.toLocaleString('en-IN') : 'N/A'}
                                    </span>
                                </div>
                            }
                            rightContent={
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    <span className="text-xl font-bold text-stone-900">
                                        {rightCorporator.votes !== null ? rightCorporator.votes.toLocaleString('en-IN') : 'N/A'}
                                    </span>
                                </div>
                            }
                        />

                        {/* Education */}
                        <ComparisonCard
                            icon={<GraduationCap className="w-4 h-4" />}
                            label="Education"
                            leftContent={
                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${leftCorporator.education === 'N/A'
                                    ? 'bg-amber-100 text-amber-700'
                                    : isLowEducation(leftCorporator.education)
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {formatEducation(leftCorporator.education).toUpperCase()}
                                </span>
                            }
                            rightContent={
                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${rightCorporator.education === 'N/A'
                                    ? 'bg-amber-100 text-amber-700'
                                    : isLowEducation(rightCorporator.education)
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {formatEducation(rightCorporator.education).toUpperCase()}
                                </span>
                            }
                        />

                        {/* Legal History */}
                        <ComparisonCard
                            icon={<AlertTriangle className="w-4 h-4" />}
                            label="Legal History"
                            leftContent={
                                <div className="space-y-2">
                                    <div className={`flex items-center gap-2 ${leftCorporator.active_cases > 0 ? 'text-red-600' : 'text-stone-400'}`}>
                                        <span className="text-2xl font-bold">{leftCorporator.active_cases}</span>
                                        <span className="text-xs">Active</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${leftCorporator.closed_cases > 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                                        <span className="text-2xl font-bold">{leftCorporator.closed_cases}</span>
                                        <span className="text-xs">Convicted</span>
                                    </div>
                                </div>
                            }
                            rightContent={
                                <div className="space-y-2">
                                    <div className={`flex items-center gap-2 ${rightCorporator.active_cases > 0 ? 'text-red-600' : 'text-stone-400'}`}>
                                        <span className="text-2xl font-bold">{rightCorporator.active_cases}</span>
                                        <span className="text-xs">Active</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${rightCorporator.closed_cases > 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                                        <span className="text-2xl font-bold">{rightCorporator.closed_cases}</span>
                                        <span className="text-xs">Convicted</span>
                                    </div>
                                </div>
                            }
                        />

                        {/* Promises */}
                        <PromisesComparison left={leftCorporator} right={rightCorporator} />

                        {/* Party Manifesto */}
                        <ManifestoComparison left={leftCorporator} right={rightCorporator} />

                        {/* View Full Profiles CTA */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Link
                                href={`/candidates/${leftCorporator.id}`}
                                className="bg-stone-900 text-white text-center py-3 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
                            >
                                View Full Profile →
                            </Link>
                            <Link
                                href={`/candidates/${rightCorporator.id}`}
                                className="bg-stone-900 text-white text-center py-3 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
                            >
                                View Full Profile →
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Empty state */
                    <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
                        <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-stone-200" />
                        <p className="text-stone-500 font-medium">Select two corporators to compare</p>
                        <p className="text-stone-400 text-sm mt-1">
                            Choose from {corporators.length} elected corporators across all 227 wards
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
