import enrichment from "@/data/club-enrichment.json";
import assets from "@/data/club-assets.json";

export interface ClubEnrichment {
  followers?: string | null;
  followersSource?: string;
  igVerified?: boolean | null;
  email?: string;
}
export interface ClubAssets {
  logo: string | null;
  cover: string | null;
  gallery: string[];
}

const E = enrichment as Record<string, ClubEnrichment>;
const A = assets as Record<string, ClubAssets>;

export function getEnrichment(slug: string): ClubEnrichment {
  return E[slug] ?? {};
}
export function getAssets(slug: string): ClubAssets {
  return A[slug] ?? { logo: null, cover: null, gallery: [] };
}
/** Gallery renders only when we truly have enough real photos. */
export function hasRealGallery(slug: string): boolean {
  return (A[slug]?.gallery?.length ?? 0) >= 3;
}
