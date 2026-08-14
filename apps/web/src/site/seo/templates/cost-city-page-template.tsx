import Image from "next/image";
import Link from "next/link";

import type { CostGuide, CostGuideCityPage } from "../pages/costi";
import { PublicShell } from "../../shell/public-shell";
import { InternalPageIntro } from "../../shared/internal-page-intro";
import { MarketingFinalCta } from "../../shared/marketing-final-cta";
import { CostHighlight } from "./cost-highlight";
import { SeoFaq } from "./seo-faq";

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
        <InternalPageIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Costi", href: "/costi" },
            { label: guide.title, href: guide.canonicalPath },
            { label: cityPage.city },
          ]}
          title={cityPage.h1}
          description={cityPage.summary}
          actions={
            <>
                  <Link href={requestHref} className="eg-button-primary eg-button-arrow w-full sm:w-auto">
                    Richiedi preventivi
                  </Link>

                  <Link href={guide.canonicalPath} className="eg-button-ghost w-full sm:w-auto">
                    Guida nazionale
                  </Link>
            </>
          }
          note="Potrai confermare il comune nel passaggio successivo."
          aside={
            guide.heroImage ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-ink after:opacity-[0.14] after:mix-blend-multiply after:content-[''] md:aspect-[720/520]">
                  <Image
                    src={guide.heroImage.src}
                    alt={guide.heroImage.alt}
                    fill
                    priority
                    sizes="(min-width: 1280px) 420px, (min-width: 1024px) 36vw, calc(100vw - 44px)"
                    className="object-cover"
                  />
              </div>
            ) : undefined
          }
        />

        <section aria-labelledby="range-citta-title" className="eg-section-editorial bg-eg-surface-muted">
          <div className="eg-container">
            <div className="grid gap-10 border-y border-eg-border py-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
              <div className="grid gap-4">
                <CostHighlight label="Range nazionale" value={guide.nationalRange ?? ""} />
                <CostHighlight label="Costo al mq" value={guide.pricePerSquareMeter ?? ""} />
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

        <section aria-labelledby="lettura-locale-title" className="eg-section-editorial">
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

        <section className="eg-section-editorial bg-eg-surface-muted">
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

        <section className="eg-section-editorial">
          <div className="eg-container">
            <SeoFaq
              faq={cityPage.faq}
              title={`Domande frequenti su ${cityPage.city}`}
            />
          </div>
        </section>

        <MarketingFinalCta
          title={`Racconta il lavoro da fare a ${cityPage.city}`}
          description="Continua nella richiesta dedicata e indica dettagli, tempi e zona dell'intervento."
          href={requestHref}
          ctaLabel="Richiedi preventivi"
        />
      </div>
    </PublicShell>
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
