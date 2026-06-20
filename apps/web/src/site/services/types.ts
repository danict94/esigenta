export type ServiceCatalogStatus =
  | "SEO_PAGE"
  | "FUNNEL_ONLY"
  | "PLANNED"
  | "HIDDEN";

export type ServiceCategory = {
  slug: string;
  title: string;
  description?: string;
  order: number;
};

/**
 * Copy/marketing per la vetrina home — solo dati di presentazione, mai usata per
 * decidere indicizzabilità o destinazione (quella resta su status/seoInterventionSlug/
 * funnelSlug). `icon` è una chiave logica risolta dalla UI, non un componente.
 */
export type ServiceHomeFeature = {
  description: string;
  image: string;
  icon: string;
  order: number;
};

export type ServiceCatalogItem = {
  slug: string;
  title: string;
  description?: string;
  categorySlug: string;
  status: ServiceCatalogStatus;
  /** Slug della landing SEO in site/seo/pages/interventi, solo per status SEO_PAGE. */
  seoInterventionSlug?: string;
  /** Slug del funnel /richiesta/[funnelSlug], per SEO_PAGE e FUNNEL_ONLY. */
  funnelSlug?: string;
  /** Sotto-servizio/task selezionabile dentro il funnel, per FUNNEL_ONLY granulari. */
  taskSlug?: string;
  /** Presente solo se la voce è in evidenza in home. Richiede status pubblicamente linkabile. */
  homeFeature?: ServiceHomeFeature;
  order: number;
};
