"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import type { Club } from "@/lib/types";
import { ClubMap } from "@/components/map/club-map";
import { Button } from "@/components/ui/button";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.21, 0.6, 0.35, 1] as const },
  }),
};

export function Hero({
  clubs,
  stats,
}: {
  clubs: Club[];
  stats: { clubs: number; cities: number; runners: number; verified: number };
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-20 lg:pt-20">
        <div>
          <motion.p
            variants={fade} initial="hidden" animate="show" custom={0}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-signal-soft px-4 py-1.5 text-xs font-semibold tracking-wide text-signal-deep"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute h-2 w-2 animate-pulse-pin rounded-full bg-signal" />
              <span className="relative h-2 w-2 rounded-full bg-signal" />
            </span>
            {stats.verified} clubs verified and counting
          </motion.p>

          <motion.h1
            variants={fade} initial="hidden" animate="show" custom={1}
            className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            Every run club in India.
            <br />
            <span className="text-signal">One map.</span>
          </motion.h1>

          <motion.p
            variants={fade} initial="hidden" animate="show" custom={2}
            className="mt-5 max-w-md text-lg leading-relaxed text-stone"
          >
            Where they meet, what pace they run, how many show up — and exactly
            how to join. No login. No DM-a-stranger.
          </motion.p>

          <motion.div
            variants={fade} initial="hidden" animate="show" custom={3}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/map">
              <Button size="lg">
                <Search className="h-4 w-4" /> Find your club
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline">
                Add your club <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.dl
            variants={fade} initial="hidden" animate="show" custom={4}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-track pt-6"
          >
            {[
              { k: "Clubs", v: stats.clubs },
              { k: "Cities", v: stats.cities },
              { k: "Weekly runners", v: `${(stats.runners / 1000).toFixed(1)}k` },
            ].map((s) => (
              <div key={s.k}>
                <dd className="font-display text-3xl font-bold tabular-nums text-ink">{s.v}</dd>
                <dt className="mt-1 text-xs font-medium uppercase tracking-widest text-stone">{s.k}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.21, 0.6, 0.35, 1] }}
          className="relative"
        >
          <div className="h-[420px] overflow-hidden rounded-3xl shadow-lift ring-1 ring-track/70 lg:h-[520px]">
            <ClubMap clubs={clubs} interactive={false} zoom={4.05} className="h-full w-full" />
          </div>
          <Link
            href="/map"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper shadow-lift transition-transform hover:scale-[1.03]"
          >
            Open the live map →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
