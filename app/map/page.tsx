"use client";

import { useEffect, useId, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Map,
    MapControls,
    MapMarker,
    MarkerContent,
    useMap,
} from "@/components/ui/map";
import type MapLibreGL from "maplibre-gl";
import { Navbar } from "@/components/ui/navbar";

// Mumbai center coordinates
const MUMBAI_CENTER: [number, number] = [72.8777, 19.076];
const MUMBAI_ZOOM = 10.5;

type DatasetType = "plain" | "admin" | "electoral";

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
        reservation: string;
    } | null>(null);

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
                setHoveredWard({
                    prabhag: props?.prabhag || 0,
                    population: props?.tot_pop || 0,
                    reservation: props?.reservation || "unknown",
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
                    reservation: props?.reservation,
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
            <div className="absolute top-20 left-4 z-10 bg-card border border-white/20 px-4 py-3 backdrop-blur-sm min-w-[180px]">
                <p className="text-xs text-white/60 font-light">Electoral Ward</p>
                <p className="text-3xl font-bold text-accent">#{hoveredWard.prabhag}</p>
                <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-white/60 font-light">Population</span>
                        <span className="font-medium">{hoveredWard.population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-white/60 font-light">Reservation</span>
                        <span className="capitalize font-medium">{hoveredWard.reservation}</span>
                    </div>
                </div>
                <p className="text-xs text-white/40 mt-2 font-light">Click for details</p>
            </div>
        );
    }
    return null;
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

    const handleLocate = useCallback((coords: { longitude: number; latitude: number }) => {
        setUserLocation({ lng: coords.longitude, lat: coords.latitude });
    }, []);

    return (
        <div className="h-screen w-screen bg-background overflow-hidden">
            <Navbar />

            {/* Dataset Toggle */}
            <div className="absolute top-24 left-6 z-20">
                <div className="bg-card/90 border border-border p-1.5 flex gap-1 backdrop-blur-sm rounded-full">
                    {/* <button
                        onClick={() => setDataset("admin")}
                        className={`px-5 py-2 text-sm font-medium transition-all rounded-full ${dataset === "admin"
                            ? "bg-accent text-white"
                            : "text-muted-foreground hover:text-accent hover:bg-muted"
                            }`}
                    >
                        Admin
                    </button> */}
                    <button
                        onClick={() => setDataset("electoral")}
                        className={`px-5 py-2 text-sm font-medium transition-all rounded-full ${dataset === "electoral"
                            ? "bg-accent text-white"
                            : "text-muted-foreground hover:text-accent hover:bg-muted"
                            }`}
                    >
                        Electoral
                    </button>
                    <button
                        onClick={() => setDataset("plain")}
                        className={`px-5 py-2 text-sm font-medium transition-all rounded-full ${dataset === "plain"
                            ? "bg-accent text-white"
                            : "text-muted-foreground hover:text-accent hover:bg-muted"
                            }`}
                    >
                        Plain
                    </button>
                </div>
            </div>


            {/* Full-screen Map */}
            <div className="h-full w-full">
                <Map
                    center={MUMBAI_CENTER}
                    zoom={MUMBAI_ZOOM}
                    minZoom={9}
                    maxZoom={18}
                    key={dataset}
                >
                    {dataset === "admin" && <AdminWardsLayer onWardClick={handleWardClick} />}
                    {dataset === "electoral" && <ElectoralWardsLayer onWardClick={handleWardClick} />}
                    {/* Plain mode shows no layers - just base map */}

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
            {dataset !== "plain" && (
                <div className="absolute bottom-6 right-6 z-20">
                    <div className="bg-card/90 border border-white/20 px-4 py-2 backdrop-blur-sm">
                        <p className="text-xs text-white/60 font-light">
                            Hover for info • Click for details
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
