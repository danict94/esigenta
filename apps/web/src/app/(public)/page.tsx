import { Hero } from "../../components/home/hero"
import { HowItWorks } from "../../components/home/how-it-works"
import { PublicShell } from "../../components/layout/public-shell"

export default function HomePage() {
  return (
    <PublicShell>
      <Hero />
      <HowItWorks />
    </PublicShell>
  )
}