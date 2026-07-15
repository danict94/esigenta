"use client";

import { FeaturedWorkSection } from "./featured-work-section";
import { HomeHero } from "./home-hero";
import { HomeTrustSection } from "./home-trust-section";
import { ProcessSteps } from "./process-steps";

export function HomeExperience() {
  return (
    <main className="eg-page eg-page-bg">
      <div className="eg-thread" />
      <HomeHero />
      <ProcessSteps />
      <FeaturedWorkSection />
      <HomeTrustSection />
    </main>
  );
}
