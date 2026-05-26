import type { TaxonomyCategory } from "../../shared/types"

export const impiantiCategories: TaxonomyCategory[] = [
  {
    slug: "idraulico",

    name: "Idraulico",

    sectorSlug: "impianti",

    services: [
      "riparazione-perdite-acqua",
      "installazione-rubinetteria",
      "sostituzione-tubi",
      "installazione-sanitari",
    ],
  },

  {
    slug: "elettricista",

    name: "Elettricista",

    sectorSlug: "impianti",

    runtimePresetSlugs: [
      "ELECTRICAL_WORK",
    ],

    services: [
      "impianto-elettrico",
      "riparazione-guasti-elettrici",
      "prese-elettriche",
      "interruttori",
      "quadro-elettrico",
      "illuminazione",
      "lampadari",
      "citofoni",
      "videocitofoni",
      "salvavita",
    ],
  },

  {
    slug: "sicurezza-elettronica",

    name: "Sicurezza elettronica",

    sectorSlug: "impianti",

    services: [
      "installazione-antifurto",
      "videosorveglianza",
      "telecamere-sicurezza",
      "sensori-allarme",
      "controllo-accessi",
      "videoregistratori",
    ],
  },
]
