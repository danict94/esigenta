"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Fan,
  House,
  Paintbrush,
  Sun,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";

import {
  Button,
  Card,
  CardContent,
  cn,
  tokens,
} from "@fixpro/ui";

import { HomeContentRail } from "../layout/home-content-rail";
import { HomeImage } from "./home-image";

type FeaturedIntervention = {
  description: string;
  href: string;
  icon: LucideIcon;
  image: string;
  title: string;
};

const featuredInterventions: FeaturedIntervention[] = [
  {
    title: "Ristrutturare bagno",
    description: "Rinnova il bagno con professionisti qualificati.",
    href: "/richiesta/rifare-bagno",
    image: "/assets/images/rifacimento-bagno.webp",
    icon: Bath,
  },
  {
    title: "Rifare impianto elettrico",
    description: "Adegua o rinnova l'impianto della tua abitazione.",
    href: "/richiesta/impianto-elettrico-nuovo",
    image: "/assets/images/impianto-elettrico.webp",
    icon: Zap,
  },
  {
    title: "Installare fotovoltaico",
    description: "Riduci i consumi con un impianto solare moderno.",
    href: "/richiesta/installare-fotovoltaico",
    image: "/assets/images/installazione-fotovoltaico.webp",
    icon: Sun,
  },
  {
    title: "Rifare tetto",
    description: "Ripara o sostituisci la copertura di casa.",
    href: "/richiesta/rifare-tetto",
    image: "/assets/images/rifare-tetto.webp",
    icon: House,
  },
  {
    title: "Installare climatizzatore",
    description: "Trova tecnici per installazione e sostituzione.",
    href: "/richiesta/installare-climatizzatore",
    image: "/assets/images/climatizzazione.webp",
    icon: Fan,
  },
  {
    title: "Cartongesso e finiture",
    description: "Pareti, controsoffitti, rasature e pittura.",
    href: "/richiesta/cartongesso",
    image: "/assets/images/cartongesso.webp",
    icon: Paintbrush,
  },
];

export function ProfessionalAreas() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  function scrollCarousel(direction: "previous" | "next") {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const card = carousel.querySelector<HTMLElement>(
      "[data-featured-intervention-card]",
    );

    const styles = window.getComputedStyle(carousel);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    const cardWidth = card?.offsetWidth ?? carousel.clientWidth;

    carousel.scrollBy({
      left:
        direction === "next"
          ? cardWidth + gap
          : -(cardWidth + gap),
      behavior: "smooth",
    });
  }

  return (
    <section
      id="progetti-piu-richiesti"
      className={cn(tokens.home.sectionGap)}
    >
      <HomeContentRail>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={tokens.home.sectionLabel}>
              Richieste comuni
            </p>

            <h2 className={cn("mt-2", tokens.home.sectionTitle)}>
              Interventi pi&ugrave; richiesti
            </h2>

            <p className={cn("mt-3", tokens.home.sectionDescription)}>
              Scegli l&apos;intervento che ti serve e ricevi
              preventivi gratuiti dai migliori professionisti della
              tua zona.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Mostra interventi precedenti"
              onClick={() => {
                scrollCarousel("previous");
              }}
              className="h-11 w-11 rounded-full px-0"
            >
              <ArrowLeft className="size-5" aria-hidden={true} />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Mostra interventi successivi"
              onClick={() => {
                scrollCarousel("next");
              }}
              className="h-11 w-11 rounded-full px-0"
            >
              <ArrowRight className="size-5" aria-hidden={true} />
            </Button>
          </div>
        </div>

        <div
          ref={carouselRef}
          role="list"
          aria-label="Interventi piu richiesti"
          className="mt-8 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto scroll-smooth px-1 pb-4 [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
        >
          {featuredInterventions.map((intervention) => (
            <ProjectCard
              key={intervention.title}
              intervention={intervention}
            />
          ))}
        </div>
      </HomeContentRail>
    </section>
  );
}

function ProjectCard({
  intervention,
}: {
  intervention: FeaturedIntervention;
}) {
  const Icon = intervention.icon;

  return (
    <Card
      role="listitem"
      data-featured-intervention-card
      className="group flex min-w-0 flex-[0_0_84%] snap-start overflow-hidden border-border-primary bg-surface-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-surface sm:flex-[0_0_20rem] md:flex-[0_0_21rem] lg:flex-[0_0_21.5rem] xl:flex-[0_0_22rem]"
    >
      <Link
        href={intervention.href}
        aria-label={`Apri richiesta per ${intervention.title}`}
        className="flex h-full w-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary"
      >
        <div className="relative overflow-hidden">
          <HomeImage
            src={intervention.image}
            alt={intervention.title}
            sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 21.5rem, (min-width: 768px) 21rem, (min-width: 640px) 20rem, 84vw"
            fallbackLabel={`Foto ${intervention.title}`}
            className="aspect-[4/3] bg-surface-tertiary transition-transform duration-300 group-hover:scale-[1.03]"
          />

          <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface-primary shadow-surface">
            <Icon
              className="size-5 text-action-primary"
              aria-hidden={true}
            />
          </div>
        </div>

        <CardContent className="flex min-h-[14rem] flex-1 flex-col px-6 pb-6 pt-6">
          <h3 className="text-xl font-semibold leading-7 text-text-primary">
            {intervention.title}
          </h3>

          <p className="mt-3 text-base leading-7 text-text-secondary">
            {intervention.description}
          </p>

          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-action-primary transition-colors group-hover:text-action-primary-hover">
            Richiedi preventivi
            <ArrowRight className="size-4" aria-hidden={true} />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}