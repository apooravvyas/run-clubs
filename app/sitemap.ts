import type { MetadataRoute } from "next";
import { getCities, getClubs } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://runclubs.in";
  const clubs = await getClubs();
  return [
    { url: base, priority: 1 },
    { url: `${base}/map`, priority: 0.9 },
    { url: `${base}/submit`, priority: 0.6 },
    ...getCities().map((c) => ({ url: `${base}/${c.slug}`, priority: 0.8 })),
    ...clubs.map((c) => ({
      url: `${base}/clubs/${c.slug}`,
      lastModified: c.lastUpdated,
      priority: 0.7,
    })),
  ];
}
