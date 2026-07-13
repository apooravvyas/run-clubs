import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Accepts club submissions.
 * With Supabase configured (service role), rows land in `submissions`
 * with status 'pending'. Without it, submissions are accepted and logged
 * so the demo flow works end-to-end.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const required = ["name", "city", "area", "meetingPoint", "timeLocal", "description", "howToJoin", "submitterEmail"];
  for (const key of required) {
    if (!body[key] || String(body[key]).trim().length === 0) {
      return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    const supabase = createClient(url, serviceKey);
    const { error } = await supabase.from("submissions").insert({
      name: body.name,
      city: body.city,
      area: body.area,
      meeting_point: body.meetingPoint,
      days: body.days ?? [],
      time_local: body.timeLocal,
      pace_band: body.paceBand || "all",
      beginner_friendly: Boolean(body.beginnerFriendly),
      is_free: Boolean(body.isFree),
      instagram: body.instagram || null,
      whatsapp: body.whatsapp || null,
      description: body.description,
      how_to_join: body.howToJoin,
      submitter_email: body.submitterEmail,
      status: "pending",
    });
    if (error) {
      return NextResponse.json({ error: "Could not save submission." }, { status: 500 });
    }
  } else {
    console.info("[runclubs] demo submission received:", body.name);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
