"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Club } from "@/lib/types";

const WA_BEARING = -17.6;
const WA_PITCH = 55;

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export interface MapboxMapProps {
  clubs: Club[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (club: Club | null) => void;
  className?: string;
  onReady?: (map: mapboxgl.Map) => void;
}

/**
 * True-parity Workabout basemap using Mapbox Standard (built-in 3D buildings +
 * light presets). Rendered only when NEXT_PUBLIC_MAPBOX_TOKEN is set; otherwise
 * MapExplorer falls back to the MapLibre light-3D map so /map never blanks.
 */
export function MapboxMap({
  clubs,
  center = [77.5946, 12.9716],
  zoom = 12.4,
  selectedId = null,
  onSelect,
  className,
  onReady,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clubsRef = useRef(clubs);
  const selectedRef = useRef<string | null>(selectedId);
  const onSelectRef = useRef(onSelect);
  const lastView = useRef<{ lng: number; lat: number; zoom: number } | null>(null);
  clubsRef.current = clubs;
  selectedRef.current = selectedId;
  onSelectRef.current = onSelect;

  const renderMarkers = (map: mapboxgl.Map) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    for (const c of clubsRef.current) {
      const wrap = document.createElement("div");
      wrap.className = "wa-pin-wrap";
      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "wa-pin" + (c.id === selectedRef.current ? " is-selected" : "");
      pin.setAttribute("aria-label", c.name);
      pin.innerHTML = `<span class="wa-pin__v">${c.avgAttendance}</span>`;
      pin.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onSelectRef.current?.(c);
        map.flyTo({ center: [c.lng, c.lat], zoom: 16, pitch: 60, bearing: WA_BEARING, duration: 2200, curve: 1.6, essential: true });
      });
      wrap.appendChild(pin);
      const m = new mapboxgl.Marker({ element: wrap, anchor: "center" }).setLngLat([c.lng, c.lat]).addTo(map);
      markersRef.current.push(m);
    }
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center,
      zoom,
      pitch: WA_PITCH,
      bearing: WA_BEARING,
      antialias: true,
      attributionControl: false,
    });
    mapRef.current = map;
    lastView.current = { lng: center[0], lat: center[1], zoom };

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    map.on("style.load", () => {
      try { map.setConfigProperty("basemap", "lightPreset", "day"); } catch { /* older style */ }
    });
    map.on("load", () => {
      onReady?.(map);
      renderMarkers(map);
      map.on("click", () => onSelectRef.current?.(null));
    });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) renderMarkers(map);
    else map.once("load", () => renderMarkers(map));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs]);

  useEffect(() => {
    markersRef.current.forEach((m) => {
      const el = m.getElement().querySelector(".wa-pin");
      if (!el) return;
      const ll = m.getLngLat();
      const club = clubs.find((c) => c.lng === ll.lng && c.lat === ll.lat);
      el.classList.toggle("is-selected", !!club && club.id === selectedId);
    });
  }, [selectedId, clubs]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = { lng: center[0], lat: center[1], zoom };
    const prev = lastView.current;
    if (prev && Math.abs(prev.lng - next.lng) < 1e-6 && Math.abs(prev.lat - next.lat) < 1e-6 && Math.abs(prev.zoom - next.zoom) < 1e-6) return;
    lastView.current = next;
    map.flyTo({ center, zoom, pitch: WA_PITCH, bearing: WA_BEARING, duration: 1600, curve: 1.5, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} aria-label="Map of run clubs" />;
}
