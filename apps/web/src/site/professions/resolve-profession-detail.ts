import {
  getPublicProfessionDetail,
  type PublicProfessionDetail,
} from "@esigenta/taxonomy/public-professions";

import { getSeoGroupLandingBySlug } from "../seo/pages/gruppi";
import {
  resolveCostGuidePage,
  resolveInterventionPage,
} from "../seo/engine/resolve-seo-page";

export type ProfessionDetailInterventionViewModel = {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly requestHref: string;
  readonly landingHref: string | null;
  readonly costGuideHref: string | null;
};

export type ProfessionDetailGroupViewModel = {
  readonly slug: string;
  readonly name: string;
  readonly href: string;
  readonly interventions: readonly ProfessionDetailInterventionViewModel[];
};

export type ProfessionDetailViewModel = {
  readonly category: PublicProfessionDetail["category"];
  readonly groups: readonly ProfessionDetailGroupViewModel[];
};

type ProfessionEditorialGroup = {
  readonly slug: string;
  readonly interventionSummaries: Readonly<Record<string, string>>;
};

type ProfessionInterventionLanding = {
  readonly slug: string;
  readonly costSlug?: string;
};

type ProfessionCostGuide = {
  readonly slug: string;
  readonly interventionSeoSlug: string;
};

export type ProfessionDetailComposerDependencies = {
  readonly getEditorialGroup: (
    slug: string,
  ) => ProfessionEditorialGroup | null;
  readonly getPublishedInterventionLanding: (
    slug: string,
  ) => ProfessionInterventionLanding | null;
  readonly getPublishedCostGuide: (
    slug: string,
  ) => ProfessionCostGuide | null;
};

const publicComposerDependencies: ProfessionDetailComposerDependencies = {
  getEditorialGroup: getSeoGroupLandingBySlug,
  getPublishedInterventionLanding: resolveInterventionPage,
  getPublishedCostGuide: resolveCostGuidePage,
};

/**
 * Web-layer composer: the public frozen detail owns category/group/work
 * membership and ordering, while the existing editorial registries only add
 * summaries and destinations that are actually published.
 */
export function composeProfessionDetailViewModel(
  detail: PublicProfessionDetail,
  dependencies: ProfessionDetailComposerDependencies,
): ProfessionDetailViewModel {
  return {
    category: detail.category,
    groups: detail.projectGroups.map((group) => {
      const editorialGroup = dependencies.getEditorialGroup(group.slug);

      if (!editorialGroup) {
        throw new Error(
          `[profession:${detail.category.slug}] Missing editorial ProjectGroup: ${group.slug}`,
        );
      }

      if (editorialGroup.slug !== group.slug) {
        throw new Error(
          `[profession:${detail.category.slug}] Editorial ProjectGroup mismatch: expected ${group.slug}, received ${editorialGroup.slug}`,
        );
      }

      return {
        slug: group.slug,
        name: group.name,
        href: `/servizi/${group.slug}`,
        interventions: group.interventions.map((intervention) => {
          const summary = editorialGroup.interventionSummaries[intervention.slug];

          if (!summary?.trim()) {
            throw new Error(
              `[profession:${detail.category.slug}] Missing editorial summary for Intervention: ${intervention.slug}`,
            );
          }

          const landing =
            dependencies.getPublishedInterventionLanding(intervention.slug);

          if (landing && landing.slug !== intervention.slug) {
            throw new Error(
              `[profession:${detail.category.slug}] Intervention landing mismatch: expected ${intervention.slug}, received ${landing.slug}`,
            );
          }

          let costGuideHref: string | null = null;

          if (landing?.costSlug) {
            const costGuide = dependencies.getPublishedCostGuide(
              landing.costSlug,
            );

            if (costGuide) {
              if (costGuide.slug !== landing.costSlug) {
                throw new Error(
                  `[profession:${detail.category.slug}] Cost guide mismatch: expected ${landing.costSlug}, received ${costGuide.slug}`,
                );
              }

              if (costGuide.interventionSeoSlug !== intervention.slug) {
                throw new Error(
                  `[profession:${detail.category.slug}] Cost guide ${costGuide.slug} belongs to ${costGuide.interventionSeoSlug}, not ${intervention.slug}`,
                );
              }

              costGuideHref = `/costi/${costGuide.slug}`;
            }
          }

          return {
            slug: intervention.slug,
            name: intervention.name,
            summary,
            requestHref: `/richiesta/${intervention.slug}`,
            landingHref: landing
              ? `/interventi/${landing.slug}`
              : null,
            costGuideHref,
          };
        }),
      };
    }),
  };
}

export function resolveProfessionDetailViewModel(
  categorySlug: string,
): ProfessionDetailViewModel | null {
  const detail = getPublicProfessionDetail(categorySlug);

  return detail
    ? composeProfessionDetailViewModel(detail, publicComposerDependencies)
    : null;
}
