"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Clock, MapPin } from "lucide-react";
import type { Club } from "@/lib/types";
import { PaceBadge } from "@/components/pace-badge";
import { VerificationBadge } from "@/components/verification-badge";
import { formatDays } from "@/lib/utils";

export function ClubCard({ club, index = 0 }: { club: Club; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.21, 0.6, 0.35, 1] }}
    >
      <Link
        href={`/clubs/${club.slug}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40"
      >
        <div className="relative h-44 overflow-hidden bg-ink">
          {club.photo ? (
            <>
              <Image
                src={club.photo}
                alt={club.name}
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-4xl text-paper/80">{club.name.slice(0, 1)}</span>
            </div>
          )}
          {club.paceDetail && (
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <PaceBadge band={club.paceBand} />
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-bold leading-snug text-ink">{club.name}</h3>
            <VerificationBadge club={club} compact />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone">
            <MapPin className="h-3.5 w-3.5" /> {club.area}
          </p>
          <div className="mt-4 flex items-center gap-4 border-t border-track/70 pt-4 text-sm text-stone">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDays(club.days)} · {club.timeLocal}
            </span>
            <span className="ml-auto flex items-center gap-1.5 font-medium text-ink">
              <Users className="h-3.5 w-3.5 text-signal" />
              {club.avgAttendance > 0 ? `~${club.avgAttendance}` : "—"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
