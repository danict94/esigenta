import { ristrutturareBagnoGuide } from "./ristrutturare-bagno/content";
import { rifareTettoGuide } from "./rifare-tetto/content";
import type { CostGuide, CostGuideCityPage } from "./types";
import { isIndexableCityPage } from "../../engine/geo-policy";

export type { CostGuide, CostGuideCityPage, CityPageQualityStatus, CityPageUniquenessLevel } from "./types";
// Registry only: la policy di indicizzabilità è di proprietà di engine/geo-policy.ts.
export { isIndexableCityPage } from "../../engine/geo-policy";

export const costGuidePriceNote =
  "I prezzi sono indicativi e variano in base a metratura, stato degli impianti, materiali, città, accessibilità del cantiere e sopralluogo.";

const all: readonly CostGuide[] = [ristrutturareBagnoGuide, rifareTettoGuide];

const bySlug: ReadonlyMap<string, CostGuide> = new Map(
  all.map((guide) => [guide.slug, guide]),
);

export function listCostGuides(): readonly CostGuide[] {
  return all;
}

export function getCostGuideBySlug(slug: string): CostGuide | null {
  return bySlug.get(slug) ?? null;
}

export function getCostGuidePriceNote(): string {
  return costGuidePriceNote;
}

export function listIndexableCostGuideCityPages(
  slug: string,
): readonly CostGuideCityPage[] {
  const guide = getCostGuideBySlug(slug);
  if (!guide) return [];
  return guide.cityPages.filter(isIndexableCityPage);
}

export function getCostGuideCityPageBySlug(
  slug: string,
  citySlug: string,
): CostGuideCityPage | null {
  const guide = getCostGuideBySlug(slug);
  if (!guide) return null;
  const cityPage = guide.cityPages.find((page) => page.citySlug === citySlug);
  if (!cityPage || !isIndexableCityPage(cityPage)) return null;
  return cityPage;
}
