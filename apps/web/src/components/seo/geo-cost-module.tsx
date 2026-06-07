import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import {
  Badge,
  cn,
  tokens,
} from "@esigenta/ui";

import type { SeoInterventionLanding } from "../../content/seo/intervention-landings";
import { GeoRequestForm } from "./geo-request-form";

export type GeoCostModuleProps = {
  geoSection: SeoInterventionLanding["geoSection"];
  costSection: SeoInterventionLanding["costSection"];
  funnelSlug: string;
  costGuideHref: string | null;
};

export function GeoCostModule({
  geoSection,
  costSection,
  funnelSlug,
  costGuideHref,
}: GeoCostModuleProps) {
  const requestHref = `/richiesta/${funnelSlug}`;

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="geo-module-title"
        className={cn(
          tokens.radius.lg,
          "bg-surface-soft px-5 py-7 md:px-8 md:py-9 lg:px-10",
        )}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)] lg:items-center">
          <div className="max-w-3xl space-y-4">
            <Badge variant="success" className="w-fit">
              Zona
            </Badge>

            <div className="space-y-3">
              <h2
                id="geo-module-title"
                className="text-3xl font-semibold leading-tight text-text-primary md:text-4xl"
              >
                {geoSection.title}
              </h2>

              <p className="text-base leading-7 text-text-secondary">
                {geoSection.summary}
              </p>
            </div>
          </div>

          <GeoRequestForm funnelSlug={funnelSlug} />
        </div>
      </section>

      <section
        id="quanto-costa"
        aria-labelledby="quanto-costa-title"
        className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-start"
      >
        <div className="space-y-5">
          <Badge className="w-fit">Costi</Badge>

          <div className="space-y-4">
            <h2
              id="quanto-costa-title"
              className="text-3xl font-semibold leading-tight text-text-primary md:text-4xl"
            >
              {costSection?.title ?? "Quanto costa questo intervento?"}
            </h2>

            {costSection?.summary ? (
              <p className="text-base leading-7 text-text-secondary">
                {costSection.summary}
              </p>
            ) : null}
          </div>

          {costSection?.priceRange ? (
            <div
              className={cn(
                tokens.radius.lg,
                "border border-border-primary bg-surface-elevated p-5",
              )}
            >
              <p className="text-sm font-medium text-text-muted">
                Range indicativo
              </p>

              <p className="mt-2 text-xl font-semibold leading-7 text-text-primary">
                {costSection.priceRange}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={requestHref}
              className={cn(
                tokens.interactive.base,
                tokens.interactive.radius,
                tokens.interactive.sizes.lg,
                tokens.interactive.variants.brand,
                "w-full gap-2 sm:w-auto",
              )}
            >
              Richiedi preventivi
              <ArrowRight className="size-4" aria-hidden={true} />
            </Link>

            {costGuideHref ? (
              <Link
                href={costGuideHref}
                className={cn(
                  tokens.interactive.base,
                  tokens.interactive.radius,
                  tokens.interactive.sizes.lg,
                  tokens.interactive.variants.brandOutline,
                  "w-full gap-2 sm:w-auto",
                )}
              >
                Vedi la guida completa ai costi
                <ArrowRight className="size-4" aria-hidden={true} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          {costSection?.priceRows?.length ? (
            <div
              className={cn(
                tokens.radius.lg,
                "overflow-hidden border border-border-primary bg-surface-elevated",
              )}
            >
              <div className="hidden border-b border-border-primary px-4 py-3 text-sm font-semibold text-text-primary md:grid md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)] md:px-5">
                <span>Voce</span>
                <span>Fascia indicativa</span>
                <span>Note</span>
              </div>

              <div className="divide-y divide-border-primary">
                {costSection.priceRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-3 px-4 py-4 text-sm leading-6 md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_minmax(0,1fr)] md:px-5"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted md:hidden">
                        Voce
                      </p>
                      <p className="font-medium text-text-primary">
                        {row.label}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted md:hidden">
                        Fascia indicativa
                      </p>
                      <p className="font-semibold text-text-primary">
                        {row.range}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted md:hidden">
                        Note
                      </p>
                      <p className="text-text-secondary">{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {costSection?.factors?.length ? (
            <div
              className={cn(
                tokens.radius.lg,
                "border border-border-primary bg-surface-primary p-5 md:p-6",
              )}
            >
              <h3 className="text-lg font-semibold leading-7 text-text-primary">
                Fattori che influenzano il prezzo
              </h3>

              <ul className="mt-4 grid gap-3 text-sm leading-6 text-text-secondary sm:grid-cols-2">
                {costSection.factors.map((factor) => (
                  <li key={factor} className="flex gap-3">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-brand-primary"
                      aria-hidden={true}
                      strokeWidth={1.8}
                    />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {costSection?.examples?.length ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold leading-7 text-text-primary">
                Esempi di richieste
              </h3>

              <div className="flex flex-wrap gap-2">
                {costSection.examples.map((example) => (
                  <span
                    key={example}
                    className={cn(
                      tokens.radius.full,
                      "inline-flex min-h-9 items-center border border-border-primary bg-surface-primary px-3 text-sm font-medium leading-5 text-text-secondary",
                    )}
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
