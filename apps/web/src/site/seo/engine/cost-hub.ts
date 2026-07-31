import { listCostGuides } from "../pages/costi";
import type { CostGuide } from "../pages/costi";
import { getSeoInterventionLandingBySlug } from "../pages/interventi";

export type CostHubCategoryGroup = {
  slug: string;
  name: string;
  guides: readonly CostGuide[];
};

/**
 * Una guida compare nell'hub solo se: è registrata (garantito da
 * listCostGuides()), non ha `pricingTeaser` (prezzi non ancora verificati),
 * ha un `summary` reale, il suo `interventionSeoSlug` risolve a una landing
 * Intervento davvero registrata (mai un link a una pagina fantasma), e non è
 * esclusa esplicitamente via `hubExcluded`. Mai `priceRows.length > 0` da
 * solo: una guida futura potrebbe avere una struttura economica diversa da
 * quella odierna.
 */
function isPublishableInHub(guide: CostGuide): boolean {
  if (guide.pricingTeaser !== undefined) return false;
  if (guide.summary.trim().length === 0) return false;
  if (!getSeoInterventionLandingBySlug(guide.interventionSeoSlug)) return false;
  if (guide.hubExcluded === true) return false;
  return true;
}

/** hubOrder crescente; senza hubOrder va in fondo, poi ordinamento stabile per titolo e slug. */
function compareGuidesForHub(a: CostGuide, b: CostGuide): number {
  const orderA = a.hubOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.hubOrder ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;

  const titleCompare = a.title.localeCompare(b.title, "it");
  if (titleCompare !== 0) return titleCompare;

  return a.slug.localeCompare(b.slug, "it");
}

/**
 * Raggruppa le guide costo pubblicabili per hubCategory (Phase 20.2).
 * Nessuna categoria è scritta a mano qui: deriva da listCostGuides(), quindi
 * una nuova guida pubblicabile con una nuova hubCategory crea automaticamente
 * un nuovo gruppo al prossimo build, senza toccare questo file o il template.
 * Non può mai produrre una categoria vuota: esiste solo se almeno una guida
 * pubblicabile la referenzia. L'ordine delle categorie resta quello di prima
 * apparizione in listCostGuides(); dentro ogni categoria le guide sono
 * ordinate da compareGuidesForHub.
 */
export function buildCostHubCategoryGroups(): readonly CostHubCategoryGroup[] {
  const guides = listCostGuides().filter(isPublishableInHub);
  const groupsBySlug = new Map<string, CostHubCategoryGroup>();

  for (const guide of guides) {
    const existing = groupsBySlug.get(guide.hubCategory.slug);

    if (existing) {
      groupsBySlug.set(guide.hubCategory.slug, {
        ...existing,
        guides: [...existing.guides, guide],
      });
      continue;
    }

    groupsBySlug.set(guide.hubCategory.slug, {
      slug: guide.hubCategory.slug,
      name: guide.hubCategory.name,
      guides: [guide],
    });
  }

  return [...groupsBySlug.values()].map((group) => ({
    ...group,
    guides: [...group.guides].sort(compareGuidesForHub),
  }));
}
