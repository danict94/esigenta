import Link from "next/link";
import type { ReactElement, SVGProps } from "react";

import { cn, tokens } from "@esigenta/ui";

import { HomeContentRail } from "../layout/home-content-rail";

type QualityStep = {
  description: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  title: string;
};

const qualitySteps: QualityStep[] = [
  {
    title: "Verifica iniziale",
    description:
      "Effettuiamo un colloquio conoscitivo, verifichiamo documenti e qualifiche professionali, e analizziamo le referenze dei clienti.",
    Icon: HeadsetEditorialIcon,
  },
  {
    title: "Controllo qualità",
    description:
      "Esaminiamo preventivi già emessi e foto dei lavori realizzati, per garantire un eccellente rapporto qualità-prezzo nei servizi offerti.",
    Icon: QualityEditorialIcon,
  },
  {
    title: "Monitoraggio",
    description:
      "I professionisti del network vengono costantemente monitorati, ed esclusi dal network in caso di comportamenti non professionali.",
    Icon: MonitorEditorialIcon,
  },
];

export function WhyChoose() {
  return (
    <section
      className={cn(
        tokens.semanticSurfaces.secondary,
        tokens.spacing.sectionXl,
      )}
    >
      <HomeContentRail>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <h2 className="max-w-md text-4xl font-normal leading-tight text-text-primary md:text-5xl">
              Perché scegliere esigenta?
            </h2>

            <p className="mt-9 max-w-xl text-xl leading-8 text-text-primary">
              esigenta seleziona attraverso delle verifiche i profili dei
              professionisti confrontando documentazione, foto dei lavori
              eseguiti recensioni dei clienti inoltre chiediamo a te la tua
              valutazione
            </p>

            <Link
              href="/#richiedi-preventivo"
              className={cn(
                tokens.interactive.base,
                tokens.interactive.radius,
                tokens.interactive.sizes.lg,
                tokens.interactive.variants.dark,
                "mt-10 w-full max-w-sm lg:mt-28",
              )}
            >
              Richiedi il tuo preventivo
            </Link>
          </div>

          <div className="grid gap-11">
            {qualitySteps.map((step) => (
              <article
                key={step.title}
                className="flex flex-col items-start gap-4 sm:flex-row sm:gap-8 lg:gap-10"
              >
                <div className="flex shrink-0 justify-center sm:w-24">
                  <step.Icon
                    className="size-16 text-text-primary sm:size-20"
                    aria-hidden={true}
                  />
                </div>

                <div>
                  <h3 className="text-3xl font-semibold leading-9 text-text-primary">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-sm text-base leading-6 text-text-primary">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </HomeContentRail>
    </section>
  );
}

function HeadsetEditorialIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <path d="M18 39a22 22 0 0 1 44 0" />
      <path d="M18 39v11a5 5 0 0 0 5 5h4V38h-4a5 5 0 0 0-5 5" />
      <path d="M62 39v11a5 5 0 0 1-5 5h-4V38h4a5 5 0 0 1 5 5" />
      <path d="M28 68c3-9 8-13 12-13s9 4 12 13" />
      <path d="M27 68h26" />
      <path d="M30 32c2-8 7-13 10-13s8 5 10 13" />
      <path d="M30 35c1 11 5 18 10 18s9-7 10-18" />
      <path d="M32 43c3 2 6 3 8 3s5-1 8-3" />
      <path d="M36 51v6" />
      <path d="M44 51v6" />
    </svg>
  );
}

function QualityEditorialIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <path d="M24 10h24l12 12v44H24z" />
      <path d="M48 10v12h12" />
      <path d="M32 30h18" />
      <path d="M32 39h18" />
      <path d="M32 48h11" />
      <circle cx="56" cy="58" r="11" />
      <path d="m50 58 4 4 8-9" />
    </svg>
  );
}

function MonitorEditorialIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <path d="M18 43v22" />
      <path d="M14 65h8" />
      <path d="M18 48h11" />
      <path d="M29 37 35 16l31 8-6 21z" />
      <path d="m35 16 6 8 25 6" />
      <path d="m29 37 11 4 20 4" />
      <path d="M40 42v8" />
      <path d="M47 44v8" />
      <path d="M41 23h1" />
      <path d="M45 24h1" />
      <path d="M49 25h1" />
      <path d="M53 26h1" />
    </svg>
  );
}
