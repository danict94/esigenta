import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { PublicProfessionHubItem } from "@esigenta/taxonomy/public-professions";

import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { PublicShell } from "../shell/public-shell";
import { FrameMarks } from "../shared/frame-marks";

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
            <div className="flex flex-col gap-2 border-t-[0.5px] border-eg-border/60 pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <div>
                <h2
                  id="profession-catalog-title"
                  className="text-[clamp(26px,3vw,30px)] font-semibold leading-[1.1] tracking-[-0.02em] text-eg-ink"
                >
                  Trova il professionista adatto
                </h2>
                <p className="mt-2 max-w-[700px] text-[13px] leading-[1.55] text-eg-text-muted sm:text-[14px]">
                  Parti dalla categoria professionale e scegli l’intervento che
                  corrisponde alla tua esigenza.
                </p>
              </div>
              <p className="shrink-0 text-[12px] text-eg-text-muted">
                {professions.length} professioni
              </p>
            </div>

            <ul className="mt-4 grid grid-cols-1 border-t-[0.5px] border-eg-border/60 min-[701px]:grid-cols-2 min-[701px]:gap-x-8 min-[981px]:grid-cols-3 min-[981px]:gap-x-9">
              {professions.map((profession) => (
                <ProfessionDirectoryItem
                  key={profession.slug}
                  profession={profession}
                />
              ))}
            </ul>
          </div>
        </section>

        <HubBusinessCta />
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
    <li className="min-w-0 border-b-[0.5px] border-eg-border/60">
      <Link
        href={`/professionisti/${profession.slug}`}
        prefetch={false}
        className="group flex h-full min-w-0 flex-col py-4.5 text-eg-ink transition-transform duration-200 ease-(--eg-ease-brand) hover:-translate-y-0.5"
      >
        <h3 className="text-[19px] font-semibold leading-[1.25] tracking-[-0.015em] transition-colors group-hover:text-eg-brand-hover sm:text-[20px]">
          {profession.name}
        </h3>

        <p className="mt-1.5 text-[12.5px] leading-[1.55] text-eg-text-muted sm:text-[13px]">
          {profession.shortDescription}
        </p>

        <p className="mt-3 text-[11.5px] leading-[1.55] text-eg-text-muted sm:text-[12px]">
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
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-3.5 text-[11.5px] sm:text-[12px]">
          <span className="text-eg-text-muted">
            {profession.interventionCount} {interventionLabel}
          </span>
          <span className="font-semibold text-eg-brand-strong transition-colors group-hover:text-eg-brand-hover">
            Scopri
          </span>
        </div>
      </Link>
    </li>
  );
}

function HubBusinessCta() {
  return (
    <section className="border-y-[0.5px] border-eg-header-border bg-eg-header py-7 text-eg-header-text">
      <div className="eg-container flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="max-w-[700px]">
          <h2 className="text-[clamp(23px,3vw,27px)] font-semibold leading-tight tracking-[-0.01em]">
            Sei un professionista?
          </h2>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-eg-header-text/75 sm:text-[14px]">
            Entra in Esigenta e presenta la tua attività ai clienti che cercano
            lavori nella tua categoria.
          </p>
        </div>

        <Link
          href="/area-impresa/iscriviti"
          prefetch={false}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-eg-md bg-eg-header-action px-5 py-3 text-[14px] font-semibold text-eg-header transition-[filter] hover:brightness-105"
        >
          Registrati come professionista
        </Link>
      </div>
    </section>
  );
}
