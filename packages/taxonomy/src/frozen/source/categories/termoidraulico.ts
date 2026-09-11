import type { FrozenCategory } from "../types/category"

export const termoidraulico: FrozenCategory = {
  id: "termoidraulico",
  slug: "termoidraulico",
  name: "Termoidraulico",
  shortDescription:
    "Si occupa di installazione e manutenzione di caldaie e sistemi di riscaldamento.",
  aliases: ["termoidraulici"],
  isPublic: false,
  projectGroups: ["riscaldamento"],
  onboardingDefaults: [
    "installare-o-sostituire-caldaia",
    "installare-o-sostituire-termosifoni",
    "installare-o-sostituire-scaldabagno",
    "fare-manutenzione-caldaia",
  ],
}
