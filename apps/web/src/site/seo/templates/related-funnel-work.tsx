import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { frozenTaxonomySource } from "@esigenta/taxonomy";
import { cn } from "@esigenta/ui";

/**
 * Phase 19.8 — pilota "lavori collegati funnel-diretto". Usato SOLO da
 * intervention-page-template.tsx (server-only, /interventi/[slug]). Non importare
 * mai questo file da un Client Component o dalla home: il barrel pubblico di
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
          `@esigenta/taxonomy. Only real frozen Intervention slugs are allowed — ` +
          `never a Category or ProjectGroup slug.`,
      );
    }

    return { slug, label: intervention.name };
  });

  return (
    <section aria-labelledby="lavori-collegati-title" className="space-y-4">
      <div className="max-w-2xl space-y-3">
        <h2
          id="lavori-collegati-title"
          className="text-2xl font-semibold leading-8 text-cantiere-ink"
        >
          Lavori che puoi richiedere insieme
        </h2>

        <p className="text-base leading-7 text-cantiere-ink-secondary">
          Oltre alla ristrutturazione completa, puoi richiedere preventivi anche
          per lavori specifici collegati. Non sono pagine dedicate: il link
          porta direttamente alla richiesta per quel lavoro.
        </p>
      </div>

      <ul
        className={cn(
          "rounded-lg",
          "divide-y divide-border-primary overflow-hidden border border-cantiere-hairline bg-cantiere-paper",
        )}
      >
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/richiesta/${item.slug}`}
              className="flex items-center justify-between gap-4 px-5 py-4 text-base font-medium text-cantiere-ink transition-colors hover:bg-cantiere-surface md:px-6"
            >
              <span>{item.label}</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-cantiere-accent">
                Richiedi preventivo
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
