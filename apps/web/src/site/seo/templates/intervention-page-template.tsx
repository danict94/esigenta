import Image from "next/image";
import Link from "next/link";

import { cn } from "@esigenta/ui";
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
import { FrameMarks } from "../../shared/frame-marks";
import { RelatedLinkList, type RelatedLinkItem } from "../../shared/related-link-list";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { GeoCostModule } from "./geo-cost-module";
import { HowItWorks } from "./how-it-works";
import { RelatedFunnelWork } from "./related-funnel-work";
import { SeoFaq } from "./seo-faq";
import { sectionTitleClassName } from "./seo-section-title";

export type InterventionLandingPageProps = {
  landing: SeoInterventionLanding;
};

const seoInterventionLandingSlugs = new Set(
  listSeoInterventionLandings().map((item) => item.slug),
);

// Server-only (vincolo @esigenta/taxonomy, vedi related-funnel-work.tsx):
// registry per trasformare i link in reali — landing se esiste, funnel se
// è un intervento taxonomy, pagina professione se è una categoria reale.
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
        <section className="pt-[calc(var(--eg-nav-clear)+12px)] pb-14">
          <div className="eg-container">
            <nav
              aria-label="Breadcrumb"
              className="mb-4.5 flex items-center gap-2 font-(family-name:--eg-font-brand) text-[12.5px] text-eg-text-muted"
            >
              <Link href="/" prefetch={false} className="transition-colors hover:text-eg-brand-strong">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              {groupCrumb ? (
                <>
                  <Link href={groupCrumb.href} prefetch={false} className="transition-colors hover:text-eg-brand-strong">
                    {groupCrumb.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="text-eg-ink">{landing.title}</span>
                </>
              ) : (
                <span className="text-eg-ink">Interventi</span>
              )}
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className={blueprintEyebrowClassName}>Intervento</p>

                <h1 className="mt-4 mb-4 font-(family-name:--eg-font-brand) text-[clamp(28px,3.8vw,42px)] font-semibold leading-[1.18] tracking-[-0.01em]">
                  {landing.h1}
                </h1>

                <p className="mb-6.5 max-w-130 text-base leading-[1.6] text-eg-ink">
                  {landing.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-3">
                  <Link href={requestHref} className="eg-button-primary">
                    {requestCtaLabel}
                  </Link>

                  {costGuideHref ? (
                    <Link href={costGuideHref} prefetch={false} className="eg-button-ghost">
                      Guida ai costi
                    </Link>
                  ) : (
                    <Link href="#quanto-costa" className="eg-button-ghost">
                      Vedi i costi
                    </Link>
                  )}
                </div>

                <p className="font-(family-name:--eg-font-brand) text-[13px] text-eg-ink">
                  &mdash; Gratis, senza impegno. Preventivi da professionisti
                  qualificati nella tua zona.
                </p>
              </div>

              <div className="relative mx-auto aspect-square w-full max-w-100 overflow-hidden shadow-eg-slab after:absolute after:inset-0 after:bg-eg-ink after:opacity-[0.14] after:mix-blend-multiply after:content-[''] lg:max-w-none">
                <FrameMarks />
                <Image
                  src={landing.image.src}
                  alt={landing.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 36vw, (min-width: 640px) 400px, calc(100vw - 44px)"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="cosa-puoi-richiedere-title" className="border-t border-eg-border py-16">
          <div className="eg-container">
            <div className="mb-9 max-w-160">
              <p className={blueprintEyebrowClassName}>Cosa puoi richiedere</p>

              <h2 id="cosa-puoi-richiedere-title" className={cn(sectionTitleClassName, "mt-3")}>
                Dalle prime valutazioni al lavoro finito
              </h2>

              <p className="mt-3 max-w-145 text-[14.5px] leading-[1.6] text-eg-ink">
                Ogni richiesta pu&ograve; includere lavorazioni diverse.
                Seleziona il tipo di intervento e descrivi cosa vuoi ottenere.
              </p>
            </div>

            <ul className="grid max-w-160 gap-x-6 sm:grid-cols-2">
              {landing.requestItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 border-b border-eg-border py-3 text-[14.5px] leading-normal text-eg-ink"
                >
                  <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {landing.scopeIncluded?.length || landing.scopeExcluded?.length ? (
          <section aria-labelledby="perimetro-lavoro-title" className="border-t border-eg-border py-16">
            <div className="eg-container">
              <div className="mb-9 max-w-160">
                <p className={blueprintEyebrowClassName}>Perimetro del lavoro</p>

                <h2 id="perimetro-lavoro-title" className={cn(sectionTitleClassName, "mt-3")}>
                  Cosa entra nel preventivo e cosa va chiarito
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-px border border-eg-border bg-eg-border md:grid-cols-2">
                {landing.scopeIncluded?.length ? (
                  <div className="bg-eg-surface px-6.5 py-7">
                    <h3 className="flex items-center gap-2 font-(family-name:--eg-font-brand) text-[13px] font-bold uppercase tracking-[0.04em] text-eg-success">
                      <CheckGlyph className="size-3.5" />
                      Cosa pu&ograve; comprendere
                    </h3>

                    <ul className="mt-4">
                      {landing.scopeIncluded.map((item) => (
                        <li key={item} className="flex gap-2.5 pb-2.75 text-sm leading-[1.5] text-eg-text-muted">
                          <CheckGlyph className="mt-0.5 size-3.75 shrink-0 text-eg-success" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {landing.scopeExcluded?.length ? (
                  <div className="bg-eg-surface px-6.5 py-7">
                    <h3 className="flex items-center gap-2 font-(family-name:--eg-font-brand) text-[13px] font-bold uppercase tracking-[0.04em] text-eg-accent">
                      <XGlyph className="size-3.5" />
                      Cosa spesso resta fuori
                    </h3>

                    <ul className="mt-4">
                      {landing.scopeExcluded.map((item) => (
                        <li key={item} className="flex gap-2.5 pb-2.75 text-sm leading-[1.5] text-eg-text-muted">
                          <XGlyph className="mt-0.5 size-3.75 shrink-0 text-eg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {landing.scopeNote ? (
                <p className="mt-5 max-w-160 text-[13.5px] leading-[1.6] text-eg-ink">{landing.scopeNote}</p>
              ) : null}

              {landing.professionalCategorySlugs.length > 0 ? (
                <div className="mt-6 flex flex-wrap items-center gap-3.5 border-t border-dashed border-eg-border pt-5">
                  <span className="font-(family-name:--eg-font-brand) text-xs text-eg-ink">
                    Professionisti coinvolti:
                  </span>

                  {landing.professionalCategorySlugs.map((slug) => (
                    <ProfessionalCategoryChip key={slug} slug={slug} />
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {landing.variants?.length ? (
          <section aria-labelledby="varianti-title" className="border-t border-eg-border py-16">
            <div className="eg-container">
              <div className="mb-9 max-w-160">
                <p className={blueprintEyebrowClassName}>Livelli di intervento</p>

                <h2 id="varianti-title" className={cn(sectionTitleClassName, "mt-3")}>
                  Non tutti i lavori sono uguali
                </h2>

                <p className="mt-3 max-w-145 text-[14.5px] leading-[1.6] text-eg-ink">
                  Capire il livello del tuo lavoro aiuta a leggere i costi e a
                  ricevere preventivi comparabili. I range indicativi sono
                  nella tabella pi&ugrave; sotto.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {landing.variants.map((variant) => (
                  <article
                    key={variant.title}
                    className="border border-eg-border bg-eg-surface px-5.5 py-6 transition-shadow duration-250 ease-(--eg-ease-brand) hover:shadow-eg-step"
                  >
                    <h3 className="font-(family-name:--eg-font-brand) text-base font-semibold leading-[1.3]">
                      {variant.title}
                    </h3>

                    <p className="mt-2.5 text-[13.5px] leading-[1.55] text-eg-text-muted">
                      {variant.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {(landing.relatedInterventionSlugs.length > 0 || (landing.relatedFunnelWork?.length ?? 0) > 0) ? (
          <section aria-labelledby="lavori-collegati-title" className="border-t border-eg-border py-16">
            <div className="eg-container">
              <div className="mb-9 max-w-160">
                <p className={blueprintEyebrowClassName}>Lavori collegati</p>

                <h2 id="lavori-collegati-title" className={cn(sectionTitleClassName, "mt-3")}>
                  Percorsi utili da abbinare a questo intervento
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {landing.relatedInterventionSlugs.length > 0 ? (
                  <div>
                    <p className="mb-3.5 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-brand) text-[11.5px] uppercase tracking-widest text-eg-brand">
                      Interventi pi&ugrave; ampi
                    </p>

                    <RelatedLinkList items={landing.relatedInterventionSlugs.map(resolveRelatedInterventionLink)} />
                  </div>
                ) : null}

                {landing.relatedFunnelWork && landing.relatedFunnelWork.length > 0 ? (
                  <RelatedFunnelWork
                    title="Lavori specifici da aggiungere"
                    taxonomyInterventionSlugs={landing.relatedFunnelWork}
                  />
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-t border-eg-border py-16">
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
          <section aria-labelledby="prepara-richiesta-title" className="border-t border-eg-border py-16">
            <div className="eg-container">
              <div className="mb-9 max-w-160">
                <p className={blueprintEyebrowClassName}>Prima della richiesta</p>

                <h2 id="prepara-richiesta-title" className={cn(sectionTitleClassName, "mt-3")}>
                  Cosa preparare per un preventivo pi&ugrave; preciso
                </h2>

                <p className="mt-3 max-w-145 text-[14.5px] leading-[1.6] text-eg-ink">
                  Non serve avere tutto: pi&ugrave; dettagli dai, pi&ugrave;
                  le risposte saranno comparabili.
                </p>
              </div>

              <div className="grid gap-x-8 sm:grid-cols-2">
                <ul>
                  {landing.preparationItems.slice(0, Math.ceil(landing.preparationItems.length / 2)).map((item) => (
                    <li key={item} className="flex gap-2.5 border-b border-eg-border py-2.25 text-sm leading-[1.5] text-eg-ink">
                      <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <ul>
                  {landing.preparationItems.slice(Math.ceil(landing.preparationItems.length / 2)).map((item) => (
                    <li key={item} className="flex gap-2.5 border-b border-eg-border py-2.25 text-sm leading-[1.5] text-eg-ink">
                      <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={requestHref} className="eg-button-primary mt-7">
                {requestCtaLabel}
              </Link>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="come-funziona-title" className="border-t border-eg-border py-16">
          <HowItWorks />
        </section>

        <section className="border-t border-eg-border py-16">
          <div className="eg-container">
            <SeoFaq faq={landing.faq} />
          </div>
        </section>

        <section className="border-t border-eg-border bg-eg-brand-strong py-16 text-eg-on-brand">
          <div className="eg-container-narrow text-center">
            <p className="flex items-center justify-center gap-2.5 font-(family-name:--eg-font-brand) text-xs uppercase tracking-[0.14em] text-[#9fd3e8] before:inline-block before:h-px before:w-5.5 before:bg-[#9fd3e8] before:content-['']">
              Prossimo passo
            </p>

            <h2 className={cn(sectionTitleClassName, "mt-3.5")}>
              Racconta il lavoro e confronta i preventivi
            </h2>

            <p className="mt-3 text-[14.5px] leading-[1.6] text-eg-on-brand-muted">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link href={requestHref} className="eg-button-primary mt-6">
              {requestCtaLabel}
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function resolveRelatedInterventionLink(slug: string): RelatedLinkItem {
  const label = formatSlugLabel(slug);

  // Landing SEO se esiste, altrimenti funnel diretto per interventi taxonomy
  // reali (stesso pattern delle pagine professione). Nessun link se lo slug
  // non esiste da nessuna parte — mai un link finto.
  const href = seoInterventionLandingSlugs.has(slug)
    ? `/interventi/${slug}`
    : taxonomyInterventionSlugs.has(slug)
      ? `/richiesta/${slug}`
      : undefined;

  return { key: slug, label, href };
}

function ProfessionalCategoryChip({ slug }: { slug: string }) {
  const category = taxonomyCategoriesBySlug.get(slug);
  const className =
    "border border-eg-brand-strong px-3 py-1.5 font-(family-name:--eg-font-brand) text-xs font-semibold text-eg-brand-strong transition-colors hover:bg-eg-brand-strong hover:text-eg-on-brand";

  // Le pagine /professionisti/[categorySlug] esistono per ogni categoria
  // taxonomy: link reale con il nome vero, mai una label derivata dallo slug.
  if (category) {
    return (
      <Link href={`/professionisti/${category.slug}`} prefetch={false} className={className}>
        {category.name}
      </Link>
    );
  }

  return <span className={className}>{formatSlugLabel(slug)}</span>;
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function formatSlugLabel(slug: string) {
  const label = slug.replaceAll("-", " ");

  return label.charAt(0).toUpperCase() + label.slice(1);
}
