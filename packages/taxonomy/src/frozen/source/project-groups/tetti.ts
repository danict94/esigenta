import type { FrozenProjectGroup } from "../types/project-group"

export const tetti: FrozenProjectGroup = {
  id: "tetti",
  slug: "tetti",
  name: "Tetti",
  interventions: [
    {
      id: "rifare-tetto",
      slug: "rifare-tetto",
      name: "Rifare tetto",
      aliases: ["rifacimento tetto", "sostituire il tetto"],
    },
    {
      id: "riparare-tetto",
      slug: "riparare-tetto",
      name: "Riparare tetto",
      aliases: ["infiltrazioni tetto", "perdita dal tetto", "riparazione tetto"],
    },
    {
      id: "sistemare-grondaie",
      slug: "sistemare-grondaie",
      name: "Sistemare grondaie",
      aliases: ["grondaie rotte", "lattoniere", "riparare grondaie", "grondaie", "lattoneria"],
    },
  ],
}
