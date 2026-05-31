import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  PageShell,
  cn,
  tokens,
} from "@fixpro/ui";

import type { SeoInterventionLanding } from "../../content/seo/intervention-landings";
import { GeoCostModule } from "./geo-cost-module";
import { SeoBreadcrumb } from "./seo-breadcrumb";
import { SeoFaq } from "./seo-faq";

export type InterventionLandingPageProps = {
  landing: SeoInterventionLanding;
};

export function InterventionLandingPage({
  landing,
}: InterventionLandingPageProps) {
  const requestHref = `/richiesta/${landing.funnelSlug}`;

  return (
    <PageShell size="xl">
      <div className="space-y-14 md:space-y-18">
        <SeoBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Interventi", href: "/interventi" },
            { label: landing.title },
          ]}
        />

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-3xl space-y-6">
            <Badge variant="success">{landing.domainSlug}</Badge>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
                {landing.h1}
              </h1>

              <p className="text-lg leading-8 text-text-secondary">
                {landing.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={requestHref}
                className={cn(
                  tokens.interactive.base,
                  tokens.interactive.radius,
                  tokens.interactive.sizes.xl,
                  tokens.interactive.variants.brand,
                  "w-full sm:w-auto",
                )}
              >
                Richiedi preventivi
                <ArrowRight className="ml-2 size-4" aria-hidden={true} />
              </Link>

              <p className="text-sm leading-6 text-text-secondary">
                Preventivi gratuiti da professionisti qualificati della
                tua zona.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="space-y-5 pt-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Cosa puoi richiedere
              </p>

              <ul className="space-y-3">
                {landing.requestItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-base leading-7 text-text-secondary"
                  >
                    <span aria-hidden={true} className="text-brand-primary">
                      -
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section
          aria-labelledby="professionisti-collegati-title"
          className="grid gap-6 lg:grid-cols-2"
        >
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2
                id="professionisti-collegati-title"
                className="text-2xl font-semibold leading-8 text-text-primary"
              >
                Professionisti collegati
              </h2>

              <p className="text-base leading-7 text-text-secondary">
                In base al lavoro, potresti aver bisogno di una o più
                figure specializzate.
              </p>

              <div className="flex flex-wrap gap-2">
                {landing.professionalCategorySlugs.map((slug) => (
                  <Badge key={slug}>{formatSlugLabel(slug)}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-2xl font-semibold leading-8 text-text-primary">
                Interventi correlati
              </h2>

              <p className="text-base leading-7 text-text-secondary">
                Altri lavori utili se stai pianificando interventi simili
                o complementari.
              </p>

              <div className="flex flex-wrap gap-2">
                {landing.relatedInterventionSlugs.map((slug) => (
                  <Badge key={slug}>{formatSlugLabel(slug)}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <GeoCostModule
          geoSection={landing.geoSection}
          costSection={landing.costSection}
          funnelSlug={landing.funnelSlug}
        />

        <SeoFaq faq={landing.faq} />

        <section className="text-center">
          <Card>
            <CardContent className="mx-auto max-w-3xl space-y-5 pt-8">
              <h2 className={tokens.home.sectionTitle}>
                Pronto a confrontare preventivi?
              </h2>

              <p className="text-base leading-7 text-text-secondary">
                Descrivi il lavoro e continua nel funnel dedicato a{" "}
                <span className="font-semibold text-text-primary">
                  {landing.title}
                </span>
                .
              </p>

              <Link
                href={requestHref}
                className={cn(
                  tokens.interactive.base,
                  tokens.interactive.radius,
                  tokens.interactive.sizes.xl,
                  tokens.interactive.variants.brand,
                  "w-full sm:w-auto",
                )}
              >
                Vai alla richiesta
                <ArrowRight className="ml-2 size-4" aria-hidden={true} />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}

function formatSlugLabel(slug: string) {
  const label = slug.replaceAll("-", " ");

  return label.charAt(0).toUpperCase() + label.slice(1);
}
