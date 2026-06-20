import { taxonomySource } from "@esigenta/taxonomy";

import { interventionCoverage } from "./coverage";
import { buildSeoPageMap } from "./seo-page-map";
import { buildCostGuideMap } from "./cost-guide-map";
import { listPublicServiceMacroAreas } from "./macro-areas";
import type {
  CoverageState,
  DestinationType,
  InterventionCoverageDecision,
  InterventionCoverageInput,
  PublicServiceCard,
  PublicServiceMacroAreaWithItems,
  VisibilityPolicy,
} from "./types";

function deriveVisibility(state: CoverageState): VisibilityPolicy {
  switch (state) {
    case "SEO_PAGE_NOW":
    case "REQUEST_NOW":
      return "VISIBLE";
    case "SHOW_IN_COLLAPSED_LIST":
      return "COLLAPSED";
    default:
      return "HIDDEN";
  }
}

function deriveDestinationType(
  state: CoverageState,
  hasSeoPage: boolean,
): DestinationType {
  if (state === "SEO_PAGE_NOW" || state === "REQUEST_NOW" || state === "SHOW_IN_COLLAPSED_LIST") {
    return hasSeoPage ? "SEO_PAGE" : "FUNNEL_DIRECT";
  }

  return "NONE";
}

function deriveHref(
  destinationType: DestinationType,
  taxonomyInterventionSlug: string,
  seoLandingSlug: string | null,
): string {
  if (destinationType === "SEO_PAGE" && seoLandingSlug) {
    return `/interventi/${seoLandingSlug}`;
  }

  if (destinationType === "FUNNEL_DIRECT") {
    return `/richiesta/${taxonomyInterventionSlug}`;
  }

  return "";
}

function buildDecision(
  input: InterventionCoverageInput,
  interventionName: string,
  seoPageMap: ReadonlyMap<string, string>,
  costGuideMap: ReadonlyMap<string, string>,
): InterventionCoverageDecision {
  const seoLandingSlug = seoPageMap.get(input.taxonomyInterventionSlug) ?? null;
  const hasSeoPage = seoLandingSlug !== null;

  const visibility = deriveVisibility(input.state);
  const destinationType = deriveDestinationType(input.state, hasSeoPage);

  const seoStatus = hasSeoPage
    ? "SEO_PAGE_NOW"
    : input.seoFutureCandidate
      ? "SEO_PAGE_FUTURE"
      : "NO_SEO_PAGE";

  const hasCostGuide = costGuideMap.has(input.taxonomyInterventionSlug);
  const costGuideStatus = hasCostGuide
    ? "COST_GUIDE_EXISTS"
    : input.costGuideFutureCandidate
      ? "COST_GUIDE_FUTURE"
      : "COST_GUIDE_NOT_APPLICABLE";

  return {
    ...input,
    publicLabel: interventionName,
    visibility,
    destinationType,
    seoStatus,
    costGuideStatus,
  };
}

export function buildInterventionCoverageDecisions(): readonly InterventionCoverageDecision[] {
  const interventionsBySlug = new Map(
    taxonomySource.interventions.map((intervention) => [
      intervention.slug,
      intervention,
    ]),
  );

  const seoPageMap = buildSeoPageMap();
  const costGuideMap = buildCostGuideMap();

  return interventionCoverage.map((input) => {
    const intervention = interventionsBySlug.get(input.taxonomyInterventionSlug);

    return buildDecision(
      input,
      intervention?.name ?? input.taxonomyInterventionSlug,
      seoPageMap,
      costGuideMap,
    );
  });
}

export function buildPublicServiceCards(
  decisions: readonly InterventionCoverageDecision[] = buildInterventionCoverageDecisions(),
): readonly PublicServiceCard[] {
  const seoPageMap = buildSeoPageMap();

  return decisions
    .filter((decision) => decision.visibility !== "HIDDEN")
    .map((decision) => {
      const seoLandingSlug = seoPageMap.get(decision.taxonomyInterventionSlug) ?? null;

      return {
        slug: decision.taxonomyInterventionSlug,
        label: decision.publicLabel,
        macroAreaSlug: decision.macroAreaSlug ?? "",
        destinationType: decision.destinationType,
        href: deriveHref(
          decision.destinationType,
          decision.taxonomyInterventionSlug,
          seoLandingSlug,
        ),
        priority: decision.priority,
        visibility: decision.visibility,
      };
    });
}

export function buildPublicServiceMacroAreasWithItems(): readonly PublicServiceMacroAreaWithItems[] {
  const cards = buildPublicServiceCards();
  const cardsByMacroArea = new Map<string, PublicServiceCard[]>();

  for (const card of cards) {
    const existing = cardsByMacroArea.get(card.macroAreaSlug) ?? [];
    existing.push(card);
    cardsByMacroArea.set(card.macroAreaSlug, existing);
  }

  return listPublicServiceMacroAreas()
    .map((area) => ({
      ...area,
      items: (cardsByMacroArea.get(area.slug) ?? []).sort(
        (a, b) => a.priority - b.priority,
      ),
    }))
    .filter((area) => area.items.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
