import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import {
  Badge,
  PageShell,
  cn,
  tokens,
} from "@fixpro/ui";

import {
  listSeoInterventionLandings,
  type SeoInterventionLanding,
} from "../../content/seo/intervention-landings";
import { GeoCostModule } from "./geo-cost-module";
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
  const costGuideHref =
    landing.slug === "ristrutturare-bagno"
      ? "/costi/ristrutturare-bagno"
      : null;

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

            <Badge variant="success" className="w-fit">
              {formatSlugLabel(landing.domainSlug)}
            </Badge>

            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
                {landing.h1}
              </h1>

              <p className="text-lg leading-8 text-text-secondary">
                {landing.description}
              </p>
            </div>

            <div className="space-y-4">
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
                Richiedi preventivi
                <ArrowRight className="size-4" aria-hidden={true} />
              </Link>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-text-secondary">
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
              tokens.radius.lg,
              "aspect-[4/3] overflow-hidden bg-surface-muted md:aspect-[720/520]",
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
            <p className={tokens.home.sectionLabel}>Cosa puoi richiedere</p>

            <h2
              id="cosa-puoi-richiedere-title"
              className="text-3xl font-semibold leading-tight text-text-primary md:text-4xl"
            >
              Dalle prime valutazioni al lavoro finito
            </h2>

            <p className="text-base leading-7 text-text-secondary">
              Ogni richiesta può includere lavorazioni diverse. Seleziona il
              tipo di intervento e descrivi cosa vuoi ottenere.
            </p>
          </div>

          <div
            className={cn(
              tokens.radius.lg,
              "border border-border-primary bg-surface-elevated p-5 md:p-7",
            )}
          >
            <ul className="grid gap-4 sm:grid-cols-2">
              {landing.requestItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-base leading-7 text-text-secondary"
                >
                  <CheckCircle2
                    className="mt-1 size-5 shrink-0 text-brand-primary"
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
          className="grid gap-8 border-y border-border-primary py-8 md:grid-cols-2 md:py-10"
        >
          <div className="space-y-4">
            <h2
              id="professionisti-collegati-title"
              className="text-2xl font-semibold leading-8 text-text-primary"
            >
              Professionisti collegati
            </h2>

            <p className="max-w-xl text-base leading-7 text-text-secondary">
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
            <h2 className="text-2xl font-semibold leading-8 text-text-primary">
              Interventi correlati
            </h2>

            <p className="max-w-xl text-base leading-7 text-text-secondary">
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

        <GeoCostModule
          geoSection={landing.geoSection}
          costSection={landing.costSection}
          funnelSlug={landing.funnelSlug}
          costGuideHref={costGuideHref}
        />

        <SeoFaq faq={landing.faq} />

        <section
          className={cn(
            tokens.radius.lg,
            "bg-surface-dark px-5 py-9 text-center text-text-on-hero-primary md:px-8 md:py-12",
          )}
        >
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Racconta il lavoro e confronta i preventivi
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
    tokens.radius.full,
    "inline-flex min-h-9 items-center border border-border-primary bg-surface-primary px-3 text-sm font-medium leading-5 text-text-secondary",
    href
      ? "transition-colors hover:border-border-focus hover:text-text-primary"
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
