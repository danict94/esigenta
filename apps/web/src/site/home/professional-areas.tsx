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

import { Button, Card, Container, cn, tokens } from "@esigenta/ui";

import {
  getServiceCatalogItemHref,
  listFeaturedServiceCatalogItems,
} from "../services";
import { HomeImage } from "./home-image";

const featuredIcons: Record<string, LucideIcon> = {
  bath: Bath,
  zap: Zap,
  sun: Sun,
  house: House,
  fan: Fan,
  paintbrush: Paintbrush,
};

const projectIdeasFeatureImage = {
  alt: "Professionisti in cantiere",
  fallbackLabel: "Foto professionisti in cantiere",
  src: "/assets/images/professionisti-hero.webp",
};

export function ProfessionalAreas() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const featuredItems = listFeaturedServiceCatalogItems()
    .map((item) => {
      const href = getServiceCatalogItemHref(item);

      if (!href || !item.homeFeature) {
        return null;
      }

      return {
        slug: item.slug,
        title: item.title,
        description: item.homeFeature.description,
        image: item.homeFeature.image,
        icon: featuredIcons[item.homeFeature.icon] ?? Bath,
        href,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

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
                href="/servizi"
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
              {featuredItems.map((item) => (
                <ProjectCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

type FeaturedDisplayItem = {
  slug: string;
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  href: string;
};

function ProjectCard({ item }: { item: FeaturedDisplayItem }) {
  return (
    <Card
      role="listitem"
      data-featured-intervention-card
      className={tokens.home.projectIdeas.card}
    >
      <Link
        href={item.href}
        aria-label={`Apri progetto ${item.title}. ${item.description}`}
        className={tokens.home.projectIdeas.cardLink}
      >
        <HomeImage
          src={item.image}
          alt={item.title}
          sizes="(min-width: 1280px) 18.5rem, (min-width: 1024px) 21vw, (min-width: 768px) 15rem, 15.5rem"
          fallbackLabel={`Foto ${item.title}`}
          className={tokens.home.projectIdeas.cardImage}
        />

        <h3 className={tokens.home.projectIdeas.cardTitle}>{item.title}</h3>
      </Link>
    </Card>
  );
}
