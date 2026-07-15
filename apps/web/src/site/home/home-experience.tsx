"use client";

import { FeaturedWorkSection } from "./featured-work-section";
import { HomeHero } from "./home-hero";
import { HomeTrustSection } from "./home-trust-section";
import { ProcessSteps } from "./process-steps";

type HomeExperienceProps = {
  // Id del sentinel muto renderizzato subito dopo l'hero: il contratto e'
  // dichiarato dal chiamante (home-page.tsx), che lo condivide anche con
  // BusinessAccessTab. Questo componente non conosce il valore concreto.
  heroBoundaryId: string;
};

export function HomeExperience({ heroBoundaryId }: HomeExperienceProps) {
  return (
    <main className="eg-page eg-page-bg">
      <div className="eg-thread" />
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
