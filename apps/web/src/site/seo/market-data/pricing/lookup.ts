import type { BasePriceRange } from "../shared/types";
import { basePriceRangesByFamily } from "./registry";

export function getBasePriceRange(familyKey: string): BasePriceRange | null {
  return basePriceRangesByFamily[familyKey] ?? null;
}
