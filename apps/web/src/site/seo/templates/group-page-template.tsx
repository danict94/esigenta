import Link from "next/link";

import { buildCanonicalPath } from "../engine/canonical";
import type {
  GroupInterventionItem,
  GroupLandingPageData,
} from "../engine/resolve-group-page";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { getCostGuidePriceNote } from "../pages/costi";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { InternalPageIntro } from "../../shared/internal-page-intro";
import { MarketingFinalCta } from "../../shared/marketing-final-cta";
import { HowItWorks } from "./how-it-works";
import { sectionTitleClassName } from "./seo-section-title";
import { PublicShell } from "../../shell/public-shell";

export type GroupLandingPageProps = {
  data: GroupLandingPageData;
};

export function GroupLandingPage({ data }: GroupLandingPageProps) {
  const { content, interventions, featured, professionalCategories } = data;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Servizi", path: "/servizi" },
    {
      name: content.title,
      path: buildCanonicalPath({ family: "groupHub", slug: content.slug }),
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
            { label: "Servizi", href: "/servizi" },
            { label: content.title },
          ]}
          title={content.h1}
          description={content.description}
          actions={
            <Link href="#interventi" className="eg-button-primary eg-button-arrow">
              Scegli l&apos;intervento
            </Link>
          }
          note="Gratis, senza impegno. Preventivi da professionisti qualificati nella tua zona."
        />

        <section
          aria-labelledby="percorso-in-evidenza-title"
          className="eg-section-editorial bg-eg-surface-muted"
        >
          <div className="eg-container">
            <div className="grid gap-10 border-y border-eg-border py-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
              <div>
                <p className={blueprintEyebrowClassName}>Percorso in evidenza</p>

                <h2 id="percorso-in-evidenza-title" className={`${sectionTitleClassName} mt-4`}>
                  {featured.name}
                </h2>

                <p className="eg-body-muted mt-5 max-w-[52ch]">
                  {featured.summary}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={featured.requestHref}
                    prefetch={false}
                    className="eg-button-primary eg-button-arrow w-full sm:w-auto"
                  >
                    Richiedi preventivi
                  </Link>

                  {featured.landingHref ? (
                    <Link
                      href={featured.landingHref}
                      prefetch={false}
                      className="eg-button-ghost w-full sm:w-auto"
                    >
                      Approfondisci l&apos;intervento
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4">
                {featured.costRange ? (
                  <div className="eg-panel p-5">
                    <p className="eg-metric-label">{featured.costRangeLabel ?? "Range indicativo"}</p>

                    <p className="mt-3 text-2xl font-medium leading-tight text-eg-ink">
                      {featured.costRange}
                    </p>

                    <p className="eg-form-help mt-4 max-w-[58ch]">
                      {getCostGuidePriceNote()}
                    </p>

                    {featured.costGuideHref ? (
                      <Link
                        href={featured.costGuideHref}
                        prefetch={false}
                        className="eg-button-ghost mt-5 w-full sm:w-auto"
                      >
                        Guida completa ai costi
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section
          id="interventi"
          aria-labelledby="interventi-gruppo-title"
          className="eg-section-editorial"
        >
          <div className="eg-container">
            <div className="max-w-160">
              <p className={blueprintEyebrowClassName}>Interventi</p>

              <h2 id="interventi-gruppo-title" className={`${sectionTitleClassName} mt-4`}>
                {content.interventionsTitle}
              </h2>

              <p className="eg-body-muted mt-5 max-w-[46ch]">
                Ogni intervento ha una richiesta dedicata. Approfondisci dove
                disponibile, oppure parti subito dal preventivo.
              </p>
            </div>

            <ul className="mt-13.5 grid gap-5 max-[860px]:mt-9.5 min-[761px]:grid-cols-2">
              {interventions.map((item) => (
                <GroupInterventionCard
                  key={item.slug}
                  item={item}
                />
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="come-funziona-title"
          className="eg-section-editorial bg-eg-surface-muted"
        >
          <HowItWorks />
        </section>

        {professionalCategories.length > 0 ? (
          <section
            aria-labelledby="professionisti-gruppo-title"
            className="eg-section-editorial"
          >
            <div className="eg-container">
              <div className="grid gap-10 border-y border-eg-border py-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
                <div>
                  <p className={blueprintEyebrowClassName}>Professionisti</p>

                  <h2 id="professionisti-gruppo-title" className="eg-h3 mt-4">
                    Chi realizza questi lavori
                  </h2>

                  <p className="eg-body-muted mt-4 max-w-[44ch]">
                    Le figure professionali collegate a questo ambito, con gli
                    interventi che seguono.
                  </p>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  {professionalCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={category.href}
                      prefetch={false}
                      className="inline-flex min-h-9 items-center rounded-full border border-eg-border bg-eg-surface px-3 text-sm font-medium leading-5 text-eg-text-muted transition-colors hover:border-eg-brand hover:text-eg-brand-strong"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <MarketingFinalCta
          title="Racconta il lavoro e confronta i preventivi"
          description="Scegli l'intervento piu vicino al tuo lavoro e continua nella richiesta dedicata: dettagli, tempi e zona."
          href="#interventi"
          ctaLabel="Scegli l'intervento"
          secondaryAction={{ href: "/servizi", label: "Tutti i servizi" }}
        />
      </div>
    </PublicShell>
  );
}

function GroupInterventionCard({
  item,
}: {
  item: GroupInterventionItem;
}) {
  return (
    <li className="flex flex-col rounded-none border border-eg-border bg-eg-surface p-6.5 shadow-none transition-[transform,box-shadow] duration-200 ease-(--eg-ease-brand) hover:-translate-y-1 hover:shadow-eg-slab">
      <h3 className="text-[19px] font-semibold leading-[1.2] tracking-[-0.01em] text-eg-ink">
        {item.name}
      </h3>

      <p className="mt-2.5 flex-1 text-[14px] leading-[1.55] text-eg-text-muted">
        {item.summary}
      </p>

      {item.costRange ? (
        <p className="mt-4 border border-dashed border-eg-border bg-eg-page px-3.5 py-3 text-[13px] leading-normal text-eg-text-muted">
          <span className="font-medium text-eg-ink">{item.costRange}</span>
          {item.costGuideHref ? (
            <>
              {" — "}
              <Link
                href={item.costGuideHref}
                prefetch={false}
                className="font-semibold text-eg-brand-strong transition-colors hover:text-eg-brand-hover hover:underline"
              >
                guida ai costi
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-eg-border pt-4">
        {item.landingHref ? (
          <Link
            href={item.landingHref}
            prefetch={false}
            className="eg-button-ghost min-h-10 px-3.5 text-xs"
          >
            Approfondisci
          </Link>
        ) : null}

        <Link
          href={item.requestHref}
          prefetch={false}
          className="eg-button-primary eg-button-arrow min-h-10 px-3.5 text-xs"
        >
          Richiedi preventivi
        </Link>
      </div>
    </li>
  );
}
