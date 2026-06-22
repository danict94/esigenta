import type { FrozenProjectGroup } from "../types/project-group"

export const finiture: FrozenProjectGroup = {
  id: "finiture",
  slug: "finiture",
  name: "Finiture",

  aliases: [
    "finiture interne",
    "finiture edili",
    "lavori di finitura"
  ],

  interventions: [
    {
      id: "tinteggiare-interni",
      slug: "tinteggiare-interni",
      name: "Tinteggiare interni",

      runtimePresetSlugs: ["PAINTING"],

      aliases: [
        "imbiancare casa",
        "imbiancare appartamento",
        "tinteggiatura pareti interne",
        "tinteggiatura interni"
      ]
    },

    {
      id: "tinteggiare-esterni",
      slug: "tinteggiare-esterni",
      name: "Tinteggiare esterni",

      runtimePresetSlugs: ["EXTERIOR_WORK", "PAINTING"],

      aliases: [
        "imbiancare facciata",
        "tinteggiatura esterna",
        "verniciare facciata",
        "tinteggiatura esterni"
      ]
    },

    {
      id: "intonacare-pareti",
      slug: "intonacare-pareti",
      name: "Intonacare pareti",

      runtimePresetSlugs: ["INTERIOR_WORK"],

      aliases: [
        "intonaco interno",
        "intonaco esterno",
        "intonacatura pareti"
      ]
    },

    {
      id: "ripristinare-intonaco",
      slug: "ripristinare-intonaco",
      name: "Ripristinare intonaco",

      runtimePresetSlugs: ["INTERIOR_WORK"],

      aliases: [
        "riparazione intonaco",
        "rifacimento intonaco"
      ]
    },

    {
      id: "applicare-stucco-decorativo",
      slug: "applicare-stucco-decorativo",
      name: "Applicare stucco decorativo",

      runtimePresetSlugs: ["INTERIOR_WORK"],

      aliases: [
        "stucco veneziano",
        "stucco decorativo",
        "finitura decorativa"
      ]
    }
  ]
}
