import type { FrozenCategory } from "../types/category"

export const architetto: FrozenCategory = {
  id: "architetto",
  slug: "architetto",
  name: "Architetto",
  shortDescription:
    "Offre servizi tecnici per pratiche edilizie e progetti di ristrutturazione.",
  aliases: ["architetti"],
  isPublic: true,
  projectGroups: ["tecnici-e-pratiche-edilizie"],
  onboardingDefaults: [
    "fare-cila-o-scia",
    "fare-progetto-ristrutturazione",
  ],
}
