import { Hero } from "./hero"
import { CostGuides } from "./cost-guides"
import { HowItWorks } from "./how-it-works"
import { ProfessionalCta } from "./professional-cta"
import { ProfessionalAreas } from "./professional-areas"
import { PublicShell } from "../shell/public-shell"

export function HomePage() {
  return (
    <PublicShell hero={<Hero />}>
      <ProfessionalAreas />
      <HowItWorks />
      <ProfessionalCta />
      <CostGuides />
    </PublicShell>
  )
}
