import Link from "next/link";

import type { ProfessionPage } from "@esigenta/taxonomy";

import { buildCanonicalPath } from "../seo/engine/canonical";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { getSeoInterventionLandingBySlug } from "../seo/pages/interventi";
import { PublicShell } from "../shell/public-shell";

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
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <nav aria-label="Breadcrumb" className="eg-link-mono mb-10">
                <Link href="/" prefetch={false}>
                  Home
                </Link>
                <span aria-hidden="true" className="mx-3 text-eg-ardesia-2">
                  /
                </span>
                <span className="text-eg-terra">Professionisti</span>
              </nav>

              <p className="eg-eyebrow">Professione</p>
              <h1 className="eg-h1 mt-5">{category.name}</h1>
              {category.description ? (
                <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-ardesia">{category.description}</p>
              ) : null}
            </div>

            {projectGroups.length === 0 ? (
              <p className="eg-body-muted mx-auto mt-12 max-w-[46ch] text-center">
                Nessuna area di lavoro disponibile per questa professione.
              </p>
            ) : (
              <div className="mt-16 grid gap-14">
                {projectGroups.map((projectGroup) => (
                  <section key={projectGroup.id} aria-labelledby={`profession-group-${projectGroup.id}`}>
                    <div className="mx-auto max-w-[760px] text-center">
                      <p className="eg-eyebrow">Ambito</p>
                      <h2 id={`profession-group-${projectGroup.id}`} className="eg-h2 mt-4">
                        {projectGroup.name}
                      </h2>
                      {projectGroup.description ? (
                        <p className="eg-body-muted mx-auto mt-5 max-w-[46ch]">
                          {projectGroup.description}
                        </p>
                      ) : null}
                    </div>

                    <ul className="mt-[54px] border-t border-eg-hairline max-[860px]:mt-[38px]">
                      {projectGroup.interventions.map((intervention, index) => (
                        <li key={intervention.id}>
                          <Link
                            href={getInterventionHref(intervention.slug)}
                            className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-hairline py-6 text-eg-terra max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px] transition-colors hover:text-eg-cotto-dark"
                            prefetch={false}
                          >
                            <span
                              aria-hidden="true"
                              data-nosnippet=""
                              className="font-mono text-xs uppercase tracking-[0.12em] text-eg-cotto-dark"
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {" "}
                            <span>
                              <span className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em] block">
                                {intervention.name}
                              </span>
                              {intervention.description ? (
                                <span className="mt-2.5 max-w-[44ch] text-[15px] leading-[1.55] text-eg-ardesia block">
                                  {intervention.description}
                                </span>
                              ) : null}
                            </span>
                            <span className="justify-self-end whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-eg-ardesia-2 max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">Apri &rarr;</span>
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
