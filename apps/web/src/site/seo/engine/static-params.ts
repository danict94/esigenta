import { listSeoInterventionLandings } from "../pages/interventi";
import { listCostGuides } from "../pages/costi";
import { listSeoGroupLandings } from "../pages/gruppi";

export function getGroupLandingStaticParams(): { groupSlug: string }[] {
  return listSeoGroupLandings().map((landing) => ({
    groupSlug: landing.slug,
  }));
}

export function getInterventionStaticParams(): { interventoSlug: string }[] {
  return listSeoInterventionLandings().map((landing) => ({
    interventoSlug: landing.slug,
  }));
}

export function getCostGuideStaticParams(): { costSlug: string }[] {
  return listCostGuides().map((guide) => ({
    costSlug: guide.slug,
  }));
}

/**
 * Fase 5.G — decisione di prodotto: nessuna pagina città viene generata,
 * a prescindere dai flag in geo/supported-cities.ts. `dynamicParams = false`
 * su app/costi/[costSlug]/[citySlug]/page.tsx fa sì che un array vuoto
 * qui trasformi OGNI /costi/<slug>/<città> in 404 (sia in build che in
 * `next dev`, che richiama questa funzione a ogni navigazione).
 * Le pagine città leggono ancora fascia nazionale, non prezzi locali reali:
 * torneranno solo con dati locali veri o una metodologia documentata — a
 * quel punto questa funzione torna a chiamare listIndexableCostGuideCityPages.
 */
export function getCostGuideCityStaticParams(): {
  costSlug: string;
  citySlug: string;
}[] {
  return [];
}
