export type CityRecord = {
  slug: string;
  name: string;
  province: string;
  region: string;
};

export const cities: readonly CityRecord[] = [
  { slug: "milano", name: "Milano", province: "Milano", region: "Lombardia" },
  { slug: "roma", name: "Roma", province: "Roma", region: "Lazio" },
  { slug: "torino", name: "Torino", province: "Torino", region: "Piemonte" },
  { slug: "napoli", name: "Napoli", province: "Napoli", region: "Campania" },
  {
    slug: "bologna",
    name: "Bologna",
    province: "Bologna",
    region: "Emilia-Romagna",
  },
  { slug: "firenze", name: "Firenze", province: "Firenze", region: "Toscana" },
  { slug: "palermo", name: "Palermo", province: "Palermo", region: "Sicilia" },
  { slug: "catania", name: "Catania", province: "Catania", region: "Sicilia" },
];

const citiesBySlug: ReadonlyMap<string, CityRecord> = new Map(
  cities.map((city) => [city.slug, city]),
);

export function listCities(): readonly CityRecord[] {
  return cities;
}

export function getCityBySlug(slug: string): CityRecord | null {
  return citiesBySlug.get(slug) ?? null;
}
