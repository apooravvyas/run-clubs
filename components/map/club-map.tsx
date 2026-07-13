"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Club } from "@/lib/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export interface ClubMapProps {
  clubs: Club[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (club: Club | null) => void;
  interactive?: boolean;
  className?: string;
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
}: ClubMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const clubsRef = useRef(clubs);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  clubsRef.current = clubs;

  // Init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom,
      attributionControl: { compact: true },
      interactive,
    });
    mapRef.current = map;

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    }

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
          "circle-color": "#111110",
          "circle-radius": ["step", ["get", "point_count"], 16, 6, 20, 15, 26],
          "circle-stroke-width": 3,
          "circle-stroke-color": "rgba(17,17,16,0.12)",
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
        paint: { "text-color": "#FAF8F5" },
      });

      // Individual pins — signal orange dots with soft halo
      map.addLayer({
        id: "club-halo",
        type: "circle",
        source: "clubs",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#FF5A1F",
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
          "circle-color": "#FF5A1F",
          "circle-radius": 6.5,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#FAF8F5",
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
          duration: 500,
        });
      });

      map.on("click", "club-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        const club = clubsRef.current.find((c) => c.id === id) ?? null;
        if (club) {
          map.easeTo({ center: [club.lng, club.lat], duration: 450, offset: [0, -60] });
        }
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

  // Respond to center/zoom prop changes (e.g., city switch)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ center, zoom, duration: 700 });
  }, [center, zoom]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} aria-label="Map of run clubs" />;
}
