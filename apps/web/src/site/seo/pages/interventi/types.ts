export type SeoInterventionLanding = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  funnelSlug: string;
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
  costSection?: {
    title: string;
    summary: string;
    priceRange?: string;
    priceRows?: readonly {
      label: string;
      range: string;
      note: string;
    }[];
    factors: readonly string[];
    examples?: readonly string[];
  };
  faq: readonly {
    question: string;
    answer: string;
  }[];
};
