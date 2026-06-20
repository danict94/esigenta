export type {
  CoverageState,
  VisibilityPolicy,
  DestinationType,
  SeoStatus,
  CostGuideStatus,
  InterventionCoverageInput,
  InterventionCoverageDecision,
  PublicServiceCard,
  PublicServiceMacroArea,
  PublicServiceMacroAreaWithItems,
} from "./types";

export { interventionCoverage } from "./coverage";

export {
  listPublicServiceMacroAreas,
  getPublicServiceMacroAreaBySlug,
} from "./macro-areas";

export { buildSeoPageMap, getSeoLandingSlugForIntervention } from "./seo-page-map";
export { buildCostGuideMap, getCostGuidePathForIntervention } from "./cost-guide-map";

export {
  buildInterventionCoverageDecisions,
  buildPublicServiceCards,
  buildPublicServiceMacroAreasWithItems,
} from "./builders";

export {
  validatePublicCatalog,
  assertValidPublicCatalog,
  type PublicCatalogValidationIssue,
} from "./validators";

// Eseguiti a module-load (vedi services-hub-page.tsx per il punto di aggancio
// server-only): se il catalogo pubblico reale non è valido, o se una delle
// funzioni di guard smette di comportarsi come previsto, il build si interrompe
// con un errore leggibile — stesso pattern già in uso da Phase 19.3 per il
// registry SEO_PAGE. ./validators.selftest esegue i propri scenari al proprio
// module-load: basta importarlo per side-effect.
import "./validators.selftest";
import { assertValidPublicCatalog as runGuard } from "./validators";

runGuard();
