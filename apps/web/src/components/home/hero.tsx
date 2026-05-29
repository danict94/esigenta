import type { LucideIcon } from "lucide-react";

import { MapPin, ShieldCheck, Zap } from "lucide-react";

import { cn, Container, tokens } from "@fixpro/ui";

import { HomeContentRail } from "../layout/home-content-rail";
import { Navbar } from "../navigation/navbar";
import { FunnelEntry } from "./funnel-entry";
import { HomeImage } from "./home-image";

const heroIllustrationSrc = "/assets/images/professionisti-hero.webp";

const trustBenefits: {
  description: string;
  iconClassName: string;
  Icon: LucideIcon;
  title: string;
}[] = [
  {
    title: "Professionisti verificati",
    description: "Solo esperti qualificati.",
    Icon: ShieldCheck,
    iconClassName: "text-accent-step-one",
  },
  {
    title: "Vicini a te",
    description: "Solo esperti qualificati.",
    Icon: MapPin,
    iconClassName: "text-accent-step-two",
  },
  {
    title: "Risposte rapide",
    description: "Meno attese, piu soluzioni.",
    Icon: Zap,
    iconClassName: "text-accent-warning",
  },
];

export function Hero() {
  return (
    <section className="pt-2 md:pt-3">
      <Container size="full" gutter="sm">
        <div className={tokens.home.hero.frame}>
          <Navbar variant="hero" />

          <div className={tokens.home.hero.lightPanel}>
            <div className={tokens.home.hero.titleBlock}>
              <h1 className={tokens.home.hero.title}>
                <span className="block">Dai forma</span>
                <span className="block">ai tuoi progetti</span>
                <span className="block">con il Professionista</span>
                <span className="block">giusto per te</span>
              </h1>
            </div>

            <div className={tokens.home.hero.searchBlock}>
              <p className={tokens.home.hero.question}>
                di cosa hai bisogno?
              </p>

              <div className={tokens.home.hero.heroSearch}>
                <FunnelEntry searchVariant="hero" />
              </div>
            </div>
          </div>

          <div className={tokens.home.hero.darkPanel}>
            <HomeImage
              src={heroIllustrationSrc}
              decorative
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              fallbackLabel="Aggiungi /assets/images/professionisti-hero.webp"
              fallbackClassName="bg-surface-dark text-text-on-hero-secondary"
              minimalFallback
              className={tokens.home.hero.image}
              imageClassName="object-contain object-bottom"
            />
          </div>
        </div>
      </Container>

      <TrustBenefits />
    </section>
  );
}

function TrustBenefits() {
  return (
    <HomeContentRail className="py-5 md:py-6">
      <div className="grid gap-3 sm:grid-cols-3 md:gap-6">
        {trustBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center gap-3 rounded-lg bg-surface-primary px-2 py-3 sm:flex-col sm:justify-start sm:text-center"
          >
            <benefit.Icon
              className={cn("size-7", benefit.iconClassName)}
              aria-hidden="true"
              strokeWidth={1.6}
            />

            <div>
              <h2 className="text-sm font-semibold text-text-primary md:text-base">
                {benefit.title}
              </h2>

              <p className="mt-1 text-xs text-text-secondary">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </HomeContentRail>
  );
}
