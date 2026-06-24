import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PageShell, cn } from "@esigenta/ui";

import {
  listSeoInterventionLandings,
  type SeoInterventionLanding,
} from "../pages/interventi";
import { resolveCostGuideHrefForIntervention } from "../engine/resolve-seo-page";
import { GeoCostModule } from "./geo-cost-module";
import { RelatedFunnelWork } from "./related-funnel-work";
import { SeoBreadcrumb } from "./seo-breadcrumb";
import { SeoFaq } from "./seo-faq";

export type InterventionLandingPageProps = {
  landing: SeoInterventionLanding;
};

const seoInterventionLandingSlugs = new Set(
  listSeoInterventionLandings().map((item) => item.slug),
);

export function InterventionLandingPage({
  landing,
}: InterventionLandingPageProps) {
  const requestHref = `/richiesta/${landing.funnelSlug}`;
  const costGuideHref = resolveCostGuideHrefForIntervention(landing.costSlug);

  return (
    <PageShell size="xl">
      <div className="space-y-12 md:space-y-16 lg:space-y-20">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="max-w-3xl space-y-7">
            <SeoBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Interventi" },
                { label: landing.title },
              ]}
            />

            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight text-cantiere-ink md:text-5xl">
                {landing.h1}
              </h1>

              <p className="text-lg leading-8 text-cantiere-ink-secondary">
                {landing.description}
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href={requestHref}
                className={cn(
                  "inline-flex items-center justify-center font-medium transition-colors",
                  "rounded-[8px]",
                  "h-12 px-6 text-[15px]",
                  "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
                  "w-full gap-2 sm:w-auto",
                )}
              >
                Richiedi preventivi
                <ArrowRight className="size-4" aria-hidden={true} />
              </Link>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-cantiere-ink-secondary">
                <span>Gratis, senza impegno.</span>
                <span>
                  Preventivi gratuiti da professionisti qualificati nella tua
                  zona.
                </span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-[8px]",
              "aspect-[4/3] overflow-hidden bg-cantiere-surface md:aspect-[720/520]",
            )}
          >
            <Image
              src={landing.image.src}
              alt={landing.image.alt}
              width={720}
              height={520}
              priority
              sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 42vw, calc(100vw - 32px)"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section
          aria-labelledby="cosa-puoi-richiedere-title"
          className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:items-start"
        >
          <div className="max-w-2xl space-y-3">
            <p className={"text-sm font-medium text-cantiere-accent"}>Cosa puoi richiedere</p>

            <h2
              id="cosa-puoi-richiedere-title"
              className="text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
            >
              Dalle prime valutazioni al lavoro finito
            </h2>

            <p className="text-base leading-7 text-cantiere-ink-secondary">
              Ogni richiesta può includere lavorazioni diverse. Seleziona il
              tipo di intervento e descrivi cosa vuoi ottenere.
            </p>
          </div>

          <div
            className={cn(
              "rounded-[8px]",
              "border border-cantiere-hairline bg-cantiere-paper p-5 md:p-7",
            )}
          >
            <ul className="grid gap-4 sm:grid-cols-2">
              {landing.requestItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-base leading-7 text-cantiere-ink-secondary"
                >
                  <CheckCircle2
                    className="mt-1 size-5 shrink-0 text-cantiere-accent"
                    aria-hidden={true}
                    strokeWidth={1.8}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="professionisti-collegati-title"
          className="grid gap-8 border-y border-cantiere-hairline py-8 md:grid-cols-2 md:py-10"
        >
          <div className="space-y-4">
            <h2
              id="professionisti-collegati-title"
              className="text-2xl font-semibold leading-8 text-cantiere-ink"
            >
              Professionisti collegati
            </h2>

            <p className="max-w-xl text-base leading-7 text-cantiere-ink-secondary">
              In base al lavoro, potresti aver bisogno di una o più figure
              specializzate.
            </p>

            <div className="flex flex-wrap gap-2">
              {landing.professionalCategorySlugs.map((slug) => (
                <SeoChip key={slug} label={formatSlugLabel(slug)} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold leading-8 text-cantiere-ink">
              Interventi correlati
            </h2>

            <p className="max-w-xl text-base leading-7 text-cantiere-ink-secondary">
              Collegamenti utili se stai pianificando lavori simili o
              complementari.
            </p>

            <div className="flex flex-wrap gap-2">
              {landing.relatedInterventionSlugs.map((slug) => (
                <RelatedInterventionChip key={slug} slug={slug} />
              ))}
            </div>
          </div>
        </section>

        {landing.relatedFunnelWork && landing.relatedFunnelWork.length > 0 ? (
          <RelatedFunnelWork
            taxonomyInterventionSlugs={landing.relatedFunnelWork}
          />
        ) : null}

        <GeoCostModule
          geoSection={landing.geoSection}
          costSection={landing.costSection}
          funnelSlug={landing.funnelSlug}
          costGuideHref={costGuideHref}
        />

        <SeoFaq faq={landing.faq} />

        <section
          className={cn(
            "rounded-[8px]",
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
                "rounded-[8px]",
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

function RelatedInterventionChip({ slug }: { slug: string }) {
  const label = formatSlugLabel(slug);
  const href = seoInterventionLandingSlugs.has(slug)
    ? `/interventi/${slug}`
    : undefined;

  if (href) {
    return <SeoChip href={href} label={label} />;
  }

  return <SeoChip label={label} />;
}

function SeoChip({
  href,
  label,
}: {
  href?: string;
  label: string;
}) {
  const className = cn(
    "rounded-full",
    "inline-flex min-h-9 items-center border border-cantiere-hairline bg-cantiere-paper px-3 text-sm font-medium leading-5 text-cantiere-ink-secondary",
    href
      ? "transition-colors hover:border-cantiere-accent hover:text-cantiere-ink"
      : "",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}

function formatSlugLabel(slug: string) {
  const label = slug.replaceAll("-", " ");

  return label.charAt(0).toUpperCase() + label.slice(1);
}
