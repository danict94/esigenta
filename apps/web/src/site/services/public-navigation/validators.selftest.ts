/**
 * Self-test del guard di coverage (Phase 19.6H). Nel monorepo non esiste alcun
 * test runner (nessun vitest/jest in nessun package.json) e questa fase non può
 * aggiungerne uno (vietato modificare package.json / inventare script). Questi
 * scenari sintetici verificano che le funzioni pure di validators.ts si comportino
 * correttamente, usando dati fittizi (mai i dati taxonomy reali — quelli sono
 * validati separatamente da assertValidPublicCatalog() su dati reali).
 *
 * Eseguito a module-load: se uno scenario fallisce, il build si interrompe con un
 * errore esplicito che indica quale assunzione sul comportamento del guard è
 * stata violata (stesso principio di un test unitario, senza un runner dedicato).
 */
import {
  findUnclassifiedInterventions,
  findStaleCoverageEntries,
  findSeoPageNowWithoutRoute,
  findCostGuideExistsWithoutRoute,
  findEmptyVisibleMacroAreas,
  findCardsWithoutRealDestination,
} from "./validators";
import type { InterventionCoverageDecision, PublicServiceCard } from "./types";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[public-navigation selftest] ${message}`);
  }
}

function makeDecision(
  overrides: Partial<InterventionCoverageDecision>,
): InterventionCoverageDecision {
  return {
    taxonomyInterventionSlug: "fixture-slug",
    state: "REQUEST_NOW",
    macroAreaSlug: "fixture-area",
    priority: 1,
    publicLabel: "Fixture",
    visibility: "VISIBLE",
    destinationType: "FUNNEL_DIRECT",
    seoStatus: "NO_SEO_PAGE",
    costGuideStatus: "COST_GUIDE_NOT_APPLICABLE",
    ...overrides,
  };
}

function makeCard(overrides: Partial<PublicServiceCard>): PublicServiceCard {
  return {
    slug: "fixture-slug",
    label: "Fixture",
    macroAreaSlug: "fixture-area",
    destinationType: "FUNNEL_DIRECT",
    href: "/richiesta/fixture-slug",
    priority: 1,
    visibility: "VISIBLE",
    ...overrides,
  };
}

function testUnclassifiedInterventionMustFail(): void {
  const result = findUnclassifiedInterventions(
    ["rifare-bagno", "potare-alberi"],
    new Set(["rifare-bagno"]),
  );

  assert(
    result.includes("potare-alberi"),
    "Test 1 failed: an unclassified TaxonomyIntervention must be detected.",
  );
}

function testRealInterventionFullyClassifiedMustPass(): void {
  const result = findUnclassifiedInterventions(
    ["rifare-bagno"],
    new Set(["rifare-bagno"]),
  );

  assert(
    result.length === 0,
    "Test 2 failed: a fully classified intervention must not be flagged.",
  );
}

function testStaleCoverageEntryMustFail(): void {
  const result = findStaleCoverageEntries(
    ["rifare-bagno", "slug-rimosso-da-taxonomy"],
    new Set(["rifare-bagno"]),
  );

  assert(
    result.includes("slug-rimosso-da-taxonomy"),
    "Test 3 failed: a coverage entry pointing to a non-existent intervention must be detected.",
  );
}

function testSeoPageNowWithoutRouteMustFail(): void {
  const decisions = [
    makeDecision({ taxonomyInterventionSlug: "fake-seo-slug", state: "SEO_PAGE_NOW" }),
  ];
  const result = findSeoPageNowWithoutRoute(decisions, new Map());

  assert(
    result.includes("fake-seo-slug"),
    "Test 4 failed: SEO_PAGE_NOW without a matching real landing must be detected.",
  );
}

function testSeoPageNowWithRouteMustPass(): void {
  const decisions = [
    makeDecision({ taxonomyInterventionSlug: "rifare-bagno", state: "SEO_PAGE_NOW" }),
  ];
  const result = findSeoPageNowWithoutRoute(
    decisions,
    new Map([["rifare-bagno", "ristrutturare-bagno"]]),
  );

  assert(
    result.length === 0,
    "Test 5 failed: SEO_PAGE_NOW with a matching real landing must pass.",
  );
}

function testCostGuideExistsWithoutRouteMustFail(): void {
  const decisions = [
    makeDecision({
      taxonomyInterventionSlug: "fake-guide-slug",
      costGuideStatus: "COST_GUIDE_EXISTS",
    }),
  ];
  const result = findCostGuideExistsWithoutRoute(decisions, new Map());

  assert(
    result.includes("fake-guide-slug"),
    "Test 6 failed: COST_GUIDE_EXISTS without a matching real guide must be detected.",
  );
}

function testEmptyVisibleMacroAreaMustFail(): void {
  const result = findEmptyVisibleMacroAreas(
    [{ slug: "area-vuota", showInIndex: true }],
    [makeCard({ macroAreaSlug: "altra-area" })],
  );

  assert(
    result.includes("area-vuota"),
    "Test 7 failed: a showInIndex macro area with zero items must be detected.",
  );
}

function testValidRequestNowCardMustPass(): void {
  const result = findCardsWithoutRealDestination([
    makeCard({ href: "/richiesta/rifare-cucina", destinationType: "FUNNEL_DIRECT" }),
  ]);

  assert(
    result.length === 0,
    "Extra test failed: a valid REQUEST_NOW card with a real /richiesta href must pass.",
  );
}

function testHashHrefMustFail(): void {
  const result = findCardsWithoutRealDestination([
    makeCard({ href: "#", destinationType: "NONE" }),
  ]);

  assert(
    result.length > 0,
    "Extra test failed: href=\"#\" must always be detected as an invalid destination.",
  );
}

export function runPublicCatalogSelfTest(): void {
  testUnclassifiedInterventionMustFail();
  testRealInterventionFullyClassifiedMustPass();
  testStaleCoverageEntryMustFail();
  testSeoPageNowWithoutRouteMustFail();
  testSeoPageNowWithRouteMustPass();
  testCostGuideExistsWithoutRouteMustFail();
  testEmptyVisibleMacroAreaMustFail();
  testValidRequestNowCardMustPass();
  testHashHrefMustFail();
}

runPublicCatalogSelfTest();
