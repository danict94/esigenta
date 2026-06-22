import type { FrozenProjectGroup } from "../types/project-group"

export const opereMurarie: FrozenProjectGroup = {
  id: "opere-murarie",
  slug: "opere-murarie",
  name: "Opere murarie",
  interventions: [
    {
      id: "fare-opere-murarie",
      slug: "fare-opere-murarie",
      name: "Fare opere murarie",
      runtimePresetSlugs: ["INTERIOR_WORK"],
      aliases: ["costruire parete divisoria", "demolire muro", "demolizioni", "tramezzi"],
    },
    {
      id: "fare-massetto",
      slug: "fare-massetto",
      name: "Fare massetto",
      runtimePresetSlugs: ["INTERIOR_WORK"],
      aliases: ["gettare massetto", "rifare il sottofondo", "massetti"],
    },
    {
      id: "ripristino-frontalino",
      slug: "ripristino-frontalino",
      name: "Ripristino frontalino",
      runtimePresetSlugs: ["EXTERIOR_WORK"],
      aliases: ["ripristinare frontalino", "rifacimento frontalino"],
    },
  ],
}
