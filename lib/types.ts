export type PaceBand = "easy" | "moderate" | "fast" | "all";

export type ClubStatus = "live" | "pending" | "archived";

/**
 * How a club's details were confirmed with the people who run it.
 * RunClubs.in only marks a club "verified" after a real human confirmation —
 * never inferred, never fabricated.
 */
export type VerificationMethod =
  | "organizer-dm"
  | "whatsapp"
  | "instagram"
  | "website"
  | "in-person"
  | "phone"
  | "email";

export const VERIFICATION_METHOD_LABEL: Record<VerificationMethod, string> = {
  "organizer-dm": "Direct message with organizer",
  whatsapp: "Confirmed over WhatsApp",
  instagram: "Confirmed via Instagram",
  website: "Confirmed via club website",
  "in-person": "Verified in person at a run",
  phone: "Confirmed by phone",
  email: "Confirmed over email",
};

export interface Club {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  gmapsUrl: string;
  meetingPoint: string;
  days: string[];
  timeLocal: string;
  avgAttendance: number;
  paceBand: PaceBand;
  paceDetail: string;
  typicalDistanceKm: [number, number];
  beginnerFriendly: boolean;
  womenFriendly: boolean;
  competitive: boolean;
  social: boolean;
  coffeeAfter: boolean;
  isFree: boolean;
  feeDetail?: string;
  instagram?: string;
  strava?: string;
  whatsapp?: string;
  website?: string;
  organizerName?: string;
  photo: string;
  description: string;
  howToJoin: string;
  verified: boolean;
  /** ISO date the club was last confirmed with its organizers. */
  verifiedAt?: string;
  /** How the club was confirmed. */
  verificationMethod?: VerificationMethod;
  /** Free-text note on the verification (who confirmed, any caveats). INTERNAL — never render. */
  verificationSource?: string;
  /** How the listing was verified (drives the public trust label). */
  verificationTier?: "club" | "public" | "community";
  status: ClubStatus;
  lastUpdated: string;
}

export interface ClubSubmission {
  name: string;
  city: string;
  area: string;
  meetingPoint: string;
  days: string[];
  timeLocal: string;
  paceBand: PaceBand;
  avgAttendance?: number;
  beginnerFriendly: boolean;
  isFree: boolean;
  instagram?: string;
  whatsapp?: string;
  description: string;
  howToJoin: string;
  submitterEmail: string;
}

export interface CityMeta {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  zoom: number;
  blurb: string;
  /** Curated city photo for the landing city-selector (swappable). */
  image?: string;
}

export const PACE_LABEL: Record<PaceBand, string> = {
  easy: "Easy · 7:00+ /km",
  moderate: "Moderate · 5:30–7:00 /km",
  fast: "Fast · sub-5:30 /km",
  all: "All paces welcome",
};

export const PACE_SHORT: Record<PaceBand, string> = {
  easy: "Easy",
  moderate: "Moderate",
  fast: "Fast",
  all: "All paces",
};

export const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
