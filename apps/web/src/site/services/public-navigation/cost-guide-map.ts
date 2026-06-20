import { listCostGuides } from "../../seo/pages/costi";
import { listSeoInterventionLandings } from "../../seo/pages/interventi";

/**
 * Derivato da site/seo/pages/costi — mai scritto a mano. Una CostGuide non
 * referenzia direttamente uno slug taxonomy: referenzia interventionSeoSlug (lo slug
 * della landing SEO). Per arrivare allo slug taxonomy reale si passa dalla landing
 * (landing.funnelSlug). Se in futuro una guida costo viene creata per una famiglia
 * senza landing SEO, questa funzione non potrà risolverla: è un limite noto, non un
 * bug (oggi tutte le guide esistenti hanno una landing SEO collegata).
 */
export function buildCostGuideMap(): ReadonlyMap<string, string> {
  const landingsBySeoSlug = new Map(
    listSeoInterventionLandings().map((landing) => [landing.slug, landing]),
  );

  const map = new Map<string, string>();

  for (const guide of listCostGuides()) {
    const landing = landingsBySeoSlug.get(guide.interventionSeoSlug);

    if (!landing) {
      continue;
    }

    map.set(landing.funnelSlug, guide.canonicalPath);
  }

  return map;
}

export function getCostGuidePathForIntervention(
  taxonomyInterventionSlug: string,
): string | null {
  return buildCostGuideMap().get(taxonomyInterventionSlug) ?? null;
}
