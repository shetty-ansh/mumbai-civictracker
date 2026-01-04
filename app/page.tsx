"use client";

import { useEffect, useId, useState } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";
import type MapLibreGL from "maplibre-gl";

// Mumbai center coordinates
const MUMBAI_CENTER: [number, number] = [72.8777, 19.076];
const MUMBAI_ZOOM = 10.5;

// GeoJSON layer component for Mumbai wards
function MumbaiWardsLayer() {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `mumbai-wards-source-${id}`;
  const fillLayerId = `mumbai-wards-fill-${id}`;
  const outlineLayerId = `mumbai-wards-outline-${id}`;
  const labelLayerId = `mumbai-wards-labels-${id}`;
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !map) return;

    // Add GeoJSON source for Mumbai wards
    map.addSource(sourceId, {
      type: "geojson",
      data: "/mumbai-wards.json",
    });

    // Add fill layer with hover effect
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#f59e0b", // amber on hover
          "#3b82f6", // blue default
        ],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.6,
          0.3,
        ],
      },
    });

    // Add outline layer
    map.addLayer({
      id: outlineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#1e40af",
        "line-width": 1.5,
      },
    });

    // Add labels layer
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
        "text-color": "#1e293b",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.5,
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

    map.on("mousemove", fillLayerId, handleMouseMove);
    map.on("mouseleave", fillLayerId, handleMouseLeave);

    return () => {
      map.off("mousemove", fillLayerId, handleMouseMove);
      map.off("mouseleave", fillLayerId, handleMouseLeave);

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
      <div className="absolute top-4 left-4 z-10 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 px-4 py-2 shadow-lg">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Ward
        </p>
        <p className="text-lg font-bold text-zinc-900 dark:text-white">
          {hoveredWard}
        </p>
      </div>
    );
  }

  return null;
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lng: number;
    lat: number;
    name: string;
  } | null>(null);

  // Sample locations in Mumbai
  const locations = [
    { lng: 72.8347, lat: 18.922, name: "Gateway of India" },
    { lng: 72.8296, lat: 18.9398, name: "Chhatrapati Shivaji Terminus" },
    { lng: 72.8352, lat: 19.0222, name: "Bandra-Worli Sea Link" },
    { lng: 72.8777, lat: 19.076, name: "Mumbai Central" },
    { lng: 72.8567, lat: 19.1726, name: "Powai Lake" },
  ];

  return (
    <div className="h-screen w-screen bg-zinc-950">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-zinc-950/90 to-transparent">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Mumbai Tracker
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">
            Interactive Map with Ward Boundaries
          </span>
        </div>
      </header>

      {/* Full-screen Map */}
      <div className="h-full w-full">
        <Map
          center={MUMBAI_CENTER}
          zoom={MUMBAI_ZOOM}
          minZoom={9}
          maxZoom={18}
        >
          {/* Mumbai Wards GeoJSON Layer */}
          <MumbaiWardsLayer />

          {/* Map Controls */}
          <MapControls
            position="bottom-right"
            showZoom={true}
            showCompass={true}
            showLocate={true}
            showFullscreen={true}
          />

          {/* Sample Markers for key locations */}
          {locations.map((loc) => (
            <MapMarker
              key={loc.name}
              longitude={loc.lng}
              latitude={loc.lat}
              onClick={() => setSelectedLocation(loc)}
            >
              <MarkerContent className="transition-transform hover:scale-110">
                <div className="relative">
                  <div className="h-4 w-4 rounded-full bg-red-500 border-2 border-white shadow-lg animate-pulse" />
                  <div className="absolute -inset-1 rounded-full bg-red-500/30 animate-ping" />
                </div>
              </MarkerContent>
              <MarkerPopup closeButton className="min-w-[200px]">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">{loc.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
                  </p>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center px-6 py-3 bg-gradient-to-t from-zinc-950/90 to-transparent">
        <p className="text-sm text-zinc-400">
          Hover over wards to see their names • Click markers to view details •
          Use controls to navigate
        </p>
      </div>
    </div>
  );
}
