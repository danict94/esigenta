import Image from "next/image";
import Link from "next/link";

import { frozenTaxonomySource } from "@esigenta/taxonomy";

import {
  listSeoInterventionLandings,
  type SeoInterventionLanding,
} from "../pages/interventi";
import {
  resolveCostGuideHrefForIntervention,
  resolveInterventionCostSectionPriceData,
} from "../engine/resolve-seo-page";
import { resolveGroupBreadcrumbForIntervention } from "../engine/resolve-group-page";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { PublicShell } from "../../shell/public-shell";
import { GeoCostModule } from "./geo-cost-module";
import { HowItWorks } from "./how-it-works";
import { RelatedFunnelWork } from "./related-funnel-work";
import { SeoFaq } from "./seo-faq";

export type InterventionLandingPageProps = {
  landing: SeoInterventionLanding;
};

const seoInterventionLandingSlugs = new Set(
  listSeoInterventionLandings().map((item) => item.slug),
);

// Server-only (vincolo @esigenta/taxonomy, vedi related-funnel-work.tsx):
// registry per trasformare i chip in link reali — landing se esiste, funnel
// se è un intervento taxonomy, pagina professione se è una categoria reale.
const taxonomyInterventionSlugs = new Set(
  frozenTaxonomySource.projectGroups.flatMap((projectGroup) =>
    projectGroup.interventions.map((intervention) => intervention.slug),
  ),
);

const taxonomyCategoriesBySlug = new Map(
  frozenTaxonomySource.categories.map((category) => [category.slug, category]),
);

export function InterventionLandingPage({
  landing,
}: InterventionLandingPageProps) {
  const requestHref = `/richiesta/${landing.funnelSlug}`;
  const requestCtaLabel = landing.requestCtaLabel ?? "Richiedi preventivi";
  const costGuideHref = resolveCostGuideHrefForIntervention(landing.costSlug);
  const priceData = resolveInterventionCostSectionPriceData(landing);
  const groupCrumb = resolveGroupBreadcrumbForIntervention(landing);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    ...(groupCrumb ? [{ name: groupCrumb.name, path: groupCrumb.href }] : []),
    { name: landing.title, path: `/interventi/${landing.slug}` },
  ]);
  const faqJsonLd = buildFaqJsonLd(landing.faq);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      ) : null}

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
                  {groupCrumb ? (
                    <>
                      <Link href={groupCrumb.href} prefetch={false}>
                        {groupCrumb.name}
                      </Link>
                      <span aria-hidden="true" className="mx-3 text-eg-text-muted">
                        /
                      </span>
                      <span className="text-eg-ink">{landing.title}</span>
                    </>
                  ) : (
                    <span className="text-eg-ink">Interventi</span>
                  )}
                </nav>

                <p className="eg-eyebrow">Intervento</p>

                <h1 className="eg-h1 mt-5">{landing.h1}</h1>

                <p className="eg-body-muted mt-6 max-w-[54ch] text-[17px] leading-8">
                  {landing.description}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href={requestHref} className="eg-button-primary w-full sm:w-auto">
                    {requestCtaLabel}
                  </Link>

                  {costGuideHref ? (
                    <Link
                      href={costGuideHref}
                      prefetch={false}
                      className="eg-button-ghost w-full sm:w-auto"
                    >
                      Guida ai costi
                    </Link>
                  ) : (
                    <Link href="#quanto-costa" className="eg-button-ghost w-full sm:w-auto">
                      Vedi i costi
                    </Link>
                  )}
                </div>

                <p className="eg-form-help mt-4 max-w-[54ch]">
                  Gratis, senza impegno. Preventivi da professionisti
                  qualificati nella tua zona.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-ink after:opacity-[0.14] after:mix-blend-multiply after:content-[''] aspect-[4/3] md:aspect-[720/520]">
                <Image
                  src={landing.image.src}
                  alt={landing.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 420px, (min-width: 1024px) 36vw, calc(100vw - 44px)"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="cosa-puoi-richiedere-title" className="eg-section bg-eg-surface-muted">
          <div className="eg-container">
            <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
              <div className="max-w-2xl">
                <p className="eg-eyebrow">Cosa puoi richiedere</p>

                <h2 id="cosa-puoi-richiedere-title" className="eg-h2 mt-4">
                  Dalle prime valutazioni al lavoro finito
                </h2>

                <p className="eg-body-muted mt-5">
                  Ogni richiesta pu&ograve; includere lavorazioni diverse.
                  Seleziona il tipo di intervento e descrivi cosa vuoi ottenere.
                </p>
              </div>

              <div className="eg-panel p-5 md:p-7">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {landing.requestItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-eg-text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-eg-brand-strong"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {landing.scopeIncluded?.length || landing.scopeExcluded?.length ? (
          <section aria-labelledby="perimetro-lavoro-title" className="eg-section">
            <div className="eg-container">
              <div className="mx-auto max-w-[760px] text-center">
                <p className="eg-eyebrow">Perimetro del lavoro</p>

                <h2 id="perimetro-lavoro-title" className="eg-h2 mt-4">
                  Cosa entra nel preventivo e cosa va chiarito
                </h2>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-2">
                {landing.scopeIncluded?.length ? (
                  <div className="eg-panel p-5 md:p-6">
                    <h3 className="eg-h3 text-[22px]">
                      Cosa pu&ograve; comprendere
                    </h3>

                    <ul className="mt-5 grid gap-3 text-sm leading-6 text-eg-text-muted">
                      {landing.scopeIncluded.map((item) => (
                        <li key={item} className="flex gap-3">
                          <Dot />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {landing.scopeExcluded?.length ? (
                  <div className="eg-panel p-5 md:p-6">
                    <h3 className="eg-h3 text-[22px]">
                      Cosa spesso resta fuori
                    </h3>

                    <ul className="mt-5 grid gap-3 text-sm leading-6 text-eg-text-muted">
                      {landing.scopeExcluded.map((item) => (
                        <li key={item} className="flex gap-3">
                          <Dot />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {landing.scopeNote ? (
                <p className="eg-form-help mx-auto mt-6 max-w-[72ch] text-center">
                  {landing.scopeNote}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {landing.variants?.length ? (
          <section aria-labelledby="varianti-title" className="eg-section bg-eg-surface-muted">
            <div className="eg-container">
              <div className="mx-auto max-w-[760px] text-center">
                <p className="eg-eyebrow">Livelli di intervento</p>

                <h2 id="varianti-title" className="eg-h2 mt-4">
                  Non tutti i lavori sono uguali
                </h2>

                <p className="eg-body-muted mx-auto mt-5 max-w-[52ch]">
                  Capire il livello del tuo lavoro aiuta a leggere i costi e a
                  ricevere preventivi comparabili. I range indicativi sono
                  nella tabella pi&ugrave; sotto.
                </p>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {landing.variants.map((variant) => (
                  <article key={variant.title} className="eg-panel p-5">
                    <h3 className="eg-h3 text-[22px]">{variant.title}</h3>

                    <p className="eg-body-muted mt-3">{variant.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="professionisti-collegati-title" className="eg-section">
          <div className="eg-container">
            <div className="grid gap-12 border-y border-eg-border py-10 md:grid-cols-2">
              <div>
                <p className="eg-eyebrow">Professionisti</p>

                <h2 id="professionisti-collegati-title" className="eg-h3 mt-4">
                  Professionisti collegati
                </h2>

                <p className="eg-body-muted mt-4 max-w-[44ch]">
                  In base al lavoro, potresti aver bisogno di una o pi&ugrave;
                  figure specializzate.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {landing.professionalCategorySlugs.map((slug) => (
                    <ProfessionalCategoryChip key={slug} slug={slug} />
                  ))}
                </div>
              </div>

              <div>
                <p className="eg-eyebrow">Collegamenti</p>

                <h2 className="eg-h3 mt-4">Interventi correlati</h2>

                <p className="eg-body-muted mt-4 max-w-[44ch]">
                  Percorsi utili se stai pianificando lavori simili o
                  complementari.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {landing.relatedInterventionSlugs.map((slug) => (
                    <RelatedInterventionChip key={slug} slug={slug} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {landing.relatedFunnelWork && landing.relatedFunnelWork.length > 0 ? (
          <section className="eg-section bg-eg-surface-muted">
            <div className="eg-container">
              <RelatedFunnelWork taxonomyInterventionSlugs={landing.relatedFunnelWork} />
            </div>
          </section>
        ) : null}

        <section className="eg-section-large">
          <div className="eg-container">
            <GeoCostModule
              geoSection={landing.geoSection}
              costSection={landing.costSection}
              priceData={priceData}
              funnelSlug={landing.funnelSlug}
              requestCtaLabel={requestCtaLabel}
              costGuideHref={costGuideHref}
            />
          </div>
        </section>

        {landing.preparationItems?.length ? (
          <section aria-labelledby="prepara-richiesta-title" className="eg-section bg-eg-surface-muted">
            <div className="eg-container">
              <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
                <div className="max-w-2xl">
                  <p className="eg-eyebrow">Prima della richiesta</p>

                  <h2 id="prepara-richiesta-title" className="eg-h2 mt-4">
                    Cosa preparare per un preventivo pi&ugrave; preciso
                  </h2>

                  <p className="eg-body-muted mt-5 max-w-[44ch]">
                    Non serve avere tutto: pi&ugrave; dettagli dai, pi&ugrave;
                    le risposte saranno comparabili.
                  </p>

                  <Link
                    href={requestHref}
                    className="eg-button-primary mt-7 w-full sm:w-auto"
                  >
                    {requestCtaLabel}
                  </Link>
                </div>

                <ul className="eg-panel grid gap-4 p-5 md:grid-cols-2 md:p-6">
                  {landing.preparationItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-eg-text-muted">
                      <Dot />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="come-funziona-title" className="eg-section">
          <HowItWorks />
        </section>

        <section className="eg-section bg-eg-surface-muted">
          <div className="eg-container">
            <SeoFaq faq={landing.faq} />
          </div>
        </section>

        <section className="eg-section-large bg-eg-brand-strong text-eg-on-brand">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow text-eg-on-brand-muted">Prossimo passo</p>

            <h2 className="eg-h2 mt-4">Racconta il lavoro e confronta i preventivi</h2>

            <p className="mt-5 text-[15px] leading-7 text-eg-on-brand-muted">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link href={requestHref} className="eg-button-primary mt-8 w-full sm:w-auto">
              {requestCtaLabel}
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function RelatedInterventionChip({ slug }: { slug: string }) {
  const label = formatSlugLabel(slug);

  // Landing SEO se esiste, altrimenti funnel diretto per interventi taxonomy
  // reali (stesso pattern delle pagine professione). Chip senza link solo se
  // lo slug non esiste da nessuna parte — mai un link finto.
  const href = seoInterventionLandingSlugs.has(slug)
    ? `/interventi/${slug}`
    : taxonomyInterventionSlugs.has(slug)
      ? `/richiesta/${slug}`
      : undefined;

  if (href) {
    return <SeoChip href={href} label={label} />;
  }

  return <SeoChip label={label} />;
}

function ProfessionalCategoryChip({ slug }: { slug: string }) {
  const category = taxonomyCategoriesBySlug.get(slug);

  // Le pagine /professionisti/[categorySlug] esistono per ogni categoria
  // taxonomy: link reale con il nome vero, mai una label derivata dallo slug.
  if (category) {
    return (
      <SeoChip href={`/professionisti/${category.slug}`} label={category.name} />
    );
  }

  return <SeoChip label={formatSlugLabel(slug)} />;
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-eg-brand-strong"
    />
  );
}

function SeoChip({ href, label }: { href?: string; label: string }) {
  const className = [
    "inline-flex min-h-9 items-center rounded-full border border-eg-border bg-eg-surface px-3 text-sm font-medium leading-5 text-eg-text-muted",
    href ? "transition-colors hover:border-eg-brand hover:text-eg-brand-strong" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={className} prefetch={false}>
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
