"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Club } from "@/lib/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

// Workabout camera constants (workabout mode only).
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
  /** Workabout mode — light warm tilted 3D map + teardrop markers. Default off. */
  workabout?: boolean;
  /** Expose the map instance (for external zoom/locate controls). */
  onReady?: (map: MLMap) => void;
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
  onReady,
}: ClubMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const clubsRef = useRef(clubs);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const waMarkersRef = useRef<maplibregl.Marker[]>([]);
  const selectedRef = useRef<string | null>(selectedId);
  const onSelectRef = useRef(onSelect);
  const lastView = useRef<{ lng: number; lat: number; zoom: number } | null>(null);
  clubsRef.current = clubs;
  selectedRef.current = selectedId;
  onSelectRef.current = onSelect;

  // Build / rebuild the Workabout teardrop markers.
  const renderWaMarkers = (map: MLMap) => {
    waMarkersRef.current.forEach((m) => m.remove());
    waMarkersRef.current = [];
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
        map.flyTo({
          center: [c.lng, c.lat],
          zoom: 16,
          pitch: 60,
          bearing: WA_BEARING,
          duration: 2200,
          curve: 1.6,
          essential: true,
        });
      });
      wrap.appendChild(pin);
      const m = new maplibregl.Marker({ element: wrap, anchor: "center" })
        .setLngLat([c.lng, c.lat])
        .addTo(map);
      waMarkersRef.current.push(m);
    }
  };

  // Init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
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

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    // Reveal only when the map has actually finished rendering (tiles painted,
    // camera settled) — the first "idle". Safety timeout so we never hang.
    let readyFired = false;
    const fireReady = () => { if (readyFired) return; readyFired = true; onReady?.(map); };
    map.once("idle", fireReady);
    const readyTimer = setTimeout(fireReady, 6000);

    map.on("error", (e) => console.error("[map] error", e && (e as { error?: unknown }).error));
    if (workabout) renderWaMarkers(map);

    if (interactive && !workabout) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    }

    map.on("load", () => {

      if (workabout) {
        // Warm the light Positron palette toward Workabout's Apple-map look.
        const setPaint = (layer: string, prop: string, val: string) => {
          try {
            if (map.getLayer(layer)) map.setPaintProperty(layer, prop, val as never);
          } catch {
            /* layer may not exist in this style version */
          }
        };
        setPaint("background", "background-color", "#ECEAE3");
        setPaint("water", "fill-color", "#AEC9DE");
        setPaint("landcover_wood", "fill-color", "#D6E2C9");
        setPaint("park", "fill-color", "#D6E2C9");
        setPaint("landuse_residential", "fill-color", "#E9E6DE");
        setPaint("building", "fill-color", "#E3DFD6");

        // 3D extruded buildings, inserted beneath the first label layer.
        const firstSymbol = map.getStyle().layers?.find((l) => l.type === "symbol")?.id;
        try {
          map.addLayer(
            {
              id: "building_3d",
              type: "fill-extrusion",
              source: "openmaptiles",
              "source-layer": "building",
              minzoom: 14,
              filter: ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
              paint: {
                "fill-extrusion-color": [
                  "interpolate", ["linear"], ["get", "render_height"],
                  0, "#E6E2D9", 40, "#DAD5CB", 120, "#CBC5BA",
                ],
                "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.5, ["get", "render_height"]],
                "fill-extrusion-base": ["case", ["has", "render_min_height"], ["get", "render_min_height"], 0],
                "fill-extrusion-opacity": 0.92,
              },
            },
            firstSymbol,
          );
        } catch {
          /* extrusion unsupported — light map still renders */
        }

        // Atmospheric sky/horizon so the tilted view reads like Workabout
        // (avoids the flat hard cut at the top of a pitched map).
        try {
          (map as unknown as { setSky?: (s: Record<string, unknown>) => void }).setSky?.({
            "sky-color": "#bcd4ea",
            "sky-horizon-blend": 0.6,
            "horizon-color": "#eef0ee",
            "horizon-fog-blend": 0.6,
            "fog-color": "#ece9e2",
            "fog-ground-blend": 0.4,
          });
        } catch {
          /* sky unsupported in this maplibre version */
        }

        renderWaMarkers(map);
        map.on("click", () => onSelectRef.current?.(null));
        return;
      }

      // ── Default (non-workabout) map: clusters + circle pins ──
      map.addSource("clubs", {
        type: "geojson",
        data: toGeoJSON(clubsRef.current),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 46,
      });
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
        layout: { "text-field": "{point_count_abbreviated}", "text-size": 12, "text-font": ["Noto Sans Bold"] },
        paint: { "text-color": "#FAF8F5" },
      });
      map.addLayer({
        id: "club-halo",
        type: "circle",
        source: "clubs",
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-color": "#1C1C1B", "circle-opacity": 0.18, "circle-radius": 14 },
      });
      map.addLayer({
        id: "club-point",
        type: "circle",
        source: "clubs",
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-color": "#1C1C1B", "circle-radius": 6.5, "circle-stroke-width": 2.5, "circle-stroke-color": "#FAF8F5" },
      });

      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("clubs") as GeoJSONSource;
        if (clusterId == null) return;
        const zoomTo = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number], zoom: zoomTo + 0.4, duration: 500 });
      });
      map.on("click", "club-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        const club = clubsRef.current.find((c) => c.id === id) ?? null;
        if (club) map.easeTo({ center: [club.lng, club.lat], duration: 450, offset: [0, -60] });
        onSelectRef.current?.(club);
      });
      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: ["club-point", "clusters"] });
        if (hits.length === 0) onSelectRef.current?.(null);
      });
      for (const layer of ["clusters", "club-point"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }
    });

    return () => {
      clearTimeout(readyTimer);
      ro.disconnect();
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
      if (workabout) {
        renderWaMarkers(map);
        return;
      }
      const source = map.getSource("clubs") as GeoJSONSource | undefined;
      source?.setData(toGeoJSON(clubs));
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs]);

  // Selection highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (workabout) {
      // Toggle the selected class on the matching teardrop.
      waMarkersRef.current.forEach((m) => {
        const el = m.getElement().querySelector(".wa-pin");
        if (!el) return;
        const club = clubs.find((c) => c.lng === m.getLngLat().lng && c.lat === m.getLngLat().lat);
        el.classList.toggle("is-selected", !!club && club.id === selectedId);
      });
      return;
    }

    // Default: pulsing DOM marker on the selected club.
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
    markerRef.current = new maplibregl.Marker({ element: el }).setLngLat([club.lng, club.lat]).addTo(map);
  }, [selectedId, clubs, workabout]);

  // Respond to center/zoom prop changes (guarded against redundant moves)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = { lng: center[0], lat: center[1], zoom };
    const prev = lastView.current;
    if (prev && Math.abs(prev.lng - next.lng) < 1e-6 && Math.abs(prev.lat - next.lat) < 1e-6 && Math.abs(prev.zoom - next.zoom) < 1e-6) return;
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
