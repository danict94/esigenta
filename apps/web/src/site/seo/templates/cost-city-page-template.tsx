import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge, PageShell, cn, tokens } from "@esigenta/ui";

import type { CostGuide, CostGuideCityPage } from "../pages/costi";
import { SeoBreadcrumb } from "./seo-breadcrumb";

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
    <PageShell size="xl">
      <div className="space-y-12 md:space-y-16 lg:space-y-20">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="max-w-3xl space-y-7">
            <SeoBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Costi", href: guide.canonicalPath },
                { label: cityPage.city },
              ]}
            />

            <Badge variant="success" className="w-fit">
              Guida costi città
            </Badge>

            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
                {cityPage.h1}
              </h1>

              <p className="text-lg leading-8 text-text-secondary">
                {cityPage.summary}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={requestHref}
                  className={cn(
                    tokens.interactive.base,
                    tokens.interactive.radius,
                    tokens.interactive.sizes.xl,
                    tokens.interactive.variants.brand,
                    "w-full gap-2 sm:w-auto",
                  )}
                >
                  Richiedi preventivi a {cityPage.city}
                  <ArrowRight className="size-4" aria-hidden={true} />
                </Link>

                <Link
                  href={guide.canonicalPath}
                  className={cn(
                    tokens.interactive.base,
                    tokens.interactive.radius,
                    tokens.interactive.sizes.xl,
                    tokens.interactive.variants.brandOutline,
                    "w-full gap-2 sm:w-auto",
                  )}
                >
                  Torna alla guida nazionale
                  <ArrowRight className="size-4" aria-hidden={true} />
                </Link>
              </div>

              <p className="text-sm leading-6 text-text-secondary">
                Potrai confermare il comune nel passaggio successivo.
              </p>
            </div>
          </div>

          <div
            className={cn(
              tokens.radius.lg,
              "aspect-[4/3] overflow-hidden bg-surface-muted md:aspect-[720/520]",
            )}
          >
            <Image
              src="/assets/images/rifacimento-bagno.webp"
              alt="Ristrutturazione bagno con sanitari e rivestimenti moderni"
              width={720}
              height={520}
              priority
              sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 42vw, calc(100vw - 32px)"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section
          aria-labelledby="range-citta-title"
          className={cn(
            tokens.radius.lg,
            "bg-surface-soft px-5 py-7 md:px-8 md:py-9 lg:px-10",
          )}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <CostHighlight label="Range nazionale" value={guide.nationalRange} />
            <CostHighlight
              label="Costo al mq"
              value={guide.pricePerSquareMeter}
            />
          </div>

          <div className="mt-6 max-w-4xl space-y-3">
            <h2
              id="range-citta-title"
              className="text-3xl font-semibold leading-tight text-text-primary md:text-4xl"
            >
              Come leggere il prezzo a {cityPage.city}
            </h2>

            <p className="text-base leading-7 text-text-secondary">
              {cityPage.priceInterpretation}
            </p>
          </div>
        </section>

        <section
          aria-labelledby="lettura-locale-title"
          className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:items-start"
        >
          <div className="max-w-2xl space-y-3">
            <p className={tokens.home.sectionLabel}>Lettura locale</p>

            <h2
              id="lettura-locale-title"
              className="text-3xl font-semibold leading-tight text-text-primary md:text-4xl"
            >
              Cosa può spostare il preventivo
            </h2>
          </div>

          <p className="text-base leading-7 text-text-secondary">
            {cityPage.localReading}
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
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
        </section>

        <section aria-labelledby="faq-citta-title" className="space-y-6">
          <div className="max-w-3xl">
            <p className={tokens.home.sectionLabel}>FAQ</p>

            <h2
              id="faq-citta-title"
              className="mt-2 text-3xl font-semibold leading-tight text-text-primary md:text-4xl"
            >
              Domande frequenti su {cityPage.city}
            </h2>
          </div>

          <div
            className={cn(
              tokens.radius.lg,
              "divide-y divide-border-primary border-y border-border-primary",
            )}
          >
            {cityPage.faq.map((item) => (
              <article
                key={item.question}
                className="grid gap-3 py-5 md:grid-cols-[0.42fr_1fr] md:gap-8 md:py-6"
              >
                <h3 className="text-lg font-semibold leading-7 text-text-primary">
                  {item.question}
                </h3>

                <p className="text-base leading-7 text-text-secondary">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={cn(
            tokens.radius.lg,
            "bg-surface-dark px-5 py-9 text-center text-text-on-hero-primary md:px-8 md:py-12",
          )}
        >
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Racconta il bagno da ristrutturare a {cityPage.city}
            </h2>

            <p className="text-base leading-7 text-text-on-hero-secondary">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link
              href={requestHref}
              className={cn(
                tokens.interactive.base,
                tokens.interactive.radius,
                tokens.interactive.sizes.xl,
                tokens.interactive.variants.warm,
                "w-full gap-2 sm:w-auto",
              )}
            >
              Richiedi preventivi a {cityPage.city}
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
        tokens.radius.lg,
        "border border-border-primary bg-surface-elevated p-5",
      )}
    >
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold leading-7 text-text-primary">
        {value}
      </p>
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
    <section
      className={cn(
        tokens.radius.lg,
        "border border-border-primary bg-surface-elevated p-5",
      )}
    >
      <h2 className="text-xl font-semibold leading-8 text-text-primary">
        {title}
      </h2>

      <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-brand-primary"
              aria-hidden={true}
              strokeWidth={1.8}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
