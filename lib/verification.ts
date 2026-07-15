import type { Club } from "@/lib/types";

/**
 * Verification is a trust signal, so it should decay honestly.
 * A club confirmed 14 months ago is not the same as one confirmed last week —
 * after this window we flag it for a re-check instead of quietly implying
 * the details are still current.
 */
export const STALE_AFTER_DAYS = 180;

export type VerificationState = "verified" | "stale" | "unverified";

type ClubVerification = Pick<Club, "verified" | "verifiedAt">;

/** Days since an ISO date (floored). Returns null if no/invalid date. */
export function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

export function verificationState(club: ClubVerification): VerificationState {
  if (!club.verified) return "unverified";
  const age = daysSince(club.verifiedAt);
  if (age !== null && age > STALE_AFTER_DAYS) return "stale";
  return "verified";
}

/** True for clubs that are verified but overdue for a re-check. */
export function needsRecheck(club: ClubVerification): boolean {
  return verificationState(club) === "stale";
}

export const VERIFICATION_LABEL: Record<VerificationState, string> = {
  verified: "Verified",
  stale: "Recheck due",
  unverified: "Community-listed",
};

/** Short, honest public-facing description of what the state means. */
export const VERIFICATION_BLURB: Record<VerificationState, string> = {
  verified: "Confirmed with the people who run this club.",
  stale: "Confirmed a while ago — we're re-checking the details.",
  unverified: "Listed from public info, not yet confirmed with the club.",
};

/** Public trust tiers — never expose internal source names. */
export type VerificationTier = "club" | "public" | "community" | "none";

export function tierOf(club: Pick<Club, "verified" | "verificationTier">): VerificationTier {
  if (!club.verified) return "none";
  return club.verificationTier ?? "public";
}

export const TIER_LABEL: Record<VerificationTier, string> = {
  club: "Verified by club",
  public: "Verified via public sources",
  community: "Community verified",
  none: "Not verified",
};

export const TIER_BLURB: Record<VerificationTier, string> = {
  club: "Confirmed directly by the club's organisers.",
  public: "Confirmed from the club's public Instagram.",
  community: "Confirmed by community members.",
  none: "We haven't confirmed this club's details yet.",
};
