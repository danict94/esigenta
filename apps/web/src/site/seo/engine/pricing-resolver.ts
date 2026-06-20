import {
  getBasePriceRange,
  type BasePriceRange,
} from "../market-data/base-price-ranges";
import { getCityPriceModifier } from "../market-data/city-price-index";

export function resolveFamilyPriceRange(
  familyKey: string,
): BasePriceRange | null {
  return getBasePriceRange(familyKey);
}

/**
 * Oggi tutti i modificatori città sono neutri (1): il range restituito
 * resta identico al range nazionale finché non viene presa una decisione
 * di prodotto su prezzi differenziati per città.
 */
export function resolveCityPriceRange(
  familyKey: string,
  citySlug: string,
): BasePriceRange | null {
  const base = getBasePriceRange(familyKey);
  if (!base) return null;

  const modifier = getCityPriceModifier(familyKey, citySlug);
  if (modifier === 1) return base;

  return base;
}
