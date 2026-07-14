import type { StyleSpecification } from "maplibre-gl";

/**
 * Workabout dark basemap for the /map screen ONLY.
 *
 * Built on the same OpenFreeMap `openmaptiles` vector source the rest of the app
 * already uses (no API key, no new dependency), but recolored to a minimal dark
 * palette and — critically — with a `fill-extrusion` buildings layer so the map
 * reads as 3D when tilted. Filters/source-layers are reused from OpenFreeMap's
 * Positron style, so they're known-valid.
 *
 * The other maps (landing hero, city, club detail) keep the light Positron style.
 */
export const DARK_MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
  sources: {
    openmaptiles: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#080808" } },

    // Green space — barely-there so the dark surface dominates.
    {
      id: "park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      filter: ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
      paint: { "fill-color": "#0d130f", "fill-opacity": 0.7 },
    },
    {
      id: "landcover_wood",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      minzoom: 10,
      filter: ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["==", ["get", "class"], "wood"]],
      paint: { "fill-color": "#0d130f", "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0, 12, 0.6] },
    },

    // Water — deep blue-charcoal.
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      filter: ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["!=", ["get", "brunnel"], "tunnel"]],
      paint: { "fill-color": "#0b141b" },
    },

    // Subtle residential fill so districts read at mid zoom.
    {
      id: "landuse_residential",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landuse",
      maxzoom: 16,
      filter: ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["==", ["get", "class"], "residential"]],
      paint: { "fill-color": "#0c0c0b", "fill-opacity": ["interpolate", ["exponential", 0.6], ["zoom"], 8, 0.6, 12, 0.3] },
    },

    // Roads — thin, low-contrast light lines.
    {
      id: "road_minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 11,
      filter: ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "class"], ["minor", "service", "track"], true, false]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "rgba(245,244,241,0.06)", "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 1, 20, 14] },
    },
    {
      id: "road_major",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 8,
      filter: ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "rgba(245,244,241,0.12)", "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 8, 0.6, 20, 18] },
    },
    {
      id: "road_motorway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "class"], "motorway"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "rgba(217,119,87,0.32)", "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 5, 0.6, 20, 22] },
    },

    // Flat building footprints at mid zoom, before extrusion kicks in.
    {
      id: "building_flat",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 12,
      maxzoom: 14,
      paint: { "fill-color": "#141413", "fill-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 13.5, 0.9] },
    },

    // The centerpiece: extruded 3D buildings.
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
          0, "#161615",
          40, "#1f1f1d",
          120, "#2a2a27",
        ],
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.5, ["get", "render_height"]],
        "fill-extrusion-base": ["case", ["has", "render_min_height"], ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.9,
      },
    },

    // National borders — faint.
    {
      id: "boundary_2",
      type: "line",
      source: "openmaptiles",
      "source-layer": "boundary",
      filter: ["all", ["==", ["get", "admin_level"], 2], ["!=", ["get", "maritime"], 1], ["!=", ["get", "disputed"], 1]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "rgba(245,244,241,0.18)", "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 12, 1.8] },
    },

    // Place labels — light text, dark halo.
    {
      id: "label_state",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      minzoom: 5,
      maxzoom: 8,
      filter: ["==", ["get", "class"], "state"],
      layout: {
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
        "text-font": ["Noto Sans Italic"],
        "text-letter-spacing": 0.2,
        "text-max-width": 9,
        "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 8, 13],
        "text-transform": "uppercase",
      },
      paint: { "text-color": "rgba(245,244,241,0.55)", "text-halo-color": "#080808", "text-halo-width": 1.2 },
    },
    {
      id: "label_town",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      minzoom: 7,
      filter: ["match", ["get", "class"], ["town", "village"], true, false],
      layout: {
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 8,
        "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 7, 11, 11, 13],
      },
      paint: { "text-color": "rgba(245,244,241,0.7)", "text-halo-color": "#080808", "text-halo-width": 1.1 },
    },
    {
      id: "label_city",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      minzoom: 4,
      filter: ["==", ["get", "class"], "city"],
      layout: {
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
        "text-font": ["Noto Sans Bold"],
        "text-max-width": 8,
        "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 4, 12, 7, 15, 11, 19],
      },
      paint: { "text-color": "#f5f3ee", "text-halo-color": "#080808", "text-halo-width": 1.3 },
    },
  ],
};
