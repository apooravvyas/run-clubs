# RunClubs.in

**Every run club in India. One map.**

Where they meet, what pace they run, how many show up — and exactly how to join.
No login. No DM-a-stranger. Free forever.

## Quick start (zero config)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app ships with a bundled, realistic seed dataset
(44 clubs across 8 cities) and runs fully in **demo mode** — no environment
variables, no database, no API keys required. Map tiles come from
[OpenFreeMap](https://openfreemap.org) (free, no key).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn-style UI primitives (`components/ui`) |
| Motion | Framer Motion |
| Map | MapLibre GL + OpenFreeMap Positron tiles |
| Data | Supabase (Postgres) with graceful fallback to bundled seed JSON |
| Images | next/image (Unsplash demo photos) |
| Fonts | Bricolage Grotesque (display) + Inter (UI) via next/font |

## Project structure

```
app/
  page.tsx              Landing (hero map, stats, featured, cities, CTA)
  map/page.tsx          Full-screen explorer (search, filters, floating cards)
  clubs/[slug]/page.tsx Club detail (SSG, JSON-LD, OG image, join section)
  [city]/page.tsx       SEO city pages (SSG, /bangalore … /ahmedabad)
  submit/page.tsx       Multi-step submission form (autosave, validation)
  admin/page.tsx        Moderation queue, CSV import, analytics, search
  api/clubs/route.ts    Public read API (the open-data layer)
  api/submissions/…     Submission intake (Supabase or demo mode)
  api/og/route.tsx      Auto-generated share cards per club
  sitemap.ts, robots.ts
components/
  map/club-map.tsx      MapLibre wrapper: clustering, halo pins, selection
  map/map-explorer.tsx  Search + filters + floating card overlay
  ui/*                  Button, Badge, Input, Card, Skeleton, …
  submit-form.tsx, admin-dashboard.tsx, club-card.tsx, …
lib/
  types.ts, data.ts (Supabase→seed fallback), supabase.ts, utils.ts
data/clubs.json         Seed dataset (8 cities, 44 clubs)
supabase/migrations/    Schema: clubs, submissions, edit_suggestions + RLS
scripts/seed.ts         Push the seed dataset into Supabase
```

## Going live with Supabase (optional)

1. Create a project at supabase.com.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Copy `.env.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only — submissions + seeding)
4. Seed: `npm run seed`
5. Restart dev — the data layer switches from bundled JSON to Supabase
   automatically (`lib/data.ts`).

## Deploying to Vercel

```bash
npx vercel
```

- Add the three env vars in Vercel → Project → Settings → Environment Variables
  (or none, for demo mode).
- Set `NEXT_PUBLIC_SITE_URL` to your production domain for correct sitemap +
  OG URLs.
- City and club pages are statically generated; the public API revalidates
  every 5 minutes.

## Design system

- **Palette:** Paper `#FAF8F5` · Ink `#111110` · Signal Orange `#FF5A1F`
  (attention only) · Stone `#8A8680` · Track `#E9E5DE`
- **Type:** Bricolage Grotesque 500–800 for display, Inter for UI, tabular
  numerals for stats.
- **Motion:** 200–700 ms, single easing curve `[0.21, 0.6, 0.35, 1]`,
  `prefers-reduced-motion` respected globally.
- **The signature:** the living map — pulsing signal-orange pins, halo dots,
  clusters in ink.

## Notes

- Demo photos are Unsplash hotlinks; replace with club-submitted photos in
  production (`photos` bucket in Supabase Storage).
- Seed data mixes well-known clubs with plausible placeholders — verify each
  club via the DM protocol before public launch (see the startup document).
- `/admin` is unlisted and noindexed; add Supabase magic-link auth before
  exposing write actions publicly.
