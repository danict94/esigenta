import Link from "next/link";

import type { PublicProfessionHubItem } from "@esigenta/taxonomy/public-professions";

import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { PublicShell } from "../shell/public-shell";
import { InternalPageIntro } from "../shared/internal-page-intro";

export type ProfessionsHubPageProps = {
  professions: readonly PublicProfessionHubItem[];
};

export function ProfessionsHubPage({ professions }: ProfessionsHubPageProps) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Professionisti", path: "/professionisti" },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="eg-page eg-page-bg">
        <InternalPageIntro
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Professionisti" }]}
          eyebrow="Categorie professionali"
          title="Professionisti per i lavori di casa"
          description="Esigenta ti aiuta a trovare il professionista adatto in base al lavoro da realizzare, partendo dalla categoria professionale più pertinente."
        />

        <section className="eg-section-editorial pt-0" aria-label="Catalogo professionisti">
          <div className="eg-container">
            <ul className="grid gap-4.5 min-[701px]:grid-cols-2 xl:grid-cols-3">
              {professions.map((profession) => (
                <ProfessionCard key={profession.slug} profession={profession} />
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function ProfessionCard({ profession }: { profession: PublicProfessionHubItem }) {
  const visibleProjectGroups = profession.projectGroups.slice(0, 3);
  const remainingProjectGroupCount =
    profession.projectGroups.length - visibleProjectGroups.length;
  const interventionLabel =
    profession.interventionCount === 1 ? "intervento" : "interventi";

  return (
    <li className="h-full">
      <Link
        href={`/professionisti/${profession.slug}`}
        prefetch={false}
        className="group flex h-full flex-col border border-eg-border bg-eg-surface p-6 text-eg-ink transition-[transform,box-shadow] duration-200 ease-(--eg-ease-brand) hover:-translate-y-1 hover:shadow-eg-slab"
      >
        <h2 className="text-[20px] font-semibold leading-[1.25]">
          {profession.name}
        </h2>

        <p className="mt-3 text-[13.5px] leading-[1.58] text-eg-text-muted">
          {profession.shortDescription}
        </p>

        <div className="mt-5 border-t border-eg-border pt-4 pb-5">
          <p className="font-(family-name:--eg-font-mono) text-[10.5px] font-semibold uppercase tracking-[0.08em] text-eg-text-muted">
            Ambiti
          </p>
          <ul className="mt-2.5 space-y-1.5 text-[13.5px] leading-[1.45] text-eg-ink">
            {visibleProjectGroups.map((projectGroup) => (
              <li key={projectGroup.slug}>{projectGroup.name}</li>
            ))}
            {remainingProjectGroupCount > 0 ? (
              <li className="text-eg-text-muted">
                + {remainingProjectGroupCount} altri ambiti
              </li>
            ) : null}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-eg-border pt-4">
          <span className="text-[12.5px] text-eg-text-muted">
            {profession.interventionCount} {interventionLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-eg-brand-strong transition-[gap,color] duration-200 group-hover:gap-2.5 group-hover:text-eg-brand-hover">
            Scopri <span aria-hidden="true">&rarr;</span>
          </span>
        </div>
      </Link>
    </li>
  );
}
