import { getCityBySlug } from "../../../geo/cities";
import { getCitySupport } from "../../../geo/supported-cities";
import { buildCanonicalPath } from "../../../engine/canonical";
import { resolveFamilyPriceRange } from "../../../engine/pricing-resolver";
import type { CostGuide, CostGuideCityPage } from "../types";
import {
  ristrutturareBagnoBase,
  ristrutturareBagnoFamilyKey,
} from "./base";
import { ristrutturareBagnoFaq } from "./faq";
import { ristrutturareBagnoLocalOverrides } from "./local-overrides";

const basePriceRange = resolveFamilyPriceRange(ristrutturareBagnoFamilyKey);

if (!basePriceRange) {
  throw new Error(
    `Missing base price range for family "${ristrutturareBagnoFamilyKey}"`,
  );
}

const bathroomCityPages: CostGuideCityPage[] = ristrutturareBagnoLocalOverrides.map(
  (override) => {
    const city = getCityBySlug(override.citySlug);
    if (!city) {
      throw new Error(`Unknown city slug "${override.citySlug}" in geo registry`);
    }

    const support = getCitySupport(ristrutturareBagnoFamilyKey, override.citySlug);
    if (!support) {
      throw new Error(
        `City "${override.citySlug}" is not registered as supported for family "${ristrutturareBagnoFamilyKey}"`,
      );
    }

    return {
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
        slug: ristrutturareBagnoBase.slug,
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
  },
);

export const ristrutturareBagnoGuide: CostGuide = {
  slug: ristrutturareBagnoBase.slug,
  funnelSlug: ristrutturareBagnoBase.funnelSlug,
  interventionSeoSlug: ristrutturareBagnoBase.interventionSeoSlug,
  title: ristrutturareBagnoBase.title,
  h1: ristrutturareBagnoBase.h1,
  metaTitle: ristrutturareBagnoBase.metaTitle,
  metaDescription: ristrutturareBagnoBase.metaDescription,
  canonicalPath: buildCanonicalPath({
    family: "costGuide",
    slug: ristrutturareBagnoBase.slug,
  }),
  heroImage: ristrutturareBagnoBase.heroImage,
  hubCategory: ristrutturareBagnoBase.hubCategory,
  topicLabel: ristrutturareBagnoBase.topicLabel,
  summary: ristrutturareBagnoBase.summary,
  nationalRange: basePriceRange.nationalRange,
  pricePerSquareMeter: basePriceRange.pricePerSquareMeter,
  priceRows: [...basePriceRange.priceRows],
  sizeExamples: [...basePriceRange.sizeExamples],
  citySections: bathroomCityPages.map((cityPage) => ({
    city: cityPage.city,
    title: cityPage.h1,
    summary: cityPage.summary,
    localReading: cityPage.localReading,
    typicalCases: cityPage.typicalCases,
    factors: cityPage.localFactors,
  })),
  cityPages: bathroomCityPages,
  factors: ristrutturareBagnoBase.factors,
  savingTips: ristrutturareBagnoBase.savingTips,
  faq: ristrutturareBagnoFaq,
};
