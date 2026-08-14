"use client";

import ReactDOM from "react-dom";

import { FeaturedWorkSection } from "./featured-work-section";
import { HomeHero } from "./home-hero";
import { HomeTrustSection } from "./home-trust-section";
import { ProcessSteps } from "./process-steps";

const HOME_HERO_IMAGE_SRC = "/assets/images/home/hero.webp";

type HomeExperienceProps = {
  // Id del sentinel muto renderizzato subito dopo l'hero: il contratto e'
  // dichiarato dal chiamante (home-page.tsx), che lo condivide anche con
  // BusinessAccessTab. Questo componente non conosce il valore concreto.
  heroBoundaryId: string;
};

export function HomeExperience({ heroBoundaryId }: HomeExperienceProps) {
  ReactDOM.preload(HOME_HERO_IMAGE_SRC, {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <main className="eg-page eg-page-bg">
      <HomeHero />
      {/* Sentinel muto: nessun numero stimato, solo il confine reale tra
          l'hero e il resto della pagina. */}
      <div id={heroBoundaryId} aria-hidden="true" className="h-px" />
      <ProcessSteps />
      <FeaturedWorkSection />
      <HomeTrustSection />
    </main>
  );
}
