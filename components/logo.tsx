import { cn } from "@/lib/utils";

/** The mark: a map pin whose inner ring is a running-track oval. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("h-7 w-7", className)} aria-hidden>
      <path
        d="M16 2C9.925 2 5 6.925 5 13c0 7.7 9.3 15.9 10.3 16.8a1 1 0 0 0 1.4 0C17.7 28.9 27 20.7 27 13c0-6.075-4.925-11-11-11Z"
        fill="#FF5A1F"
      />
      <ellipse cx="16" cy="13" rx="6.4" ry="4.6" stroke="#FAF8F5" strokeWidth="2.2" fill="none" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        RunClubs<span className="text-signal">.in</span>
      </span>
    </span>
  );
}
