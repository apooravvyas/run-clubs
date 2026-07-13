import { Badge } from "@/components/ui/badge";
import { PACE_SHORT, type PaceBand } from "@/lib/types";
import { cn } from "@/lib/utils";

const tone: Record<PaceBand, string> = {
  easy: "bg-emerald-50 text-emerald-700",
  moderate: "bg-amber-50 text-amber-700",
  fast: "bg-signal-soft text-signal-deep",
  all: "bg-track/70 text-ink",
};

export function PaceBadge({ band, className }: { band: PaceBand; className?: string }) {
  return (
    <Badge className={cn(tone[band], className)} variant="neutral">
      <svg viewBox="0 0 12 8" className="h-2 w-3" aria-hidden>
        <ellipse cx="6" cy="4" rx="5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {PACE_SHORT[band]}
    </Badge>
  );
}
