"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, ShieldCheck } from "lucide-react";
import type { Club } from "@/lib/types";
import { getEnrichment, getAssets } from "@/lib/enrichment";
import Image from "next/image";
import { formatDays } from "@/lib/utils";

/** Editorial club card: logo-or-monogram on a textured ink tile + real signals only. */
export function ClubCard({ club, index = 0 }: { club: Club; index?: number }) {
  const enrich = getEnrichment(club.slug);
  const assets = getAssets(club.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.21, 0.6, 0.35, 1] }}
    >
      <Link
        href={`/clubs/${club.slug}`}
        className="group block overflow-hidden rounded-2xl border border-track bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      >
        {/* Identity tile */}
        <div
          className="relative flex h-40 items-center justify-center overflow-hidden"
          style={{
            background:
              assets.cover
                ? undefined
                : "radial-gradient(120% 90% at 20% 10%, #262624 0%, #1c1c1b 45%, #111110 100%)",
          }}
        >
          {assets.cover ? (
            <>
              <Image src={assets.cover} alt="" fill sizes="380px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </>
          ) : assets.logo ? (
            <Image src={assets.logo} alt={`${club.name} logo`} width={72} height={72} className="h-18 w-18 rounded-full border border-paper/25 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-paper/20 bg-paper/5 transition-transform duration-300 group-hover:scale-105">
              <span className="font-display text-2xl text-paper/90">{club.name.slice(0, 1)}</span>
            </div>
          )}
          {enrich.followers && (
            <span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70">
              {enrich.followers} on Instagram
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-bold leading-snug text-ink">{club.name}</h3>
            {club.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-ink/70" strokeWidth={2} />}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone">
            <MapPin className="h-3.5 w-3.5" /> {club.area}
          </p>
          {(club.days.length > 0 || enrich.igVerified) && (
            <div className="mt-4 flex items-center gap-4 border-t border-track/70 pt-4 text-sm text-stone">
              {club.days.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDays(club.days)}{club.timeLocal ? ` · ${club.timeLocal}` : ""}
                </span>
              )}
              {enrich.igVerified && (
                <span className="ml-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.13em] text-stone">
                  <ShieldCheck className="h-3 w-3" /> IG verified
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
