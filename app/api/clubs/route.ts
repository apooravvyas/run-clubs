import { NextResponse } from "next/server";
import { getClubs } from "@/lib/data";

export const revalidate = 300;

/** Public read API — the open-data layer. */
export async function GET() {
  const clubs = await getClubs();
  return NextResponse.json(
    { count: clubs.length, clubs },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
