import Link from "next/link";
import { Logo } from "@/components/logo";

const cities = ["bangalore", "mumbai", "delhi", "pune", "hyderabad", "chennai", "kolkata", "ahmedabad"];

export function Footer() {
  return (
    <footer className="border-t border-track/60 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone">
              Every run club in India. One map. Built by runners, verified with clubs, free forever.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-stone">Cities</h4>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {cities.map((c) => (
                <li key={c}>
                  <Link href={`/${c}`} className="capitalize text-ink/80 transition-colors hover:text-signal">
                    {c === "delhi" ? "Delhi NCR" : c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-stone">RunClubs</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/map" className="text-ink/80 hover:text-signal">Explore the map</Link></li>
              <li><Link href="/submit" className="text-ink/80 hover:text-signal">Add your club</Link></li>
              <li><Link href="/admin" className="text-ink/80 hover:text-signal">Moderation</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-track/60 pt-6 text-xs text-stone">
          © {new Date().getFullYear()} RunClubs.in · Find your people. Then keep up.
        </p>
      </div>
    </footer>
  );
}
