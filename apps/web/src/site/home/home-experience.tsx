"use client";

import ReactDOM from "react-dom";

import { FeaturedWorkSection } from "./featured-work-section";
import { HomeHero } from "./home-hero";
import { HomeTrustSection } from "./home-trust-section";
import { ProcessSteps } from "./process-steps";

// Stesso breakpoint di home-hero.tsx (min-[861px]): la section cambia
// background-image li', questi due preload devono restare in coppia con
// quello. Ogni preload porta il proprio `media`: il browser scarica solo
// quello che fa match con il viewport corrente, l'altro resta inerte.
const HOME_HERO_IMAGE_SRC_MOBILE = "/assets/images/home/hero-mobile.webp";
const HOME_HERO_IMAGE_SRC_DESKTOP = "/assets/images/home/hero-desktop.webp";
const HOME_HERO_BREAKPOINT_MOBILE = "(max-width: 860px)";
const HOME_HERO_BREAKPOINT_DESKTOP = "(min-width: 861px)";

type HomeExperienceProps = {
  // Id del sentinel muto renderizzato subito dopo l'hero: il contratto e'
  // dichiarato dal chiamante (home-page.tsx), che lo condivide anche con
  // BusinessAccessTab. Questo componente non conosce il valore concreto.
  heroBoundaryId: string;
};

export function HomeExperience({ heroBoundaryId }: HomeExperienceProps) {
  ReactDOM.preload(HOME_HERO_IMAGE_SRC_MOBILE, {
    as: "image",
    fetchPriority: "high",
    media: HOME_HERO_BREAKPOINT_MOBILE,
  });
  ReactDOM.preload(HOME_HERO_IMAGE_SRC_DESKTOP, {
    as: "image",
    fetchPriority: "high",
    media: HOME_HERO_BREAKPOINT_DESKTOP,
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
