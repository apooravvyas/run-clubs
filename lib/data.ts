import "server-only";
import seed from "@/data/clubs.json";
import type { Club, CityMeta } from "@/lib/types";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";
import { needsRecheck as needsRecheckFn } from "@/lib/verification";

const seedClubs = seed.clubs as Club[];
const seedCities = seed.cities as CityMeta[];

/**
 * Data layer with graceful fallback:
 * reads from Supabase when configured, otherwise serves the bundled
 * seed dataset so the app runs (and demos) with zero setup.
 */
export async function getClubs(): Promise<Club[]> {
  if (supabaseEnabled()) {
    const { data, error } = await getSupabase()
      .from("clubs")
      .select("*")
      .eq("status", "live")
      .order("avg_attendance", { ascending: false });
    if (!error && data && data.length > 0) return data.map(fromRow);
  }
  return seedClubs.filter((c) => c.status === "live");
}

export async function getClubBySlug(slug: string): Promise<Club | null> {
  const clubs = await getClubs();
  return clubs.find((c) => c.slug === slug) ?? null;
}

export async function getClubsByCity(city: string): Promise<Club[]> {
  const clubs = await getClubs();
  return clubs.filter((c) => c.city === city);
}

export function getCities(): CityMeta[] {
  return seedCities;
}

export function getCity(slug: string): CityMeta | null {
  return seedCities.find((c) => c.slug === slug) ?? null;
}

export async function getStats() {
  const clubs = await getClubs();
  const cities = new Set(clubs.map((c) => c.city)).size;
  const runners = clubs.reduce((sum, c) => sum + c.avgAttendance, 0);
  const verified = clubs.filter((c) => c.verified).length;
  const needsRecheck = clubs.filter((c) => needsRecheckFn(c)).length;
  return { clubs: clubs.length, cities, runners, verified, needsRecheck };
}

/** Map a snake_case Supabase row into the app's camelCase Club. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(r: any): Club {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    city: r.city,
    area: r.area,
    lat: r.lat,
    lng: r.lng,
    gmapsUrl: r.gmaps_url,
    meetingPoint: r.meeting_point,
    days: r.days ?? [],
    timeLocal: r.time_local,
    avgAttendance: r.avg_attendance ?? 0,
    paceBand: r.pace_band,
    paceDetail: r.pace_detail ?? "",
    typicalDistanceKm: [r.distance_min_km ?? 5, r.distance_max_km ?? 10],
    beginnerFriendly: r.beginner_friendly,
    womenFriendly: r.women_friendly,
    competitive: r.competitive,
    social: r.social,
    coffeeAfter: r.coffee_after,
    isFree: r.is_free,
    feeDetail: r.fee_detail ?? undefined,
    instagram: r.instagram ?? undefined,
    strava: r.strava ?? undefined,
    whatsapp: r.whatsapp ?? undefined,
    website: r.website ?? undefined,
    organizerName: r.organizer_name ?? undefined,
    photo: r.photo,
    description: r.description,
    howToJoin: r.how_to_join,
    verified: r.verified,
    verifiedAt: r.verified_at ?? undefined,
    verificationMethod: r.verification_method ?? undefined,
    verificationSource: r.verification_source ?? undefined,
    status: r.status,
    lastUpdated: r.last_updated,
  };
}
