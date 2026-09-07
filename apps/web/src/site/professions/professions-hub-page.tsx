import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { PublicProfessionHubItem } from "@esigenta/taxonomy/public-professions";

import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { PublicShell } from "../shell/public-shell";
import {
  DirectoryAction,
  DirectoryItemSummary,
  DirectoryItemTitle,
} from "../shared/directory-primitives";
import { FrameMarks } from "../shared/frame-marks";
import { InternalPageFinalCta } from "../shared/internal-page-final-cta";
import {
  blueprintTitleClassName,
  SectionHeader,
} from "../shared/section-header";

export type ProfessionsHubPageProps = {
  professions: readonly PublicProfessionHubItem[];
};

export function ProfessionsHubPage({ professions }: ProfessionsHubPageProps) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Professionisti", path: "/professionisti" },
  ]);
  const interventionCount = professions.reduce(
    (total, profession) => total + profession.interventionCount,
    0,
  );

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="eg-page eg-page-bg">
        <ProfessionHubHero
          professionCount={professions.length}
          interventionCount={interventionCount}
        />

        <section aria-labelledby="profession-catalog-title" className="pb-12 sm:pb-14">
          <div className="eg-container">
            <div className="flex flex-col gap-2 border-t border-eg-border pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <div>
                <SectionHeader
                  id="profession-catalog-title"
                  title="Trova il professionista adatto"
                  align="left"
                  titleClassName={blueprintTitleClassName}
                />
                <p className="mt-2 max-w-[700px] text-[13px] leading-[1.55] text-eg-text-muted sm:text-[14px]">
                  Parti dalla categoria professionale e scegli l’intervento che
                  corrisponde alla tua esigenza.
                </p>
              </div>
              <p className="shrink-0 text-[12px] text-eg-text-muted">
                {professions.length} professioni
              </p>
            </div>

            <ul className="mt-4 grid grid-cols-1 border-t border-eg-border min-[701px]:grid-cols-2 min-[701px]:gap-x-8 min-[981px]:grid-cols-3 min-[981px]:gap-x-9">
              {professions.map((profession) => (
                <ProfessionDirectoryItem
                  key={profession.slug}
                  profession={profession}
                />
              ))}
            </ul>
          </div>
        </section>

        <InternalPageFinalCta
          title="Sei un professionista?"
          description="Entra in Esigenta e presenta la tua attività ai clienti che cercano lavori nella tua categoria."
          href="/area-impresa/iscriviti"
          ctaLabel="Registrati come professionista"
        />
      </div>
    </PublicShell>
  );
}

function ProfessionHubHero({
  professionCount,
  interventionCount,
}: {
  professionCount: number;
  interventionCount: number;
}) {
  return (
    <header className="pt-[calc(var(--eg-nav-clear)+4px)] pb-7 sm:pb-8">
      <div className="eg-container">
        <nav
          aria-label="Breadcrumb"
          className="mb-4.5 flex items-center gap-2 text-[12px] text-eg-text-muted"
        >
          <Link
            href="/"
            prefetch={false}
            className="transition-colors hover:text-eg-brand-strong"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-eg-ink">Professionisti</span>
        </nav>

        <div className="grid items-center gap-5 min-[981px]:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)] min-[981px]:gap-11">
          <div className="max-w-[690px]">
            <h1 className="eg-h1 text-balance">
              Professionisti per i lavori di casa
            </h1>
            <p className="mt-3 max-w-[650px] text-[14px] leading-[1.6] text-eg-text-muted sm:text-[16px] sm:leading-[1.65]">
              Esigenta ti aiuta a trovare il professionista adatto in base al
              lavoro da realizzare, partendo dalla categoria professionale più
              pertinente.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[11.5px] font-medium text-eg-text-muted sm:text-[12px]">
              <span>
                <strong className="font-semibold text-eg-ink">
                  {professionCount} categorie
                </strong>{" "}
                professionali
              </span>
              <span>
                <strong className="font-semibold text-eg-ink">
                  {interventionCount} interventi
                </strong>{" "}
                disponibili
              </span>
            </p>
          </div>

          <div className="group relative h-[188px] overflow-hidden rounded-eg-lg sm:h-[235px] min-[981px]:h-[300px]">
            <FrameMarks />
            <Image
              src="/assets/images/professionisti.webp"
              alt="Professionisti durante un sopralluogo per lavori in casa"
              fill
              priority
              sizes="(min-width: 981px) 500px, calc(100vw - 44px)"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function ProfessionDirectoryItem({
  profession,
}: {
  profession: PublicProfessionHubItem;
}) {
  const visibleProjectGroups = profession.projectGroups.slice(0, 3);
  const remainingProjectGroupCount =
    profession.projectGroups.length - visibleProjectGroups.length;
  const interventionLabel =
    profession.interventionCount === 1 ? "intervento" : "interventi";

  return (
    <li className="min-w-0 border-b border-eg-border">
      <div
        className="group relative flex h-full min-w-0 flex-col py-4.5 text-eg-ink transition-[padding-left] duration-200 ease-(--eg-ease-brand) hover:pl-2"
      >
        <DirectoryItemTitle className="transition-colors group-hover:text-eg-brand-hover">
          {profession.name}
        </DirectoryItemTitle>

        <DirectoryItemSummary className="mt-1.5">
          {profession.shortDescription}
        </DirectoryItemSummary>

        <DirectoryItemSummary className="mt-3">
          <strong className="font-semibold text-eg-ink">Ambiti:</strong>{" "}
          {visibleProjectGroups.map((projectGroup, index) => (
            <span key={projectGroup.slug}>
              {index > 0 ? " · " : null}
              {projectGroup.name}
            </span>
          ))}
          {remainingProjectGroupCount > 0
            ? ` +${remainingProjectGroupCount}`
            : null}
        </DirectoryItemSummary>

        <div className="mt-auto flex items-center justify-between gap-4 pt-3.5 text-[11.5px] sm:text-[12px]">
          <span className="text-eg-text-muted">
            {profession.interventionCount} {interventionLabel}
          </span>
          <DirectoryAction
            href={`/professionisti/${profession.slug}`}
            className="after:absolute after:inset-0"
          >
            Scopri
          </DirectoryAction>
        </div>
      </div>
    </li>
  );
}
