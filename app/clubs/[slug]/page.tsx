import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Clock, Instagram, Globe, MessageCircle, Mail,
  ShieldCheck, ShieldQuestion, ExternalLink, ArrowUpRight,
} from "lucide-react";
import { getClubBySlug, getClubs, getClubsByCity, getCity } from "@/lib/data";
import { type Club } from "@/lib/types";
import { getEnrichment, getAssets, hasRealGallery } from "@/lib/enrichment";
import { tierOf, TIER_LABEL, TIER_BLURB } from "@/lib/verification";
import { ClubCard } from "@/components/club-card";
import { ClubMap } from "@/components/map/club-map";

export async function generateStaticParams() {
  const clubs = await getClubs();
  return clubs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) return {};
  const title = `${club.name} — run club in ${club.area}`;
  const description = club.description || `${club.name}, a running community in ${club.area}.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [`/api/og?slug=${club.slug}`] },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function igHandle(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/instagram\.com\/([A-Za-z0-9._]+)/);
  return m ? m[1] : null;
}

function Monogram({ name, size = "lg" }: { name: string; size?: "lg" | "sm" }) {
  return (
    <div
      className={
        size === "lg"
          ? "flex h-24 w-24 items-center justify-center rounded-full border border-paper/25 bg-paper/10 sm:h-28 sm:w-28"
          : "flex h-12 w-12 items-center justify-center rounded-full border border-paper/25 bg-paper/10"
      }
    >
      <span className={size === "lg" ? "font-display text-4xl text-paper" : "font-display text-xl text-paper"}>
        {name.slice(0, 1)}
      </span>
    </div>
  );
}

function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-stone">{children}</p>
  );
}

/* ── page ────────────────────────────────────────────────────────────── */

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const city = getCity(club.city);
  const nearby = (await getClubsByCity(club.city)).filter((c) => c.id !== club.id).slice(0, 3);
  const enrich = getEnrichment(club.slug);
  const assets = getAssets(club.slug);
  const tier = tierOf(club);
  const handle = igHandle(club.instagram);
  const hasSchedule = club.days.length > 0;
  const showGallery = hasRealGallery(club.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    name: club.name,
    sport: "Running",
    address: { "@type": "PostalAddress", addressLocality: club.area, addressRegion: city?.name },
    geo: { "@type": "GeoCoordinates", latitude: club.lat, longitude: club.lng },
    url: `https://runclubs.in/clubs/${club.slug}`,
    ...(club.instagram ? { sameAs: [club.instagram] } : {}),
  };

  return (
    <article className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1 · Identity hero */}
      <header className="relative bg-ink">
        {assets.cover && (
          <>
            <Image src={assets.cover} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
          </>
        )}
        <div className="relative mx-auto max-w-5xl px-5 pb-12 pt-16 sm:pb-16 sm:pt-24">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            {assets.logo ? (
              <Image
                src={assets.logo}
                alt={`${club.name} logo`}
                width={112}
                height={112}
                className="h-24 w-24 rounded-full border border-paper/25 object-cover sm:h-28 sm:w-28"
              />
            ) : (
              <Monogram name={club.name} />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-paper/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.17em] text-paper/80">
                  {tier === "none" ? <ShieldQuestion className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                  {TIER_LABEL[tier]}
                </span>
              </div>
              <h1 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-paper sm:text-6xl">
                {club.name}
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-paper/70">
                <MapPin className="h-4 w-4" /> {club.area !== club.name ? club.area : city?.name}
                {city && club.area !== city.name ? `, ${city.name}` : ""}
              </p>
            </div>
          </div>

          {/* 2 · Community snapshot (real signals only) */}
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-paper/15 pt-6">
            {enrich.followers && (
              <div>
                <MonoLabel>Community</MonoLabel>
                <p className="mt-1 text-lg font-medium text-paper">
                  {enrich.followers} <span className="text-sm text-paper/60">on Instagram</span>
                </p>
              </div>
            )}
            {enrich.igVerified && (
              <div>
                <MonoLabel>Instagram</MonoLabel>
                <p className="mt-1 flex items-center gap-1.5 text-lg font-medium text-paper">
                  <ShieldCheck className="h-4 w-4" /> Verified account
                </p>
              </div>
            )}
            {club.verifiedAt && (
              <div>
                <MonoLabel>Last checked</MonoLabel>
                <p className="mt-1 text-lg font-medium text-paper">
                  {new Date(club.verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5">
        {/* 3 · Join the community — primary CTA */}
        <section className="mt-10 rounded-2xl border border-track bg-white p-6 sm:p-8">
          <MonoLabel>Join the community</MonoLabel>
          <div className="mt-4 flex flex-wrap gap-3">
            {club.instagram && (
              <a
                href={club.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-black"
              >
                <Instagram className="h-4 w-4" /> {handle ? `@${handle}` : "Instagram"}
              </a>
            )}
            {(club.whatsapp || enrich.whatsapp) && (
              <a href={club.whatsapp || enrich.whatsapp} target="_blank" rel="noopener noreferrer"
                 className="inline-flex h-11 items-center gap-2 rounded-full border border-track px-6 text-sm font-medium text-ink transition-colors hover:border-stone">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {(club.website || enrich.website) && (
              <a href={club.website || enrich.website} target="_blank" rel="noopener noreferrer"
                 className="inline-flex h-11 items-center gap-2 rounded-full border border-track px-6 text-sm font-medium text-ink transition-colors hover:border-stone">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
            {enrich.events && (
              <a href={enrich.events} target="_blank" rel="noopener noreferrer"
                 className="inline-flex h-11 items-center gap-2 rounded-full border border-track px-6 text-sm font-medium text-ink transition-colors hover:border-stone">
                <ExternalLink className="h-4 w-4" /> Events
              </a>
            )}
            {enrich.email && (
              <a href={`mailto:${enrich.email}`}
                 className="inline-flex h-11 items-center gap-2 rounded-full border border-track px-6 text-sm font-medium text-ink transition-colors hover:border-stone">
                <Mail className="h-4 w-4" /> Collabs
              </a>
            )}
          </div>
        </section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {/* 4 · About */}
            <section>
              <h2 className="font-display text-2xl text-ink">About</h2>
              {enrich.bio ? (
                <>
                  <p className="mt-3 text-[17px] leading-relaxed text-ink/85">{enrich.bio}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.17em] text-stone">From the club’s Instagram</p>
                </>
              ) : club.description ? (
                <p className="mt-3 text-[16px] leading-relaxed text-ink/80">{club.description}</p>
              ) : (
                <p className="mt-3 text-[15px] leading-relaxed text-stone">
                  This club hasn't been profiled yet. Their Instagram is the best introduction.
                </p>
              )}
            </section>

            {/* 5 · Runs */}
            <section className="mt-12">
              <h2 className="font-display text-2xl text-ink">Runs</h2>
              <dl className="mt-4 divide-y divide-track/70 border-y border-track/70">
                <div className="flex items-center justify-between gap-6 py-4">
                  <dt className="flex items-center gap-2 text-sm text-stone"><Clock className="h-4 w-4" /> Schedule</dt>
                  <dd className="text-right text-[15px] font-medium text-ink">
                    {hasSchedule ? `${club.days.join(" · ")}${club.timeLocal ? ` — ${club.timeLocal}` : ""}` : "Not verified"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-6 py-4">
                  <dt className="flex items-center gap-2 text-sm text-stone"><MapPin className="h-4 w-4" /> Meeting point</dt>
                  <dd className="text-right text-[15px] font-medium text-ink">
                    {club.meetingPoint || "Not verified"}
                  </dd>
                </div>
              </dl>
              {!hasSchedule && !club.meetingPoint && club.instagram && (
                <a href={club.instagram} target="_blank" rel="noopener noreferrer"
                   className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-track underline-offset-4 hover:decoration-ink">
                  The club announces run details on Instagram <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </section>

            {/* 6 · Gallery — only with ≥3 real photos */}
            {showGallery && (
              <section className="mt-12">
                <h2 className="font-display text-2xl text-ink">Gallery</h2>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {assets.gallery.slice(0, 6).map((src, i) => (
                    <div key={src} className="relative h-32 overflow-hidden rounded-xl sm:h-40">
                      <Image src={src} alt={`${club.name} photo ${i + 1}`} fill sizes="(max-width:640px) 33vw, 300px" className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {club.meetingPoint && (
              <div className="overflow-hidden rounded-2xl border border-track">
                <div className="h-52">
                  <ClubMap clubs={[club]} center={[club.lng, club.lat]} zoom={13.5} interactive={false} />
                </div>
                <div className="bg-white p-5">
                  <MonoLabel>Meeting point</MonoLabel>
                  <p className="mt-1 font-medium text-ink">{club.meetingPoint}</p>
                </div>
              </div>
            )}

            {/* 7 · Verification note */}
            <div className={`${club.meetingPoint ? "mt-4" : ""} rounded-2xl border border-track bg-white p-5`}>
              <div className="flex items-center gap-2 text-ink">
                {tier === "none" ? <ShieldQuestion className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                <p className="text-sm font-semibold">{TIER_LABEL[tier]}</p>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-stone">{TIER_BLURB[tier]}</p>
              <Link href={`/submit?edit=${club.slug}`} className="mt-3 inline-block text-[13px] font-medium text-ink underline decoration-track underline-offset-4 hover:decoration-ink">
                Run this club? Confirm your details
              </Link>
            </div>
          </aside>
        </div>

        {/* 8 · Related clubs */}
        {nearby.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl text-ink">More clubs in {city?.name}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((c, i) => (
                <ClubCard key={c.id} club={c} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky join bar */}
      {club.instagram && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-track bg-white/95 p-3 backdrop-blur sm:hidden">
          <a href={club.instagram} target="_blank" rel="noopener noreferrer"
             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper">
            <Instagram className="h-4 w-4" /> Join on Instagram
          </a>
        </div>
      )}
    </article>
  );
}
