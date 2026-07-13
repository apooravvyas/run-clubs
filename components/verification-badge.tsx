import { BadgeCheck, ShieldQuestion, Clock3 } from "lucide-react";
import type { Club } from "@/lib/types";
import { verificationState, VERIFICATION_LABEL, type VerificationState } from "@/lib/verification";
import { cn } from "@/lib/utils";

type ClubVerification = Pick<Club, "verified" | "verifiedAt">;

const STYLES: Record<VerificationState, { className: string; Icon: typeof BadgeCheck; title: string }> = {
  verified: {
    className: "text-emerald-600",
    Icon: BadgeCheck,
    title: "Confirmed with the people who run this club",
  },
  stale: {
    className: "text-amber-600",
    Icon: Clock3,
    title: "Verified a while ago — a re-check is due",
  },
  unverified: {
    className: "text-stone",
    Icon: ShieldQuestion,
    title: "Listed from public info, not yet confirmed with the club",
  },
};

/**
 * Public trust badge. Shows the true verification state — including the honest
 * "community-listed" case — instead of hiding unverified clubs.
 */
export function VerificationBadge({
  club,
  compact = false,
  className,
}: {
  club: ClubVerification;
  compact?: boolean;
  className?: string;
}) {
  const state = verificationState(club);
  const { className: tone, Icon, title } = STYLES[state];
  return (
    <span
      className={cn("inline-flex items-center gap-1", tone, className)}
      title={title}
    >
      <Icon className={compact ? "h-4 w-4" : "h-4 w-4"} strokeWidth={2.2} />
      {!compact && <span className="text-xs font-medium">{VERIFICATION_LABEL[state]}</span>}
    </span>
  );
}

