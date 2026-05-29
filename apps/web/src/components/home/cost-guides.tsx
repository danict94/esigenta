import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, cn, tokens } from "@fixpro/ui";

import { HomeContentRail } from "../layout/home-content-rail";
import { HomeImage } from "./home-image";

type Guide = {
  description: string;
  imageSrc: string;
  title: string;
};

const guides: Guide[] = [
  {
    title: "Quanto costa rifare un bagno nel 2026?",
    description:
      "Prezzi indicativi, materiali, dimensioni e fattori che cambiano il preventivo.",
    imageSrc: "/assets/images/home/guida-bagno.webp",
  },
  {
    title: "Quanto costa riparare un tetto nel 2025?",
    description:
      "Cosa valutare tra urgenza, sicurezza, materiali e complessità del lavoro.",
    imageSrc: "/assets/images/home/guida-tetto.webp",
  },
  {
    title: "Quanto costa installare un climatizzatore?",
    description:
      "Esempi utili per capire installazione, manutenzione e possibili extra.",
    imageSrc: "/assets/images/home/guida-climatizzatore.webp",
  },
  {
    title: "Quanto rende un impianto fotovoltaico?",
    description:
      "Una guida semplice su consumi, incentivi e ritorno dell'investimento.",
    imageSrc: "/assets/images/home/guida-fotovoltaico.webp",
  },
];

export function CostGuides() {
  return (
    <section className={tokens.home.section}>
      <HomeContentRail>
        <div className="max-w-3xl">
          <p className={tokens.home.sectionLabel}>Consigli</p>

          <h2 className={cn("mt-2", tokens.home.sectionTitle)}>
            Guide e costi consulta le nostre guide
          </h2>

          <p className={cn("mt-4", tokens.home.sectionDescription)}>
            Consulta le guide esigenta per capire prezzi indicativi, esempi
            reali e cosa valutare prima di richiedere preventivi.
          </p>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide) => (
            <GuideCard key={guide.title} guide={guide} />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-primary underline underline-offset-4 transition-colors hover:text-action-primary"
          >
            <ArrowRight className="size-5 text-action-primary" aria-hidden="true" />
            leggi tutti
          </Link>
        </div>
      </HomeContentRail>
    </section>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="overflow-hidden border-transparent">
      <HomeImage
        src={guide.imageSrc}
        alt={guide.title}
        sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 100vw"
        fallbackLabel="Foto guida"
        className="aspect-video bg-surface-tertiary"
      />

      <CardContent className="px-4 pb-5 pt-4">
        <h3 className="text-sm font-semibold leading-5 text-text-primary">
          {guide.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {guide.description}
        </p>
      </CardContent>
    </Card>
  );
}
