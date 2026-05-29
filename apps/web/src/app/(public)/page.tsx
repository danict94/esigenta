import { Hero } from "../../components/home/hero";
import { CostGuides } from "../../components/home/cost-guides";
import { HowItWorks } from "../../components/home/how-it-works";
import { ProfessionalCta } from "../../components/home/professional-cta";
import { ProfessionalAreas } from "../../components/home/professional-areas";
import { PublicShell } from "../../components/layout/public-shell";

export default function HomePage() {
  return (
    <PublicShell hero={<Hero />}>
      <HowItWorks />
      <ProfessionalAreas />
      <ProfessionalCta />
      <CostGuides />
    </PublicShell>
  );
}
