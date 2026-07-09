import Link from "next/link";

import type {
  GroupInterventionItem,
  GroupLandingPageData,
} from "../engine/resolve-group-page";
import { getCostGuidePriceNote } from "../pages/costi";
import { HowItWorks } from "./how-it-works";
import { PublicShell } from "../../shell/public-shell";

export type GroupLandingPageProps = {
  data: GroupLandingPageData;
};

export function GroupLandingPage({ data }: GroupLandingPageProps) {
  const { content, interventions, featured, professionalCategories } = data;

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow text-center">
            <nav aria-label="Breadcrumb" className="eg-link-mono mb-10">
              <Link href="/" prefetch={false}>
                Home
              </Link>
              <span aria-hidden="true" className="mx-3 text-eg-ardesia-2">
                /
              </span>
              <Link href="/servizi" prefetch={false}>
                Servizi
              </Link>
              <span aria-hidden="true" className="mx-3 text-eg-ardesia-2">
                /
              </span>
              <span className="text-eg-terra">{content.title}</span>
            </nav>

            <p className="eg-eyebrow">Ambito</p>

            <h1 className="eg-h1 mt-5">{content.h1}</h1>

            <p className="mx-auto mt-[22px] max-w-[48ch] text-base leading-[1.65] text-eg-ardesia">
              {content.description}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="#interventi" className="eg-button-primary">
                Scegli l&apos;intervento <span aria-hidden="true">&darr;</span>
              </Link>
            </div>

            <p className="eg-form-help mx-auto mt-4 max-w-[54ch]">
              Gratis, senza impegno. Preventivi da professionisti qualificati
              nella tua zona.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="percorso-in-evidenza-title"
          className="eg-section bg-eg-calce-2"
        >
          <div className="eg-container">
            <div className="grid gap-10 border-y border-eg-hairline py-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
              <div>
                <p className="eg-eyebrow">Percorso in evidenza</p>

                <h2 id="percorso-in-evidenza-title" className="eg-h2 mt-4">
                  {featured.name}
                </h2>

                <p className="eg-body-muted mt-5 max-w-[52ch]">
                  {featured.landingDescription}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={featured.requestHref}
                    prefetch={false}
                    className="eg-button-primary w-full sm:w-auto"
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
                    <p className="eg-mono-label">Range indicativo</p>

                    <p className="mt-3 text-2xl font-medium leading-tight text-eg-terra">
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
          className="eg-section"
        >
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Interventi</p>

              <h2 id="interventi-gruppo-title" className="eg-h2 mt-4">
                {content.interventionsTitle}
              </h2>

              <p className="eg-body-muted mx-auto mt-5 max-w-[46ch]">
                Ogni intervento ha una richiesta dedicata. Approfondisci dove
                disponibile, oppure parti subito dal preventivo.
              </p>
            </div>

            <ul className="mt-[54px] border-t border-eg-hairline max-[860px]:mt-[38px]">
              {interventions.map((item, index) => (
                <GroupInterventionRow
                  key={item.slug}
                  index={index + 1}
                  item={item}
                />
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="come-funziona-title"
          className="eg-section bg-eg-calce-2"
        >
          <HowItWorks />
        </section>

        {professionalCategories.length > 0 ? (
          <section
            aria-labelledby="professionisti-gruppo-title"
            className="eg-section"
          >
            <div className="eg-container">
              <div className="grid gap-10 border-y border-eg-hairline py-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
                <div>
                  <p className="eg-eyebrow">Professionisti</p>

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
                      className="inline-flex min-h-9 items-center rounded-full border border-eg-hairline bg-eg-calce px-3 text-sm font-medium leading-5 text-eg-ardesia transition-colors hover:border-eg-cotto hover:text-eg-cotto-dark"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="eg-section-large bg-eg-terra text-eg-calce">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow text-eg-calce/60">Prossimo passo</p>

            <h2 className="eg-h2 mt-4">
              Racconta il lavoro e confronta i preventivi
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-eg-calce/70">
              Scegli l&apos;intervento pi&ugrave; vicino al tuo lavoro e
              continua nella richiesta dedicata: dettagli, tempi e zona.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="#interventi" className="eg-button-primary w-full sm:w-auto">
                Scegli l&apos;intervento
              </Link>

              <Link
                href="/servizi"
                prefetch={false}
                className="eg-button-ghost w-full sm:w-auto"
              >
                Tutti i servizi
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function GroupInterventionRow({
  index,
  item,
}: {
  index: number;
  item: GroupInterventionItem;
}) {
  return (
    <li className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-start gap-6 border-b border-eg-hairline py-6 max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px]">
      <span className="pt-1.5 font-mono text-xs uppercase tracking-[0.12em] text-eg-cotto-dark">
        {String(index).padStart(2, "0")}
      </span>

      <div>
        <h3 className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em] text-eg-terra">
          {item.name}
        </h3>

        <p className="mt-2.5 max-w-[54ch] text-[15px] leading-[1.55] text-eg-ardesia">
          {item.summary}
        </p>

        {item.costRange ? (
          <p className="mt-2.5 text-[14px] leading-[1.55] text-eg-ardesia">
            <span className="font-medium text-eg-terra">{item.costRange}</span>
            {item.costGuideHref ? (
              <>
                {" — "}
                <Link
                  href={item.costGuideHref}
                  prefetch={false}
                  className="underline decoration-eg-hairline underline-offset-4 transition-colors hover:text-eg-cotto-dark"
                >
                  guida ai costi
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-2.5 pt-1.5 max-[860px]:col-start-2 max-[860px]:mt-2 max-[860px]:flex-row max-[860px]:flex-wrap max-[860px]:items-start">
        {item.landingHref ? (
          <Link
            href={item.landingHref}
            prefetch={false}
            className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-eg-ardesia-2 transition-colors hover:text-eg-cotto-dark"
          >
            Approfondisci &rarr;
          </Link>
        ) : null}

        <Link
          href={item.requestHref}
          prefetch={false}
          className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-eg-cotto-dark transition-colors hover:text-eg-terra"
        >
          Richiedi &rarr;
        </Link>
      </div>
    </li>
  );
}
