"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/ui/navbar";
import {
  ArrowLeft,
  Hammer,
  CheckCircle2,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Search,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { MPLADSData, WorkRecord, MPListItem } from "@/lib/services/mpService";

/* =========================================================
   HELPERS
========================================================= */

function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatName(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getFirstAndLastName(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length <= 2) return formatName(name);
  return formatName(`${parts[0]} ${parts[parts.length - 1]}`);
}

function sentenceCase(str: string | undefined): string {
  if (!str) return "—";
  const s = str.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getStageBadge(stage: string | undefined) {
  if (!stage) return { label: "Unknown", bg: "bg-stone-100", text: "text-stone-700 font-bold" };

  const s = stage.toLowerCase();
  if (s.includes("completed") && !s.includes("partially")) {
    return { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700 font-bold" };
  }
  if (s.includes("partially")) {
    return { label: "Partially Done", bg: "bg-amber-50", text: "text-amber-700 font-bold" };
  }
  if (s.includes("physical inspection")) {
    return { label: "Inspection", bg: "bg-blue-50", text: "text-blue-700 font-bold" };
  }
  if (s.includes("vendor")) {
    return { label: "Vendor ID", bg: "bg-purple-50", text: "text-purple-700 font-bold" };
  }
  if (s.includes("pending")) {
    return { label: "Pending", bg: "bg-orange-50", text: "text-orange-700 font-bold" };
  }
  return { label: stage, bg: "bg-stone-100", text: "text-stone-700 font-bold" };
}

/* =========================================================
   COMPONENTS
========================================================= */

function WorksTable({
  records,
  searchQuery,
}: {
  records: WorkRecord[];
  searchQuery: string;
}) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        r.WORK_DESCRIPTION?.toLowerCase().includes(q) ||
        r.WORK_STAGE?.toLowerCase().includes(q) ||
        r.IDA_NAME?.toLowerCase().includes(q) ||
        r.ACTIVITY_NAME?.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">No records found</p>
        <p className="text-sm mt-1">
          {searchQuery ? "Try a different search term" : "No works in this category yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200">
            <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs capitalize tracking-wide">
              #
            </th>
            <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs capitalize tracking-wide">
              Work description
            </th>
            <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs capitalize tracking-wide hidden md:table-cell">
              Stage
            </th>
            <th className="text-right py-3 px-4 font-semibold text-stone-500 text-xs capitalize tracking-wide">
              Amount
            </th>
            <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs capitalize tracking-wide hidden lg:table-cell">
              Sanction date
            </th>
            <th className="py-3 px-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((record, idx) => {
            const stage = getStageBadge(record.WORK_STAGE);
            const isExpanded = expandedRow === idx;

            return (
              <React.Fragment key={`row-group-${idx}`}>
                <tr
                  className={`border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors ${isExpanded ? "bg-stone-50" : ""
                    }`}
                  onClick={() => setExpandedRow(isExpanded ? null : idx)}
                >
                  <td className="py-4 px-4 text-stone-400 font-mono text-xs whitespace-nowrap">
                    {record.Sno || idx + 1}
                  </td>
                  <td className="py-4 px-4 min-w-[200px]">
                    <p className="font-medium text-stone-800 line-clamp-2 leading-snug text-sm">
                      {sentenceCase(record.WORK_DESCRIPTION)}
                    </p>
                    <span
                      className={`inline-flex items-center mt-2 px-2.5 py-1 rounded-md text-xs md:hidden ${stage.bg} ${stage.text}`}
                    >
                      {stage.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs ${stage.bg} ${stage.text}`}
                    >
                      {stage.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-stone-800 whitespace-nowrap">
                    {record.SANCTION_AMOUNT
                      ? formatINR(record.SANCTION_AMOUNT)
                      : record.RECOMMENDED_AMOUNT
                        ? formatINR(record.RECOMMENDED_AMOUNT)
                        : "—"}
                  </td>
                  <td className="py-4 px-4 text-stone-500 hidden lg:table-cell whitespace-nowrap">
                    {record.SANCTION_DATE && record.SANCTION_DATE !== "NA"
                      ? record.SANCTION_DATE
                      : "—"}
                  </td>
                  <td className="py-4 px-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <td colSpan={6} className="px-4 py-4 md:px-8">
                      <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                          <span className="text-stone-400 text-xs capitalize tracking-wide block mb-1">
                            Category
                          </span>
                          <p className="text-stone-800 font-medium">
                            {record.WORK_CATEGORY || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 text-xs capitalize tracking-wide block mb-1">
                            Implementing agency
                          </span>
                          <p className="text-stone-800 font-medium">
                            {record.IDA_NAME || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 text-xs capitalize tracking-wide block mb-1">
                            Letter no
                          </span>
                          <p className="text-stone-800 font-medium">
                            {record.LETTER_NO || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 text-xs capitalize tracking-wide block mb-1">
                            Recommendation date
                          </span>
                          <p className="text-stone-800 font-medium">
                            {record.RECOMMENDATION_DATE || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 text-xs capitalize tracking-wide block mb-1">
                            Recommended amount
                          </span>
                          <p className="text-stone-800 font-medium text-base">
                            {record.RECOMMENDED_AMOUNT
                              ? formatINR(record.RECOMMENDED_AMOUNT)
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 text-xs capitalize tracking-wide block mb-1">
                            Sanctioned amount
                          </span>
                          <p className="text-stone-800 font-medium text-base">
                            {record.SANCTION_AMOUNT
                              ? formatINR(record.SANCTION_AMOUNT)
                              : "—"}
                          </p>
                        </div>
                        {record.ACTIVITY_NAME && (
                          <div className="md:col-span-3">
                            <span className="text-stone-400 text-xs capitalize tracking-wide block mb-1">
                              Activity
                            </span>
                            <p className="text-stone-800 font-medium">
                              {sentenceCase(record.ACTIVITY_NAME)}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   MAIN CLIENT COMPONENT
========================================================= */

interface MPClientProps {
  initialData: MPLADSData;
  mpsList: MPListItem[];
}

export default function MPClient({ initialData, mpsList }: MPClientProps) {
  const [activeTab, setActiveTab] = useState<"recommended" | "sanctioned" | "completed">("recommended");
  const [searchQuery, setSearchQuery] = useState("");

  if (!initialData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <Building2 className="w-16 h-16 text-stone-300 mx-auto" />
            <p className="text-xl font-semibold text-stone-700">No data available</p>
            <p className="text-stone-400">MPLADS data could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentMP = initialData;
  const baseMoney = 147000000; // 14.70 Crores
  const sanctionedAmount = currentMP.works.sanctioned.totalAmount || 0;
  const percentUtilized = Math.min(100, Math.round((sanctionedAmount / baseMoney) * 100));

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/representatives"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Representatives
        </Link>

        {/* Header */}
        <div className="mb-8 pb-8 border-b border-stone-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold capitalize tracking-wide px-2.5 py-1 rounded-md" style={{ backgroundColor: `${currentMP.color}15`, color: currentMP.color }}>
                  {currentMP.party}
                </span>
                <span className="text-sm text-stone-500 font-medium tracking-wide capitalize">
                  {currentMP.mp.constituency.toLowerCase()}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 mb-2 md:hidden">
                {getFirstAndLastName(currentMP.mp.name)}
              </h1>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-2 hidden md:block">
                {formatName(currentMP.mp.name)}
              </h1>
              <p className="text-stone-500 text-lg max-w-2xl">
                MPLADS fund utilization dashboard
              </p>
            </div>
            
            {/* MP Image */}
            {currentMP.mp.image && (
              <div className="shrink-0 self-center md:self-auto mt-4 md:mt-0 order-1 md:order-2">
                <img 
                  src={currentMP.mp.image} 
                  alt={currentMP.mp.name} 
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover shadow-sm border-2 border-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Selected MP Detail */}
        {currentMP && (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Project Status Overview */}
            <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/50">
              <div className="flex flex-col items-center justify-center">

                <div className="flex w-full md:w-auto justify-between md:justify-center gap-2 md:gap-16">
                  <div className="text-center flex-1 md:flex-none">
                    <p className="text-2xl md:text-4xl font-extrabold" style={{ color: currentMP.color }}>
                      {currentMP.works.recommended.count}
                    </p>
                    <p className="text-[10px] md:text-xs text-stone-500 capitalize tracking-wide mt-1 md:mt-2 font-semibold">
                      Recommended
                    </p>
                  </div>
                  <div className="w-px bg-stone-200" />
                  <div className="text-center flex-1 md:flex-none px-1 md:px-0">
                    <p className="text-2xl md:text-4xl font-extrabold text-emerald-600">
                      {currentMP.works.sanctioned.count}
                    </p>
                    <p className="text-[10px] md:text-xs text-emerald-600/80 capitalize tracking-wide mt-1 md:mt-2 font-semibold">
                      Sanctioned
                    </p>
                  </div>
                  <div className="w-px bg-stone-200" />
                  <div className="text-center flex-1 md:flex-none">
                    <p className="text-2xl md:text-4xl font-extrabold text-blue-600">
                      {currentMP.works.completed.count}
                    </p>
                    <p className="text-[10px] md:text-xs text-blue-600/80 capitalize tracking-wide mt-1 md:mt-2 font-semibold">
                      Completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Funds Summary */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 md:mt-8">
                <div className="bg-white rounded-xl p-2 md:p-4 border border-stone-100 shadow-sm text-center md:text-left">
                  <p className="text-[10px] md:text-xs text-stone-400 capitalize tracking-wide mb-1 truncate">Recommended</p>
                  <p className="text-sm md:text-xl font-bold text-stone-800">
                    {formatINR(currentMP.works.recommended.totalAmount || 0)}
                  </p>
                </div>
                <div className="bg-emerald-50/50 rounded-xl p-2 md:p-4 border border-emerald-100 shadow-sm text-center md:text-left">
                  <p className="text-[10px] md:text-xs text-emerald-600 capitalize tracking-wide mb-1 truncate">Sanctioned</p>
                  <p className="text-sm md:text-xl font-bold text-emerald-800">
                    {formatINR(currentMP.works.sanctioned.totalAmount || 0)}
                  </p>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-2 md:p-4 border border-blue-100 shadow-sm text-center md:text-left">
                  <p className="text-[10px] md:text-xs text-blue-600 capitalize tracking-wide mb-1 truncate">Completed</p>
                  <p className="text-sm md:text-xl font-bold text-blue-800">
                    {formatINR(currentMP.works.completed.totalAmount || 0)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-stone-500 mb-2 gap-2">
                  <span className="font-medium">Fund utilization progress</span>
                  <span className="font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-full text-xs">
                    {percentUtilized}% utilized of ₹14.70 Cr
                  </span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden ring-1 ring-inset ring-stone-200">
                  <div
                    className="h-full rounded-[6px] transition-all duration-1000 ease-out"
                    style={{
                      width: `${percentUtilized}%`,
                      background: `linear-gradient(90deg, ${currentMP.color}, #10b981)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tabs + Search */}
            <div className="border-b border-stone-100 px-4 md:px-6 pt-4 bg-white">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex w-full md:w-[75%] gap-1 p-1 bg-stone-100/80 rounded-xl overflow-x-auto scrollbar-hide">
                  {(
                    [
                      {
                        key: "recommended" as const,
                        label: "Recommended",
                        count: currentMP.works.recommended.count,
                        icon: ClipboardList,
                      },
                      {
                        key: "sanctioned" as const,
                        label: "Sanctioned",
                        count: currentMP.works.sanctioned.count,
                        icon: Hammer,
                      },
                      {
                        key: "completed" as const,
                        label: "Completed",
                        count: currentMP.works.completed.count,
                        icon: CheckCircle2,
                      },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2.5 md:py-3 text-[11px] md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key
                        ? "bg-stone-900 text-white shadow-sm ring-1 ring-black/5"
                        : "text-stone-500 hover:text-stone-700"
                        }`}
                    >
                      <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-md font-semibold ${activeTab === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-stone-200 text-stone-500"
                          }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-[25%] mb-4 md:mb-2 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search works..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:bg-white w-full transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Works Table */}
            <WorksTable
              records={currentMP.works[activeTab].records}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </main>
    </div>
  );
}
