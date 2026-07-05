import Image from "next/image";
import Link from "next/link";

import {
  getCostGuidePriceNote,
  isIndexableCityPage,
  type CostGuide,
} from "../pages/costi";
import { resolveInterventionHrefForCostGuide } from "../engine/resolve-seo-page";
import { PublicShell } from "../../shell/public-shell";
import { GeoRequestForm } from "./geo-request-form";
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
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="grid items-start gap-[clamp(42px,6vw,82px)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
              <div className="max-w-[720px] max-lg:max-w-none">
                <nav aria-label="Breadcrumb" className="eg-link-mono mb-10">
                  <Link href="/" prefetch={false}>
                    Home
                  </Link>
                  <span aria-hidden="true" className="mx-3 text-eg-ardesia-2">
                    /
                  </span>
                  <Link href="/costi" prefetch={false}>
                    Costi
                  </Link>
                </nav>

                <p className="eg-eyebrow">Guida costi</p>

                <h1 className="eg-h1 mt-5">{guide.h1}</h1>

                <p className="eg-body-muted mt-6 max-w-[54ch] text-[17px] leading-8">
                  {guide.summary}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href={requestHref} className="eg-button-primary w-full sm:w-auto">
                    Richiedi preventivi
                  </Link>

                  {interventionHref ? (
                    <Link href={interventionHref} className="eg-button-ghost w-full sm:w-auto">
                      Landing intervento
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-terra after:opacity-[0.14] after:mix-blend-multiply after:content-[''] aspect-[4/3] md:aspect-[720/520]">
                <Image
                  src={guide.heroImage.src}
                  alt={guide.heroImage.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 420px, (min-width: 1024px) 36vw, calc(100vw - 44px)"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="sintesi-costo-title" className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <div className="grid gap-10 border-y border-eg-hairline py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.36fr)] lg:items-start">
              <div>
                <p className="eg-eyebrow">Sintesi costo</p>

                <h2 id="sintesi-costo-title" className="eg-h2 mt-4">
                  Range indicativi per {guide.topicLabel}
                </h2>

                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <CostHighlight label="Costo complessivo" value={guide.nationalRange} />
                  <CostHighlight label="Costo al mq" value={guide.pricePerSquareMeter} />
                </div>

                <p className="eg-form-help mt-5 max-w-[58ch]">{priceNote}</p>
              </div>

              <GeoRequestForm funnelSlug={guide.funnelSlug} />
            </div>
          </div>
        </section>

        <section aria-labelledby="tabella-prezzi-title" className="eg-section">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Tabella prezzi</p>

              <h2 id="tabella-prezzi-title" className="eg-h2 mt-4">
                Voci che compongono il preventivo
              </h2>
            </div>

            <PriceTable rows={guide.priceRows} />
          </div>
        </section>

        <section aria-labelledby="dimensioni-bagno-title" className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Esempi</p>

              <h2 id="dimensioni-bagno-title" className="eg-h2 mt-4">
                Esempi per dimensione e livello di finitura
              </h2>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {guide.sizeExamples.map((example) => (
                <article key={example.label} className="eg-panel p-5">
                  <h3 className="eg-h3 text-[22px]">{example.label}</h3>

                  <p className="mt-3 text-2xl font-medium leading-tight text-eg-terra">
                    {example.range}
                  </p>

                  <p className="eg-body-muted mt-3">{example.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="fattori-costo-title" className="eg-section">
          <div className="eg-container">
            <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
              <div className="max-w-2xl">
                <p className="eg-eyebrow">Fattori costo</p>

                <h2 id="fattori-costo-title" className="eg-h2 mt-4">
                  Cosa incide davvero sul prezzo
                </h2>
              </div>

              <ul className="eg-panel grid gap-4 p-5 md:grid-cols-2 md:p-6">
                {guide.factors.map((factor) => (
                  <li key={factor} className="flex gap-3 text-sm leading-6 text-eg-ardesia">
                    <Dot />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {indexableCityPages.length > 0 ? (
          <section aria-labelledby="costi-citta-title" className="eg-section bg-eg-calce-2">
            <div className="eg-container">
              <div className="mx-auto max-w-[760px] text-center">
                <p className="eg-eyebrow">Citt&agrave;</p>

                <h2 id="costi-citta-title" className="eg-h2 mt-4">
                  Quanto costa {guide.topicLabel} nella tua citt&agrave;?
                </h2>

                <p className="eg-body-muted mx-auto mt-5 max-w-[56ch]">
                  Le differenze locali dipendono da cantiere, accessibilit&agrave;,
                  disponibilit&agrave; dei professionisti e caratteristiche
                  dell&apos;immobile.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {indexableCityPages.map((cityPage) => (
                    <Link
                      key={cityPage.citySlug}
                      href={cityPage.canonicalPath}
                      className="inline-flex min-h-9 items-center rounded-full border border-eg-hairline bg-eg-calce px-3 text-sm font-medium leading-5 text-eg-ardesia transition-colors hover:border-eg-cotto hover:text-eg-cotto-dark"
                      prefetch={false}
                    >
                      {cityPage.city}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-2">
                {guide.citySections.map((section) => {
                  const cityPage = indexableCityPages.find(
                    (page) => page.city === section.city,
                  );

                  return (
                    <article key={section.city} className="eg-panel p-5">
                      <h3 className="eg-h3 text-[24px]">{section.title}</h3>

                      <p className="eg-body-muted mt-3">{section.summary}</p>
                      <p className="eg-body-muted mt-3">{section.localReading}</p>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <MiniList title="Casi frequenti" items={section.typicalCases} />
                        <MiniList title="Fattori locali" items={section.factors} />
                      </div>

                      {cityPage ? (
                        <Link
                          href={cityPage.canonicalPath}
                          className="eg-button-ghost mt-6 w-full sm:w-auto"
                          prefetch={false}
                        >
                          Costi a {cityPage.city}
                        </Link>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="risparmiare-title" className="eg-section">
          <div className="eg-container">
            <div className="eg-panel p-5 md:p-7">
              <div className="max-w-3xl">
                <p className="eg-eyebrow">Consigli</p>

                <h2 id="risparmiare-title" className="eg-h2 mt-4">
                  Come risparmiare senza perdere qualit&agrave;
                </h2>
              </div>

              <ul className="mt-7 grid gap-4 md:grid-cols-2">
                {guide.savingTips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-sm leading-6 text-eg-ardesia">
                    <Dot />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <SeoFaq faq={guide.faq} />
          </div>
        </section>

        <section className="eg-section-large bg-eg-terra text-eg-calce">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow text-eg-calce/60">Prossimo passo</p>

            <h2 className="eg-h2 mt-4">Racconta il lavoro e confronta i preventivi</h2>

            <p className="mt-5 text-[15px] leading-7 text-eg-calce/70">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link href={requestHref} className="eg-button-primary mt-8 w-full sm:w-auto">
              Vai alla richiesta
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function CostHighlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="eg-panel p-5">
      <p className="eg-mono-label">{label}</p>
      <p className="mt-3 text-2xl font-medium leading-tight text-eg-terra">{value}</p>
    </div>
  );
}

function PriceTable({ rows }: { rows: CostGuide["priceRows"] }) {
  return (
    <div className="eg-panel mt-12 overflow-hidden">
      <div className="hidden border-b border-eg-hairline px-5 py-4 text-sm font-medium text-eg-terra md:grid md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)]">
        <span>Voce</span>
        <span>Fascia indicativa</span>
        <span>Note</span>
      </div>

      <div className="divide-y divide-eg-hairline">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-4 px-5 py-5 text-sm leading-6 md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)]"
          >
            <div>
              <p className="eg-mono-label md:hidden">Voce</p>
              <p className="mt-1 font-medium text-eg-terra md:mt-0">{row.label}</p>
            </div>

            <div>
              <p className="eg-mono-label md:hidden">Fascia</p>
              <p className="mt-1 font-medium text-eg-terra md:mt-0">{row.range}</p>
            </div>

            <div>
              <p className="eg-mono-label md:hidden">Note</p>
              <p className="mt-1 text-eg-ardesia md:mt-0">{row.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium leading-6 text-eg-terra">{title}</h4>

      <ul className="mt-2 space-y-2 text-sm leading-6 text-eg-ardesia">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Dot />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-eg-cotto-dark"
    />
  );
}
