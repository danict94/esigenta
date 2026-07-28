import { frozenTaxonomySource } from "@esigenta/taxonomy";

import { RelatedLinkList } from "../../shared/related-link-list";

/**
 * Phase 19.8: pilota "lavori collegati funnel-diretto". Usato solo da
 * intervention-page-template.tsx (server-only, /interventi/[slug]). Non importare
 * questo file da Client Component o dalla home: il barrel pubblico di
 * @esigenta/taxonomy trascina query Prisma/pg non bundlabili per il browser
 * (stesso vincolo di Phase 19.6H).
 */
export type RelatedFunnelWorkProps = {
  title: string;
  taxonomyInterventionSlugs: readonly string[];
};

const interventionsBySlug = new Map(
  frozenTaxonomySource.projectGroups
    .flatMap((projectGroup) => projectGroup.interventions)
    .map((intervention) => [intervention.slug, intervention]),
);

export function RelatedFunnelWork({
  title,
  taxonomyInterventionSlugs,
}: RelatedFunnelWorkProps) {
  if (taxonomyInterventionSlugs.length === 0) {
    return null;
  }

  const items = taxonomyInterventionSlugs.map((slug) => {
    const intervention = interventionsBySlug.get(slug);

    if (!intervention) {
      throw new Error(
        `RelatedFunnelWork: taxonomyInterventionSlug "${slug}" does not exist in ` +
          `@esigenta/taxonomy. Only real frozen Intervention slugs are allowed; ` +
          `never a Category or ProjectGroup slug.`,
      );
    }

    return { key: slug, label: intervention.name, href: `/richiesta/${slug}` };
  });

  return (
    <div>
      <p className="mb-3.5 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-brand) text-[11.5px] uppercase tracking-widest text-eg-brand">
        {title}
      </p>

      <RelatedLinkList items={items} />
    </div>
  );
}
