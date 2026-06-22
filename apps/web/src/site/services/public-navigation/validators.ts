import { frozenTaxonomySource } from "@esigenta/taxonomy";

import { interventionCoverage } from "./coverage";
import { getPublicServiceMacroAreaBySlug } from "./macro-areas";
import { buildSeoPageMap } from "./seo-page-map";
import { buildCostGuideMap } from "./cost-guide-map";
import { buildInterventionCoverageDecisions, buildPublicServiceCards } from "./builders";
import type { InterventionCoverageDecision, PublicServiceCard } from "./types";

/** Guard 1 — ogni TaxonomyIntervention reale deve avere una decisione di coverage. */
export function findUnclassifiedInterventions(
  taxonomyInterventionSlugs: readonly string[],
  coverageSlugs: ReadonlySet<string>,
): string[] {
  return taxonomyInterventionSlugs.filter((slug) => !coverageSlugs.has(slug));
}

/** Guard 2 — ogni decisione di coverage deve puntare a un intervento taxonomy reale. */
export function findStaleCoverageEntries(
  coverageSlugs: readonly string[],
  taxonomyInterventionSlugs: ReadonlySet<string>,
): string[] {
  return coverageSlugs.filter((slug) => !taxonomyInterventionSlugs.has(slug));
}

/** Guard 3 — ogni item non HIDDEN deve avere una macro area. */
export function findVisibleWithoutMacroArea(
  decisions: readonly InterventionCoverageDecision[],
): string[] {
  return decisions
    .filter((decision) => decision.visibility !== "HIDDEN" && !decision.macroAreaSlug)
    .map((decision) => decision.taxonomyInterventionSlug);
}

/** Guard 3b — ogni item HIDDEN deve avere un motivo esplicito. */
export function findHiddenWithoutReason(
  decisions: readonly InterventionCoverageDecision[],
): string[] {
  return decisions
    .filter((decision) => decision.visibility === "HIDDEN" && !decision.hiddenReason)
    .map((decision) => decision.taxonomyInterventionSlug);
}

/** Guard 4 — ogni macro area referenziata deve esistere. */
export function findUnknownMacroAreaReferences(
  decisions: readonly InterventionCoverageDecision[],
): string[] {
  return decisions
    .filter(
      (decision) =>
        decision.macroAreaSlug && !getPublicServiceMacroAreaBySlug(decision.macroAreaSlug),
    )
    .map((decision) => `${decision.taxonomyInterventionSlug} -> ${decision.macroAreaSlug}`);
}

/** Guard 5 — ogni card visibile/collassata deve avere una destinazione reale (no href="", no "#"). */
export function findCardsWithoutRealDestination(
  cards: readonly PublicServiceCard[],
): string[] {
  return cards
    .filter(
      (card) =>
        card.destinationType === "NONE" ||
        !card.href ||
        card.href === "#" ||
        !/^\/(interventi|richiesta)\//.test(card.href),
    )
    .map((card) => card.slug);
}

/**
 * Guard 6 — SEO_PAGE_NOW (coverage.ts `state`, autorato a mano) deve corrispondere
 * a una landing /interventi/[slug] reale (seo-page-map.ts, derivato). Cattura il
 * caso in cui coverage.ts dichiara SEO_PAGE_NOW per uno slug senza landing reale.
 */
export function findSeoPageNowWithoutRoute(
  decisions: readonly InterventionCoverageDecision[],
  seoPageMap: ReadonlyMap<string, string>,
): string[] {
  return decisions
    .filter((decision) => decision.state === "SEO_PAGE_NOW")
    .filter((decision) => !seoPageMap.has(decision.taxonomyInterventionSlug))
    .map((decision) => decision.taxonomyInterventionSlug);
}

/**
 * Guard 6b (drift) — se esiste una landing SEO reale per uno slug ma coverage.ts
 * non lo classifica come SEO_PAGE_NOW, la coverage è andata fuori sincrono (es.
 * una nuova landing creata senza aggiornare coverage.ts). Specifico per questo
 * design (seoStatus è derivato, mai autorato): senza questo guard una landing
 * nuova resterebbe silenziosamente REQUEST_NOW/COLLAPSED invece di SEO_PAGE_NOW.
 */
export function findRealSeoPagesNotMarkedSeoPageNow(
  decisions: readonly InterventionCoverageDecision[],
  seoPageMap: ReadonlyMap<string, string>,
): string[] {
  const stateBySlug = new Map(
    decisions.map((decision) => [decision.taxonomyInterventionSlug, decision.state]),
  );

  return [...seoPageMap.keys()].filter(
    (slug) => stateBySlug.get(slug) !== "SEO_PAGE_NOW",
  );
}

/**
 * Guard 7 — COST_GUIDE_EXISTS è sempre derivato da cost-guide-map.ts (mai
 * autorato a mano), quindi è per costruzione coerente con la route reale. Questo
 * guard resta in difesa: se in futuro il campo diventasse autorabile, fallisce
 * comunque su un disallineamento.
 */
export function findCostGuideExistsWithoutRoute(
  decisions: readonly InterventionCoverageDecision[],
  costGuideMap: ReadonlyMap<string, string>,
): string[] {
  return decisions
    .filter((decision) => decision.costGuideStatus === "COST_GUIDE_EXISTS")
    .filter((decision) => !costGuideMap.has(decision.taxonomyInterventionSlug))
    .map((decision) => decision.taxonomyInterventionSlug);
}

/** Guard 8 — nessuna macro area "in indice" deve restare vuota dopo il filtro coverage. */
export function findEmptyVisibleMacroAreas(
  macroAreaSlugs: readonly { slug: string; showInIndex: boolean }[],
  cards: readonly PublicServiceCard[],
): string[] {
  const macroAreasWithItems = new Set(cards.map((card) => card.macroAreaSlug));

  return macroAreaSlugs
    .filter((area) => area.showInIndex && !macroAreasWithItems.has(area.slug))
    .map((area) => area.slug);
}

/** Guard 9 — nessun intervento può comparire in più di una macro area senza override esplicito. */
export function findDuplicateInterventionAcrossMacroAreas(
  decisions: readonly InterventionCoverageDecision[],
): string[] {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const decision of decisions) {
    if (!decision.macroAreaSlug) continue;

    const existing = seen.get(decision.taxonomyInterventionSlug);

    if (existing && existing !== decision.macroAreaSlug) {
      duplicates.push(decision.taxonomyInterventionSlug);
    }

    seen.set(decision.taxonomyInterventionSlug, decision.macroAreaSlug);
  }

  return duplicates;
}

export type PublicCatalogValidationIssue = {
  code: string;
  message: string;
};

export function validatePublicCatalog(): PublicCatalogValidationIssue[] {
  const issues: PublicCatalogValidationIssue[] = [];

  const taxonomyInterventionSlugs = frozenTaxonomySource.projectGroups
    .flatMap((projectGroup) => projectGroup.interventions)
    .map((intervention) => intervention.slug);
  const taxonomyInterventionSlugSet = new Set(taxonomyInterventionSlugs);
  const coverageSlugs = interventionCoverage.map((input) => input.taxonomyInterventionSlug);
  const coverageSlugSet = new Set(coverageSlugs);

  const unclassified = findUnclassifiedInterventions(
    taxonomyInterventionSlugs,
    coverageSlugSet,
  );
  for (const slug of unclassified) {
    issues.push({
      code: "UNCLASSIFIED_INTERVENTION",
      message:
        `TaxonomyIntervention "${slug}" is unclassified in public catalog coverage. ` +
        `Choose: macroAreaSlug, visibility, destinationType, seoStatus, costGuideStatus.`,
    });
  }

  const stale = findStaleCoverageEntries(coverageSlugs, taxonomyInterventionSlugSet);
  for (const slug of stale) {
    issues.push({
      code: "STALE_COVERAGE_ENTRY",
      message: `Coverage entry "${slug}" does not match any real TaxonomyIntervention.`,
    });
  }

  if (unclassified.length > 0 || stale.length > 0) {
    // Le verifiche successive presuppongono coverage/taxonomy allineati: se non lo
    // sono, fermarsi qui evita errori derivati confusi.
    return issues;
  }

  const decisions = buildInterventionCoverageDecisions();
  const cards = buildPublicServiceCards(decisions);

  for (const slug of findVisibleWithoutMacroArea(decisions)) {
    issues.push({
      code: "VISIBLE_WITHOUT_MACRO_AREA",
      message: `Intervention "${slug}" is not HIDDEN but has no macroAreaSlug.`,
    });
  }

  for (const slug of findHiddenWithoutReason(decisions)) {
    issues.push({
      code: "HIDDEN_WITHOUT_REASON",
      message: `Intervention "${slug}" is HIDDEN but has no hiddenReason.`,
    });
  }

  for (const reference of findUnknownMacroAreaReferences(decisions)) {
    issues.push({
      code: "UNKNOWN_MACRO_AREA",
      message: `Coverage reference "${reference}" points to a macro area that does not exist.`,
    });
  }

  for (const slug of findCardsWithoutRealDestination(cards)) {
    issues.push({
      code: "MISSING_REAL_DESTINATION",
      message: `Public card "${slug}" is visible/collapsed but has no real destination.`,
    });
  }

  const seoPageMap = buildSeoPageMap();

  for (const slug of findSeoPageNowWithoutRoute(decisions, seoPageMap)) {
    issues.push({
      code: "SEO_PAGE_NOW_WITHOUT_ROUTE",
      message: `Intervention "${slug}" has state SEO_PAGE_NOW in coverage.ts but no real /interventi/[slug] landing was found.`,
    });
  }

  for (const slug of findRealSeoPagesNotMarkedSeoPageNow(decisions, seoPageMap)) {
    issues.push({
      code: "REAL_SEO_PAGE_NOT_TRACKED",
      message: `A real SEO landing exists for "${slug}" but coverage.ts does not classify it as SEO_PAGE_NOW (coverage drifted out of sync).`,
    });
  }

  const costGuideMap = buildCostGuideMap();

  for (const slug of findCostGuideExistsWithoutRoute(decisions, costGuideMap)) {
    issues.push({
      code: "COST_GUIDE_EXISTS_WITHOUT_ROUTE",
      message: `Intervention "${slug}" is COST_GUIDE_EXISTS but no real /costi/[slug] guide was found.`,
    });
  }

  const macroAreaDescriptors = [...new Set(decisions.map((d) => d.macroAreaSlug))]
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => getPublicServiceMacroAreaBySlug(slug))
    .filter((area): area is NonNullable<typeof area> => area !== null);

  for (const slug of findEmptyVisibleMacroAreas(macroAreaDescriptors, cards)) {
    issues.push({
      code: "EMPTY_VISIBLE_MACRO_AREA",
      message: `Macro area "${slug}" has showInIndex=true but no visible/collapsed item.`,
    });
  }

  for (const slug of findDuplicateInterventionAcrossMacroAreas(decisions)) {
    issues.push({
      code: "DUPLICATE_MACRO_AREA_ASSIGNMENT",
      message: `Intervention "${slug}" is assigned to more than one macro area.`,
    });
  }

  return issues;
}

export function assertValidPublicCatalog(): void {
  const issues = validatePublicCatalog();

  if (issues.length === 0) {
    return;
  }

  const formatted = issues.map((issue) => `  [${issue.code}] ${issue.message}`).join("\n");

  throw new Error(
    `Public services catalog coverage is invalid (${issues.length} issue(s)):\n${formatted}`,
  );
}
