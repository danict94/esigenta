export type {
  ServiceCatalogItem,
  ServiceCatalogStatus,
  ServiceHomeFeature,
} from "./types";

export {
  listServiceCatalogItems,
  getServiceCatalogItemBySlug,
  isPubliclyLinkable,
  listPubliclyLinkableServiceCatalogItems,
  getServiceCatalogItemHref,
  listFeaturedServiceCatalogItems,
} from "./catalog";

// NOTA client-safety: questo barrel è importato anche dalla home (Client Component) —
// non deve mai re-esportare codice che trascini il barrel @esigenta/taxonomy, le cui
// query Prisma/pg non sono bundlabili per il browser. /servizi legge i Group Service
// direttamente da frozenTaxonomySource in services-hub-page.tsx (Server Component),
// non da qui.
