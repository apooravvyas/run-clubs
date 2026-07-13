"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, PartyPopper } from "lucide-react";
import type { CityMeta, PaceBand } from "@/lib/types";
import { DAYS_ORDER, PACE_LABEL } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "runclubs.submit.draft";

interface FormState {
  name: string;
  city: string;
  area: string;
  meetingPoint: string;
  days: string[];
  timeLocal: string;
  paceBand: PaceBand | "";
  beginnerFriendly: boolean;
  isFree: boolean;
  instagram: string;
  whatsapp: string;
  description: string;
  howToJoin: string;
  submitterEmail: string;
}

const initial: FormState = {
  name: "",
  city: "",
  area: "",
  meetingPoint: "",
  days: [],
  timeLocal: "",
  paceBand: "",
  beginnerFriendly: true,
  isFree: true,
  instagram: "",
  whatsapp: "",
  description: "",
  howToJoin: "",
  submitterEmail: "",
};

const STEPS = ["The basics", "When & how fast", "How to join", "Verify"] as const;

export function SubmitForm({ cities }: { cities: CityMeta[] }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [touchedNext, setTouchedNext] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  // Restore + autosave draft
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setForm({ ...initial, ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return form.name.trim().length > 2 && form.city && form.area.trim().length > 1 && form.meetingPoint.trim().length > 3;
      case 1:
        return form.days.length > 0 && form.timeLocal.trim().length > 2 && form.paceBand !== "";
      case 2:
        return form.description.trim().length > 20 && form.howToJoin.trim().length > 15;
      case 3:
        return /.+@.+\..+/.test(form.submitterEmail);
      default:
        return false;
    }
  }, [step, form]);

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      sessionStorage.removeItem(STORAGE_KEY);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="mx-auto max-w-md rounded-3xl bg-white p-10 text-center shadow-lift"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 16 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-signal text-white shadow-pin"
        >
          <PartyPopper className="h-7 w-7" />
        </motion.div>
        <h2 className="mt-6 font-display text-2xl font-extrabold text-ink">
          {form.name || "Your club"} is in the queue.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-stone">
          We&apos;ll DM the club to verify the details — that&apos;s how the badge stays
          meaningful. You&apos;ll get an email when it goes live.
        </p>
        <Link href="/map" className="mt-8 inline-block">
          <Button>Back to the map</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-stone">
          {STEPS.map((label, i) => (
            <span key={label} className={cn(i === step && "text-ink")}>{label}</span>
          ))}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track">
          <motion.div
            className="h-full rounded-full bg-signal"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-7 shadow-card sm:p-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -22 }}
            transition={{ duration: 0.25, ease: [0.21, 0.6, 0.35, 1] }}
          >
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">Club name</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Indiranagar Run Club" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <select
                      id="city"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className="h-12 w-full rounded-xl border border-track bg-white px-4 text-[15px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30"
                    >
                      <option value="">Choose a city</option>
                      {cities.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="area">Area / neighbourhood</Label>
                    <Input id="area" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Indiranagar" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="meet">Exact meeting point</Label>
                  <Input id="meet" value={form.meetingPoint} onChange={(e) => set("meetingPoint", e.target.value)} placeholder="Metro Station, Gate 2" />
                  <p className="mt-1.5 text-xs text-stone">Be precise — this is the line runners actually follow.</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label>Run days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_ORDER.map((d) => {
                      const on = form.days.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() =>
                            set("days", on ? form.days.filter((x) => x !== d) : [...form.days, d])
                          }
                          className={cn(
                            "h-10 w-14 rounded-xl border text-sm font-medium transition-all",
                            on ? "border-signal bg-signal text-white shadow-pin" : "border-track bg-white text-stone hover:text-ink"
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="time">Start time</Label>
                    <Input id="time" value={form.timeLocal} onChange={(e) => set("timeLocal", e.target.value)} placeholder="6:00 AM" />
                  </div>
                  <div>
                    <Label htmlFor="pace">Pace</Label>
                    <select
                      id="pace"
                      value={form.paceBand}
                      onChange={(e) => set("paceBand", e.target.value as PaceBand)}
                      className="h-12 w-full rounded-xl border border-track bg-white px-4 text-[15px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30"
                    >
                      <option value="">Choose pace band</option>
                      {(Object.keys(PACE_LABEL) as PaceBand[]).map((p) => (
                        <option key={p} value={p}>{PACE_LABEL[p]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: "beginnerFriendly" as const, label: "Beginner-friendly" },
                    { key: "isFree" as const, label: "Free to join" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => set(t.key, !form[t.key])}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        form[t.key] ? "border-signal bg-signal-soft text-signal-deep" : "border-track bg-white text-stone"
                      )}
                    >
                      <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", form[t.key] ? "border-signal bg-signal text-white" : "border-track")}>
                        {form[t.key] && <Check className="h-3 w-3" />}
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="desc">Describe the club in a sentence or two</Label>
                  <Textarea id="desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Saturday social run, pace groups for everyone, breakfast after." />
                </div>
                <div>
                  <Label htmlFor="join">How does a new runner join?</Label>
                  <Textarea id="join" value={form.howToJoin} onChange={(e) => set("howToJoin", e.target.value)} placeholder="Just show up Saturday 6 AM at Gate 2 — or DM us on Instagram for the WhatsApp link." />
                  <p className="mt-1.5 text-xs text-stone">This is the most-read line on your page. Make it foolproof.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ig">Instagram (optional)</Label>
                    <Input id="ig" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/…" />
                  </div>
                  <div>
                    <Label htmlFor="wa">WhatsApp invite (optional)</Label>
                    <Input id="wa" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="https://chat.whatsapp.com/…" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email">Your email</Label>
                  <Input id="email" type="email" value={form.submitterEmail} onChange={(e) => set("submitterEmail", e.target.value)} placeholder="you@example.com" />
                  <p className="mt-1.5 text-xs text-stone">
                    Only for verification and the go-live note. Never shown publicly, never spammed.
                  </p>
                </div>
                <div className="rounded-2xl bg-paper p-5 text-sm leading-relaxed text-stone">
                  <p className="font-medium text-ink">What happens next</p>
                  <p className="mt-1">
                    We confirm the details with the club (usually via Instagram or WhatsApp),
                    the ✅ Verified badge goes on, and the pin goes live — typically within 48 hours.
                  </p>
                </div>
                {status === "error" && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    Couldn&apos;t save the submission. Check your connection and try again — your draft is safe.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between border-t border-track/70 pt-6">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {!stepValid && touchedNext && (
            <span className="text-xs text-stone">Fill the highlighted fields to continue</span>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => {
                setTouchedNext(true);
                if (stepValid) {
                  setStep((s) => s + 1);
                  setTouchedNext(false);
                }
              }}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={!stepValid || status === "sending"}>
              {status === "sending" ? "Sending…" : "Submit for verification"}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-stone">
        Draft autosaves as you type. No account needed.
      </p>
    </div>
  );
}
