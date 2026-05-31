import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  cn,
  tokens,
} from "@fixpro/ui";

import type { SeoInterventionLanding } from "../../content/seo/intervention-landings";

export type GeoCostModuleProps = {
  geoSection: SeoInterventionLanding["geoSection"];
  costSection: SeoInterventionLanding["costSection"];
  funnelSlug: string;
};

export function GeoCostModule({
  geoSection,
  costSection,
  funnelSlug,
}: GeoCostModuleProps) {
  const requestHref = `/richiesta/${funnelSlug}`;

  return (
    <section
      id="quanto-costa"
      aria-labelledby="quanto-costa-title"
      className={cn(tokens.home.sectionGap)}
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <Badge variant="success">Zona</Badge>

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold leading-8 text-text-primary">
                {geoSection.title}
              </h2>

              <p className="text-base leading-7 text-text-secondary">
                {geoSection.summary}
              </p>
            </div>

            <Link
              href={requestHref}
              className={cn(
                tokens.interactive.base,
                tokens.interactive.radius,
                tokens.interactive.sizes.lg,
                tokens.interactive.variants.brand,
                "w-full sm:w-auto",
              )}
            >
              Richiedi preventivi
              <ArrowRight className="ml-2 size-4" aria-hidden={true} />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <Badge>Costi</Badge>

              <h2
                id="quanto-costa-title"
                className="text-2xl font-semibold leading-8 text-text-primary"
              >
                {costSection?.title ?? "Quanto costa questo intervento?"}
              </h2>

              {costSection?.summary ? (
                <p className="text-base leading-7 text-text-secondary">
                  {costSection.summary}
                </p>
              ) : null}

              {costSection?.priceRange ? (
                <p className="text-lg font-semibold text-text-primary">
                  {costSection.priceRange}
                </p>
              ) : null}
            </div>

            {costSection?.factors?.length ? (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-text-primary">
                  Fattori che influenzano il prezzo
                </h3>

                <ul className="grid gap-2 text-sm leading-6 text-text-secondary sm:grid-cols-2">
                  {costSection.factors.map((factor) => (
                    <li key={factor} className="flex gap-2">
                      <span aria-hidden={true} className="text-brand-primary">
                        -
                      </span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {costSection?.examples?.length ? (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-text-primary">
                  Esempi di richieste
                </h3>

                <div className="flex flex-wrap gap-2">
                  {costSection.examples.map((example) => (
                    <Badge key={example} size="sm">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
