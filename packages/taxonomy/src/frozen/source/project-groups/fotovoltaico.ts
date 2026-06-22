import type { FrozenProjectGroup } from "../types/project-group"

export const fotovoltaico: FrozenProjectGroup = {
  id: "fotovoltaico",
  slug: "fotovoltaico",
  name: "Fotovoltaico",
  interventions: [
    {
      id: "installare-fotovoltaico",
      slug: "installare-fotovoltaico",
      name: "Installare fotovoltaico",
      runtimePresetSlugs: ["RENOVATION"],
      aliases: ["impianto fotovoltaico", "pannelli solari", "installazione fotovoltaico"],
    },
    {
      id: "installare-fotovoltaico-con-accumulo",
      slug: "installare-fotovoltaico-con-accumulo",
      name: "Installare fotovoltaico con accumulo",
      runtimePresetSlugs: ["RENOVATION"],
      aliases: ["fotovoltaico con batteria", "impianto con accumulo", "fotovoltaico con accumulo"],
    },
  ],
}
