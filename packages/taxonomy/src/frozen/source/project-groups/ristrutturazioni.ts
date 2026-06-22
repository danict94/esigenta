import type { FrozenProjectGroup } from "../types/project-group"

export const ristrutturazioni: FrozenProjectGroup = {
  id: "ristrutturazioni",
  slug: "ristrutturazioni",
  name: "Ristrutturazioni",
  interventions: [
    {
      id: "ristrutturare-bagno",
      slug: "ristrutturare-bagno",
      name: "Ristrutturare bagno",
      runtimePresetSlugs: ["BATHROOM_RENOVATION", "HOME_RENOVATION"],
      aliases: ["rifare il bagno", "ristrutturare il bagno", "ristrutturazione bagno"],
    },
    {
      id: "ristrutturare-cucina",
      slug: "ristrutturare-cucina",
      name: "Ristrutturare cucina",
      runtimePresetSlugs: ["HOME_RENOVATION"],
      aliases: ["rifare la cucina", "ristrutturazione cucina"],
    },
    {
      id: "ristrutturare-casa",
      slug: "ristrutturare-casa",
      name: "Ristrutturare casa",
      runtimePresetSlugs: ["HOME_RENOVATION", "RENOVATION"],
      aliases: ["ristrutturare villa", "ristrutturazione casa indipendente", "ristrutturazione casa"],
    },
    {
      id: "ristrutturare-appartamento",
      slug: "ristrutturare-appartamento",
      name: "Ristrutturare appartamento",
      runtimePresetSlugs: ["HOME_RENOVATION", "RENOVATION"],
      aliases: ["ristrutturare casa intera", "ristrutturazione appartamento"],
    },
  ],
}
