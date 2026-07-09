export type SeoInterventionLanding = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  funnelSlug: string;
  /**
   * ProjectGroup taxonomy di appartenenza (Fase 5). Il breadcrumb linka
   * /servizi/<groupSlug> solo se quel gruppo ha una landing registrata in
   * pages/gruppi; l'appartenenza è validata fail-fast contro la taxonomy
   * da engine/resolve-group-page.ts.
   */
  groupSlug?: string;
  /** Label CTA verso il funnel: mai generica sulla pilota (es. "Richiedi preventivi per il bagno"). */
  requestCtaLabel?: string;
  image: {
    src: string;
    alt: string;
  };
  geoSection: {
    title: string;
    summary: string;
  };
  relatedInterventionSlugs: readonly string[];
  professionalCategorySlugs: readonly string[];
  /**
   * Slug di TaxonomyIntervention reali (Phase 19.8) — lavori specifici
   * richiedibili insieme alla landing principale, mai una pagina SEO dedicata.
   * Solo lo slug: label e validazione esistenza sono risolte da
   * templates/related-funnel-work.tsx leggendo @esigenta/taxonomy, per non
   * duplicare i nomi qui. Mai un TaxonomyService/Category/Domain.
   */
  relatedFunnelWork?: readonly string[];
  guideSlugs?: readonly string[];
  costSlug?: string;
  requestItems: readonly string[];
  /**
   * Fase 5 — blocchi strutturati della landing "forte" (pilota:
   * ristrutturare-bagno). Tutti opzionali: una landing senza questi campi
   * renderizza come prima. Regole editoriali: linguaggio prudente ("può
   * comprendere", "spesso quotati a parte"), MAI numeri, tempi, obblighi o
   * permessi — i prezzi vivono solo in market-data/CostGuide.
   */
  scopeIncluded?: readonly string[];
  scopeExcluded?: readonly string[];
  /** Nota prudente sotto le due liste (es. "ogni preventivo definisce cosa è compreso"). */
  scopeNote?: string;
  /** Livelli/varianti dell'intervento: solo orientamento, i numeri restano nella tabella costi. */
  variants?: readonly { title: string; summary: string }[];
  /** Checklist di cosa preparare prima della richiesta (orientata al funnel). */
  preparationItems?: readonly string[];
  costSection?: {
    title: string;
    summary: string;
    /**
     * Fase 2 — SSOT prezzi: i numeri non vivono qui. `priceRowLabels`
     * seleziona quali righe di `CostGuide.priceRows` mostrare nel riepilogo
     * (risolte da engine/resolve-seo-page.ts leggendo la guida collegata via
     * `costSlug`). Se `costSlug` non punta a una guida reale, il blocco
     * prezzo non viene mostrato: mai un numero inventato in questo file.
     */
    priceRowLabels?: readonly string[];
    factors: readonly string[];
    examples?: readonly string[];
  };
  faq: readonly {
    question: string;
    answer: string;
  }[];
};
