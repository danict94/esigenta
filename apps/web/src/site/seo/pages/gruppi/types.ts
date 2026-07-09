/**
 * Landing di un Group Service (Phase pilota /servizi/ristrutturazioni).
 * Solo editoriale: gli interventi del gruppo vengono SEMPRE dalla taxonomy
 * (frozenTaxonomySource), mai elencati qui. Nessun prezzo: i costi arrivano
 * dalle CostGuide reali via engine/resolve-group-page.ts.
 */
export type SeoGroupLanding = {
  /** Deve esistere come ProjectGroup slug nella frozen taxonomy (fail-fast). */
  slug: string;
  title: string;
  h1: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  /** Titolo della sezione interventi (es. "Cosa puoi ristrutturare"): il tema del gruppo non va hardcodato nel template. */
  interventionsTitle: string;
  /**
   * Intervento in evidenza del gruppo: deve appartenere al gruppo e avere
   * una landing SEO reale (fail-fast) — è il percorso completo
   * landing → costi → funnel mostrato per primo.
   */
  featuredInterventionSlug: string;
  /**
   * 1-2 frasi di orientamento per OGNI intervento del gruppo (chiave = slug
   * taxonomy, fail-fast su slug sconosciuti o mancanti): aiutano a scegliere
   * il percorso giusto. Mai prezzi, tempi o promesse su permessi.
   */
  interventionSummaries: Record<string, string>;
};
