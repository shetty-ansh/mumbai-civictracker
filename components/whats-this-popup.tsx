"use client";

import { useState } from "react";
import Image from "next/image";
import { HelpCircle, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { showToast } from "@/lib/toast";

type DatasetType = "forecast" | "electoral" | "results" | "flooding";

// Map type configuration for dropdown and carousel
// Extracted interface for reusability
export interface MapTypeConfig {
    id: DatasetType;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
}

interface WhatsThisPopupProps {
    dataset: DatasetType;
    setDataset: (d: DatasetType) => void;
    mapTypes: MapTypeConfig[];
}

export function WhatsThisPopup({ dataset, setDataset, mapTypes }: WhatsThisPopupProps) {
    const [expanded, setExpanded] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const prevSlide = () => setCarouselIndex((i) => (i === 0 ? mapTypes.length - 1 : i - 1));
    const nextSlide = () => setCarouselIndex((i) => (i === mapTypes.length - 1 ? 0 : i + 1));

    return (
        <>
            {/* Small floating pill */}
            <button
                onClick={() => setExpanded(true)}
                className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-stone-200 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all group hover:scale-105 active:scale-95"
            >
                <HelpCircle className="w-4 h-4 text-[#FF8C00]" />
                <span className="text-xs sm:text-sm font-medium text-stone-700">What&apos;s this page?</span>
            </button>

            {/* Full-screen overlay */}
            {expanded && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
                    onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}
                >
                    <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl sm:rounded-3xl overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Close button */}
                        <button
                            onClick={() => setExpanded(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 hover:bg-stone-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-stone-600" />
                        </button>

                        {/* Hero image */}
                        <div className="relative w-full h-48 sm:h-64 md:h-72 bg-gradient-to-b from-stone-100 to-white overflow-hidden">
                            <Image
                                src="/images/pages/maps.png"
                                alt="The Maps of Mumbai"
                                fill
                                className="object-contain p-4 sm:p-6"
                                priority
                            />
                            {/* Gradient overlay at bottom of image */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="px-5 sm:px-8 pb-6 sm:pb-8 -mt-4">
                            {/* Title section */}
                            <div className="mb-5 sm:mb-6">
                                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#FF8C00] mb-1">aamchi mumbai</p>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
                                    The Maps of Mumbai
                                </h2>
                            </div>

                            {/* Description paragraph */}
                            <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6 sm:mb-8 max-w-xl">
                                Explore Mumbai through layered, interactive maps — from electoral ward boundaries
                                and election results to air quality and beyond. Each map tells a different story
                                about the city, helping you understand your neighborhood, your representatives,
                                and the environment around you.
                            </p>

                            {/* Carousel of map types */}
                            <div className="mb-6 sm:mb-8">
                                <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-3">Types of Maps</p>

                                {/* Carousel container */}
                                <div className="relative">
                                    {/* Navigation arrows */}
                                    <button
                                        onClick={prevSlide}
                                        className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white border border-stone-200 shadow-md hover:bg-stone-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-stone-600" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white border border-stone-200 shadow-md hover:bg-stone-50 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-stone-600" />
                                    </button>

                                    {/* Slide */}
                                    <div className="overflow-hidden rounded-xl sm:rounded-2xl mx-4 sm:mx-6">
                                        <div
                                            className="flex transition-transform duration-300 ease-out"
                                            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                                        >
                                            {mapTypes.map((mapType) => (
                                                <div
                                                    key={mapType.id}
                                                    className="w-full flex-shrink-0 p-5 sm:p-6 border border-stone-200 rounded-xl sm:rounded-2xl bg-stone-50"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-2xl sm:text-3xl"
                                                            style={{ backgroundColor: `${mapType.color}15`, color: mapType.color }}
                                                        >
                                                            {mapType.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1">
                                                                {mapType.label}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                                                                {mapType.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dots indicator */}
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        {mapTypes.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCarouselIndex(i)}
                                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                                    i === carouselIndex
                                                        ? 'w-6 bg-[#FF8C00]'
                                                        : 'bg-stone-300 hover:bg-stone-400'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Explore Now button */}
                            <button
                                onClick={() => {
                                    const selectedType = mapTypes[carouselIndex];
                                    setDataset(selectedType.id);
                                    setExpanded(false);
                                    if (selectedType.id === 'results') {
                                        showToast('info', 'Election Results', 'Showing all 227 ward winners');
                                    }
                                }}
                                className="w-full py-3.5 sm:py-4 bg-stone-900 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg"
                            >
                                EXPLORE NOW!
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
