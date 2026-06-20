export type CityPriceModifier = {
  citySlug: string;
  /** 1 = nessuna variazione rispetto al range nazionale base. */
  multiplier: number;
};

const cityPriceIndexByFamily: Record<string, readonly CityPriceModifier[]> = {
  "costGuide:ristrutturare-bagno": [
    { citySlug: "milano", multiplier: 1 },
    { citySlug: "roma", multiplier: 1 },
    { citySlug: "torino", multiplier: 1 },
    { citySlug: "napoli", multiplier: 1 },
    { citySlug: "bologna", multiplier: 1 },
    { citySlug: "firenze", multiplier: 1 },
    { citySlug: "palermo", multiplier: 1 },
    { citySlug: "catania", multiplier: 1 },
  ],
};

export function getCityPriceModifier(
  familyKey: string,
  citySlug: string,
): number {
  const list = cityPriceIndexByFamily[familyKey] ?? [];
  return (
    list.find((modifier) => modifier.citySlug === citySlug)?.multiplier ?? 1
  );
}
