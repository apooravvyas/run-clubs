"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check, X, Search, Upload, Users, MapPin, BadgeCheck, Inbox, Pencil,
} from "lucide-react";
import type { Club } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaceBadge } from "@/components/pace-badge";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

interface PendingSubmission {
  id: string;
  name: string;
  city: string;
  area: string;
  meetingPoint: string;
  timeLocal: string;
  submitterEmail: string;
  receivedAt: string;
}

const DEMO_QUEUE: PendingSubmission[] = [
  { id: "q1", name: "Yelahanka Dawn Runners", city: "bangalore", area: "Yelahanka", meetingPoint: "Mother Dairy Circle", timeLocal: "5:45 AM", submitterEmail: "captain@ydr.run", receivedAt: "2026-07-08" },
  { id: "q2", name: "Thane Creek Striders", city: "mumbai", area: "Thane", meetingPoint: "Upvan Lake gate", timeLocal: "6:00 AM", submitterEmail: "hello@tcstriders.in", receivedAt: "2026-07-07" },
  { id: "q3", name: "Gandhinagar GIFT Runners", city: "ahmedabad", area: "GIFT City", meetingPoint: "GIFT One Tower plaza", timeLocal: "6:15 AM", submitterEmail: "run@giftrunners.in", receivedAt: "2026-07-06" },
];

export function AdminDashboard({ clubs }: { clubs: Club[] }) {
  const [queue, setQueue] = useState<PendingSubmission[]>(DEMO_QUEUE);
  const [decided, setDecided] = useState<{ approved: number; rejected: number }>({ approved: 0, rejected: 0 });
  const [query, setQuery] = useState("");
  const [importedRows, setImportedRows] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredClubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((c) => `${c.name} ${c.city} ${c.area}`.toLowerCase().includes(q));
  }, [clubs, query]);

  const stats = useMemo(() => {
    const verified = clubs.filter((c) => c.verified).length;
    const cities = new Set(clubs.map((c) => c.city)).size;
    const runners = clubs.reduce((s, c) => s + c.avgAttendance, 0);
    return { total: clubs.length, verified, cities, runners };
  }, [clubs]);

  function decide(id: string, verdict: "approved" | "rejected") {
    setQueue((q) => q.filter((s) => s.id !== id));
    setDecided((d) => ({ ...d, [verdict]: d[verdict] + 1 }));
  }

  function handleCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const rows = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      // Header + data rows; in production this posts to /api/admin/import
      setImportedRows(Math.max(0, rows.length - 1));
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink">Moderation</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Bulk import CSV
          </Button>
        </div>
      </div>

      {importedRows !== null && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Parsed {importedRows} rows — ready to stage. (Wire to Supabase to persist.)
        </p>
      )}

      {/* Analytics */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: MapPin, label: "Live clubs", value: stats.total },
          { icon: BadgeCheck, label: "Verified", value: stats.verified },
          { icon: Users, label: "Weekly runners", value: `~${stats.runners}` },
          { icon: Inbox, label: "In queue", value: queue.length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-card">
            <s.icon className="h-5 w-5 text-signal" strokeWidth={1.8} />
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-ink">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-stone">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">Submission queue</h2>
          <span className="text-sm text-stone tabular-nums">
            {decided.approved} approved · {decided.rejected} rejected this session
          </span>
        </div>
        <div className="mt-5 space-y-3">
          <AnimatePresence>
            {queue.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.25 }}
                className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-ink">{s.name}</h3>
                    <Badge variant="outline" className="capitalize">{s.city}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-stone">
                    {s.area} · {s.meetingPoint} · {s.timeLocal} · {s.submitterEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => decide(s.id, "rejected")}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => decide(s.id, "approved")}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {queue.length === 0 && (
            <EmptyState
              title="Queue clear."
              hint="Every submission has been reviewed. New ones appear here the moment they arrive."
            />
          )}
        </div>
      </section>

      {/* All clubs */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-ink">All clubs</h2>
        <div className="mt-4 flex max-w-md items-center gap-2 rounded-2xl bg-white p-2 shadow-card">
          <Search className="ml-2 h-4 w-4 text-stone" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, area…"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-track/70 text-xs uppercase tracking-widest text-stone">
                <th className="px-5 py-3.5 font-medium">Club</th>
                <th className="hidden px-5 py-3.5 font-medium sm:table-cell">City</th>
                <th className="hidden px-5 py-3.5 font-medium md:table-cell">Pace</th>
                <th className="px-5 py-3.5 font-medium">Turnout</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredClubs.map((c) => (
                <tr key={c.id} className="border-b border-track/40 transition-colors last:border-0 hover:bg-paper/70">
                  <td className="px-5 py-3.5 font-medium text-ink">{c.name}</td>
                  <td className="hidden px-5 py-3.5 capitalize text-stone sm:table-cell">{c.city}</td>
                  <td className="hidden px-5 py-3.5 md:table-cell"><PaceBadge band={c.paceBand} /></td>
                  <td className="px-5 py-3.5 tabular-nums text-stone">~{c.avgAttendance}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        c.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {c.verified ? <BadgeCheck className="h-3.5 w-3.5" /> : null}
                      {c.verified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredClubs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-stone">
                    No clubs match “{query}”. Try a shorter search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
