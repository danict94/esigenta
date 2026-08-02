import Link from "next/link";

import { cn } from "@esigenta/ui";

import type { SeoInterventionLanding } from "../pages/interventi";
import type { InterventionCostSectionPriceData } from "../engine/resolve-seo-page";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { RequestCtaPanel } from "./request-cta-panel";
import { sectionTitleClassName } from "./seo-section-title";

export type GeoCostModuleProps = {
  geoSection: SeoInterventionLanding["geoSection"];
  costSection: SeoInterventionLanding["costSection"];
  /** Fase 2 — numeri risolti dalla guida costi collegata, mai da costSection. */
  priceData: InterventionCostSectionPriceData;
  funnelSlug: string;
  requestCtaLabel: string;
  costGuideHref: string | null;
};

/**
 * Blocco Costi come teaser, non guida: il dettaglio voce-per-voce, i
 * fattori e gli esempi vivono solo in /costi/[slug]. Duplicarli qui
 * significava indicizzare lo stesso contenuto su due URL per la stessa
 * intenzione di ricerca — qui resta solo la sintesi e un rimando reale.
 */
export function GeoCostModule({
  geoSection,
  costSection,
  priceData,
  funnelSlug,
  requestCtaLabel,
  costGuideHref,
}: GeoCostModuleProps) {
  const requestHref = `/richiesta/${funnelSlug}`;

  return (
    <div className="grid gap-16">
      <section aria-labelledby="geo-module-title">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.36fr)] lg:items-center">
          <div className="max-w-160">
            <p className={blueprintEyebrowClassName}>Zona</p>

            <h2 id="geo-module-title" className={cn(sectionTitleClassName, "mt-3")}>
              {geoSection.title}
            </h2>

            <p className="mt-3 max-w-[56ch] text-[14.5px] leading-[1.6] text-eg-ink">{geoSection.summary}</p>
          </div>

          <RequestCtaPanel requestHref={requestHref} ctaLabel={requestCtaLabel} />
        </div>
      </section>

      <section
        id="quanto-costa"
        aria-labelledby="quanto-costa-title"
        className="relative overflow-hidden bg-eg-brand-strong px-6.5 py-9 text-eg-on-brand md:px-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-42.5 -right-25 size-85 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--eg-color-brand) 40%, transparent), transparent 70%)",
          }}
        />

        <div className="relative grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-center">
          <div>
            <p className="flex items-center gap-2.5 font-(family-name:--eg-font-brand) text-xs uppercase tracking-[0.14em] text-[#9fd3e8] before:inline-block before:h-px before:w-5.5 before:bg-[#9fd3e8] before:content-['']">
              Costi
            </p>

            <h2 id="quanto-costa-title" className="mt-3.5 font-(family-name:--eg-font-brand) text-[clamp(20px,2.6vw,26px)] font-semibold leading-[1.25]">
              {costSection?.title ?? "Quanto costa questo intervento?"}
            </h2>

            <p className="mt-3.5 max-w-135 text-[14px] leading-[1.6] text-eg-on-brand-muted">
              {costSection?.summary ??
                "Il costo dipende da diversi fattori: nella guida completa trovi il dettaglio voce per voce."}
            </p>
          </div>

          {priceData ? (
            <div className="border border-eg-on-brand-border bg-white/8 px-6 py-5.5 text-center">
              <p className="font-(family-name:--eg-font-brand) text-[clamp(22px,2.6vw,28px)] font-bold leading-tight">
                {priceData.priceRange}
              </p>

              <p className="mt-1.5 font-(family-name:--eg-font-brand) text-[11.5px] tracking-[0.03em] text-eg-on-brand-muted">
                {priceData.priceRangeLabel}
              </p>

              {costGuideHref ? (
                <Link
                  href={costGuideHref}
                  prefetch={false}
                  className="eg-button-primary mt-4 w-full justify-center"
                >
                  Guida completa ai costi
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
