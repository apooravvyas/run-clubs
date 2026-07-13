import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCities, getCity, getClubsByCity } from "@/lib/data";
import { ClubCard } from "@/components/club-card";
import { ClubMap } from "@/components/map/club-map";
import { SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return getCities().map((c) => ({ city: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const meta = getCity(city);
  if (!meta) return {};
  const clubs = await getClubsByCity(city);
  return {
    title: `Run clubs in ${meta.name} (${clubs.length} mapped)`,
    description: `Every run club in ${meta.name}: meeting points, days, pace groups, turnout, and how to join. Verified and free.`,
    alternates: { canonical: `/${city}` },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const meta = getCity(city);
  if (!meta) notFound();

  const clubs = await getClubsByCity(city);
  const totalRunners = clubs.reduce((s, c) => s + c.avgAttendance, 0);
  const beginner = clubs.filter((c) => c.beginnerFriendly).length;
  const free = clubs.filter((c) => c.isFree).length;

  return (
    <div className="pb-20">
      <section className="mx-auto max-w-6xl px-5 pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">
          {meta.state}
        </p>
        <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
          Run clubs in {meta.name}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone">{meta.blurb}</p>

        <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-track pt-6">
          {[
            { k: "Clubs", v: clubs.length },
            { k: "Weekly runners", v: `~${totalRunners}` },
            { k: "Beginner-friendly", v: beginner },
          ].map((s) => (
            <div key={s.k}>
              <dd className="font-display text-3xl font-bold tabular-nums text-ink">{s.v}</dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-widest text-stone">{s.k}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-5">
        <div className="h-[380px] overflow-hidden rounded-3xl shadow-card ring-1 ring-track/70">
          <ClubMap
            clubs={clubs}
            center={[meta.lng, meta.lat]}
            zoom={meta.zoom}
            interactive={false}
          />
        </div>
        <div className="mt-4 flex justify-center">
          <Link href={`/map?city=${meta.slug}`}>
            <Button variant="secondary">Explore {meta.name} on the live map</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <SectionHeading
          eyebrow="All clubs"
          title={`${clubs.length} clubs, ${free} of them free`}
          sub="Sorted by weekly turnout. Every listing shows exactly how to join."
        />
        {clubs.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...clubs]
              .sort((a, b) => b.avgAttendance - a.avgAttendance)
              .map((club, i) => (
                <ClubCard key={club.id} club={club} index={i} />
              ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title={`No clubs mapped in ${meta.name} yet`}
              hint="Know one? Put it on the map — it takes three minutes and no login."
              action={
                <Link href="/submit">
                  <Button>Add the first club</Button>
                </Link>
              }
            />
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="rounded-3xl border border-track/70 bg-white p-8">
          <h2 className="font-display text-xl font-bold text-ink">Upcoming runs in {meta.name}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
            A live calendar of every club&apos;s weekly runs and city races is coming.
            Clubs get it free when they verify.
          </p>
        </div>
      </section>
    </div>
  );
}
