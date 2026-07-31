import { frozenTaxonomySource } from "@esigenta/taxonomy";

import { getCityBySlug } from "../geo/cities";
import { getCitySupport } from "../geo/supported-cities";
import { buildCanonicalPath } from "./canonical";
import { resolveFamilyPriceRange } from "./pricing-resolver";
import { isIndexableCityPage } from "./geo-policy";
import type {
  CityLocalOverride,
  CostGuide,
  CostGuideBaseContent,
  CostGuideCityPage,
} from "../pages/costi/types";

// Server-only (stesso vincolo del barrel @esigenta/taxonomy in
// related-funnel-work.tsx): mai importare questo modulo da un Client
// Component o dalla home.
const taxonomyInterventionSlugs = new Set(
  frozenTaxonomySource.projectGroups.flatMap((projectGroup) =>
    projectGroup.interventions.map((intervention) => intervention.slug),
  ),
);

export type ComposeCostGuideInput = {
  base: CostGuideBaseContent;
  faq: CostGuide["faq"];
  localOverrides: readonly CityLocalOverride[];
};

/**
 * Fase 3 — unico composer per tutte le famiglie guida costi: i content.ts
 * per famiglia non contengono più logica copiata, solo questa chiamata con
 * i tre file di contenuto. La familyKey è derivata dallo slug
 * ("costGuide:<slug>"), quindi non può divergere dal registry per typo nel
 * content.ts: un disallineamento con market-data/supported-cities fallisce
 * qui sotto, a build-time.
 */
export function composeCostGuide(input: ComposeCostGuideInput): CostGuide {
  const { base, faq, localOverrides } = input;
  const familyKey = `costGuide:${base.slug}`;

  // pricingTeaser: guida deliberatamente senza prezzi ancora (in attesa di
  // verifica su prezzari ufficiali). Nessuna lookup in market-data, nessuna
  // voce richiesta lì — il template mostra il teaser al posto di Sintesi
  // numerica e Tabella prezzi. Guide senza questo campo (bagno, rifare-tetto,
  // impermeabilizzare-tetto) passano dal ramo esistente sotto, invariato.
  const pricing = base.pricingTeaser
    ? {
        nationalRange: undefined,
        pricePerSquareMeter: undefined,
        priceRows: [],
        sourceLabel: undefined,
        sourceYear: undefined,
        sizeExamples: [],
      }
    : (() => {
        const basePriceRange = resolveFamilyPriceRange(familyKey);

        if (!basePriceRange) {
          throw new Error(`Missing base price range for family "${familyKey}"`);
        }

        if (basePriceRange.priceRows.length === 0) {
          throw new Error(
            `Cost guide "${base.slug}" has an empty price table in market-data: ` +
              `a cost page must never be published without real price rows`,
          );
        }

        return {
          nationalRange: basePriceRange.nationalRange,
          pricePerSquareMeter: basePriceRange.pricePerSquareMeter,
          priceRows: [...basePriceRange.priceRows],
          sourceLabel: basePriceRange.sourceLabel,
          sourceYear: basePriceRange.sourceYear,
          sizeExamples: [...basePriceRange.sizeExamples],
        };
      })();

  for (const item of base.relatedWork ?? []) {
    if (!taxonomyInterventionSlugs.has(item.slug)) {
      throw new Error(
        `Cost guide "${base.slug}" declares relatedWork slug "${item.slug}" ` +
          `which does not exist in @esigenta/taxonomy. Only real frozen ` +
          `Intervention slugs are allowed; never a Category or ProjectGroup slug.`,
      );
    }
  }

  const cityPages: CostGuideCityPage[] = localOverrides.map((override) => {
    const city = getCityBySlug(override.citySlug);
    if (!city) {
      throw new Error(
        `Unknown city slug "${override.citySlug}" in geo registry`,
      );
    }

    const support = getCitySupport(familyKey, override.citySlug);
    if (!support) {
      throw new Error(
        `City "${override.citySlug}" is not registered as supported for family "${familyKey}"`,
      );
    }

    const cityPage: CostGuideCityPage = {
      city: city.name,
      citySlug: city.slug,
      seoEnabled: support.seoEnabled,
      contentStatus: support.contentStatus,
      uniquenessLevel: support.uniquenessLevel,
      title: override.title,
      h1: override.h1,
      metaTitle: override.metaTitle,
      metaDescription: override.metaDescription,
      canonicalPath: buildCanonicalPath({
        family: "costGuide",
        slug: base.slug,
        citySlug: city.slug,
      }),
      summary: override.summary,
      localReading: override.localReading,
      priceInterpretation: override.priceInterpretation,
      typicalCases: override.typicalCases,
      localFactors: override.localFactors,
      whenPriceGoesUp: override.whenPriceGoesUp,
      whatToAskInQuote: override.whatToAskInQuote,
      faq: override.faq,
    };

    // I flag del registry dichiarano la città pubblicabile ma la policy
    // (contenuto locale reale) la boccerebbe: contraddizione tra registry e
    // contenuto, non una pagina "silenziosamente non generata".
    const flagsSayIndexable =
      support.seoEnabled &&
      support.contentStatus === "ready" &&
      support.uniquenessLevel !== "thin";

    if (flagsSayIndexable && !isIndexableCityPage(cityPage)) {
      throw new Error(
        `City "${override.citySlug}" of family "${familyKey}" is flagged as ` +
          `indexable in geo/supported-cities.ts but has no real local content ` +
          `(localReading and at least one FAQ are required)`,
      );
    }

    return cityPage;
  });

  return {
    slug: base.slug,
    funnelSlug: base.funnelSlug,
    interventionSeoSlug: base.interventionSeoSlug,
    title: base.title,
    h1: base.h1,
    metaTitle: base.metaTitle,
    metaDescription: base.metaDescription,
    canonicalPath: buildCanonicalPath({
      family: "costGuide",
      slug: base.slug,
    }),
    heroImage: base.heroImage,
    hubCategory: base.hubCategory,
    topicLabel: base.topicLabel,
    summary: base.summary,
    ...pricing,
    citySections: cityPages.map((cityPage) => ({
      city: cityPage.city,
      title: cityPage.h1,
      summary: cityPage.summary,
      localReading: cityPage.localReading,
      typicalCases: cityPage.typicalCases,
      factors: cityPage.localFactors,
    })),
    cityPages,
    factors: base.factors,
    savingTips: base.savingTips,
    faq,
    relatedWork: base.relatedWork,
    priceTableNote: base.priceTableNote,
    priceTableIntro: base.priceTableIntro,
    nationalRangeLabel: base.nationalRangeLabel,
    pricingTeaser: base.pricingTeaser,
    hubDescription: base.hubDescription,
    hubOrder: base.hubOrder,
    hubExcluded: base.hubExcluded,
    hubBadge: base.hubBadge,
  };
}
