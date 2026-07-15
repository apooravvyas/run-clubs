"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export interface CityCard {
  slug: string;
  name: string;
  state: string;
  image?: string;
  clubs: number;
  runners: number;
}

/**
 * Fullscreen, editorial city-selection experience (Workabout-style):
 * dark canvas, serif wordmark, mono labels, a horizontal carousel of large
 * immersive city cards. Uses RunClubs cities + data; clicking a card opens
 * that city's map (/map?city=slug).
 */
export function CitySelector({ cities }: { cities: CityCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardW = el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 1;
    setActive(Math.round(el.scrollLeft / (cardW + 24)));
  };

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#080808] text-[#F5F3EE]">
      {/* Top bar */}
      <header className="fade-up relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/map" className="font-display text-2xl leading-none tracking-tight text-[#F5F3EE]">
          RunClubs
        </Link>
        <span className="absolute left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.17em] text-white/65 sm:block">
          Select your city
        </span>
      </header>

      {/* Carousel */}
      <div className="relative flex min-h-0 flex-1 items-center">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="hide-scrollbar flex h-full w-full snap-x snap-mandatory items-center gap-6 overflow-x-auto scroll-smooth px-[8vw] sm:px-[calc(50vw-320px)]"
        >
          {cities.map((c, i) => (
            <div
              key={c.slug}
              data-card
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
              className="fade-up relative h-[64vh] max-h-[680px] w-[84vw] shrink-0 snap-center sm:w-[640px]"
            >
              <Link href={`/map?city=${c.slug}`} className="group block h-full w-full">
                <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-gradient-to-br from-[#1c2230] via-[#141414] to-[#0c0c0c]">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      priority={i < 2}
                      sizes="(max-width: 640px) 84vw, 640px"
                      className="object-cover transition-all duration-[700ms] ease-out group-hover:scale-[1.05] group-hover:brightness-110"
                    />
                  )}
                  {/* legibility gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* mono meta (top-left) */}
                  <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.17em] text-white/80">
                    {c.clubs} clubs · ~{c.runners.toLocaleString("en-IN")} runners
                  </div>

                  {/* city name (bottom-left) */}
                  <h2 className="absolute bottom-6 left-6 max-w-[75%] font-display text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl">
                    {c.name}
                  </h2>

                  {/* arrow button (bottom-right) */}
                  <div className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/40 text-white transition-all duration-300 group-hover:border-white group-hover:bg-white/10">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <footer className="fade-up relative z-10 flex items-center justify-between px-6 py-6 sm:px-10" style={{ animationDelay: "0.35s" }}>
        <div className="flex flex-1 items-center gap-3 font-mono text-[9px] text-white/50">
          <span className="tabular-nums">{pad(Math.min(active, cities.length - 1))}</span>
          <span className="relative h-px w-28 bg-white/20">
            <span
              className="absolute inset-y-0 left-0 bg-white/70 transition-all duration-300"
              style={{ width: `${((active + 1) / cities.length) * 100}%` }}
            />
          </span>
          <span className="tabular-nums">{pad(cities.length - 1)}</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">© 2026 RunClubs.in</span>
      </footer>
    </div>
  );
}
