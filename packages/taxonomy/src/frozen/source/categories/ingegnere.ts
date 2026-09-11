import type { FrozenCategory } from "../types/category"

export const ingegnere: FrozenCategory = {
  id: "ingegnere",
  slug: "ingegnere",
  name: "Ingegnere",
  shortDescription:
    "Offre servizi tecnici per pratiche edilizie e progetti di ristrutturazione.",
  aliases: ["ingegneri"],
  isPublic: true,
  projectGroups: ["tecnici-e-pratiche-edilizie"],
  onboardingDefaults: [
    "fare-cila-o-scia",
    "fare-progetto-ristrutturazione",
  ],
}
