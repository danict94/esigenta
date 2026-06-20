import { getCityBySlug } from "../../../geo/cities";
import { getCitySupport } from "../../../geo/supported-cities";
import { buildCanonicalPath } from "../../../engine/canonical";
import { resolveFamilyPriceRange } from "../../../engine/pricing-resolver";
import type { CostGuide, CostGuideCityPage } from "../types";
import { rifareTettoBase, rifareTettoFamilyKey } from "./base";
import { rifareTettoFaq } from "./faq";
import { rifareTettoLocalOverrides } from "./local-overrides";

const basePriceRange = resolveFamilyPriceRange(rifareTettoFamilyKey);

if (!basePriceRange) {
  throw new Error(`Missing base price range for family "${rifareTettoFamilyKey}"`);
}

const roofCityPages: CostGuideCityPage[] = rifareTettoLocalOverrides.map(
  (override) => {
    const city = getCityBySlug(override.citySlug);
    if (!city) {
      throw new Error(`Unknown city slug "${override.citySlug}" in geo registry`);
    }

    const support = getCitySupport(rifareTettoFamilyKey, override.citySlug);
    if (!support) {
      throw new Error(
        `City "${override.citySlug}" is not registered as supported for family "${rifareTettoFamilyKey}"`,
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
        slug: rifareTettoBase.slug,
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

export const rifareTettoGuide: CostGuide = {
  slug: rifareTettoBase.slug,
  funnelSlug: rifareTettoBase.funnelSlug,
  interventionSeoSlug: rifareTettoBase.interventionSeoSlug,
  title: rifareTettoBase.title,
  h1: rifareTettoBase.h1,
  metaTitle: rifareTettoBase.metaTitle,
  metaDescription: rifareTettoBase.metaDescription,
  canonicalPath: buildCanonicalPath({
    family: "costGuide",
    slug: rifareTettoBase.slug,
  }),
  heroImage: rifareTettoBase.heroImage,
  hubCategory: rifareTettoBase.hubCategory,
  topicLabel: rifareTettoBase.topicLabel,
  summary: rifareTettoBase.summary,
  nationalRange: basePriceRange.nationalRange,
  pricePerSquareMeter: basePriceRange.pricePerSquareMeter,
  priceRows: [...basePriceRange.priceRows],
  sizeExamples: [...basePriceRange.sizeExamples],
  citySections: roofCityPages.map((cityPage) => ({
    city: cityPage.city,
    title: cityPage.h1,
    summary: cityPage.summary,
    localReading: cityPage.localReading,
    typicalCases: cityPage.typicalCases,
    factors: cityPage.localFactors,
  })),
  cityPages: roofCityPages,
  factors: rifareTettoBase.factors,
  savingTips: rifareTettoBase.savingTips,
  faq: rifareTettoFaq,
};
