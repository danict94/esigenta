/**
 * Schema del catalogo pubblico (Phase 19.6H). Ogni TaxonomyIntervention reale deve
 * avere una decisione di coverage esplicita (vedi coverage.ts). Questo file non
 * implementa /servizi: definisce solo i contratti che la fase di implementazione
 * (Phase 19.6I) consumerà.
 */

export type CoverageState =
  | "SEO_PAGE_NOW"
  | "REQUEST_NOW"
  | "SHOW_IN_COLLAPSED_LIST"
  | "HIDE_FOR_NOW"
  | "SEO_PAGE_FUTURE"
  | "HIDE_UNTIL_TAXONOMY_EXISTS"
  | "NEEDS_TAXONOMY_FIX";

export type VisibilityPolicy = "FEATURED" | "VISIBLE" | "COLLAPSED" | "HIDDEN";

export type DestinationType = "SEO_PAGE" | "FUNNEL_DIRECT" | "NONE";

export type SeoStatus = "SEO_PAGE_NOW" | "SEO_PAGE_FUTURE" | "NO_SEO_PAGE";

export type CostGuideStatus =
  | "COST_GUIDE_EXISTS"
  | "COST_GUIDE_FUTURE"
  | "COST_GUIDE_NOT_APPLICABLE";

/**
 * Input editoriale minimo per una TaxonomyIntervention reale (coverage.ts).
 * publicLabel/seoStatus/costGuideStatus NON vanno dichiarati qui: sono derivati da
 * taxonomy + seo-page-map + cost-guide-map in builders.ts, per non duplicare dati
 * che esistono già altrove.
 */
export type InterventionCoverageInput = {
  taxonomyInterventionSlug: string;
  state: CoverageState;
  /** Obbligatorio se la voce non è HIDDEN (vedi deriveVisibility). */
  macroAreaSlug?: string;
  /** Obbligatorio se la voce è HIDDEN. */
  hiddenReason?: string;
  /** Ordine relativo dentro la macro area (più basso = più in evidenza). */
  priority: number;
  /** Candidato SEO_PAGE_FUTURE (OI-029) — non crea nulla, solo traccia l'intento. */
  seoFutureCandidate?: boolean;
  /** Candidato COST_GUIDE_FUTURE (OI-014) — non crea nulla, solo traccia l'intento. */
  costGuideFutureCandidate?: boolean;
};

/** Decisione completa, dopo il merge con taxonomy/seo-page-map/cost-guide-map. */
export type InterventionCoverageDecision = InterventionCoverageInput & {
  publicLabel: string;
  visibility: VisibilityPolicy;
  destinationType: DestinationType;
  seoStatus: SeoStatus;
  costGuideStatus: CostGuideStatus;
};

export type PublicServiceCard = {
  slug: string;
  label: string;
  macroAreaSlug: string;
  destinationType: DestinationType;
  href: string;
  priority: number;
  visibility: VisibilityPolicy;
};

export type PublicServiceMacroArea = {
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
  showInIndex: boolean;
  /** Solo per documentazione/lettura umana — la membership reale viene da coverage.ts. */
  includedDomainSlugs?: readonly string[];
  includedInterventionSlugs?: readonly string[];
};

export type PublicServiceMacroAreaWithItems = PublicServiceMacroArea & {
  items: PublicServiceCard[];
};
