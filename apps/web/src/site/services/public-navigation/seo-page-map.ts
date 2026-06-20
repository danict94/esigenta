import { listSeoInterventionLandings } from "../../seo/pages/interventi";

/**
 * Derivato da site/seo/pages/interventi — mai scritto a mano (Phase 19.6E/19.6F).
 * landing.funnelSlug è già lo slug taxonomy reale (garanzia da Phase 19.3): quando
 * una nuova landing viene registrata in site/seo/pages/interventi/index.ts, questo
 * mapping la rileva al prossimo build senza nessuna modifica qui.
 */
export function buildSeoPageMap(): ReadonlyMap<string, string> {
  return new Map(
    listSeoInterventionLandings().map((landing) => [
      landing.funnelSlug,
      landing.slug,
    ]),
  );
}

export function getSeoLandingSlugForIntervention(
  taxonomyInterventionSlug: string,
): string | null {
  return buildSeoPageMap().get(taxonomyInterventionSlug) ?? null;
}
