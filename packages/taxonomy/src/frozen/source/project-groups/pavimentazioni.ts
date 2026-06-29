import type { FrozenProjectGroup } from "../types/project-group"

export const pavimentazioni: FrozenProjectGroup = {
  id: "pavimentazioni",
  slug: "pavimentazioni",
  name: "Pavimentazioni",
  interventions: [
    {
      id: "fare-massetto",
      slug: "fare-massetto",
      name: "Fare massetto",
      aliases: ["gettare massetto", "rifare il sottofondo", "massetti"],
    },
  ],
}
