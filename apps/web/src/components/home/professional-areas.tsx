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

import { Button, Card, Container, cn, tokens } from "@fixpro/ui";

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
    href: "/interventi/ristrutturare-bagno",
    image: "/assets/images/rifacimento-bagno.webp",
    icon: Bath,
  },
  {
    title: "Rifare impianto elettrico",
    description: "Adegua o rinnova l'impianto della tua abitazione.",
    href: "/interventi/rifare-impianto-elettrico",
    image: "/assets/images/impianto-elettrico.webp",
    icon: Zap,
  },
  {
    title: "Installare fotovoltaico",
    description: "Riduci i consumi con un impianto solare moderno.",
    href: "/interventi/installare-fotovoltaico",
    image: "/assets/images/installazione-fotovoltaico.webp",
    icon: Sun,
  },
  {
    title: "Rifare tetto",
    description: "Ripara o sostituisci la copertura di casa.",
    href: "/interventi/rifare-tetto",
    image: "/assets/images/rifare-tetto.webp",
    icon: House,
  },
  {
    title: "Installare climatizzatore",
    description: "Trova tecnici per installazione e sostituzione.",
    href: "/interventi/installare-climatizzatore",
    image: "/assets/images/climatizzazione.webp",
    icon: Fan,
  },
  {
    title: "Cartongesso e finiture",
    description: "Pareti, controsoffitti, rasature e pittura.",
    href: "/interventi/cartongesso-e-finiture",
    image: "/assets/images/cartongesso.webp",
    icon: Paintbrush,
  },
];

const projectIdeasFeatureImage = {
  alt: "Professionisti in cantiere",
  fallbackLabel: "Foto professionisti in cantiere",
  src: "/assets/images/professionisti-hero.webp",
};

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
      left: direction === "next" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    });
  }

  return (
    <section
      id="progetti-piu-richiesti"
      className={cn(tokens.home.projectIdeas.root)}
    >
      <Container size="lg" gutter="md">
        <div className={tokens.home.projectIdeas.inner}>
          <div className={tokens.home.projectIdeas.feature}>
            <HomeImage
              src={projectIdeasFeatureImage.src}
              alt={projectIdeasFeatureImage.alt}
              sizes="(min-width: 1280px) 32.5rem, (min-width: 1024px) 38vw, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
              fallbackLabel={projectIdeasFeatureImage.fallbackLabel}
              className={tokens.home.projectIdeas.featureImage}
              priority
            />

            <div className={tokens.home.projectIdeas.copy}>
              <h2 className={tokens.home.projectIdeas.title}>
                Idee per il tuo
                <br />
                progetto
              </h2>

              <p className={tokens.home.projectIdeas.description}>
                Scopri alcuni
                <br />
                degli interventi
                <br />
                pi&ugrave; richiesti.
              </p>

              <Link
                href="#idee-progetto-lista"
                className={cn("group", tokens.home.projectIdeas.cta)}
              >
                <span>vedi tutti</span>
                <span
                  className={tokens.home.projectIdeas.ctaIcon}
                  aria-hidden={true}
                >
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </div>
          </div>

          <div className={tokens.home.projectIdeas.carouselShell}>
            <div className={tokens.home.projectIdeas.carouselToolbar}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label="Scorri progetti precedenti"
                className={tokens.home.projectIdeas.carouselButton}
                onClick={() => {
                  scrollCarousel("previous");
                }}
              >
                <ArrowLeft className="size-4" aria-hidden={true} />
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label="Scorri progetti successivi"
                className={tokens.home.projectIdeas.carouselButton}
                onClick={() => {
                  scrollCarousel("next");
                }}
              >
                <ArrowRight className="size-4" aria-hidden={true} />
              </Button>
            </div>

            <div
              ref={carouselRef}
              id="idee-progetto-lista"
              role="list"
              aria-label="Idee per il tuo progetto"
              className={tokens.home.projectIdeas.carousel}
            >
              {featuredInterventions.map((intervention) => (
                <ProjectCard
                  key={intervention.title}
                  intervention={intervention}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProjectCard({ intervention }: { intervention: FeaturedIntervention }) {
  return (
    <Card
      role="listitem"
      data-featured-intervention-card
      className={tokens.home.projectIdeas.card}
    >
      <Link
        href={intervention.href}
        aria-label={`Apri progetto ${intervention.title}. ${intervention.description}`}
        className={tokens.home.projectIdeas.cardLink}
      >
        <HomeImage
          src={intervention.image}
          alt={intervention.title}
          sizes="(min-width: 1280px) 18.5rem, (min-width: 1024px) 21vw, (min-width: 768px) 15rem, 15.5rem"
          fallbackLabel={`Foto ${intervention.title}`}
          className={tokens.home.projectIdeas.cardImage}
        />

        <h3 className={tokens.home.projectIdeas.cardTitle}>
          {intervention.title}
        </h3>
      </Link>
    </Card>
  );
}
