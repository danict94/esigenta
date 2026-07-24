import Image from "next/image";
import Link from "next/link";

import type { CostGuide, CostGuideCityPage } from "../pages/costi";
import { PublicShell } from "../../shell/public-shell";

export type CityCostGuidePageProps = {
  guide: CostGuide;
  cityPage: CostGuideCityPage;
};

export function CityCostGuidePage({
  guide,
  cityPage,
}: CityCostGuidePageProps) {
  const requestHref = `/richiesta/${guide.funnelSlug}`;

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="grid items-start gap-[clamp(42px,6vw,82px)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
              <div className="max-w-[720px] max-lg:max-w-none">
                <nav aria-label="Breadcrumb" className="eg-nav-link mb-10">
                  <Link href="/" prefetch={false}>
                    Home
                  </Link>
                  <span aria-hidden="true" className="mx-3 text-eg-text-muted">
                    /
                  </span>
                  <Link href={guide.canonicalPath} prefetch={false}>
                    Costi
                  </Link>
                  <span aria-hidden="true" className="mx-3 text-eg-text-muted">
                    /
                  </span>
                  <span className="text-eg-ink">{cityPage.city}</span>
                </nav>

                <p className="eg-eyebrow">Guida costi citt&agrave;</p>

                <h1 className="eg-h1 mt-5">{cityPage.h1}</h1>

                <p className="eg-body-muted mt-6 max-w-[54ch] text-[17px] leading-8">
                  {cityPage.summary}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href={requestHref} className="eg-button-primary w-full sm:w-auto">
                    Richiedi preventivi
                  </Link>

                  <Link href={guide.canonicalPath} className="eg-button-ghost w-full sm:w-auto">
                    Guida nazionale
                  </Link>
                </div>

                <p className="eg-form-help mt-4">
                  Potrai confermare il comune nel passaggio successivo.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-ink after:opacity-[0.14] after:mix-blend-multiply after:content-[''] aspect-[4/3] md:aspect-[720/520]">
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

        <section aria-labelledby="range-citta-title" className="eg-section bg-eg-surface-muted">
          <div className="eg-container">
            <div className="grid gap-10 border-y border-eg-border py-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
              <div className="grid gap-4">
                <CostHighlight label="Range nazionale" value={guide.nationalRange} />
                <CostHighlight label="Costo al mq" value={guide.pricePerSquareMeter} />
              </div>

              <div>
                <p className="eg-eyebrow">Prezzo locale</p>

                <h2 id="range-citta-title" className="eg-h2 mt-4">
                  Come leggere il prezzo a {cityPage.city}
                </h2>

                <p className="eg-body-muted mt-5">{cityPage.priceInterpretation}</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="lettura-locale-title" className="eg-section">
          <div className="eg-container">
            <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
              <div className="max-w-2xl">
                <p className="eg-eyebrow">Lettura locale</p>

                <h2 id="lettura-locale-title" className="eg-h2 mt-4">
                  Cosa pu&ograve; spostare il preventivo
                </h2>
              </div>

              <p className="eg-body-muted text-[16px] leading-8">
                {cityPage.localReading}
              </p>
            </div>
          </div>
        </section>

        <section className="eg-section bg-eg-surface-muted">
          <div className="eg-container">
            <div className="grid gap-5 md:grid-cols-2">
              <ChecklistSection title="Casi frequenti" items={cityPage.typicalCases} />
              <ChecklistSection title="Fattori locali" items={cityPage.localFactors} />
              <ChecklistSection
                title="Quando il prezzo sale"
                items={cityPage.whenPriceGoesUp}
              />
              <ChecklistSection
                title="Cosa chiedere nel preventivo"
                items={cityPage.whatToAskInQuote}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-citta-title" className="eg-section">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">FAQ</p>

              <h2 id="faq-citta-title" className="eg-h2 mt-4">
                Domande frequenti su {cityPage.city}
              </h2>
            </div>

            <div className="mt-10 border-y border-eg-border">
              {cityPage.faq.map((item) => (
                <article
                  key={item.question}
                  className="grid gap-4 border-b border-eg-border py-6 last:border-b-0 md:grid-cols-[0.42fr_1fr] md:gap-10"
                >
                  <h3 className="eg-h3 text-[22px]">{item.question}</h3>

                  <p className="eg-body-muted">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="eg-section-large bg-eg-brand-strong text-eg-on-brand">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow text-eg-on-brand-muted">Prossimo passo</p>

            <h2 className="eg-h2 mt-4">
              Racconta il lavoro da fare a {cityPage.city}
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-eg-on-brand-muted">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link href={requestHref} className="eg-button-primary mt-8 w-full sm:w-auto">
              Richiedi preventivi
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
      <p className="eg-metric-label">{label}</p>
      <p className="mt-3 text-2xl font-medium leading-tight text-eg-ink">{value}</p>
    </div>
  );
}

function ChecklistSection({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <section className="eg-panel p-5">
      <h2 className="eg-h3 text-[24px]">{title}</h2>

      <ul className="mt-4 space-y-3 text-sm leading-6 text-eg-text-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <Dot />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-eg-brand-strong"
    />
  );
}
