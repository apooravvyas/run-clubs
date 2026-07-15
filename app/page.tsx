import { getClubs, getCities } from "@/lib/data";
import { CitySelector, type CityCard } from "@/components/landing/city-selector";

export default async function HomePage() {
  const [clubs, cities] = [await getClubs(), getCities()];

  const cards: CityCard[] = cities
    .map((c) => {
      const cityClubs = clubs.filter((x) => x.city === c.slug);
      return {
        slug: c.slug,
        name: c.name,
        state: c.state,
        image: c.image,
        clubs: cityClubs.length,
        runners: cityClubs.reduce((s, x) => s + x.avgAttendance, 0),
      };
    })
    .filter((c) => c.clubs > 0)
    .sort((a, b) => b.clubs - a.clubs)
    .slice(0, 6);

  return <CitySelector cities={cards} />;
}
