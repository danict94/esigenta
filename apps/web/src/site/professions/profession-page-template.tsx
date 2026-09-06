import Link from "next/link";

import { buildCanonicalPath } from "../seo/engine/canonical";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { PublicShell } from "../shell/public-shell";
import { InternalPageIntro } from "../shared/internal-page-intro";
import { InterventionCard } from "../shared/intervention-card";
import { ProfessionEditorialIntro } from "./profession-editorial-intro";
import { ProfessionPricingSection } from "./profession-pricing-section";
import type { ProfessionDetailViewModel } from "./resolve-profession-detail";

export type ProfessionPageTemplateProps = {
  page: ProfessionDetailViewModel;
};

const professionInterventionCardLabels = {
  landing: "Scopri l’intervento",
  costGuide: "Guida ai costi",
  request: "Richiedi preventivi",
} as const;

export function ProfessionPageTemplate({ page }: ProfessionPageTemplateProps) {
  const { category, groups } = page;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Professionisti", path: "/professionisti" },
    {
      name: category.name,
      path: buildCanonicalPath({ family: "profession", slug: category.slug }),
    },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="eg-page eg-page-bg">
        <InternalPageIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Professionisti", href: "/professionisti" },
            { label: category.name },
          ]}
          title={category.name}
          description={category.description}
        />

        <ProfessionEditorialIntro
          intro={page.editorialContent?.intro ?? null}
        />

        <ProfessionPricingSection
          pricing={page.editorialContent?.pricing ?? null}
        />

        <section className="pb-16">
          <div className="eg-container">
            {groups.length === 0 ? (
              <p className="eg-body-muted max-w-[46ch]">
                Nessuna area di lavoro disponibile per questa professione.
              </p>
            ) : (
              <div className="grid gap-14">
                {groups.map((group) => (
                  <section key={group.slug} aria-labelledby={`profession-group-${group.slug}`}>
                    <div className="max-w-[760px]">
                      <h2 id={`profession-group-${group.slug}`} className="eg-h2">
                        <Link
                          href={group.href}
                          prefetch={false}
                          className="transition-colors hover:text-eg-brand-strong"
                        >
                          {group.name}
                        </Link>
                      </h2>
                    </div>

                    <ul className="mt-[54px] grid gap-5 max-[860px]:mt-[38px] min-[761px]:grid-cols-2">
                      {group.interventions.map((intervention) => (
                        <InterventionCard
                          key={intervention.slug}
                          name={intervention.name}
                          summary={intervention.summary}
                          requestHref={intervention.requestHref}
                          landingHref={intervention.landingHref}
                          costGuideHref={intervention.costGuideHref}
                          ctaLabels={professionInterventionCardLabels}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </PublicShell>
  );
}
