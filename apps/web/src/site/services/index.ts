export type {
  ServiceCatalogItem,
  ServiceCatalogStatus,
  ServiceCategory,
  ServiceHomeFeature,
} from "./types";

export { listServiceCategories, getServiceCategoryBySlug } from "./categories";

export {
  listServiceCatalogItems,
  getServiceCatalogItemBySlug,
  listServiceCatalogItemsByCategory,
  listVisibleServiceCatalogItemsByCategory,
  isPubliclyLinkable,
  listPubliclyLinkableServiceCatalogItems,
  getServiceCatalogItemHref,
  listFeaturedServiceCatalogItems,
} from "./catalog";

// NOTA (Phase 19.6H): public-navigation/** NON viene re-esportato da questo barrel.
// site/services/index.ts è importato anche da professional-areas.tsx (Client
// Component, home), e public-navigation/builders.ts importa taxonomySource da
// @esigenta/taxonomy, il cui barrel pubblico trascina anche query Prisma/pg — non
// bundlabile per il browser. Il guard viene invece eseguito da un punto
// esclusivamente server-side (site/services/services-hub-page.tsx), per non
// rompere il build della home. Vedi public-navigation/index.ts per l'API completa.
