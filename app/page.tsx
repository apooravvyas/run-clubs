import Link from "next/link";
import { MapPin, ShieldCheck, Coffee, ArrowRight } from "lucide-react";
import { getClubs, getCities, getStats } from "@/lib/data";
import { Hero } from "@/components/landing/hero";
import { ClubCard } from "@/components/club-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [clubs, stats] = await Promise.all([getClubs(), getStats()]);
  const cities = getCities();

  const featured = [...clubs].sort((a, b) => b.avgAttendance - a.avgAttendance).slice(0, 6);
  const recent = [...clubs]
    .sort((a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated))
    .slice(0, 3);

  return (
    <>
      <Hero clubs={clubs} stats={stats} />

      {/* Featured clubs */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Featured"
            title="Where India shows up"
            sub="The biggest weekly turnouts on the map right now."
          />
          <Link href="/map" className="hidden shrink-0 sm:block">
            <Button variant="ghost">View all <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((club, i) => (
            <ClubCard key={club.id} club={club} index={i} />
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="border-y border-track/60 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            eyebrow="Cities"
            title="Pick your start line"
            sub="Eight cities at launch. Yours next — add the clubs you run with."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((c) => {
              const count = clubs.filter((x) => x.city === c.slug).length;
              return (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="group rounded-2xl border border-track/70 bg-paper p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-ink">{c.name}</h3>
                    <span className="rounded-full bg-track/60 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink group-hover:bg-signal-soft group-hover:text-signal-deep">
                      {count}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-stone">{c.blurb}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why RunClubs exists */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          eyebrow="Why this exists"
          title="Run clubs are everywhere. Finding one shouldn't take a stranger's DM."
          sub="Clubs live in Instagram bios and locked WhatsApp groups. The questions that actually matter — what pace, how many people, can I just show up — go unanswered. We answer them, club by club, verified with the people who run them."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "The map is the product",
              body: "Every club pinned with its real meeting point, days, time, pace and size. Sixty seconds from landing to knowing where to be on Saturday.",
            },
            {
              icon: ShieldCheck,
              title: "Verified, not scraped",
              body: "Clubs confirm their own details before the badge goes on. Stale pins are the death of map products — freshness is the whole point.",
            },
            {
              icon: Coffee,
              title: "Vibe is data",
              body: "Beginner-friendly. Women-friendly. Coffee after. Free or paid. The soft signals that decide whether you actually show up — finally structured.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-card">
              <f.icon className="h-6 w-6 text-signal" strokeWidth={1.8} />
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently added + testimonials placeholder */}
      <section className="border-t border-track/60 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading eyebrow="Fresh pins" title="Recently updated" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((club, i) => (
              <ClubCard key={club.id} club={club} index={i} />
            ))}
          </div>

          <div className="mt-16 grid gap-4 rounded-3xl bg-paper p-8 sm:grid-cols-3">
            {[
              "“Found my Saturday crew in one search.” — runner, Bangalore",
              "“We got 30 new members the week we were verified.” — club captain, Mumbai",
              "“The beginner filter is why I finally showed up.” — first-timer, Pune",
            ].map((quote) => (
              <p key={quote} className="text-sm italic leading-relaxed text-stone">
                {quote}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center sm:px-14">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-paper sm:text-5xl">
            Run a club? <span className="text-signal">Put it on the map.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-paper/70">
            Three minutes, no login. Get verified, get the badge, get found by every
            runner searching your city.
          </p>
          <Link href="/submit" className="mt-8 inline-block">
            <Button size="lg">Add your club <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>
    </>
  );
}
