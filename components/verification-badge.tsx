import { BadgeCheck, ShieldQuestion } from "lucide-react";
import type { Club } from "@/lib/types";
import { tierOf, TIER_LABEL } from "@/lib/verification";
import { cn } from "@/lib/utils";

type ClubVerification = Pick<Club, "verified" | "verificationTier">;

/** Honest, monochrome verification badge. Tiers: club / public / community / none. */
export function VerificationBadge({
  club,
  compact = false,
  className,
}: {
  club: ClubVerification;
  compact?: boolean;
  className?: string;
}) {
  const tier = tierOf(club);
  const Icon = tier === "none" ? ShieldQuestion : BadgeCheck;
  const tone = tier === "none" ? "text-stone" : "text-ink";
  return (
    <span className={cn("inline-flex items-center gap-1", tone, className)} title={TIER_LABEL[tier]}>
      <Icon className="h-4 w-4" strokeWidth={2.2} />
      {!compact && <span className="text-xs font-medium">{TIER_LABEL[tier]}</span>}
    </span>
  );
}
