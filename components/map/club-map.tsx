"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Club } from "@/lib/types";
import { DARK_MAP_STYLE } from "@/lib/map-style-dark";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

// Workabout camera constants (used only when `workabout` is on).
const WA_PITCH = 55;
const WA_BEARING = -17.6;

export interface ClubMapProps {
  clubs: Club[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (club: Club | null) => void;
  interactive?: boolean;
  className?: string;
  /**
   * Workabout mode — dark 3D map with tilted camera + cinematic flyTo.
   * Default false, so the landing / city / club maps are unchanged.
   */
  workabout?: boolean;
}

function toGeoJSON(clubs: Club[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: clubs.map((c) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name },
    })),
  };
}

export function ClubMap({
  clubs,
  center = [78.9629, 21.5937],
  zoom = 4.2,
  selectedId = null,
  onSelect,
  interactive = true,
  className,
  workabout = false,
}: ClubMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const clubsRef = useRef(clubs);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const lastView = useRef<{ lng: number; lat: number; zoom: number } | null>(null);
  clubsRef.current = clubs;

  // Init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: workabout ? DARK_MAP_STYLE : MAP_STYLE,
      center,
      zoom,
      pitch: workabout ? WA_PITCH : 0,
      bearing: workabout ? WA_BEARING : 0,
      maxPitch: workabout ? 75 : 60,
      antialias: workabout,
      attributionControl: { compact: true },
      interactive,
    });
    mapRef.current = map;
    lastView.current = { lng: center[0], lat: center[1], zoom };

    if (interactive) {
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: workabout, visualizePitch: workabout }),
        "bottom-right",
      );
    }

    const clusterColor = workabout ? "#2a2a29" : "#111110";
    const clusterStroke = workabout ? "rgba(245,244,241,0.16)" : "rgba(17,17,16,0.12)";
    const countColor = workabout ? "#F5F3EE" : "#FAF8F5";
    const pinStroke = workabout ? "rgba(245,244,241,0.92)" : "#FAF8F5";

    map.on("load", () => {
      map.addSource("clubs", {
        type: "geojson",
        data: toGeoJSON(clubsRef.current),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 46,
      });

      // Cluster bubbles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "clubs",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": clusterColor,
          "circle-radius": ["step", ["get", "point_count"], 16, 6, 20, 15, 26],
          "circle-stroke-width": 3,
          "circle-stroke-color": clusterStroke,
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "clubs",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-font": ["Noto Sans Bold"],
        },
        paint: { "text-color": countColor },
      });

      // Individual pins — accent dots with soft halo
      map.addLayer({
        id: "club-halo",
        type: "circle",
        source: "clubs",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#D97757",
          "circle-opacity": 0.18,
          "circle-radius": 14,
        },
      });
      map.addLayer({
        id: "club-point",
        type: "circle",
        source: "clubs",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#D97757",
          "circle-radius": 6.5,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": pinStroke,
        },
      });

      // Interactions
      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("clubs") as GeoJSONSource;
        if (clusterId == null) return;
        const zoomTo = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoomTo + 0.4,
          duration: 600,
          ...(workabout ? { pitch: WA_PITCH, bearing: WA_BEARING } : {}),
        });
      });

      map.on("click", "club-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        const club = clubsRef.current.find((c) => c.id === id) ?? null;
        if (club) {
          if (workabout) {
            // Cinematic dive INTO the location — never zoom out to overview first.
            map.flyTo({
              center: [club.lng, club.lat],
              zoom: 16,
              pitch: 60,
              bearing: WA_BEARING,
              duration: 2200,
              curve: 1.6,
              essential: true,
            });
          } else {
            map.easeTo({ center: [club.lng, club.lat], duration: 450, offset: [0, -60] });
          }
        }
        // Open the card immediately (do not await moveend).
        onSelect?.(club);
      });

      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: ["club-point", "clusters"] });
        if (hits.length === 0) onSelect?.(null);
      });

      for (const layer of ["clusters", "club-point"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when the filtered club list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const source = map.getSource("clubs") as GeoJSONSource | undefined;
      source?.setData(toGeoJSON(clubs));
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [clubs]);

  // Animated DOM marker on the selected club
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerRef.current?.remove();
    markerRef.current = null;
    if (!selectedId) return;
    const club = clubs.find((c) => c.id === selectedId);
    if (!club) return;

    const el = document.createElement("div");
    el.className = "relative flex h-5 w-5 items-center justify-center";
    el.innerHTML = `
      <span class="absolute h-5 w-5 rounded-full bg-signal animate-pulse-pin"></span>
      <span class="relative h-4 w-4 rounded-full bg-signal ring-[3px] ring-white shadow-pin"></span>
    `;
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([club.lng, club.lat])
      .addTo(map);
  }, [selectedId, clubs]);

  // Respond to center/zoom prop changes (e.g., city switch) — guarded so it
  // only moves when the target actually changes (avoids re-firing on every render).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = { lng: center[0], lat: center[1], zoom };
    const prev = lastView.current;
    if (
      prev &&
      Math.abs(prev.lng - next.lng) < 1e-6 &&
      Math.abs(prev.lat - next.lat) < 1e-6 &&
      Math.abs(prev.zoom - next.zoom) < 1e-6
    ) {
      return;
    }
    lastView.current = next;
    if (workabout) {
      map.flyTo({ center, zoom, pitch: WA_PITCH, bearing: WA_BEARING, duration: 1600, curve: 1.5, essential: true });
    } else {
      map.easeTo({ center, zoom, duration: 700 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom, workabout]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} aria-label="Map of run clubs" />;
}
