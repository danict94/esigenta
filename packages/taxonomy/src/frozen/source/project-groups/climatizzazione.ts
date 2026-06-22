import type { FrozenProjectGroup } from "../types/project-group"

export const climatizzazione: FrozenProjectGroup = {
  id: "climatizzazione",
  slug: "climatizzazione",
  name: "Climatizzazione",
  interventions: [
    {
      id: "installare-climatizzatore",
      slug: "installare-climatizzatore",
      name: "Installare climatizzatore",
      runtimePresetSlugs: ["QUICK_SERVICE"],
      aliases: ["installare aria condizionata", "montare condizionatore", "installazione climatizzatore"],
    },
    {
      id: "fare-manutenzione-climatizzatore",
      slug: "fare-manutenzione-climatizzatore",
      name: "Fare manutenzione climatizzatore",
      runtimePresetSlugs: ["QUICK_SERVICE"],
      aliases: ["pulizia climatizzatore", "ricarica gas climatizzatore", "manutenzione climatizzatore"],
    },
  ],
}
