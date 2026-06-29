import type { FrozenProjectGroup } from "../types/project-group"

// Perimetro semantico (rifinitura di naming, nessun nuovo gruppo, nessuna
// frammentazione del dominio): questo gruppo include tutte le lavorazioni
// superficiali su pareti interne ed esterne — tinteggiatura, intonaco, rasatura,
// ripristino, stucco decorativo. Le varianti "intonaco esterno" e simili restano
// incluse qui per coerenza di funnel, non per distinzione tecnica.
export const finiture: FrozenProjectGroup = {
  id: "finiture",
  slug: "finiture",
  name: "Imbianchini e finiture",

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

      aliases: [
        "riparazione intonaco",
        "rifacimento intonaco"
      ]
    },

    {
      id: "applicare-stucco-decorativo",
      slug: "applicare-stucco-decorativo",
      name: "Applicare stucco decorativo",

      aliases: [
        "stucco veneziano",
        "stucco decorativo",
        "finitura decorativa"
      ]
    },

    {
      id: "rasare-pareti",
      slug: "rasare-pareti",
      name: "Rasare pareti",

      aliases: [
        "rasatura pareti",
        "rasare muro",
        "rasatura muro",
        "stuccatura e rasatura"
      ]
    }
  ]
}
