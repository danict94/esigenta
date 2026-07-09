import Image from "next/image";
import Link from "next/link";

import {
  listSeoInterventionLandings,
  type SeoInterventionLanding,
} from "../pages/interventi";
import {
  resolveCostGuideHrefForIntervention,
  resolveInterventionCostSectionPriceData,
} from "../engine/resolve-seo-page";
import { PublicShell } from "../../shell/public-shell";
import { GeoCostModule } from "./geo-cost-module";
import { RelatedFunnelWork } from "./related-funnel-work";
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
  const priceData = resolveInterventionCostSectionPriceData(landing);

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
                  <span className="text-eg-terra">Interventi</span>
                </nav>

                <p className="eg-eyebrow">Intervento</p>

                <h1 className="eg-h1 mt-5">{landing.h1}</h1>

                <p className="eg-body-muted mt-6 max-w-[54ch] text-[17px] leading-8">
                  {landing.description}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href={requestHref} className="eg-button-primary w-full sm:w-auto">
                    Richiedi preventivi
                  </Link>

                  <Link href="#quanto-costa" className="eg-button-ghost w-full sm:w-auto">
                    Vedi i costi
                  </Link>
                </div>

                <p className="eg-form-help mt-4 max-w-[54ch]">
                  Gratis, senza impegno. Preventivi da professionisti
                  qualificati nella tua zona.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-terra after:opacity-[0.14] after:mix-blend-multiply after:content-[''] aspect-[4/3] md:aspect-[720/520]">
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

        <section aria-labelledby="cosa-puoi-richiedere-title" className="eg-section bg-eg-calce-2">
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
                    <li key={item} className="flex gap-3 text-sm leading-6 text-eg-ardesia">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-eg-cotto-dark"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="professionisti-collegati-title" className="eg-section">
          <div className="eg-container">
            <div className="grid gap-12 border-y border-eg-hairline py-10 md:grid-cols-2">
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
                    <SeoChip key={slug} label={formatSlugLabel(slug)} />
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
          <section className="eg-section bg-eg-calce-2">
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
              costGuideHref={costGuideHref}
            />
          </div>
        </section>

        <section className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <SeoFaq faq={landing.faq} />
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

function SeoChip({ href, label }: { href?: string; label: string }) {
  const className = [
    "inline-flex min-h-9 items-center rounded-full border border-eg-hairline bg-eg-calce px-3 text-sm font-medium leading-5 text-eg-ardesia",
    href ? "transition-colors hover:border-eg-cotto hover:text-eg-cotto-dark" : "",
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
