import Link from "next/link";

import type { SeoInterventionLanding } from "../pages/interventi";
import type { InterventionCostSectionPriceData } from "../engine/resolve-seo-page";
import { RequestCtaPanel } from "./request-cta-panel";

export type GeoCostModuleProps = {
  geoSection: SeoInterventionLanding["geoSection"];
  costSection: SeoInterventionLanding["costSection"];
  /** Fase 2 — numeri risolti dalla guida costi collegata, mai da costSection. */
  priceData: InterventionCostSectionPriceData;
  funnelSlug: string;
  requestCtaLabel: string;
  costGuideHref: string | null;
};

export function GeoCostModule({
  geoSection,
  costSection,
  priceData,
  funnelSlug,
  requestCtaLabel,
  costGuideHref,
}: GeoCostModuleProps) {
  const requestHref = `/richiesta/${funnelSlug}`;

  return (
    <div className="grid gap-16">
      <section
        aria-labelledby="geo-module-title"
        className="border-y border-eg-border py-10"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.36fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="eg-eyebrow">Zona</p>

            <h2 id="geo-module-title" className="eg-h2 mt-4">
              {geoSection.title}
            </h2>

            <p className="eg-body-muted mt-5 max-w-[56ch]">{geoSection.summary}</p>
          </div>

          <RequestCtaPanel requestHref={requestHref} ctaLabel={requestCtaLabel} />
        </div>
      </section>

      <section
        id="quanto-costa"
        aria-labelledby="quanto-costa-title"
        className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
      >
        <div>
          <p className="eg-eyebrow">Costi</p>

          <h2 id="quanto-costa-title" className="eg-h2 mt-4">
            {costSection?.title ?? "Quanto costa questo intervento?"}
          </h2>

          {costSection?.summary ? (
            <p className="eg-body-muted mt-5 max-w-[52ch]">{costSection.summary}</p>
          ) : null}

          {priceData ? (
            <div className="eg-panel mt-7 p-5">
              <p className="eg-metric-label">Range indicativo</p>

              <p className="mt-3 text-2xl font-medium leading-tight text-eg-ink">
                {priceData.priceRange}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={requestHref} className="eg-button-primary w-full sm:w-auto">
              Richiedi preventivi
            </Link>

            {costGuideHref ? (
              <Link href={costGuideHref} className="eg-button-ghost w-full sm:w-auto">
                Guida costi
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-7">
          {priceData && priceData.priceRows.length > 0 ? (
            <div className="eg-panel overflow-hidden">
              <div className="hidden border-b border-eg-border px-5 py-4 text-sm font-medium text-eg-ink md:grid md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)]">
                <span>Voce</span>
                <span>Fascia indicativa</span>
                <span>Note</span>
              </div>

              <div className="divide-y divide-eg-border">
                {priceData.priceRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-4 px-5 py-5 text-sm leading-6 md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)]"
                  >
                    <div>
                      <p className="eg-table-label md:hidden">Voce</p>
                      <p className="mt-1 font-medium text-eg-ink md:mt-0">
                        {row.label}
                      </p>
                    </div>

                    <div>
                      <p className="eg-table-label md:hidden">Fascia</p>
                      <p className="mt-1 font-medium text-eg-ink md:mt-0">
                        {row.range}
                      </p>
                    </div>

                    <div>
                      <p className="eg-table-label md:hidden">Note</p>
                      <p className="mt-1 text-eg-text-muted md:mt-0">{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {costSection?.factors?.length ? (
            <div className="eg-panel p-5 md:p-6">
              <h3 className="eg-h3 text-[22px]">Fattori che influenzano il prezzo</h3>

              <ul className="mt-5 grid gap-3 text-sm leading-6 text-eg-text-muted sm:grid-cols-2">
                {costSection.factors.map((factor) => (
                  <li key={factor} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-eg-brand-strong"
                    />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {costSection?.examples?.length ? (
            <div>
              <h3 className="eg-h3 text-[22px]">Esempi di richieste</h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {costSection.examples.map((example) => (
                  <span
                    key={example}
                    className="inline-flex min-h-9 items-center rounded-full border border-eg-border bg-eg-surface px-3 text-sm font-medium leading-5 text-eg-text-muted"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {costGuideHref ? (
        <section
          aria-labelledby="approfondisci-costi-title"
          className="eg-panel p-5 md:p-7"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h3 id="approfondisci-costi-title" className="eg-h3 text-[22px]">
                Vuoi approfondire i costi?
              </h3>

              <p className="eg-body-muted mt-3 max-w-[64ch]">
                Qui vedi solo la sintesi: nella guida completa trovi la tabella
                estesa voce per voce, cosa include ogni lavorazione, gli esempi
                per dimensione e le letture per citt&agrave;.
              </p>
            </div>

            <Link
              href={costGuideHref}
              prefetch={false}
              className="eg-button-ghost w-full lg:w-auto"
            >
              Guida completa ai costi
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
