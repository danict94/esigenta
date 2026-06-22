import type { FrozenProjectGroup } from "../types/project-group"

export const cartongesso: FrozenProjectGroup = {
  id: "cartongesso",
  slug: "cartongesso",
  name: "Cartongesso",

  aliases: [
    "lavori in cartongesso",
    "cartongesso e pareti"
  ],

  interventions: [
    {
      id: "realizzare-parete-cartongesso",
      slug: "realizzare-parete-cartongesso",
      name: "Realizzare parete in cartongesso",

      runtimePresetSlugs: ["INTERIOR_WORK"],

      aliases: [
        "parete in cartongesso",
        "divisorio in cartongesso",
        "tramezza in cartongesso"
      ]
    },

    {
      id: "realizzare-controsoffitto",
      slug: "realizzare-controsoffitto",
      name: "Realizzare controsoffitto",

      runtimePresetSlugs: ["INTERIOR_WORK"],

      aliases: [
        "controsoffitto in cartongesso",
        "abbassamento soffitto",
        "soffitto in cartongesso"
      ]
    },

    {
      id: "realizzare-controparete",
      slug: "realizzare-controparete",
      name: "Realizzare controparete",

      runtimePresetSlugs: ["INTERIOR_WORK"],

      aliases: [
        "controparete in cartongesso",
        "isolamento parete interna"
      ]
    }
  ]
}
