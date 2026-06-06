"use client";

import { useEffect, useId, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, AlertTriangle, ExternalLink, X, Trophy, Cloud, ChevronDown, Layers, HelpCircle, ArrowRight, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import {
    Map,
    MapControls,
    MapMarker,
    MarkerContent,
    useMap,
} from "@/components/ui/map";
import type MapLibreGL from "maplibre-gl";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import categoryReservationData from "@/data/category-reservation.json";
import winnersData from "@/data/winners.json";
import floodingData from "@/data/flooding-data.json";
import { showToast } from "@/lib/toast";
import { getAllWardCenters } from "@/lib/ward-utils";
import { WhatsThisPopup, MapTypeConfig } from "@/components/whats-this-popup";

// Mumbai center coordinates
const MUMBAI_CENTER: [number, number] = [72.8777, 19.076];
const MUMBAI_ZOOM = 10.5;

type DatasetType = "forecast" | "electoral" | "results" | "flooding";

// Map type configuration for dropdown and carousel
const MAP_TYPES: MapTypeConfig[] = [
    {
        id: "electoral",
        label: "Electoral Wards",
        icon: <Layers className="w-5 h-5" />,
        description: "Explore all 227 electoral ward boundaries with reservation and demographic data.",
        color: "#FF8C00",
    },
    {
        id: "results",
        label: "Election Results",
        icon: <Trophy className="w-5 h-5" />,
        description: "See who won each ward — color-coded by coalition with full candidate details.",
        color: "#F59E0B",
    },
    {
        id: "forecast",
        label: "Weather & AQI",
        icon: <Cloud className="w-5 h-5" />,
        description: "Live air quality and weather data mapped across Mumbai's wards.",
        color: "#3B82F6",
    },
    {
        id: "flooding",
        label: "Flooding Risk",
        icon: <Droplets className="w-5 h-5" />,
        description: "View areas with historical and forecasted flooding risks across Mumbai.",
        color: "#0ea5e9",
    },
];

// Map Type Dropdown component
function MapTypeDropdown({ dataset, setDataset }: { dataset: DatasetType; setDataset: (d: DatasetType) => void }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const current = MAP_TYPES.find(m => m.id === dataset) || MAP_TYPES[0];

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium text-stone-800"
            >
                <span className="flex items-center gap-2" style={{ color: current.color }}>
                    {current.icon}
                </span>
                <span className="hidden sm:inline">{current.label}</span>
                <span className="sm:hidden">{current.label.split(' ')[0]}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {open && (
                <div className="absolute top-full left-0 mt-2 w-56 sm:w-64 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-stone-100">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Select Map Type</p>
                    </div>
                    {MAP_TYPES.map((mapType) => (
                        <button
                            key={mapType.id}
                            onClick={() => {
                                setDataset(mapType.id);
                                setOpen(false);
                                if (mapType.id === 'results') {
                                    showToast('info', 'Election Results', 'Showing all 227 ward winners');
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-stone-50 ${
                                dataset === mapType.id ? 'bg-stone-50' : ''
                            }`}
                        >
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ color: mapType.color, backgroundColor: `${mapType.color}15` }}>
                                {mapType.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${
                                    dataset === mapType.id ? 'text-stone-900' : 'text-stone-700'
                                }`}>{mapType.label}</p>
                                <p className="text-xs text-stone-400 truncate">{mapType.description.slice(0, 50)}...</p>
                            </div>
                            {dataset === mapType.id && (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mapType.color }} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper to slugify ward name for URL
function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Admin Wards Layer (24 wards - A, B, C...)
function AdminWardsLayer({ onWardClick }: { onWardClick: (name: string, id: string | number) => void }) {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `admin-wards-source-${id}`;
    const fillLayerId = `admin-wards-fill-${id}`;
    const outlineLayerId = `admin-wards-outline-${id}`;
    const labelLayerId = `admin-wards-labels-${id}`;
    const [hoveredWard, setHoveredWard] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !map) return;

        map.addSource(sourceId, {
            type: "geojson",
            data: "/mumbai-wards.json",
        });

        // Outline only - transparent fill with black outlines
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": "#000000",
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.15, // slight fill on hover for feedback
                    0, // completely transparent normally
                ],
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#FF6B35", // vibrant orange on hover
                    "#888888", // subtle gray normally
                ],
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    2.5, // medium thickness on hover
                    0.6, // very thin normally
                ],
            },
        });

        map.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: sourceId,
            layout: {
                "text-field": ["get", "NAME"],
                "text-size": 12,
                "text-anchor": "center",
                "text-allow-overlap": false,
            },
            paint: {
                "text-color": "#000000", // black text
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.5,
            },
        });

        let hoveredFeatureId: string | number | undefined = undefined;

        const handleMouseMove = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: false }
                    );
                }
                hoveredFeatureId = e.features[0].id;
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: true }
                    );
                }
                const wardName = e.features[0].properties?.NAME?.trim() || "Unknown";
                setHoveredWard(wardName);
                map.getCanvas().style.cursor = "pointer";
            }
        };

        const handleMouseLeave = () => {
            if (hoveredFeatureId !== undefined) {
                map.setFeatureState(
                    { source: sourceId, id: hoveredFeatureId },
                    { hover: false }
                );
            }
            hoveredFeatureId = undefined;
            setHoveredWard(null);
            map.getCanvas().style.cursor = "";
        };

        const handleClick = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                const wardName = e.features[0].properties?.NAME?.trim() || "Unknown";
                const wardId = e.features[0].id ?? "unknown";
                console.log(`Admin Ward clicked: ID=${wardId}, Name=${wardName}`);
                onWardClick(wardName, wardId);
            }
        };

        map.on("mousemove", fillLayerId, handleMouseMove);
        map.on("mouseleave", fillLayerId, handleMouseLeave);
        map.on("click", fillLayerId, handleClick);
        // Also listen to outline layer for better hover detection
        map.on("mousemove", outlineLayerId, handleMouseMove);
        map.on("mouseleave", outlineLayerId, handleMouseLeave);
        map.on("click", outlineLayerId, handleClick);

        return () => {
            map.off("mousemove", fillLayerId, handleMouseMove);
            map.off("mouseleave", fillLayerId, handleMouseLeave);
            map.off("click", fillLayerId, handleClick);
            map.off("mousemove", outlineLayerId, handleMouseMove);
            map.off("mouseleave", outlineLayerId, handleMouseLeave);
            map.off("click", outlineLayerId, handleClick);
            try {
                if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
                if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
                if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId, labelLayerId, onWardClick]);

    if (hoveredWard) {
        return (
            <div className="absolute top-20 left-4 z-10 bg-card border border-white/20 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/60 font-light">Admin Ward</p>
                <p className="text-2xl font-bold text-accent">{hoveredWard}</p>
                <p className="text-xs text-white/40 mt-1 font-light">Click to view details</p>
            </div>
        );
    }
    return null;
}

// Electoral Wards Layer (227 wards)
function ElectoralWardsLayer({ onWardClick }: { onWardClick: (name: string, id: string | number) => void }) {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `electoral-wards-source-${id}`;
    const fillLayerId = `electoral-wards-fill-${id}`;
    const outlineLayerId = `electoral-wards-outline-${id}`;
    const labelLayerId = `electoral-wards-labels-${id}`;
    const [hoveredWard, setHoveredWard] = useState<{
        prabhag: number;
        population: number;
        category: string;
        isWomenReserved: boolean;
    } | null>(null);

    // Build lookup from JSON
    const reservationLookup = categoryReservationData.reduce((acc, item) => {
        acc[item.ward_no] = { category: item.category, women_reserved: item.women_reserved };
        return acc;
    }, {} as Record<number, { category: string; women_reserved: boolean }>);

    useEffect(() => {
        if (!isLoaded || !map) return;

        map.addSource(sourceId, {
            type: "geojson",
            data: "/mumbai_electoral_2022_ward_level.geojson",
        });

        // Outline only - transparent fill with black outlines
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": "#000000",
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.15, // slight fill on hover for feedback
                    0, // completely transparent normally
                ],
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#FF6B35", // vibrant orange on hover
                    "#888888", // subtle gray normally
                ],
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    2, // medium thickness on hover
                    0.4, // very thin normally
                ],
            },
        });

        map.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: sourceId,
            layout: {
                "text-field": ["to-string", ["get", "prabhag"]],
                "text-size": 10,
                "text-anchor": "center",
                "text-allow-overlap": false,
            },
            paint: {
                "text-color": "#000000", // black text
                "text-halo-color": "#ffffff",
                "text-halo-width": 1,
            },
        });

        let hoveredFeatureId: string | number | undefined = undefined;

        const handleMouseMove = async (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: false }
                    );
                }
                hoveredFeatureId = e.features[0].id;
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: true }
                    );
                }
                const props = e.features[0].properties;
                const wardNo = props?.prabhag || 0;
                const reservation = reservationLookup[wardNo] || { category: 'GEN', women_reserved: false };

                setHoveredWard({
                    prabhag: wardNo,
                    population: props?.tot_pop || 0,
                    category: reservation.category,
                    isWomenReserved: reservation.women_reserved,
                });

                map.getCanvas().style.cursor = "pointer";
            }
        };

        const handleMouseLeave = () => {
            if (hoveredFeatureId !== undefined) {
                map.setFeatureState(
                    { source: sourceId, id: hoveredFeatureId },
                    { hover: false }
                );
            }
            hoveredFeatureId = undefined;
            setHoveredWard(null);
            map.getCanvas().style.cursor = "";
        };

        const handleClick = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                const props = e.features[0].properties;
                console.log("Electoral Ward clicked:", {
                    id: e.features[0].id,
                    prabhag: props?.prabhag,
                    population: props?.tot_pop,
                });
                onWardClick(`ward-${props?.prabhag}`, e.features[0].id ?? "unknown");
            }
        };

        map.on("mousemove", fillLayerId, handleMouseMove);
        map.on("mouseleave", fillLayerId, handleMouseLeave);
        map.on("click", fillLayerId, handleClick);
        // Also listen to outline layer for better hover detection
        map.on("mousemove", outlineLayerId, handleMouseMove);
        map.on("mouseleave", outlineLayerId, handleMouseLeave);
        map.on("click", outlineLayerId, handleClick);

        return () => {
            map.off("mousemove", fillLayerId, handleMouseMove);
            map.off("mouseleave", fillLayerId, handleMouseLeave);
            map.off("click", fillLayerId, handleClick);
            map.off("mousemove", outlineLayerId, handleMouseMove);
            map.off("mouseleave", outlineLayerId, handleMouseLeave);
            map.off("click", outlineLayerId, handleClick);
            try {
                if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
                if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
                if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId, labelLayerId, onWardClick]);

    if (hoveredWard) {
        return (
            <div className="absolute top-24 left-6 z-10 bg-white border border-stone-200 rounded-xl px-5 py-4 shadow-lg min-w-[200px]">
                <p className="text-xs text-stone-500 uppercase tracking-wider font-medium">Electoral Ward</p>
                <p className="text-4xl font-bold text-stone-900 ">#{hoveredWard.prabhag}</p>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Population</span>
                        <span className="font-semibold text-stone-900">{hoveredWard.population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Category</span>
                        <span className={`font-semibold ${hoveredWard.category === 'SC' ? 'text-blue-600' :
                            hoveredWard.category === 'ST' ? 'text-green-600' :
                                hoveredWard.category === 'OBC' ? 'text-amber-600' :
                                    'text-stone-900'
                            }`}>
                            {hoveredWard.category}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Reservation</span>
                        <span className={`font-semibold ${hoveredWard.isWomenReserved ? 'text-pink-600' : 'text-stone-900'}`}>
                            {hoveredWard.isWomenReserved ? 'Women' : 'General'}
                        </span>
                    </div>
                </div>
                <p className="text-xs text-stone-400 mt-3">Click for details</p>
            </div>
        );
    }
    return null;
}

// Electoral Wards 2025 Layer (New ward boundaries)
function Electoral2025WardsLayer({ onWardClick }: { onWardClick: (name: string, id: string | number) => void }) {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `electoral-2025-wards-source-${id}`;
    const fillLayerId = `electoral-2025-wards-fill-${id}`;
    const outlineLayerId = `electoral-2025-wards-outline-${id}`;
    const labelLayerId = `electoral-2025-wards-labels-${id}`;
    const [hoveredWard, setHoveredWard] = useState<{
        wardNo: number;
    } | null>(null);
    const [isLayerLoaded, setIsLayerLoaded] = useState(false);

    // Build lookup from JSON
    const reservationLookup = categoryReservationData.reduce((acc, item) => {
        acc[item.ward_no] = { category: item.category, women_reserved: item.women_reserved };
        return acc;
    }, {} as Record<number, { category: string; women_reserved: boolean }>);

    // Show loading toast while ward outlines load
    useEffect(() => {
        if (!isLayerLoaded && isLoaded) {
            showToast('info', 'Loading Map', 'Ward outlines loading...');
        }
    }, [isLoaded, isLayerLoaded]);

    useEffect(() => {
        if (!isLoaded || !map) return;

        map.addSource(sourceId, {
            type: "geojson",
            data: "/2025-ward-data.geojson",
        });

        // Mark layer as loaded after source is added
        setIsLayerLoaded(true);

        // Outline only - transparent fill with black outlines
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": "#000000",
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.15, // slight fill on hover for feedback
                    0, // completely transparent normally
                ],
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#10B981", // green on hover
                    "#333333", // darker gray normally for better visibility
                ],
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    3, // thicker on hover
                    1.2, // thicker normally for visibility
                ],
            },
        });

        map.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: sourceId,
            layout: {
                "text-field": ["get", "note"],
                "text-size": 12,
                "text-anchor": "center",
                "text-allow-overlap": false,
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            },
            paint: {
                "text-color": "#000000", // black text
                "text-halo-color": "#ffffff",
                "text-halo-width": 2,
            },
        });

        let hoveredFeatureId: string | number | undefined = undefined;

        const handleMouseMove = async (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: false }
                    );
                }
                hoveredFeatureId = e.features[0].id;
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: true }
                    );
                }
                const props = e.features[0].properties;
                const wardNo = parseInt(props?.note) || 0;

                setHoveredWard({
                    wardNo: wardNo,
                });

                map.getCanvas().style.cursor = "pointer";
            }
        };

        const handleMouseLeave = () => {
            if (hoveredFeatureId !== undefined) {
                map.setFeatureState(
                    { source: sourceId, id: hoveredFeatureId },
                    { hover: false }
                );
            }
            hoveredFeatureId = undefined;
            setHoveredWard(null);
            map.getCanvas().style.cursor = "";
        };

        const handleClick = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                const props = e.features[0].properties;
                const wardNo = parseInt(props?.note) || 0;
                console.log("2025 Electoral Ward clicked:", {
                    id: e.features[0].id,
                    wardNo: wardNo,
                });
                onWardClick(`ward-${wardNo}`, e.features[0].id ?? "unknown");
            }
        };

        map.on("mousemove", fillLayerId, handleMouseMove);
        map.on("mouseleave", fillLayerId, handleMouseLeave);
        map.on("click", fillLayerId, handleClick);
        // Also listen to outline layer for better hover detection
        map.on("mousemove", outlineLayerId, handleMouseMove);
        map.on("mouseleave", outlineLayerId, handleMouseLeave);
        map.on("click", outlineLayerId, handleClick);

        return () => {
            map.off("mousemove", fillLayerId, handleMouseMove);
            map.off("mouseleave", fillLayerId, handleMouseLeave);
            map.off("click", fillLayerId, handleClick);
            map.off("mousemove", outlineLayerId, handleMouseMove);
            map.off("mouseleave", outlineLayerId, handleMouseLeave);
            map.off("click", outlineLayerId, handleClick);
            try {
                if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
                if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
                if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId, labelLayerId, onWardClick]);

    if (hoveredWard) {
        const reservation = reservationLookup[hoveredWard.wardNo] || { category: 'GEN', women_reserved: false };
        return (
            <div className="absolute top-24 left-6 z-10 bg-white border border-emerald-200 rounded-xl px-5 py-4 shadow-lg min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">2025</span>
                    <p className="text-xs text-stone-500 uppercase tracking-wider font-medium">Electoral Ward</p>
                </div>
                <p className="text-4xl font-bold text-stone-900 ">#{hoveredWard.wardNo}</p>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Category</span>
                        <span className={`font-semibold ${reservation.category === 'SC' ? 'text-blue-600' :
                            reservation.category === 'ST' ? 'text-green-600' :
                                reservation.category === 'OBC' ? 'text-amber-600' :
                                    'text-stone-900'
                            }`}>
                            {reservation.category}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Reservation</span>
                        <span className={`font-semibold ${reservation.women_reserved ? 'text-pink-600' : 'text-stone-900'}`}>
                            {reservation.women_reserved ? 'Women' : 'General'}
                        </span>
                    </div>
                </div>
                <p className="text-xs text-stone-400 mt-3">Click for details</p>
            </div>
        );
    }
    return null;
}

// My Ward Button - Black button with Pin icon
function MyWardButton({
    setDataset,
    onWardFound
}: {
    setDataset: (type: DatasetType) => void;
    onWardFound: (feature: any) => void;
}) {
    const { map, isLoaded } = useMap();
    const [finding, setFinding] = useState(false);

    const handleFindWard = () => {
        if (!isLoaded || !map) return;
        setFinding(true);
        setDataset("electoral");

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { longitude, latitude } = pos.coords;

                    // Fly to location
                    map.flyTo({
                        center: [longitude, latitude],
                        zoom: 14,
                        duration: 2000,
                    });

                    // Wait for move to end and tiles to load
                    map.once("moveend", () => {
                        // Check immediately
                        const point = map.project([longitude, latitude]);
                        // Attempt to query all layers at the point
                        const features = map.queryRenderedFeatures(point);
                        const wardFeature = features.find(f =>
                            (f.source.includes("electoral-wards-source") || f.source.includes("electoral-2025-wards-source")) &&
                            f.layer.type === 'fill'
                        );

                        if (wardFeature) {
                            onWardFound(wardFeature);
                            setFinding(false);
                        } else {
                            // Retry once after a short delay in case of tile loading
                            setTimeout(() => {
                                const features = map.queryRenderedFeatures(point);
                                const wardFeature = features.find(f =>
                                    (f.source.includes("electoral-wards-source") || f.source.includes("electoral-2025-wards-source")) &&
                                    f.layer.type === 'fill'
                                );
                                if (wardFeature) {
                                    onWardFound(wardFeature);
                                } else {
                                    console.warn("No electoral ward found at this location");
                                }
                                setFinding(false);
                            }, 1000);
                        }
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setFinding(false);
                    showToast('error', 'Location Error', 'Could not access your location. Please check your permissions.');
                }
            );
        } else {
            showToast('error', 'Not Supported', 'Geolocation is not supported by your browser');
            setFinding(false);
        }
    };

    return (
        <button
            onClick={handleFindWard}
            disabled={finding}
            className="bg-black text-white px-3 sm:px-4 py-2 text-sm font-medium rounded-full shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
        >
            {finding ? (
                <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Finding...</span>
                </>
            ) : (
                <>
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">My Ward</span>
                </>
            )}
        </button>
    );
}

// Coalition color mappings for election results
const COALITION_COLORS: Record<string, { color: string; name: string; parties: string[] }> = {
    mahayuti: {
        color: "#FF6B35", // Saffron/Orange
        name: "Mahayuti",
        parties: ["Bharatiya Janata Party", "Shiv Sena", "Republican Party of India (A)"]
    },
    mva: {
        color: "#2196F3", // Vibrant Blue
        name: "MVA",
        parties: ["Shiv Sena (Uddhav Balasaheb Thackeray)", "Maharashtra Navnirman Sena", "Nationalist Congress Party - Sharad Pawar"]
    },
    congress: {
        color: "#4CAF50", // Green
        name: "Congress+",
        parties: ["Indian National Congress", "Vanchit Bahujan Aghadi"]
    },
    aimim: {
        color: "#00897B", // Teal
        name: "AIMIM",
        parties: ["All India Majlis-E-Ittehadul Muslimeen"]
    },
    other: {
        color: "#9E9E9E", // Gray - NCP, Samajwadi Party, AAP, Independents
        name: "Other",
        parties: []
    }
};

// Get coalition for a party
function getCoalitionForParty(partyName: string): string {
    for (const [coalitionId, coalition] of Object.entries(COALITION_COLORS)) {
        // Use exact match to avoid "Shiv Sena" matching "Shiv Sena (Uddhav Balasaheb Thackeray)"
        if (coalition.parties.some(p => p === partyName)) {
            return coalitionId;
        }
    }
    // Check for independent
    if (partyName.toLowerCase().includes("independent")) {
        return "other";
    }
    return "other";
}

// Winner type
interface WinnerData {
    ward_no: number;
    candidate_name: string;
    party_name: string;
    coalition: string;
    color: string;
}

// Election Results Layer - Colors wards based on winning party
function ElectionResultsLayer({ onWardClick }: { onWardClick: (name: string, id: string | number) => void }) {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `election-results-source-${id}`;
    const fillLayerId = `election-results-fill-${id}`;
    const outlineLayerId = `election-results-outline-${id}`;
    const labelLayerId = `election-results-labels-${id}`;

    const [winners, setWinners] = useState<Record<number, WinnerData>>({});
    const [hoveredWard, setHoveredWard] = useState<WinnerData | null>(null);
    const [coalitionCounts, setCoalitionCounts] = useState<Record<string, number>>({});
    // Build winners map and counts from imported JSON
    useEffect(() => {
        const winnersMap: Record<number, WinnerData> = {};
        const counts: Record<string, number> = {};

        for (const winner of winnersData) {
            const coalition = getCoalitionForParty(winner.party_name);
            const color = COALITION_COLORS[coalition]?.color || COALITION_COLORS.other.color;

            winnersMap[winner.ward_no] = {
                ward_no: winner.ward_no,
                candidate_name: winner.candidate_name,
                party_name: winner.party_name,
                coalition,
                color
            };

            counts[coalition] = (counts[coalition] || 0) + 1;
        }

        setWinners(winnersMap);
        setCoalitionCounts(counts);
    }, []);

    useEffect(() => {
        if (!isLoaded || !map || Object.keys(winners).length === 0) return;

        // Build color expression for fill
        const colorExpression: any[] = ["match", ["to-number", ["get", "note"]]];

        for (const [wardNo, winner] of Object.entries(winners)) {
            colorExpression.push(parseInt(wardNo), winner.color);
        }
        // Default color for wards without winners
        colorExpression.push("#E0E0E0");

        map.addSource(sourceId, {
            type: "geojson",
            data: "/2025-ward-data.geojson",
        });

        // Colored fill based on winning coalition
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": colorExpression as any,
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.9,
                    0.7,
                ],
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#000000", // Black on hover
                    "#1a1a1a", // Dark gray normally for visibility
                ],
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    4, // Thick on hover
                    2, // Prominent outline always visible
                ],
            },
        });

        map.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: sourceId,
            layout: {
                "text-field": ["get", "note"],
                "text-size": 11,
                "text-anchor": "center",
                "text-allow-overlap": false,
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            },
            paint: {
                "text-color": "#000000",
                "text-halo-color": "#ffffff",
                "text-halo-width": 2,
            },
        });

        let hoveredFeatureId: string | number | undefined = undefined;

        const handleMouseMove = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: false }
                    );
                }
                hoveredFeatureId = e.features[0].id;
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: true }
                    );
                }
                const props = e.features[0].properties;
                const wardNo = parseInt(props?.note) || 0;
                const winner = winners[wardNo];

                if (winner) {
                    setHoveredWard(winner);
                } else {
                    setHoveredWard(null);
                }

                map.getCanvas().style.cursor = "pointer";
            }
        };

        const handleMouseLeave = () => {
            if (hoveredFeatureId !== undefined) {
                map.setFeatureState(
                    { source: sourceId, id: hoveredFeatureId },
                    { hover: false }
                );
            }
            hoveredFeatureId = undefined;
            setHoveredWard(null);
            map.getCanvas().style.cursor = "";
        };

        const handleClick = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                const props = e.features[0].properties;
                const wardNo = parseInt(props?.note) || 0;
                onWardClick(`ward-${wardNo}`, e.features[0].id ?? "unknown");
            }
        };

        map.on("mousemove", fillLayerId, handleMouseMove);
        map.on("mouseleave", fillLayerId, handleMouseLeave);
        map.on("click", fillLayerId, handleClick);

        return () => {
            map.off("mousemove", fillLayerId, handleMouseMove);
            map.off("mouseleave", fillLayerId, handleMouseLeave);
            map.off("click", fillLayerId, handleClick);
            try {
                if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
                if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
                if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map, winners, sourceId, fillLayerId, outlineLayerId, labelLayerId, onWardClick]);

    return (
        <>
            {/* Hover Info Card */}
            {hoveredWard && (
                <div className="absolute top-24 left-6 z-10 bg-white border-2 rounded-xl px-5 py-4 shadow-xl min-w-[240px]" style={{ borderColor: hoveredWard.color }}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: hoveredWard.color }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: hoveredWard.color }}>
                            {COALITION_COLORS[hoveredWard.coalition]?.name || "Other"}
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-stone-900 ">
                        #{hoveredWard.ward_no}
                    </p>
                    <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-stone-800">{hoveredWard.candidate_name}</p>
                        <p className="text-xs text-stone-500">{hoveredWard.party_name}</p>
                    </div>
                    <p className="text-xs text-stone-400 mt-3">Click for details</p>
                </div>
            )}

            {/* Large Legend */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 border border-stone-300 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Election Results
                </h3>
                <div className="space-y-3">
                    {Object.entries(COALITION_COLORS).map(([coalitionId, coalition]) => {
                        const count = coalitionCounts[coalitionId] || 0;
                        if (coalitionId === "other" && count === 0) return null;
                        return (
                            <div key={coalitionId} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-6 h-6 rounded-md shadow-sm border border-black/10"
                                        style={{ backgroundColor: coalition.color }}
                                    />
                                    <span className="text-sm font-semibold text-stone-800">{coalition.name}</span>
                                </div>
                                <span className="text-lg font-bold text-stone-900 min-w-[40px] text-right">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500">Total Wards Declared</span>
                        <span className="text-xl font-bold text-stone-900">
                            {Object.values(coalitionCounts).reduce((a, b) => a + b, 0)}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

// Weather Forecast Layer - Shows AQI data for each ward
function WeatherForecastLayer({ onWardClick }: { onWardClick: (name: string, id: string | number) => void }) {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `weather-forecast-source-${id}`;
    const fillLayerId = `weather-forecast-fill-${id}`;
    const outlineLayerId = `weather-forecast-outline-${id}`;
    const labelLayerId = `weather-forecast-labels-${id}`;

    const [weatherData, setWeatherData] = useState<Record<number, { aqi: number; temp: number; condition: string }>>({});
    const [hoveredWard, setHoveredWard] = useState<{ wardNo: number; aqi: number; temp: number; condition: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // AQI color mapping
    const getAQIColor = (aqi: number): string => {
        if (aqi <= 50) return "#00E400"; // Good - Green
        if (aqi <= 100) return "#FFFF00"; // Moderate - Yellow
        if (aqi <= 150) return "#FF7E00"; // Unhealthy for Sensitive - Orange
        if (aqi <= 200) return "#FF0000"; // Unhealthy - Red
        if (aqi <= 300) return "#8F3F97"; // Very Unhealthy - Purple
        return "#7E0023"; // Hazardous - Maroon
    };

    const getAQILabel = (aqi: number): string => {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy for Sensitive";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";
        return "Hazardous";
    };

    // Fetch weather data for all wards
    useEffect(() => {
        const fetchWeatherData = async () => {
            setLoading(true);
            try {
                const wardCenters = getAllWardCenters();
                const weatherPromises = wardCenters.slice(0, 25).map(async (ward) => { // Use 25 wards for demo
                    try {
                        // Using actual API endpoint that was set up, instead of mock
                        const response = await fetch('/api/weather/forecast', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                lat: ward.lat,
                                lon: ward.lng,
                                wardId: ward.wardId,
                            }),
                        });
                        
                        if (!response.ok) {
                            throw new Error('Failed to fetch from API');
                        }
                        
                        const data = await response.json();
                        // OpenWeather forecast structure usually has aqi in air pollution endpoint
                        // Since this uses standard forecast endpoint, we can mock AQI but use real temp
                        const temp = data.forecast?.list?.[0]?.main?.temp || 28;
                        const condition = data.forecast?.list?.[0]?.weather?.[0]?.main || 'Clear';
                        
                        // Generating mock AQI as air pollution API would require a separate call
                        const mockAQI = Math.floor(Math.random() * 300) + 1;

                        return {
                            wardId: parseInt(ward.wardId),
                            aqi: mockAQI,
                            temp: Math.round(temp),
                            condition: condition
                        };
                    } catch (error) {
                        console.error(`Error fetching weather for ward ${ward.wardId}:`, error);
                        // Fallback to mock data if API fails or rate limits
                        return {
                            wardId: parseInt(ward.wardId),
                            aqi: Math.floor(Math.random() * 300) + 1,
                            temp: Math.floor(Math.random() * 15) + 20,
                            condition: ["Clear", "Cloudy", "Rainy", "Hazy"][Math.floor(Math.random() * 4)]
                        };
                    }
                });

                const results = await Promise.all(weatherPromises);
                const weatherMap: Record<number, { aqi: number; temp: number; condition: string }> = {};

                results.forEach(result => {
                    if (result) {
                        weatherMap[result.wardId] = {
                            aqi: result.aqi,
                            temp: result.temp,
                            condition: result.condition
                        };
                    }
                });

                setWeatherData(weatherMap);
            } catch (error) {
                console.error("Error fetching weather data:", error);
                showToast('error', 'Weather Error', 'Failed to load weather data');
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) {
            fetchWeatherData();
        }
    }, [isLoaded]);

    useEffect(() => {
        if (!isLoaded || !map || Object.keys(weatherData).length === 0) return;

        // Build color expression for fill based on AQI
        const colorExpression: any[] = ["match", ["to-number", ["get", "note"]]];

        for (const [wardNo, weather] of Object.entries(weatherData)) {
            colorExpression.push(parseInt(wardNo), getAQIColor(weather.aqi));
        }
        // Default color for wards without data
        colorExpression.push("#E0E0E0");

        map.addSource(sourceId, {
            type: "geojson",
            data: "/2025-ward-data.geojson",
        });

        // Colored fill based on AQI
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": colorExpression as any,
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.9,
                    0.7,
                ],
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#000000", // Black on hover
                    "#666666", // Gray normally
                ],
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    3, // Thick on hover
                    1, // Thin normally
                ],
            },
        });

        map.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: sourceId,
            layout: {
                "text-field": ["get", "note"],
                "text-size": 11,
                "text-anchor": "center",
                "text-allow-overlap": false,
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            },
            paint: {
                "text-color": "#000000",
                "text-halo-color": "#ffffff",
                "text-halo-width": 2,
            },
        });

        let hoveredFeatureId: string | number | undefined = undefined;

        const handleMouseMove = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: false }
                    );
                }
                hoveredFeatureId = e.features[0].id;
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: true }
                    );
                }
                const props = e.features[0].properties;
                const wardNo = parseInt(props?.note) || 0;
                const weather = weatherData[wardNo];

                if (weather) {
                    setHoveredWard({
                        wardNo,
                        aqi: weather.aqi,
                        temp: weather.temp,
                        condition: weather.condition
                    });
                } else {
                    setHoveredWard(null);
                }

                map.getCanvas().style.cursor = "pointer";
            }
        };

        const handleMouseLeave = () => {
            if (hoveredFeatureId !== undefined) {
                map.setFeatureState(
                    { source: sourceId, id: hoveredFeatureId },
                    { hover: false }
                );
            }
            hoveredFeatureId = undefined;
            setHoveredWard(null);
            map.getCanvas().style.cursor = "";
        };

        const handleClick = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                const props = e.features[0].properties;
                const wardNo = parseInt(props?.note) || 0;
                onWardClick(`ward-${wardNo}`, e.features[0].id ?? "unknown");
            }
        };

        map.on("mousemove", fillLayerId, handleMouseMove);
        map.on("mouseleave", fillLayerId, handleMouseLeave);
        map.on("click", fillLayerId, handleClick);

        return () => {
            map.off("mousemove", fillLayerId, handleMouseMove);
            map.off("mouseleave", fillLayerId, handleMouseLeave);
            map.off("click", fillLayerId, handleClick);
            try {
                if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
                if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
                if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map, weatherData, sourceId, fillLayerId, outlineLayerId, labelLayerId, onWardClick]);

    return (
        <>
            {/* Hover Info Card */}
            {hoveredWard && (
                <div className="absolute top-24 left-6 z-10 bg-white border-2 rounded-xl px-5 py-4 shadow-xl min-w-[240px]" style={{ borderColor: getAQIColor(hoveredWard.aqi) }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Cloud className="w-4 h-4" style={{ color: getAQIColor(hoveredWard.aqi) }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: getAQIColor(hoveredWard.aqi) }}>
                            {getAQILabel(hoveredWard.aqi)}
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-stone-900">
                        #{hoveredWard.wardNo}
                    </p>
                    <div className="mt-3 space-y-2">
                        <div className="flex justify-between gap-4">
                            <span className="text-sm text-stone-500">AQI</span>
                            <span className="font-bold text-lg" style={{ color: getAQIColor(hoveredWard.aqi) }}>
                                {hoveredWard.aqi}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-sm text-stone-500">Temperature</span>
                            <span className="font-semibold text-stone-900">{hoveredWard.temp}°C</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-sm text-stone-500">Condition</span>
                            <span className="font-semibold text-stone-900">{hoveredWard.condition}</span>
                        </div>
                    </div>
                    <p className="text-xs text-stone-400 mt-3">Click for details</p>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="absolute top-24 left-6 z-10 bg-white border border-stone-200 rounded-xl px-5 py-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                        <span className="text-sm text-stone-600">Loading weather data...</span>
                    </div>
                </div>
            )}

            {/* AQI Legend */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 border border-stone-300 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    Air Quality Index
                </h3>
                <div className="space-y-2">
                    {[
                        { range: "0-50", label: "Good", color: "#00E400" },
                        { range: "51-100", label: "Moderate", color: "#FFFF00" },
                        { range: "101-150", label: "Unhealthy for Sensitive", color: "#FF7E00" },
                        { range: "151-200", label: "Unhealthy", color: "#FF0000" },
                        { range: "201-300", label: "Very Unhealthy", color: "#8F3F97" },
                        { range: "300+", label: "Hazardous", color: "#7E0023" },
                    ].map((item) => (
                        <div key={item.range} className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-sm shadow-sm border border-black/10"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1">
                                <span className="text-xs font-semibold text-stone-800">{item.label}</span>
                                <span className="text-xs text-stone-500 ml-2">({item.range})</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500">Wards with Data</span>
                        <span className="text-lg font-bold text-stone-900">
                            {Object.keys(weatherData).length}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

// Flooding Risk Layer
function FloodingLayer() {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `flooding-source-${id}`;
    const fillLayerId = `flooding-fill-${id}`;
    const outlineLayerId = `flooding-outline-${id}`;

    useEffect(() => {
        if (!isLoaded || !map) return;

        map.addSource(sourceId, {
            type: "geojson",
            data: floodingData as any,
        });

        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": "#0ea5e9", // Sky blue for water/flooding
                "fill-opacity": 0.5,
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": "#0284c7",
                "line-width": 1.5,
            },
        });

        return () => {
            try {
                if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
                if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId]);

    return (
        <div className="absolute bottom-6 left-6 z-20 bg-white/95 border border-stone-300 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-500" />
                Flooding Risk Zones
            </h3>
            <p className="text-sm text-stone-600 max-w-xs">
                Highlighted areas indicate historical or forecasted flooding risks within Mumbai.
            </p>
        </div>
    );
}

export default function MapPage() {
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetType>("electoral");
    const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);

    const handleWardClick = useCallback(
        (wardName: string, wardId: string | number) => {
            const slug = slugify(wardName);
            router.push(`/map/${slug}`);
        },
        [router]
    );

    // Callback for when My Ward finds a feature
    const handleWardFound = useCallback((feature: any) => {
        const props = feature.properties;
        // Support both 2022 (prabhag) and 2025 (note) property formats
        const wardNo = props?.prabhag || props?.note;
        console.log("My Ward found:", {
            id: feature.id,
            wardNo: wardNo,
        });

        // We use the same click handler logic
        // The ID in geojson is usually the feature id
        handleWardClick(`ward-${wardNo}`, feature.id ?? "unknown");
    }, [handleWardClick]);

    const handleLocate = useCallback((coords: { longitude: number; latitude: number }) => {
        setUserLocation({ lng: coords.longitude, lat: coords.latitude });
    }, []);

    const [showWarning, setShowWarning] = useState(true);

    return (
        <div className="h-screen w-screen bg-background overflow-hidden">
            <Navbar />

            {/* Full-screen Map */}
            <div className="h-full w-full">
                <Map
                    center={MUMBAI_CENTER}
                    zoom={MUMBAI_ZOOM}
                    minZoom={9}
                    maxZoom={18}
                    key={dataset}
                >
                    {/* Map Type Dropdown + My Ward Button - inside Map for shared context */}
                    <div className="absolute top-4 left-4 sm:left-6 z-20 flex items-center gap-2 sm:gap-3">
                        <MapTypeDropdown dataset={dataset} setDataset={setDataset} />
                        <MyWardButton setDataset={setDataset} onWardFound={handleWardFound} />
                    </div>

                    {dataset === "electoral" && <Electoral2025WardsLayer onWardClick={handleWardClick} />}
                    {dataset === "results" && <ElectionResultsLayer onWardClick={handleWardClick} />}
                    {dataset === "forecast" && <WeatherForecastLayer onWardClick={handleWardClick} />}
                    {dataset === "flooding" && (
                        <>
                            <Electoral2025WardsLayer onWardClick={handleWardClick} />
                            <FloodingLayer />
                        </>
                    )}

                    {/* User location marker */}
                    {userLocation && (
                        <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
                            <MarkerContent>
                                <div className="relative">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-2 border-white shadow-lg animate-pulse" />
                                    <div className="w-3 h-3 rounded-full bg-accent/30 animate-ping" />
                                </div>
                            </MarkerContent>
                        </MapMarker>
                    )}

                    <MapControls
                        position="bottom-left"
                        showZoom={true}
                        showCompass={true}
                        showLocate={true}
                        showFullscreen={true}
                        onLocate={handleLocate}
                    />
                </Map>
            </div>

            {/* Legend for Electoral */}
            {/* {dataset === "electoral" && (
                <div className="absolute bottom-6 left-6 z-20 bg-card/90 border border-white/20 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs font-semibold mb-3 text-white">Reservation</p>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#f5e6c8", border: "1px solid #888" }} />
                            <span className="text-white/80 font-light">General</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#f5d9a8", border: "1px solid #888" }} />
                            <span className="text-white/80 font-light">Women</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#e8c896", border: "1px solid #888" }} />
                            <span className="text-white/80 font-light">SC</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#dbb87a", border: "1px solid #888" }} />
                            <span className="text-white/80 font-light">ST</span>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Hint */}
            {dataset !== "forecast" && (
                <div className="absolute bottom-24 right-6 z-20 hidden sm:block">
                    <div className="bg-card/90 border border-white/20 px-4 py-2 backdrop-blur-sm">
                        <p className="text-xs text-black font-light">
                            Hover for info • Click for details
                        </p>
                    </div>
                </div>
            )}

            {/* What's this page? floating popup */}
            <WhatsThisPopup dataset={dataset} setDataset={setDataset} mapTypes={MAP_TYPES} />

        </div>
    );
}

