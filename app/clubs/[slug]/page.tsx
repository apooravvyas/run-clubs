import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Users, Clock, MapPin, Coffee, Baby, Trophy, HeartHandshake,
  IndianRupee, Instagram, Globe, MessageCircle, Pencil, ExternalLink, Footprints,
  ShieldCheck, Clock3, ShieldQuestion,
} from "lucide-react";
import { getClubBySlug, getClubs, getClubsByCity, getCity } from "@/lib/data";
import { PACE_LABEL, VERIFICATION_METHOD_LABEL, type Club } from "@/lib/types";
import { PaceBadge } from "@/components/pace-badge";
import { VerificationBadge } from "@/components/verification-badge";
import { verificationState, VERIFICATION_BLURB, daysSince } from "@/lib/verification";
import { ClubCard } from "@/components/club-card";
import { ClubMap } from "@/components/map/club-map";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

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
  const description = `${PACE_LABEL[club.paceBand]}. ${club.description}`.trim();
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?slug=${club.slug}`],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <Icon className="h-5 w-5 text-signal" strokeWidth={1.8} />
      <p className="mt-3 text-xs font-medium uppercase tracking-widest text-stone">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}

function VerificationCard({ club }: { club: Club }) {
  const state = verificationState(club);
  const age = daysSince(club.verifiedAt);
  const Icon = state === "verified" ? ShieldCheck : state === "stale" ? Clock3 : ShieldQuestion;
  const tone =
    state === "verified"
      ? "text-emerald-600"
      : state === "stale"
        ? "text-amber-600"
        : "text-stone";
  const heading =
    state === "verified" ? "Verified with the club" : state === "stale" ? "Verified — recheck due" : "Community-listed";

  return (
    <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
      <div className={`flex items-center gap-2 ${tone}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
        <p className="font-display text-base font-bold">{heading}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink/75">{VERIFICATION_BLURB[state]}</p>

      {club.verified ? (
        <dl className="mt-4 space-y-2 border-t border-track/70 pt-4 text-sm">
          {club.verifiedAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Last confirmed</dt>
              <dd className="text-right font-medium text-ink">
                {new Date(club.verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {age !== null && <span className="text-stone"> · {age === 0 ? "today" : `${age}d ago`}</span>}
              </dd>
            </div>
          )}
          {club.verificationMethod && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone">How</dt>
              <dd className="text-right font-medium text-ink">{VERIFICATION_METHOD_LABEL[club.verificationMethod]}</dd>
            </div>
          )}
          {club.verificationSource && (
            <p className="pt-1 text-[13px] leading-relaxed text-stone">{club.verificationSource}</p>
          )}
        </dl>
      ) : (
        <div className="mt-4 border-t border-track/70 pt-4">
          <p className="text-[13px] leading-relaxed text-stone">
            Run this club? Confirm the details and get the verified badge.
          </p>
          <Link href={`/submit?edit=${club.slug}`} className="mt-3 inline-block">
            <Button variant="secondary" size="sm">
              <ShieldCheck className="h-3.5 w-3.5" /> Verify this club
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

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

  const vibeTags = [
    club.beginnerFriendly && { icon: Baby, label: "Beginner-friendly" },
    club.womenFriendly && { icon: HeartHandshake, label: "Women-friendly" },
    club.competitive && { icon: Trophy, label: "Competitive" },
    club.coffeeAfter && { icon: Coffee, label: "Coffee after" },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    name: club.name,
    sport: "Running",
    address: { "@type": "PostalAddress", addressLocality: club.area, addressRegion: city?.name },
    geo: { "@type": "GeoCoordinates", latitude: club.lat, longitude: club.lng },
    url: `https://runclubs.in/clubs/${club.slug}`,
  };

  return (
    <article className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="relative h-[46vh] min-h-[320px] w-full">
        <Image src={club.photo} alt={club.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-5 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <PaceBadge band={club.paceBand} />
              <span className="rounded-full bg-white/95 px-3 py-1">
                <VerificationBadge club={club} />
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {club.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-white/85">
              <MapPin className="h-4 w-4" /> {club.area}, {city?.name} · updated {timeAgo(club.lastUpdated)}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5">
        {/* Fact grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Fact icon={Clock} label="When" value={`${club.days.join(" · ")} — ${club.timeLocal}`} />
          <Fact icon={Users} label="Usual turnout" value={club.avgAttendance > 0 ? `~${club.avgAttendance} runners` : "Not verified"} />
          <Fact icon={Footprints} label="Pace" value={PACE_LABEL[club.paceBand]} />
          <Fact
            icon={IndianRupee}
            label="Cost"
            value={club.isFree ? "Free" : club.feeDetail ?? "Paid"}
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {/* About */}
            <section>
              <h2 className="font-display text-2xl font-bold text-ink">About the club</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{club.description}</p>
              <p className="mt-2 text-sm text-stone">{club.paceDetail} · typical distance {club.typicalDistanceKm[0]}–{club.typicalDistanceKm[1]} km</p>
              {vibeTags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {vibeTags.map((t) => (
                    <span key={t.label} className="inline-flex items-center gap-1.5 rounded-full bg-track/60 px-3.5 py-1.5 text-sm font-medium text-ink">
                      <t.icon className="h-4 w-4 text-signal" /> {t.label}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* How to join — the money section */}
            <section className="mt-10 rounded-3xl bg-ink p-7 text-paper">
              <h2 className="font-display text-2xl font-bold">How to join</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-paper/85">{club.howToJoin}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {club.whatsapp && (
                  <a href={club.whatsapp} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary"><MessageCircle className="h-4 w-4" /> WhatsApp group</Button>
                  </a>
                )}
                {club.instagram && (
                  <a href={club.instagram} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-paper/25 bg-transparent text-paper hover:bg-paper/10">
                      <Instagram className="h-4 w-4" /> Instagram
                    </Button>
                  </a>
                )}
                {club.strava && (
                  <a href={club.strava} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-paper/25 bg-transparent text-paper hover:bg-paper/10">
                      Strava <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                {club.website && (
                  <a href={club.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-paper/25 bg-transparent text-paper hover:bg-paper/10">
                      <Globe className="h-4 w-4" /> Website
                    </Button>
                  </a>
                )}
              </div>
            </section>

            {/* Gallery */}
            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold text-ink">Gallery</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="relative h-32 overflow-hidden rounded-xl sm:h-40">
                    <Image
                      src={club.photo}
                      alt={`${club.name} photo ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 33vw, 260px"
                      className="object-cover"
                      style={{ objectPosition: `${i * 40}% center` }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone">Photos from the club — more added after verification.</p>
            </section>
          </div>

          {/* Sidebar: meeting point map + edit */}
          <aside>
            <div className="overflow-hidden rounded-2xl shadow-card ring-1 ring-track/70">
              <div className="h-56">
                <ClubMap clubs={[club]} center={[club.lng, club.lat]} zoom={13.5} interactive={false} />
              </div>
              <div className="bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-stone">Meeting point</p>
                <p className="mt-1 font-medium text-ink">{club.meetingPoint}</p>
                <a href={club.gmapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                  <Button variant="secondary" className="w-full">
                    Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Verification — honest trust signal */}
            <VerificationCard club={club} />

            <div className="mt-4 rounded-2xl border border-dashed border-track bg-white/60 p-5">
              <p className="text-sm text-stone">
                Something changed? Meeting point moved, time shifted, club paused?
              </p>
              <Link href={`/submit?edit=${club.slug}`} className="mt-3 inline-block">
                <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /> Suggest an edit</Button>
              </Link>
            </div>
          </aside>
        </div>

        {/* Nearby clubs */}
        {nearby.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-ink">
              More clubs in {city?.name}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((c, i) => (
                <ClubCard key={c.id} club={c} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
