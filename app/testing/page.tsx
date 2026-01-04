"use client";

import { useEffect, useId, useState } from "react";
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

// GeoJSON layer component for 2022 Electoral Wards
function ElectoralWardsLayer() {
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

        // Add GeoJSON source for 2022 Electoral Wards
        map.addSource(sourceId, {
            type: "geojson",
            data: "/mumbai_electoral_2022_ward_level.geojson",
        });

        // Add fill layer with hover effect - flat black/white theme
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#000000", // black on hover
                    [
                        "match",
                        ["get", "reservation"],
                        "women", "#e5e5e5",
                        "SC", "#d4d4d4",
                        "ST", "#a3a3a3",
                        "SC women", "#737373",
                        "#f5f5f5" // general - lightest
                    ]
                ],
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.5,
                    0.7,
                ],
            },
        });

        // Add outline layer
        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": "#000000",
                "line-width": 1,
            },
        });

        // Add labels layer - show prabhag number
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
                "text-color": "#000000",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1,
            },
        });

        // Track hovered feature for hover state
        let hoveredFeatureId: string | number | undefined = undefined;

        const handleMouseMove = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
        ) => {
            if (e.features && e.features.length > 0) {
                // Remove hover state from previous feature
                if (hoveredFeatureId !== undefined) {
                    map.setFeatureState(
                        { source: sourceId, id: hoveredFeatureId },
                        { hover: false }
                    );
                }

                // Set hover state on current feature
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
                console.log("Ward clicked:", {
                    id: e.features[0].id,
                    prabhag: props?.prabhag,
                    population: props?.tot_pop,
                    SC_pop: props?.SC_pop,
                    ST_pop: props?.ST_pop,
                    reservation: props?.reservation,
                });
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
                // ignore cleanup errors
            }
        };
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId, labelLayerId]);

    // Floating info box for hovered ward
    if (hoveredWard) {
        return (
            <div className="absolute top-20 left-4 z-10 rounded-lg bg-background border border-border px-4 py-3 shadow-sm min-w-[180px]">
                <p className="text-xs text-muted-foreground">Electoral Ward</p>
                <p className="text-2xl font-bold">#{hoveredWard.prabhag}</p>
                <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Population</span>
                        <span className="font-medium">{hoveredWard.population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Reservation</span>
                        <span className="font-medium capitalize">{hoveredWard.reservation}</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Click for full details</p>
            </div>
        );
    }

    return null;
}

export default function TestingPage() {
    return (
        <div className="h-screen w-screen bg-background">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-sm border-b border-border">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/home">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-heading text-xl font-bold">Electoral Wards 2022</h1>
                        <p className="text-xs text-muted-foreground">227 wards • Test data</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <Home className="w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Full-screen Map */}
            <div className="h-full w-full pt-16">
                <Map
                    center={MUMBAI_CENTER}
                    zoom={MUMBAI_ZOOM}
                    minZoom={9}
                    maxZoom={18}
                >
                    {/* Electoral Wards GeoJSON Layer */}
                    <ElectoralWardsLayer />

                    {/* Map Controls */}
                    <MapControls
                        position="bottom-right"
                        showZoom={true}
                        showCompass={true}
                        showLocate={true}
                        showFullscreen={true}
                    />
                </Map>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-3">
                <p className="text-xs font-medium mb-2">Reservation Category</p>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f5f5f5", border: "1px solid #000" }} />
                        <span>General</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#e5e5e5", border: "1px solid #000" }} />
                        <span>Women</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#d4d4d4", border: "1px solid #000" }} />
                        <span>SC</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#a3a3a3", border: "1px solid #000" }} />
                        <span>ST</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#737373", border: "1px solid #000" }} />
                        <span>SC Women</span>
                    </div>
                </div>
            </div>

            {/* Bottom hint */}
            <div className="absolute bottom-4 right-4 z-20">
                <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-center">
                    <p className="text-sm text-muted-foreground">
                        Hover for info • Click to log data
                    </p>
                </div>
            </div>
        </div>
    );
}
