"use client";

import { FeaturedWorkSection } from "./featured-work-section";
import { HomeHero } from "./home-hero";
import { HomeHubSection } from "./home-hub-section";
import { HomeProofSection } from "./home-proof-section";
import { ProcessSteps } from "./process-steps";

export function HomeExperience() {
  return (
    <main className="eg-page eg-page-bg">
      <div className="eg-thread" />
      <HomeHero />
      <ProcessSteps />
      <FeaturedWorkSection />
      <HomeHubSection />
      <HomeProofSection />
    </main>
  );
}
