import type { Metadata } from "next";
import { getClubs, getCities } from "@/lib/data";
import { MapExplorer } from "@/components/map/map-explorer";

export const metadata: Metadata = {
  title: "The Map",
  description:
    "Every run club in India on one interactive map. Filter by city, pace, beginner-friendliness and cost.",
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const clubs = await getClubs();
  const cities = getCities();
  return <MapExplorer clubs={clubs} cities={cities} initialCity={city} />;
}
