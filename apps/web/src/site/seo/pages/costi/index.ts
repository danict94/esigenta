import { ristrutturareBagnoGuide } from "./ristrutturare-bagno/content";
import { rifareTettoGuide } from "./rifare-tetto/content";
import { impermeabilizzareTettoGuide } from "./impermeabilizzare-tetto/content";
import { rifareImpiantoElettricoGuide } from "./rifare-impianto-elettrico/content";
import { impermeabilizzareTerrazzoGuide } from "./impermeabilizzare-terrazzo/content";
import type { CostGuide, CostGuideCityPage } from "./types";
import { isIndexableCityPage } from "../../engine/geo-policy";

export type { CostGuide, CostGuideCityPage, CityPageQualityStatus, CityPageUniquenessLevel } from "./types";
// Registry only: la policy di indicizzabilità è di proprietà di engine/geo-policy.ts.
export { isIndexableCityPage } from "../../engine/geo-policy";

// Audit 2026-08: "stato degli impianti" era improprio su guide non
// impiantistiche (tetto, terrazzo) — sostituito con una formulazione
// realmente universale, senza introdurre un secondo testo per dominio.
export const costGuidePriceNote =
  "I prezzi sono indicativi e variano in base a metratura, stato dell'immobile, materiali, città, accessibilità del cantiere e sopralluogo.";

// impermeabilizzareTerrazzoGuide è registrata ma il suo Intervention è
// publicationStatus "draft" nella frozen taxonomy: il gate di pubblicazione
// (static-params.ts + resolve-seo-page.ts + cost-hub.ts + sitemap.ts) la
// esclude automaticamente da generateStaticParams, hub /costi, sitemap e da
// qualunque lookup pubblico — nessuna condizione qui, il registry resta
// identico per ogni guida.
const all: readonly CostGuide[] = [
  ristrutturareBagnoGuide,
  rifareTettoGuide,
  impermeabilizzareTettoGuide,
  rifareImpiantoElettricoGuide,
  impermeabilizzareTerrazzoGuide,
];

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
