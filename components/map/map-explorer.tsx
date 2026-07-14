"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, X, Users, Clock, MapPin, ArrowRight, Plus, Minus, Navigation, ArrowUpRight,
} from "lucide-react";
import type { Club, CityMeta, PaceBand } from "@/lib/types";
import { PACE_SHORT } from "@/lib/types";
import { ClubMap } from "@/components/map/club-map";
import { MapboxMap, MAPBOX_TOKEN } from "@/components/map/mapbox-map";
import { cn, formatDays } from "@/lib/utils";

const PACE_FILTERS: (PaceBand | "any")[] = ["any", "all", "easy", "moderate", "fast"];
const WA_BEARING = -17.6;

interface Props {
  clubs: Club[];
  cities: CityMeta[];
  initialCity?: string;
}

export function MapExplorer({ clubs, cities, initialCity }: Props) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>(initialCity ?? "any");
  const [pace, setPace] = useState<PaceBand | "any">("any");
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<Club | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  type AnyMap = { flyTo: (o: Record<string, unknown>) => void; easeTo: (o: Record<string, unknown>) => void; getZoom: () => number };
  const mapRef = useRef<AnyMap | null>(null);
  const useMapbox = !!MAPBOX_TOKEN;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs.filter((c) => {
      if (city !== "any" && c.city !== city) return false;
      if (pace !== "any" && c.paceBand !== pace) return false;
      if (beginnerOnly && !c.beginnerFriendly) return false;
      if (freeOnly && !c.isFree) return false;
      if (verifiedOnly && !c.verified) return false;
      if (q && !`${c.name} ${c.area} ${c.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [clubs, query, city, pace, beginnerOnly, freeOnly, verifiedOnly]);

  const WA_DEFAULT_ZOOM = 12.4;
  const defaultCity = cities.find((c) => c.slug === "bangalore") ?? cities[0];
  const activeCity = cities.find((c) => c.slug === city);
  const cameraCity = activeCity ?? defaultCity;
  const center: [number, number] = cameraCity ? [cameraCity.lng, cameraCity.lat] : [78.9629, 21.5937];
  const zoom = activeCity ? activeCity.zoom : WA_DEFAULT_ZOOM;
  const cityLabel = activeCity?.name ?? "India";

  const onSelect = (c: Club | null) => {
    setSelected(c);
    if (c) setBrowseOpen(false);
  };

  const locate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 14, pitch: 55, bearing: WA_BEARING, duration: 2200, curve: 1.6, essential: true,
      }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const zoomBy = (d: number) => {
    const m = mapRef.current; if (!m) return;
    m.easeTo({ zoom: m.getZoom() + d, duration: 300 });
  };
  const resetNorth = () => mapRef.current?.easeTo({ bearing: WA_BEARING, pitch: 55, duration: 600 });

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-[#EFEEE9]">
      {useMapbox ? (
        <MapboxMap
          clubs={filtered}
          center={center}
          zoom={zoom}
          selectedId={selected?.id ?? null}
          onSelect={onSelect}
          onReady={(m) => (mapRef.current = m as unknown as AnyMap)}
          className="absolute inset-0"
        />
      ) : (
        <ClubMap
          clubs={filtered}
          center={center}
          zoom={zoom}
          selectedId={selected?.id ?? null}
          onSelect={onSelect}
          workabout
          onReady={(m) => (mapRef.current = m as unknown as AnyMap)}
          className="absolute inset-0"
        />
      )}

      {/* Top-left glass card */}
      <div className="pointer-events-auto absolute left-4 top-4 z-10 w-[min(92vw,420px)]">
        <div className="wa-card p-5">
          <h1 className="font-display text-[2rem] leading-none tracking-tight text-[#151515]">
            RunClubs <span className="italic font-semibold">{cityLabel}</span>
          </h1>
          <div className="mt-4 flex gap-2">
            <button className="wa-btn wa-btn--solid flex-1" onClick={() => setBrowseOpen(true)}>
              Browse clubs
            </button>
            <button className="wa-btn wa-btn--glass flex-1" onClick={locate}>
              Use my location
            </button>
          </div>
        </div>
      </div>

      {/* Top-right: areas + */}
      <div className="absolute right-5 top-5 z-10 flex items-center gap-4">
        <div className="relative">
          <button className="wa-mono flex items-center gap-1" onClick={() => setAreasOpen((v) => !v)}>
            Cities <span className="text-base leading-none">+</span>
          </button>
          <AnimatePresence>
            {areasOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="wa-card absolute right-0 mt-3 w-52 overflow-hidden p-1.5"
              >
                <button
                  onClick={() => { setCity("any"); setAreasOpen(false); }}
                  className={cn("wa-mono block w-full rounded-md px-3 py-2 text-left hover:bg-black/5", city === "any" && "bg-black/5")}
                >
                  All cities
                </button>
                {cities.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => { setCity(c.slug); setAreasOpen(false); }}
                    className={cn("wa-mono block w-full rounded-md px-3 py-2 text-left hover:bg-black/5", city === c.slug && "bg-black/5")}
                  >
                    {c.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom-left legend */}
      <div className="absolute bottom-5 left-5 z-10 flex items-center gap-4">
        <button className="wa-mono flex items-center gap-1.5" onClick={() => setVerifiedOnly(false)}>
          <span className={cn("h-2 w-2 rounded-full", !verifiedOnly ? "bg-[#151515]" : "bg-black/25")} /> All
        </button>
        <button className="wa-mono flex items-center gap-1.5" onClick={() => setVerifiedOnly(true)}>
          <span className={cn("h-2 w-2 rounded-full", verifiedOnly ? "bg-[#151515]" : "bg-black/25")} /> Verified
        </button>
      </div>

      {/* Bottom-right controls */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col items-center gap-2">
        <button className="wa-round" onClick={() => zoomBy(1)} aria-label="Zoom in"><Plus className="h-5 w-5" /></button>
        <button className="wa-round" onClick={() => zoomBy(-1)} aria-label="Zoom out"><Minus className="h-5 w-5" /></button>
        <button className="wa-round" onClick={resetNorth} aria-label="Reset view"><Navigation className="h-4 w-4" /></button>
      </div>

      {/* Selected-club detail card (dark) */}
      <AnimatePresence>
        {selected && !browseOpen && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.21, 0.6, 0.35, 1] }}
            className="pointer-events-auto absolute inset-x-4 bottom-4 z-20 mx-auto max-w-md sm:inset-x-auto sm:bottom-5 sm:right-5"
          >
            <div className="wa-drawer overflow-hidden rounded-2xl">
              <div className="relative h-32">
                <Image src={selected.photo} alt={selected.name} fill sizes="440px" className="object-cover" />
                <button onClick={() => setSelected(null)} className="wa-round wa-round--dark absolute right-3 top-3 !h-9 !w-9" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-medium text-[#f7f4ee]">{selected.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#e7e1d6]/70">
                  <MapPin className="h-3.5 w-3.5" /> {selected.area}, {cities.find((c) => c.slug === selected.city)?.name ?? selected.city}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#e7e1d6]/80">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatDays(selected.days)} · {selected.timeLocal}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> ~{selected.avgAttendance}</span>
                  <span className="wa-mono !text-[#e7e1d6]/60">{PACE_SHORT[selected.paceBand]}</span>
                </div>
                <Link href={`/clubs/${selected.slug}`} className="mt-4 block">
                  <span className="wa-btn wa-btn--solid w-full !bg-[#f7f4ee] !text-[#151515]">
                    How to join <ArrowRight className="ml-1.5 h-4 w-4" />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browse bottom-sheet drawer (dark) */}
      <AnimatePresence>
        {browseOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30"
          >
            <div className="absolute inset-0 bg-black/20" onClick={() => setBrowseOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
              className="wa-drawer absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden"
            >
              <div className="flex items-start justify-between px-6 pt-6">
                <div>
                  <p className="wa-drawer__eyebrow">Select a club</p>
                  <h2 className="wa-drawer__title mt-2">
                    {filtered.length} run {filtered.length === 1 ? "club" : "clubs"}
                    {activeCity ? <span className="italic font-normal opacity-70"> in {activeCity.name}</span> : null}
                  </h2>
                </div>
                <button onClick={() => setBrowseOpen(false)} className="wa-round wa-round--dark" aria-label="Close"><X className="h-5 w-5" /></button>
              </div>

              {/* Search + filters */}
              <div className="mt-5 px-6">
                <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3">
                  <Search className="h-4 w-4 text-white/50" />
                  <input
                    value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search clubs, areas…"
                    className="h-11 w-full bg-transparent text-[15px] text-[#f7f4ee] placeholder:text-white/40 focus:outline-none"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PACE_FILTERS.map((p) => (
                    <button
                      key={p} onClick={() => setPace(p)}
                      className={cn("wa-btn h-8 rounded-full px-3.5 !text-[11px]",
                        pace === p ? "bg-[#f7f4ee] text-[#151515]" : "border border-white/14 bg-white/[0.04] text-white/75")}
                    >
                      {p === "any" ? "Any pace" : PACE_SHORT[p]}
                    </button>
                  ))}
                  <button onClick={() => setBeginnerOnly((v) => !v)} className={cn("wa-btn h-8 rounded-full px-3.5 !text-[11px]", beginnerOnly ? "bg-[#f7f4ee] text-[#151515]" : "border border-white/14 bg-white/[0.04] text-white/75")}>Beginner</button>
                  <button onClick={() => setFreeOnly((v) => !v)} className={cn("wa-btn h-8 rounded-full px-3.5 !text-[11px]", freeOnly ? "bg-[#f7f4ee] text-[#151515]" : "border border-white/14 bg-white/[0.04] text-white/75")}>Free</button>
                </div>
              </div>

              {/* List */}
              <div className="mt-2 max-h-[46vh] overflow-y-auto px-6 pb-8">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { onSelect(c); mapRef.current?.flyTo({ center: [c.lng, c.lat], zoom: 16, pitch: 60, bearing: WA_BEARING, duration: 2200, curve: 1.6, essential: true }); }}
                    className="block w-full border-b border-white/8 py-4 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <p className="text-[16px] font-medium text-[#f7f4ee]">{c.name}</p>
                    <p className="mt-0.5 text-[12px] text-[#e7e1d6]/70">
                      {c.area} · {formatDays(c.days)} {c.timeLocal} · ~{c.avgAttendance} runners
                    </p>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-lg font-medium text-[#f7f4ee]">No clubs match — yet.</p>
                    <p className="mt-1 text-sm text-white/50">Loosen a filter, or add the club that should be here.</p>
                    <Link href="/submit" className="mt-4 inline-block"><span className="wa-btn wa-btn--solid !bg-[#f7f4ee] !text-[#151515] px-4">Add a club</span></Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
