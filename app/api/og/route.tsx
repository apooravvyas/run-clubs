import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import seed from "@/data/clubs.json";
import type { Club } from "@/lib/types";
import { PACE_LABEL } from "@/lib/types";

export const runtime = "edge";

/** Auto-generated share card — every club link previews as a designed card. */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const club = (seed.clubs as Club[]).find((c) => c.slug === slug);

  const name = club?.name ?? "RunClubs.in";
  const line = club
    ? `${club.days.join(" · ")} — ${club.timeLocal} · ~${club.avgAttendance} runners`
    : "Every run club in India. One map.";
  const pace = club ? PACE_LABEL[club.paceBand] : "Find your people. Then keep up.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FAF8F5",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: "#FF5A1F",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 700, color: "#111110", display: "flex" }}>
            RunClubs.in
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#111110",
              lineHeight: 1.05,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 32, color: "#8A8680", display: "flex" }}>{line}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontSize: 26,
              color: "#E24A12",
              backgroundColor: "#FFF0E9",
              padding: "12px 28px",
              borderRadius: 999,
              display: "flex",
            }}
          >
            {pace}
          </div>
          <div style={{ fontSize: 24, color: "#8A8680", display: "flex" }}>runclubs.in</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
