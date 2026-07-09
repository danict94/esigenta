import { listSeoInterventionLandings } from "../pages/interventi";
import { listCostGuides, listIndexableCostGuideCityPages } from "../pages/costi";
import { listSeoGroupLandings } from "../pages/gruppi";

export function getGroupLandingStaticParams(): { groupSlug: string }[] {
  return listSeoGroupLandings().map((landing) => ({
    groupSlug: landing.slug,
  }));
}

export function getInterventionStaticParams(): { interventoSlug: string }[] {
  return listSeoInterventionLandings().map((landing) => ({
    interventoSlug: landing.slug,
  }));
}

export function getCostGuideStaticParams(): { costSlug: string }[] {
  return listCostGuides().map((guide) => ({
    costSlug: guide.slug,
  }));
}

export function getCostGuideCityStaticParams(): {
  costSlug: string;
  citySlug: string;
}[] {
  return listCostGuides().flatMap((guide) =>
    listIndexableCostGuideCityPages(guide.slug).map((cityPage) => ({
      costSlug: guide.slug,
      citySlug: cityPage.citySlug,
    })),
  );
}
