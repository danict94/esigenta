import Link from "next/link";

import type { ProfessionPage } from "@esigenta/taxonomy";

import { buildCanonicalPath } from "../seo/engine/canonical";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { getSeoInterventionLandingBySlug } from "../seo/pages/interventi";
import { PublicShell } from "../shell/public-shell";
import { InternalPageIntro } from "../shared/internal-page-intro";

export type ProfessionPageTemplateProps = {
  page: ProfessionPage;
};

function getInterventionHref(slug: string): string {
  const landing = getSeoInterventionLandingBySlug(slug);

  return landing ? `/interventi/${slug}` : `/richiesta/${slug}`;
}

export function ProfessionPageTemplate({ page }: ProfessionPageTemplateProps) {
  const { category, projectGroups } = page;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
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
            { label: "Professionisti" },
            { label: category.name },
          ]}
          title={category.name}
          description={category.description}
        />

        <section className="pb-16">
          <div className="eg-container">
            {projectGroups.length === 0 ? (
              <p className="eg-body-muted max-w-[46ch]">
                Nessuna area di lavoro disponibile per questa professione.
              </p>
            ) : (
              <div className="grid gap-14">
                {projectGroups.map((projectGroup) => (
                  <section key={projectGroup.id} aria-labelledby={`profession-group-${projectGroup.id}`}>
                    <div className="max-w-[760px]">
                      <h2 id={`profession-group-${projectGroup.id}`} className="eg-h2">
                        {projectGroup.name}
                      </h2>
                      {projectGroup.description ? (
                        <p className="eg-body-muted mt-5 max-w-[46ch]">
                          {projectGroup.description}
                        </p>
                      ) : null}
                    </div>

                    <ul className="mt-[54px] border-t border-eg-border max-[860px]:mt-[38px]">
                      {projectGroup.interventions.map((intervention, index) => (
                        <li key={intervention.id}>
                          <Link
                            href={getInterventionHref(intervention.slug)}
                            className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-border py-6 text-eg-ink max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px] transition-colors hover:text-eg-brand-strong"
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
                              <span className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em] block">
                                {intervention.name}
                              </span>
                              {intervention.description ? (
                                <span className="mt-2.5 max-w-[44ch] text-[15px] leading-[1.55] text-eg-text-muted block">
                                  {intervention.description}
                                </span>
                              ) : null}
                            </span>
                            <span className="eg-list-status justify-self-end whitespace-nowrap max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">Apri &rarr;</span>
                          </Link>
                        </li>
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
