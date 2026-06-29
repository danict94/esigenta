import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge, PageShell, cn } from "@esigenta/ui";

import {
  getCostGuidePriceNote,
  isIndexableCityPage,
  type CostGuide,
} from "../pages/costi";
import { resolveInterventionHrefForCostGuide } from "../engine/resolve-seo-page";
import { GeoRequestForm } from "./geo-request-form";
import { SeoBreadcrumb } from "./seo-breadcrumb";
import { SeoFaq } from "./seo-faq";

export type CostGuidePageProps = {
  guide: CostGuide;
};

export function CostGuidePage({ guide }: CostGuidePageProps) {
  const requestHref = `/richiesta/${guide.funnelSlug}`;
  const interventionHref = resolveInterventionHrefForCostGuide(
    guide.interventionSeoSlug,
  );
  const priceNote = getCostGuidePriceNote();
  const indexableCityPages = guide.cityPages.filter(isIndexableCityPage);

  return (
    <PageShell size="xl">
      <div className="space-y-12 md:space-y-16 lg:space-y-20">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="max-w-3xl space-y-7">
            <SeoBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Costi" },
                { label: guide.title },
              ]}
            />

            <Badge variant="success" className="w-fit">
              Guida costi
            </Badge>

            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight text-cantiere-ink md:text-5xl">
                {guide.h1}
              </h1>

              <p className="text-lg leading-8 text-cantiere-ink-secondary">
                {guide.summary}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={requestHref}
                className={cn(
                  "inline-flex items-center justify-center font-medium transition-colors",
                  "rounded-lg",
                  "h-12 px-6 text-[15px]",
                  "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
                  "w-full gap-2 sm:w-auto",
                )}
              >
                Richiedi preventivi
                <ArrowRight className="size-4" aria-hidden={true} />
              </Link>

              {interventionHref ? (
                <Link
                  href={interventionHref}
                  className={cn(
                    "inline-flex items-center justify-center font-medium transition-colors",
                    "rounded-lg",
                    "h-12 px-6 text-[15px]",
                    "border border-cantiere-accent bg-transparent text-cantiere-accent hover:bg-cantiere-accent hover:text-cantiere-paper",
                    "w-full gap-2 sm:w-auto",
                  )}
                >
                  Torna alla landing
                  <ArrowRight className="size-4" aria-hidden={true} />
                </Link>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg",
              "aspect-4/3 overflow-hidden bg-cantiere-surface md:aspect-720/520",
            )}
          >
            <Image
              src={guide.heroImage.src}
              alt={guide.heroImage.alt}
              width={720}
              height={520}
              priority
              sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 42vw, calc(100vw - 32px)"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section
          aria-labelledby="sintesi-costo-title"
          className={cn(
            "rounded-lg",
            "bg-cantiere-surface px-5 py-7 md:px-8 md:py-9 lg:px-10",
          )}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)] lg:items-start">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className={"text-sm font-medium text-cantiere-accent"}>Sintesi costo</p>

                <h2
                  id="sintesi-costo-title"
                  className="text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
                >
                  Range indicativi per {guide.topicLabel}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <CostHighlight
                  label="Costo complessivo"
                  value={guide.nationalRange}
                />
                <CostHighlight
                  label="Costo al mq"
                  value={guide.pricePerSquareMeter}
                />
              </div>

              <p className="text-sm leading-6 text-cantiere-ink-secondary">{priceNote}</p>
            </div>

            <GeoRequestForm funnelSlug={guide.funnelSlug} />
          </div>
        </section>

        <section aria-labelledby="tabella-prezzi-title" className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className={"text-sm font-medium text-cantiere-accent"}>Tabella prezzi</p>

            <h2
              id="tabella-prezzi-title"
              className="text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
            >
              Voci che compongono il preventivo
            </h2>
          </div>

          <PriceTable rows={guide.priceRows} />
        </section>

        <section
          aria-labelledby="dimensioni-bagno-title"
          className="space-y-6"
        >
          <div className="max-w-3xl space-y-3">
            <p className={"text-sm font-medium text-cantiere-accent"}>Esempi</p>

            <h2
              id="dimensioni-bagno-title"
              className="text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
            >
              Esempi per dimensione e livello di finitura
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {guide.sizeExamples.map((example) => (
              <div
                key={example.label}
                className={cn(
                  "rounded-lg",
                  "border border-cantiere-hairline bg-cantiere-paper p-5",
                )}
              >
                <h3 className="text-lg font-semibold leading-7 text-cantiere-ink">
                  {example.label}
                </h3>

                <p className="mt-3 text-xl font-semibold leading-7 text-cantiere-ink">
                  {example.range}
                </p>

                <p className="mt-3 text-sm leading-6 text-cantiere-ink-secondary">
                  {example.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="fattori-costo-title"
          className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:items-start"
        >
          <div className="max-w-2xl space-y-3">
            <p className={"text-sm font-medium text-cantiere-accent"}>Fattori costo</p>

            <h2
              id="fattori-costo-title"
              className="text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
            >
              Cosa incide davvero sul prezzo
            </h2>
          </div>

          <ul
            className={cn(
              "rounded-lg",
              "grid gap-4 border border-cantiere-hairline bg-cantiere-paper p-5 md:grid-cols-2 md:p-6",
            )}
          >
            {guide.factors.map((factor) => (
              <li
                key={factor}
                className="flex gap-3 text-base leading-7 text-cantiere-ink-secondary"
              >
                <CheckCircle2
                  className="mt-1 size-5 shrink-0 text-cantiere-accent"
                  aria-hidden={true}
                  strokeWidth={1.8}
                />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </section>

        {indexableCityPages.length > 0 ? (
        <section aria-labelledby="costi-citta-title" className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className={"text-sm font-medium text-cantiere-accent"}>Città</p>

            <h2
              id="costi-citta-title"
              className="text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
            >
              Quanto costa {guide.topicLabel} nella tua città?
            </h2>

            <p className="text-base leading-7 text-cantiere-ink-secondary">
              Le differenze locali dipendono da cantiere, accessibilità,
              disponibilità dei professionisti e caratteristiche
              dell&apos;immobile. Le pagine città vengono pubblicate solo se
              superano il quality gate editoriale.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {indexableCityPages.map((cityPage) => (
                <Link
                  key={cityPage.citySlug}
                  href={cityPage.canonicalPath}
                  className={cn(
                    "rounded-full",
                    "inline-flex min-h-9 items-center border border-cantiere-hairline bg-cantiere-paper px-3 text-sm font-medium leading-5 text-cantiere-ink-secondary transition-colors hover:border-cantiere-accent hover:text-cantiere-ink",
                  )}
                >
                  {cityPage.city}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {guide.citySections.map((section) => {
              const cityPage = indexableCityPages.find(
                (page) => page.city === section.city,
              );

              return (
                <article
                  key={section.city}
                  className={cn(
                    "rounded-lg",
                    "border border-cantiere-hairline bg-cantiere-paper p-5",
                  )}
                >
                  <h3 className="text-xl font-semibold leading-8 text-cantiere-ink">
                    {section.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-cantiere-ink-secondary">
                    {section.summary}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-cantiere-ink-secondary">
                    {section.localReading}
                  </p>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold leading-6 text-cantiere-ink">
                        Casi frequenti
                      </h4>

                      <ul className="mt-2 space-y-2 text-sm leading-6 text-cantiere-ink-secondary">
                        {section.typicalCases.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span
                              aria-hidden={true}
                              className="text-cantiere-accent"
                            >
                              -
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold leading-6 text-cantiere-ink">
                        Fattori locali
                      </h4>

                      <ul className="mt-2 space-y-2 text-sm leading-6 text-cantiere-ink-secondary">
                        {section.factors.map((factor) => (
                          <li key={factor} className="flex gap-2">
                            <span
                              aria-hidden={true}
                              className="text-cantiere-accent"
                            >
                              -
                            </span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {cityPage ? (
                    <Link
                      href={cityPage.canonicalPath}
                      className={cn(
                        "inline-flex items-center justify-center font-medium transition-colors",
                        "rounded-lg",
                        "h-12 px-6 text-[15px]",
                        "border border-cantiere-accent bg-transparent text-cantiere-accent hover:bg-cantiere-accent hover:text-cantiere-paper",
                        "mt-5 w-full gap-2 sm:w-auto",
                      )}
                    >
                      Vedi i costi a {cityPage.city}
                      <ArrowRight className="size-4" aria-hidden={true} />
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
        ) : null}

        <section
          aria-labelledby="risparmiare-title"
          className={cn(
            "rounded-lg",
            "border border-cantiere-hairline bg-cantiere-paper p-5 md:p-7",
          )}
        >
          <div className="max-w-3xl space-y-3">
            <p className={"text-sm font-medium text-cantiere-accent"}>Consigli</p>

            <h2
              id="risparmiare-title"
              className="text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
            >
              Come risparmiare senza perdere qualità
            </h2>
          </div>

          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {guide.savingTips.map((tip) => (
              <li
                key={tip}
                className="flex gap-3 text-base leading-7 text-cantiere-ink-secondary"
              >
                <CheckCircle2
                  className="mt-1 size-5 shrink-0 text-cantiere-accent"
                  aria-hidden={true}
                  strokeWidth={1.8}
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <SeoFaq faq={guide.faq} />

        <section
          className={cn(
            "rounded-lg",
            "bg-cantiere-ink px-5 py-9 text-center text-cantiere-paper md:px-8 md:py-12",
          )}
        >
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Racconta il lavoro e confronta i preventivi
            </h2>

            <p className="text-base leading-7 text-cantiere-paper/75">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link
              href={requestHref}
              className={cn(
                "inline-flex items-center justify-center font-medium transition-colors",
                "rounded-lg",
                "h-12 px-6 text-[15px]",
                "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
                "w-full gap-2 sm:w-auto",
              )}
            >
              Va alla richiesta
              <ArrowRight className="size-4" aria-hidden={true} />
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function CostHighlight({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "rounded-lg",
        "border border-cantiere-hairline bg-cantiere-paper p-5",
      )}
    >
      <p className="text-sm font-medium text-cantiere-ink-secondary">{label}</p>
      <p className="mt-2 text-xl font-semibold leading-7 text-cantiere-ink">
        {value}
      </p>
    </div>
  );
}

function PriceTable({ rows }: { rows: CostGuide["priceRows"] }) {
  return (
    <div
      className={cn(
        "rounded-lg",
        "overflow-hidden border border-cantiere-hairline bg-cantiere-paper",
      )}
    >
      <div className="hidden border-b border-cantiere-hairline px-4 py-3 text-sm font-semibold text-cantiere-ink md:grid md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)] md:px-5">
        <span>Voce</span>
        <span>Fascia indicativa</span>
        <span>Note</span>
      </div>

      <div className="divide-y divide-border-primary">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-3 px-4 py-4 text-sm leading-6 md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)] md:px-5"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-cantiere-ink-secondary md:hidden">
                Voce
              </p>
              <p className="font-medium text-cantiere-ink">{row.label}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-cantiere-ink-secondary md:hidden">
                Fascia indicativa
              </p>
              <p className="font-semibold text-cantiere-ink">{row.range}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-cantiere-ink-secondary md:hidden">
                Note
              </p>
              <p className="text-cantiere-ink-secondary">{row.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
