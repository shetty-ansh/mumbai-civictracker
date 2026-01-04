"use client";

import { useEffect, useId, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Map,
    MapControls,
    useMap,
} from "@/components/ui/map";
import type MapLibreGL from "maplibre-gl";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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

        // Vibrant beige fill with black outlines
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#d4a574", // warm tan on hover
                    "#f5e6c8", // vibrant beige default
                ],
                "fill-opacity": 0.9,
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": "#000000", // black outline
                "line-width": 1.5,
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
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId, labelLayerId, onWardClick]);

    if (hoveredWard) {
        return (
            <div className="absolute top-20 left-4 z-10 bg-card border border-border px-4 py-3 shadow-sm">
                <p className="text-xs text-muted-foreground">Admin Ward</p>
                <p className="text-xl font-semibold">{hoveredWard}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
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

        // Vibrant beige colors based on reservation
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#c9a66b", // warm tan on hover
                    [
                        "match",
                        ["get", "reservation"],
                        "women", "#f5d9a8",    // warm yellow-beige
                        "SC", "#e8c896",       // golden beige
                        "ST", "#dbb87a",       // deeper gold
                        "SC women", "#d4a574", // warm tan
                        "#f5e6c8"              // general - vibrant beige
                    ]
                ],
                "fill-opacity": 0.9,
            },
        });

        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": "#000000", // black outline
                "line-width": 0.8,
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
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId, labelLayerId, onWardClick]);

    if (hoveredWard) {
        return (
            <div className="absolute top-20 left-4 z-10 bg-card border border-border px-4 py-3 shadow-sm min-w-[160px]">
                <p className="text-xs text-muted-foreground">Electoral Ward</p>
                <p className="text-2xl font-semibold">#{hoveredWard.prabhag}</p>
                <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Population</span>
                        <span>{hoveredWard.population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Reservation</span>
                        <span className="capitalize">{hoveredWard.reservation}</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Click for details</p>
            </div>
        );
    }
    return null;
}

export default function MapPage() {
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetType>("plain");

    const handleWardClick = useCallback(
        (wardName: string, wardId: string | number) => {
            const slug = slugify(wardName);
            router.push(`/map/${slug}`);
        },
        [router]
    );

    return (
        <div className="h-screen w-screen bg-background">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/home">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">Mumbai</h1>
                        <p className="text-xs text-muted-foreground">
                            {dataset === "plain" && "Base Map"}
                            {dataset === "admin" && "24 Administrative Wards"}
                            {dataset === "electoral" && "227 Electoral Wards"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/">
                            <Home className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Dataset Toggle */}
            <div className="absolute top-16 left-4 z-20">
                <div className="bg-card border border-border p-1 flex gap-1">
                    <button
                        onClick={() => setDataset("plain")}
                        className={`px-3 py-1.5 text-sm transition-colors ${dataset === "plain"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Plain
                    </button>
                    <button
                        onClick={() => setDataset("admin")}
                        className={`px-3 py-1.5 text-sm transition-colors ${dataset === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Admin
                    </button>
                    <button
                        onClick={() => setDataset("electoral")}
                        className={`px-3 py-1.5 text-sm transition-colors ${dataset === "electoral"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Electoral
                    </button>
                </div>
            </div>

            {/* Full-screen Map */}
            <div className="h-full w-full pt-14">
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

                    <MapControls
                        position="bottom-right"
                        showZoom={true}
                        showCompass={true}
                        showLocate={true}
                        showFullscreen={true}
                    />
                </Map>
            </div>

            {/* Legend for Electoral */}
            {dataset === "electoral" && (
                <div className="absolute bottom-4 left-4 z-20 bg-card border border-border px-3 py-2">
                    <p className="text-xs font-medium mb-2">Reservation</p>
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#f5e6c8", border: "1px solid #000" }} />
                            <span>General</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#f5d9a8", border: "1px solid #000" }} />
                            <span>Women</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#e8c896", border: "1px solid #000" }} />
                            <span>SC</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: "#dbb87a", border: "1px solid #000" }} />
                            <span>ST</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Hint */}
            {dataset !== "plain" && (
                <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-card border border-border px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            Hover for info • Click for details
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
