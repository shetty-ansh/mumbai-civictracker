"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
    Map,
    MapControls,
    useMap,
} from "@/components/ui/map";
import type MapLibreGL from "maplibre-gl";
import { ArrowLeft, Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Mumbai center coordinates
const MUMBAI_CENTER: [number, number] = [72.8777, 19.076];
const MUMBAI_ZOOM = 10.5;

interface Candidate {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    symbol: string;
    ward_name: string;
}

// Party color mapping based on official party colors
function getPartyColor(partyName: string): { bg: string; text: string } {
    const party = partyName.toLowerCase();

    if (party.includes('bjp') || party.includes('bharatiya janata')) {
        return { bg: '#FF9933', text: '#000000' }; // Saffron
    }
    if (party.includes('shiv sena') || party.includes('shivsena')) {
        return { bg: '#FF6634', text: '#FFFFFF' }; // Orange
    }
    if (party.includes('congress') || party.includes('inc')) {
        return { bg: '#19AAED', text: '#FFFFFF' }; // Sky Blue
    }
    if (party.includes('ncp') || party.includes('nationalist congress')) {
        if (party.includes('ajit') || party.includes('pawar') && !party.includes('sharad')) {
            return { bg: '#FF69B4', text: '#000000' }; // Pink (Ajit Pawar faction)
        }
        return { bg: '#00A7E1', text: '#FFFFFF' }; // Blue (Sharad Pawar faction)
    }
    if (party.includes('aap') || party.includes('aam aadmi')) {
        return { bg: '#0066CC', text: '#FFFFFF' }; // Blue
    }
    if (party.includes('mns') || party.includes('maharashtra navnirman')) {
        return { bg: '#FF9933', text: '#000000' }; // Saffron
    }
    if (party.includes('independent')) {
        return { bg: '#808080', text: '#FFFFFF' }; // Gray
    }

    // Default color for unknown parties
    return { bg: '#000000', text: '#FFFFFF' }; // Black
}

// GeoJSON layer component for 2022 Electoral Wards
function ElectoralWardsLayer({
    candidates,
    onWardClick
}: {
    candidates: Record<number, Candidate[]>;
    onWardClick: (wardNo: number) => void;
}) {
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
        candidateCount: number;
    } | null>(null);

    useEffect(() => {
        if (!isLoaded || !map) return;

        // Add GeoJSON source for 2022 Electoral Wards
        map.addSource(sourceId, {
            type: "geojson",
            data: "/mumbai_electoral_2022_ward_level.geojson",
        });

        // Add fill layer with hover effect - transparent fill, outline only
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

        // Add outline layer with hover effect
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
                    0.5, // very thin normally
                ],
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
                const prabhagNo = props?.prabhag || 0;
                const wardCandidates = candidates[prabhagNo] || [];

                setHoveredWard({
                    prabhag: prabhagNo,
                    population: props?.tot_pop || 0,
                    reservation: props?.reservation || "unknown",
                    candidateCount: wardCandidates.length,
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
                const prabhagNo = props?.prabhag || 0;
                onWardClick(prabhagNo);
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
                // ignore cleanup errors
            }
        };
    }, [isLoaded, map, sourceId, fillLayerId, outlineLayerId, labelLayerId, candidates, onWardClick]);

    // Floating info box for hovered ward
    if (hoveredWard) {
        return (
            <div className="absolute top-20 left-4 z-10 rounded-lg bg-background border border-border px-4 py-3 shadow-sm min-w-[220px]">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Electoral Ward</p>
                        <p className="text-2xl font-bold">#{hoveredWard.prabhag}</p>
                    </div>
                    {hoveredWard.candidateCount > 0 && (
                        <div className="text-right">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground rounded-full border border-border">
                                {hoveredWard.candidateCount} {hoveredWard.candidateCount === 1 ? 'Candidate' : 'Candidates'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-muted-foreground block">Population</span>
                            <span className="font-medium">{hoveredWard.population.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Reservation</span>
                            <span className="font-medium capitalize">{hoveredWard.reservation}</span>
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">
                    {hoveredWard.candidateCount > 0 ? 'Click to view candidates' : 'No candidates yet'}
                </p>
            </div>
        );
    }

    return null;
}

// Candidate List Modal
function CandidateListModal({
    wardNo,
    candidates,
    onClose
}: {
    wardNo: number | null;
    candidates: Candidate[];
    onClose: () => void;
}) {
    if (wardNo === null) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">Ward #{wardNo} Candidates</h2>
                        <p className="text-sm text-muted-foreground">
                            {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'} running
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Candidate List */}
                <div className="overflow-y-auto flex-1 p-6">
                    {candidates.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No candidates found for this ward</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {candidates.map((candidate, index) => (
                                <div
                                    key={candidate.id}
                                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <h3 className="font-semibold text-lg">{candidate.candidate_name}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{candidate.ward_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                                                style={{
                                                    backgroundColor: getPartyColor(candidate.party_name).bg,
                                                    color: getPartyColor(candidate.party_name).text
                                                }}
                                            >
                                                {candidate.party_name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Symbol:</span>
                                            <span className="font-medium">{candidate.symbol}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border">
                    <Button onClick={onClose} className="w-full">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function TestingPage() {
    const [candidates, setCandidates] = useState<Record<number, Candidate[]>>({});
    const [selectedWard, setSelectedWard] = useState<number | null>(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            const { data, error } = await supabase
                .from('bmc_candidates')
                .select('*');

            if (error) {
                console.error('Error fetching candidates:', error);
                return;
            }

            if (data) {
                const mapping: Record<number, Candidate[]> = {};
                data.forEach((candidate: Candidate) => {
                    if (!mapping[candidate.ward_no]) {
                        mapping[candidate.ward_no] = [];
                    }
                    mapping[candidate.ward_no].push(candidate);
                });
                setCandidates(mapping);
            }
        };

        fetchCandidates();
    }, []);

    const handleWardClick = (wardNo: number) => {
        setSelectedWard(wardNo);
    };

    const handleCloseModal = () => {
        setSelectedWard(null);
    };

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
                        <p className="text-xs text-muted-foreground">227 wards • Click to view candidates</p>
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
                    <ElectoralWardsLayer
                        candidates={candidates}
                        onWardClick={handleWardClick}
                    />

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
                        Hover for info • Click to view candidates
                    </p>
                </div>
            </div>

            {/* Candidate List Modal */}
            <CandidateListModal
                wardNo={selectedWard}
                candidates={selectedWard !== null ? (candidates[selectedWard] || []) : []}
                onClose={handleCloseModal}
            />
        </div>
    );
}
