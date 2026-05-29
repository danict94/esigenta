import Link from "next/link";
import { BriefcaseBusiness, MapPin } from "lucide-react";

import { Card, CardContent, cn, tokens } from "@fixpro/ui";

import { HomeContentRail } from "../layout/home-content-rail";
import { HomeImage } from "./home-image";

const professionalImageSrc = "/assets/images/professionista-furgone.webp";

export function ProfessionalCta() {
  return (
    <section className={tokens.home.section}>
      <HomeContentRail>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className={tokens.home.sectionLabel}>
              Per i professionisti
            </p>

            <h2 className={cn("mt-3", tokens.home.sectionTitle)}>
              Cerchi dei lavori?
            </h2>

            <p className="mt-2 text-2xl font-medium leading-tight tracking-[-0.04em] text-text-primary md:text-3xl">
              Fai crescere la tua attività con esigenta
            </p>

            <p className={cn("mt-5 md:leading-7", tokens.home.sectionDescription)}>
              Esigenta è la piattaforma affidabile per trovare lavori che vuoi.
              Registrati gratis e ricevi nuove opportunità di lavoro nella tua
              zona in base alle competenze. Scegli tra grandi progetti o piccoli
              lavori — decidi tu.
            </p>

            <Link
              href="/area-impresa"
              className={cn(
                tokens.interactive.base,
                tokens.interactive.variants.secondary,
                "mt-7 h-11 rounded-full border-border-focus px-6 text-sm font-semibold",
              )}
            >
              Iscriviti gratis
            </Link>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden lg:min-h-[30rem]">
            <Card className="absolute left-5 top-10 z-10 w-48 border-border-secondary bg-surface-elevated shadow-card md:left-10 md:top-16">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-action-primary">
                  <BriefcaseBusiness className="size-4" aria-hidden="true" />
                  Nuova richiesta
                </p>

                <p className="mt-3 text-sm font-semibold text-text-primary">
                  Installare climatizzatore
                </p>

                <p className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  Bagno a Ripoli
                </p>
              </CardContent>
            </Card>

            <HomeImage
              src={professionalImageSrc}
              decorative
              sizes="(min-width: 1024px) 620px, 100vw"
              fallbackLabel="Aggiungi /assets/images/professionista-furgone.webp"
              className="absolute inset-x-0 bottom-0 top-4 mx-auto max-w-2xl"
              imageClassName="object-contain object-bottom"
            />
          </div>
        </div>
      </HomeContentRail>
    </section>
  );
}
