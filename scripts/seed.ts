/**
 * Seed Supabase from the bundled dataset.
 * Usage:  SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import seed from "../data/clubs.json";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const rows = seed.clubs.map((c) => ({
    slug: c.slug,
    name: c.name,
    city: c.city,
    area: c.area,
    lat: c.lat,
    lng: c.lng,
    gmaps_url: c.gmapsUrl,
    meeting_point: c.meetingPoint,
    days: c.days,
    time_local: c.timeLocal,
    avg_attendance: c.avgAttendance,
    pace_band: c.paceBand,
    pace_detail: c.paceDetail,
    distance_min_km: c.typicalDistanceKm[0],
    distance_max_km: c.typicalDistanceKm[1],
    beginner_friendly: c.beginnerFriendly,
    women_friendly: c.womenFriendly,
    competitive: c.competitive,
    social: c.social,
    coffee_after: c.coffeeAfter,
    is_free: c.isFree,
    fee_detail: c.feeDetail ?? null,
    instagram: c.instagram ?? null,
    strava: c.strava ?? null,
    whatsapp: c.whatsapp ?? null,
    website: c.website ?? null,
    organizer_name: c.organizerName ?? null,
    photo: c.photo,
    description: c.description,
    how_to_join: c.howToJoin,
    verified: c.verified,
    status: c.status,
    last_updated: c.lastUpdated,
  }));

  const { error } = await supabase.from("clubs").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} clubs.`);
}

main();
