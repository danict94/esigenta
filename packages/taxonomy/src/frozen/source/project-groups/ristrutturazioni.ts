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
      aliases: ["rifare il bagno", "ristrutturare il bagno", "ristrutturazione bagno"],
    },
    {
      id: "ristrutturare-cucina",
      slug: "ristrutturare-cucina",
      name: "Ristrutturare cucina",
      aliases: ["rifare la cucina", "ristrutturazione cucina"],
    },
    {
      id: "ristrutturare-casa",
      slug: "ristrutturare-casa",
      name: "Ristrutturare casa",
      aliases: ["ristrutturare villa", "ristrutturazione casa indipendente", "ristrutturazione casa"],
    },
    {
      id: "ristrutturare-appartamento",
      slug: "ristrutturare-appartamento",
      name: "Ristrutturare appartamento",
      aliases: ["ristrutturare casa intera", "ristrutturazione appartamento"],
    },
  ],
}
