"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Users, Clock, MapPin, ArrowRight } from "lucide-react";
import type { Club, CityMeta, PaceBand } from "@/lib/types";
import { PACE_SHORT } from "@/lib/types";
import { ClubMap } from "@/components/map/club-map";
import { PaceBadge } from "@/components/pace-badge";
import { VerifiedBadge } from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { cn, formatDays } from "@/lib/utils";

const PACE_FILTERS: (PaceBand | "any")[] = ["any", "all", "easy", "moderate", "fast"];

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
  const [selected, setSelected] = useState<Club | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs.filter((c) => {
      if (city !== "any" && c.city !== city) return false;
      if (pace !== "any" && c.paceBand !== pace) return false;
      if (beginnerOnly && !c.beginnerFriendly) return false;
      if (freeOnly && !c.isFree) return false;
      if (q) {
        const hay = `${c.name} ${c.area} ${c.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [clubs, query, city, pace, beginnerOnly, freeOnly]);

  const activeCity = cities.find((c) => c.slug === city);
  const center: [number, number] = activeCity
    ? [activeCity.lng, activeCity.lat]
    : [78.9629, 21.5937];
  const zoom = activeCity ? activeCity.zoom : 4.2;

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
      <ClubMap
        clubs={filtered}
        center={center}
        zoom={zoom}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        className="h-full w-full"
      />

      {/* Search + filters overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-5">
        <div className="pointer-events-auto mx-auto max-w-3xl">
          <div className="flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-lift backdrop-blur">
            <Search className="ml-2 h-4 w-4 shrink-0 text-stone" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs, areas, cities…"
              className="h-10 w-full bg-transparent text-[15px] text-ink placeholder:text-stone-light focus:outline-none"
              aria-label="Search clubs"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="rounded-full p-2 text-stone hover:bg-track/60"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-9 rounded-full border border-track bg-white/95 px-4 text-sm font-medium text-ink shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-signal/40"
              aria-label="Filter by city"
            >
              <option value="any">All cities</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {PACE_FILTERS.map((p) => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPace(p)}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm font-medium shadow-card transition-colors",
                  pace === p
                    ? "border-ink bg-ink text-paper"
                    : "border-track bg-white/95 text-stone hover:text-ink"
                )}
              >
                {p === "any" ? "Any pace" : PACE_SHORT[p]}
              </motion.button>
            ))}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setBeginnerOnly((v) => !v)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium shadow-card transition-colors",
                beginnerOnly ? "border-signal bg-signal text-white" : "border-track bg-white/95 text-stone hover:text-ink"
              )}
            >
              Beginner-friendly
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFreeOnly((v) => !v)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium shadow-card transition-colors",
                freeOnly ? "border-signal bg-signal text-white" : "border-track bg-white/95 text-stone hover:text-ink"
              )}
            >
              Free
            </motion.button>

            <span className="ml-auto hidden rounded-full bg-ink/85 px-3 py-1.5 text-xs font-medium tabular-nums text-paper sm:block">
              {filtered.length} {filtered.length === 1 ? "club" : "clubs"}
            </span>
          </div>
        </div>
      </div>

      {/* No results state */}
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-40 z-10 mx-auto max-w-sm rounded-2xl bg-white/95 p-6 text-center shadow-lift backdrop-blur"
          >
            <p className="font-display text-lg font-bold text-ink">No clubs match — yet.</p>
            <p className="mt-1 text-sm text-stone">
              Loosen a filter, or be the reason this changes.
            </p>
            <Link href="/submit" className="mt-4 inline-block">
              <Button size="sm">Add a club here</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating selected-club card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.21, 0.6, 0.35, 1] }}
            className="absolute inset-x-4 bottom-4 z-10 mx-auto max-w-md sm:inset-x-auto sm:right-5 sm:bottom-5"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-lift">
              <div className="relative h-32">
                <Image src={selected.photo} alt={selected.name} fill sizes="420px" className="object-cover" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-ink shadow-card hover:bg-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-ink">{selected.name}</h3>
                  {selected.verified && <VerifiedBadge compact />}
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone">
                  <MapPin className="h-3.5 w-3.5" /> {selected.area}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-stone">
                  <PaceBadge band={selected.paceBand} />
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {formatDays(selected.days)} · {selected.timeLocal}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-ink">
                    <Users className="h-3.5 w-3.5 text-signal" /> ~{selected.avgAttendance}
                  </span>
                </div>
                <Link href={`/clubs/${selected.slug}`} className="mt-4 block">
                  <Button className="w-full" size="md">
                    How to join <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
