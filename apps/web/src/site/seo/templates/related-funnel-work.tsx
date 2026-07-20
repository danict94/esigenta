import Link from "next/link";

import { frozenTaxonomySource } from "@esigenta/taxonomy";

/**
 * Phase 19.8: pilota "lavori collegati funnel-diretto". Usato solo da
 * intervention-page-template.tsx (server-only, /interventi/[slug]). Non importare
 * questo file da Client Component o dalla home: il barrel pubblico di
 * @esigenta/taxonomy trascina query Prisma/pg non bundlabili per il browser
 * (stesso vincolo di Phase 19.6H).
 */
export type RelatedFunnelWorkProps = {
  taxonomyInterventionSlugs: readonly string[];
};

const interventionsBySlug = new Map(
  frozenTaxonomySource.projectGroups
    .flatMap((projectGroup) => projectGroup.interventions)
    .map((intervention) => [intervention.slug, intervention]),
);

export function RelatedFunnelWork({
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

    return { slug, label: intervention.name };
  });

  return (
    <section aria-labelledby="lavori-collegati-title">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="eg-eyebrow">Lavori collegati</p>

        <h2 id="lavori-collegati-title" className="eg-h2 mt-4">
          Lavori che puoi richiedere insieme
        </h2>

        <p className="eg-body-muted mx-auto mt-5 max-w-[46ch]">
          Collegamenti diretti alla richiesta per lavori specifici che spesso
          accompagnano questo intervento.
        </p>
      </div>

      <ul className="mt-[54px] border-t border-eg-hairline max-[860px]:mt-[38px]">
        {items.map((item, index) => (
          <li key={item.slug}>
            <Link
              href={`/richiesta/${item.slug}`}
              className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-hairline py-6 text-eg-terra max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px] transition-colors hover:text-eg-cotto-dark"
              prefetch={false}
            >
              <span
                aria-hidden="true"
                data-nosnippet=""
                className="eg-list-index"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {" "}
              <span>
                <span className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em] block">{item.label}</span>
              </span>
              <span className="eg-list-status justify-self-end whitespace-nowrap max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">Richiedi &rarr;</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
