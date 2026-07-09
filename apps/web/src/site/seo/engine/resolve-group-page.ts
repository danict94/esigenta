import { frozenTaxonomySource } from "@esigenta/taxonomy";

import {
  getSeoGroupLandingBySlug,
  type SeoGroupLanding,
} from "../pages/gruppi";
import { getSeoInterventionLandingBySlug } from "../pages/interventi";
import { getCostGuideBySlug } from "../pages/costi";
import { resolveCostGuideHrefForIntervention } from "./resolve-seo-page";

export type GroupInterventionItem = {
  slug: string;
  name: string;
  /** Orientamento editoriale da interventionSummaries (obbligatoria per ogni intervento del gruppo). */
  summary: string;
  landingHref: string | null;
  requestHref: string;
  costGuideHref: string | null;
  /** nationalRange della CostGuide reale (market-data), mai una stringa scritta qui. */
  costRange: string | null;
};

export type FeaturedGroupIntervention = GroupInterventionItem & {
  /** Intro della landing SEO reale (garantita dal fail-fast sul featured). */
  landingDescription: string;
};

export type GroupLandingPageData = {
  content: SeoGroupLanding;
  interventions: GroupInterventionItem[];
  featured: FeaturedGroupIntervention;
  professionalCategories: { slug: string; name: string; href: string }[];
};

/**
 * Server-only (importa @esigenta/taxonomy come related-funnel-work.tsx: mai
 * da Client Component). Ritorna null per slug non registrati (→ notFound),
 * ma fallisce il build per contenuto registrato incoerente: gruppo
 * inesistente in taxonomy, featured fuori dal gruppo o senza landing reale.
 */
export function resolveGroupLandingPage(
  slug: string,
): GroupLandingPageData | null {
  const content = getSeoGroupLandingBySlug(slug);
  if (!content) return null;

  const group = frozenTaxonomySource.projectGroups.find(
    (projectGroup) => projectGroup.slug === content.slug,
  );

  if (!group) {
    throw new Error(
      `SeoGroupLanding "${content.slug}" does not match any ProjectGroup in the frozen taxonomy`,
    );
  }

  const groupInterventionSlugs = new Set(
    group.interventions.map((intervention) => intervention.slug),
  );

  for (const summarySlug of Object.keys(content.interventionSummaries)) {
    if (!groupInterventionSlugs.has(summarySlug)) {
      throw new Error(
        `SeoGroupLanding "${content.slug}" has an interventionSummaries entry ` +
          `for "${summarySlug}" which is not an intervention of that group`,
      );
    }
  }

  const interventions: GroupInterventionItem[] = group.interventions.map(
    (intervention) => {
      const summary = content.interventionSummaries[intervention.slug];

      if (!summary) {
        throw new Error(
          `SeoGroupLanding "${content.slug}" is missing an interventionSummaries ` +
            `entry for "${intervention.slug}": every intervention of the group ` +
            `needs a real orientation summary, never an empty row`,
        );
      }

      const landing = getSeoInterventionLandingBySlug(intervention.slug);
      const costGuideHref = landing
        ? resolveCostGuideHrefForIntervention(landing.costSlug)
        : null;
      const guide =
        landing && costGuideHref && landing.costSlug
          ? getCostGuideBySlug(landing.costSlug)
          : null;

      return {
        slug: intervention.slug,
        name: intervention.name,
        summary,
        landingHref: landing ? `/interventi/${landing.slug}` : null,
        requestHref: `/richiesta/${intervention.slug}`,
        costGuideHref,
        costRange: guide?.nationalRange ?? null,
      };
    },
  );

  const featuredItem = interventions.find(
    (item) => item.slug === content.featuredInterventionSlug,
  );

  if (!featuredItem) {
    throw new Error(
      `SeoGroupLanding "${content.slug}" declares featuredInterventionSlug ` +
        `"${content.featuredInterventionSlug}" which is not an intervention of that group`,
    );
  }

  const featuredLanding = getSeoInterventionLandingBySlug(featuredItem.slug);

  if (!featuredItem.landingHref || !featuredLanding) {
    throw new Error(
      `SeoGroupLanding "${content.slug}" featured intervention ` +
        `"${content.featuredInterventionSlug}" has no SEO landing: the featured ` +
        `path must link a real /interventi page, pick a different intervention`,
    );
  }

  const featured: FeaturedGroupIntervention = {
    ...featuredItem,
    landingDescription: featuredLanding.description,
  };

  const professionalCategories = frozenTaxonomySource.categories
    .filter((category) => category.projectGroups.includes(content.slug))
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      href: `/professionisti/${category.slug}`,
    }));

  return { content, interventions, featured, professionalCategories };
}
