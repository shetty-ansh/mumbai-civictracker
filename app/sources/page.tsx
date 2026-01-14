"use client";

import { Navbar } from "@/components/ui/navbar";
import { ExternalLink, Database, FileText, Scale, AlertTriangle, ChevronDown, ChevronUp, BookOpen, X, Instagram } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SupportPopup } from "@/components/support-popup";

export default function SourcesPage() {
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"resources" | "sources">("resources");
    const [showInstagramPopup, setShowInstagramPopup] = useState(false);

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-fraunces)] mb-4 text-stone-900">
                        Resources & Sources
                    </h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                        Helpful resources for voters and transparent data sources used in this platform.
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-stone-200 rounded-full p-1">
                        <button
                            onClick={() => setActiveTab("resources")}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "resources"
                                ? "bg-stone-900 text-white shadow-md"
                                : "text-stone-600 hover:text-stone-900"
                                }`}
                        >
                            Resources
                        </button>
                        <button
                            onClick={() => setActiveTab("sources")}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "sources"
                                ? "bg-stone-900 text-white shadow-md"
                                : "text-stone-600 hover:text-stone-900"
                                }`}
                        >
                            Data Sources
                        </button>
                    </div>
                </div>

                {/* RESOURCES TAB */}
                {activeTab === "resources" && (
                    <div className="grid gap-8">
                        {/* Handbook Resource */}
                        <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-50 rounded-lg">
                                    <BookOpen className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-stone-900">Voter Resources</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-stone-900 mb-1">Handbook on Candidate Information</h3>
                                        <p className="text-sm text-stone-600">
                                            A comprehensive guide to understanding candidate affidavits, election data, and how to make informed voting decisions.
                                        </p>
                                    </div>
                                    <a
                                        href="https://drive.google.com/file/d/1yWBvO8YkspZcZMjWRMc1hUc4FREfCG77/view?usp=drivesdk"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap bg-white px-4 py-2 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Handbook
                                    </a>
                                </div>
                            </div>

                            {/* Credits */}
                            <div className="mt-6 pt-6 border-t border-stone-100">
                                <p className="text-xs uppercase tracking-wider text-stone-400 mb-3">Resource Credits</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-stone-900">Mark Your Presence</p>
                                        <a
                                            href="https://markyourpresence.org.in"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                                        >
                                            markyourpresence.org.in
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => setShowInstagramPopup(true)}
                                        className="p-2.5 bg-stone-900 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
                                    >
                                        <Instagram className="w-5 h-5 text-transparent bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text" style={{ stroke: 'url(#instagram-gradient)', strokeWidth: 2 }} />
                                        <svg width="0" height="0">
                                            <defs>
                                                <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#FBBF24" />
                                                    <stop offset="50%" stopColor="#EC4899" />
                                                    <stop offset="100%" stopColor="#9333EA" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SOURCES TAB */}
                {activeTab === "sources" && (
                    <div className="grid gap-8">
                        {/* Message from Developer */}
                        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setIsMessageOpen(!isMessageOpen)}
                                className="w-full flex items-center justify-between p-4 sm:p-5 bg-stone-900 text-white hover:bg-stone-800 transition-colors text-left"
                            >
                                <span className="font-medium flex items-center gap-2">
                                    👋 Message from the Developer
                                </span>
                                {isMessageOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            {isMessageOpen && (
                                <div className="p-5 sm:p-6 bg-white border-t border-stone-100">
                                    <p className="text-stone-700 leading-relaxed max-w-3xl">
                                        This platform was built to democratize access to candidate information and empower Mumbai's voters.
                                        <br /><br />
                                        As a student-led initiative without institutional resources, we have manually verified data to the best of our ability, but minor discrepancies may exist. Our goal is strictly neutral civic awareness, and we do not intend to disrespect or defame any candidate or party.
                                        <br /><br />
                                        If you spot an error, please let us know at <a href="mailto:shettyansh205@gmail.com" className="text-amber-700 font-medium hover:underline">shettyansh205@gmail.com</a>, and we will correct it immediately. Thank you for your support.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Data Coverage Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col sm:flex-row gap-4 text-left">
                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-amber-900 mb-2">Important Notice on Data Accuracy</h3>
                                <p className="text-sm text-amber-800 mb-3 leading-relaxed">
                                    We have currently covered detailed candidate-level data (Education, Legal Record, etc.) explicitly for <strong>Congress, BJP, Shiv Sena, Shiv Sena (UBT), MNS, NCP, Aam Aadmi Party, Bahujan Samaj Party, Samajwadi Party, and VBA - Vanchit Bahujan Aghadi</strong>.
                                </p>
                                <p className="text-sm text-amber-800 mb-3 leading-relaxed">
                                    <strong>Note on Education:</strong> We count education based on the highest <em>completed</em> degree. For example, if a candidate is in the second year of BCom but has not graduated, we classify their education level as <strong>12th Pass</strong>.
                                </p>
                                <p className="text-sm text-amber-800 leading-relaxed">
                                    Please note that while we strive for accuracy, some data points may be prone to human error as they were manually verified. As college students with limited resources, we couldn't manually verify detailed affidavits for every single independent candidate, but official records are linked below for your own research.
                                </p>
                            </div>
                        </div>

                        {/* Official Records */}
                        <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Scale className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-stone-900">Official Election Records</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
                                    <div>
                                        <h3 className="font-medium text-stone-900">BMC Election Documents</h3>
                                        <p className="text-sm text-stone-500 mt-1">Primary source for candidate lists and reservation categories.</p>
                                    </div>
                                    <a
                                        href="https://www.mcgm.gov.in/irj/portal/anonymous/qlelectiondocs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 whitespace-nowrap"
                                    >
                                        Visit Site <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
                                    <div>
                                        <h3 className="font-medium text-stone-900">Candidate Affidavits</h3>
                                        <p className="text-sm text-stone-500 mt-1">Official repository of candidate affidavits containing asset and criminal details.</p>
                                    </div>
                                    <a
                                        href="https://electiondata.mcgm.gov.in/Candidate%20Affidavit/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 whitespace-nowrap"
                                    >
                                        View Repository <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Spatial Data */}
                        <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <Database className="w-6 h-6 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-stone-900">Map & Spatial Data</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition-colors">
                                    <div>
                                        <h3 className="font-medium text-stone-900">2025 Ward Boundaries</h3>
                                        <p className="text-sm text-stone-500 mt-1">Ward outline data by <strong>Abhijit Ekbote</strong> from City Resource. Used with permission.</p>
                                    </div>
                                    <a
                                        href="https://cityresource.in/councillorwards2025/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
                                    >
                                        Visit Source <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
                                    <div>
                                        <h3 className="font-medium text-stone-900">Open City Ward Maps</h3>
                                        <p className="text-sm text-stone-500 mt-1">Additional geospatial data for Mumbai electoral ward boundaries.</p>
                                    </div>
                                    <a
                                        href="https://data.opencity.in/dataset/mumbai-wards-map/resource/0318c3e8-1530-4bf4-b29b-7281573dee8a"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 whitespace-nowrap"
                                    >
                                        Open Dataset <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
                                    <div>
                                        <h3 className="font-medium text-stone-900">GitHub Spatial Data</h3>
                                        <p className="text-sm text-stone-500 mt-1">Verified GeoJSON data for electoral wards.</p>
                                    </div>
                                    <a
                                        href="https://github.com/sanjanakrishnan/mumbai_spatial_data"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 whitespace-nowrap"
                                    >
                                        View Repo <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center text-sm text-amber-900/80">
                            <p className="font-medium mb-1">Disclaimer</p>
                            <p>
                                All data on this platform is for informational purposes only. While we accept no liability for any errors or omissions, we strive for maximum accuracy by sourcing directly from official records attached above.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <footer className="border-t border-stone-200 mt-auto py-8 bg-white text-center">
                <p className="text-sm text-stone-500">
                    © {new Date().getFullYear()} Mumbai Civic Tracker. Open source for civic transparency.
                </p>
            </footer>

            {/* Instagram Popup */}
            {showInstagramPopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowInstagramPopup(false)}
                >
                    <div
                        className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowInstagramPopup(false)}
                            className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <div className="p-4">
                            <div className="border-2 border-stone-200 rounded-xl overflow-hidden">
                                <a
                                    href="https://www.instagram.com/markyourpresence_org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Image
                                        src="/images/markyourpresence.jpeg"
                                        alt="Mark Your Presence Instagram"
                                        width={600}
                                        height={600}
                                        className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="px-4 pb-4 text-center">
                            <p className="text-sm text-stone-600">
                                Click the image to visit their Instagram profile
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <SupportPopup />
        </div>
    );
}
