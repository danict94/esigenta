import {
  getSeoInterventionLandingBySlug,
  type SeoInterventionLanding,
} from "../pages/interventi";
import {
  getCostGuideBySlug,
  getCostGuideCityPageBySlug,
  type CostGuide,
  type CostGuideCityPage,
} from "../pages/costi";

export type { SeoInterventionLanding, CostGuide, CostGuideCityPage };

export function resolveInterventionPage(
  slug: string,
): SeoInterventionLanding | null {
  return getSeoInterventionLandingBySlug(slug);
}

export function resolveCostGuidePage(slug: string): CostGuide | null {
  return getCostGuideBySlug(slug);
}

export function resolveCostGuideCityPage(
  slug: string,
  citySlug: string,
): CostGuideCityPage | null {
  return getCostGuideCityPageBySlug(slug, citySlug);
}

/**
 * Phase 20.3 — link servizio → guida costo. landing.costSlug è un campo
 * editoriale libero: non garantisce che la guida esista davvero (alcune
 * landing dichiarano un costSlug per una guida non ancora pubblicata). Questo
 * resolver verifica l'esistenza reale prima di costruire l'href, così il
 * template può semplicemente nascondere il link invece di puntare a un 404.
 */
export function resolveCostGuideHrefForIntervention(
  costSlug: string | undefined,
): string | null {
  if (!costSlug) {
    return null;
  }

  const guide = getCostGuideBySlug(costSlug);
  return guide ? `/costi/${costSlug}` : null;
}

/**
 * Phase 20.3 — link guida costo → landing servizio. interventionSeoSlug è
 * obbligatorio sul tipo CostGuide, ma non è comunque autovalidato contro il
 * registry SEO interventi al momento della scrittura del contenuto. Stesso
 * principio del resolver sopra: verifica prima di linkare.
 */
export function resolveInterventionHrefForCostGuide(
  interventionSeoSlug: string,
): string | null {
  const landing = getSeoInterventionLandingBySlug(interventionSeoSlug);
  return landing ? `/interventi/${interventionSeoSlug}` : null;
}

/**
 * Risoluzione a cascata per un intervento richiamato fuori dal proprio
 * contesto (es. il blocco "Interventi specifici" di una guida costi che
 * rimanda a un lavoro diverso): guida costi reale → landing intervento
 * reale → funnel diretto. Il funnel esiste sempre per uno slug taxonomy
 * reale, quindi questa funzione ritorna sempre un href valido — mai null,
 * a differenza dei resolver sopra che possono nascondere il link.
 */
export function resolveBestHrefForIntervention(slug: string): string {
  if (getCostGuideBySlug(slug)) {
    return `/costi/${slug}`;
  }

  if (getSeoInterventionLandingBySlug(slug)) {
    return `/interventi/${slug}`;
  }

  return `/richiesta/${slug}`;
}

/**
 * Fallback condiviso della didascalia sotto il prezzo nel modulo Costi di
 * /interventi/[slug] (geo-cost-module.tsx): usato da ogni guida che non
 * imposta `interventionRangeLabel`, così il comportamento attuale resta
 * invariato per tutte le guide che mostrano davvero un totale complessivo.
 */
export const DEFAULT_INTERVENTION_RANGE_LABEL = "RANGE INDICATIVO COMPLESSIVO";

export type InterventionCostSectionPriceData = {
  priceRange: string;
  /**
   * Didascalia da mostrare sotto `priceRange` nel modulo Costi della landing
   * intervento. Risolta qui (guide.interventionRangeLabel, con fallback a
   * DEFAULT_INTERVENTION_RANGE_LABEL) invece che nel componente, così
   * geo-cost-module.tsx resta un renderer puro: nessuno slug o testo del
   * prezzo da interpretare, solo una stringa già decisa dai dati della guida.
   */
  priceRangeLabel: string;
  priceRows: readonly CostGuide["priceRows"][number][];
} | null;

/**
 * Fase 2 — SSOT prezzi. Unica fonte numerica per il blocco prezzo di una
 * landing intervento: la guida costi collegata via costSlug (stessi dati di
 * /costi/[slug], derivati da market-data). Nessun numero vive nel content.ts
 * della landing. Se costSlug non è dichiarato o non punta a una guida reale,
 * ritorna null — il template non mostra alcun blocco prezzo, mai un valore
 * inventato. priceRowLabels seleziona quali righe della guida mostrare: un
 * label che non esiste nella guida fa fallire il build, non silenziosamente
 * a runtime.
 */
export function resolveInterventionCostSectionPriceData(
  landing: SeoInterventionLanding,
): InterventionCostSectionPriceData {
  if (!landing.costSlug) return null;

  const guide = getCostGuideBySlug(landing.costSlug);
  if (!guide) return null;

  // Guida in modalità pricingTeaser (nessun prezzo ancora verificato): mai
  // mostrare un blocco prezzo sulla landing intervento in questo caso.
  if (guide.pricingTeaser || !guide.nationalRange) return null;

  const priceRowLabels = landing.costSection?.priceRowLabels ?? [];

  const priceRows = priceRowLabels.map((label) => {
    const row = guide.priceRows.find((candidate) => candidate.label === label);

    if (!row) {
      throw new Error(
        `SeoInterventionLanding "${landing.slug}" declares priceRowLabel ` +
          `"${label}" that does not exist in CostGuide "${guide.slug}".priceRows`,
      );
    }

    return row;
  });

  return {
    priceRange: guide.nationalRange,
    priceRangeLabel: guide.interventionRangeLabel ?? DEFAULT_INTERVENTION_RANGE_LABEL,
    priceRows,
  };
}
