import type { TaxonomyIntervention } from "../../../shared/types";

export const intonaciRasatureInterventions: TaxonomyIntervention[] = [
  {
    slug: "fare-intonaco",

    name: "Fare intonaco",

    services: ["intonaci"],

    aliases: [
      "intonacare muro",
      "intonacare parete",
      "rifare intonaco",
      "intonaco nuovo",
      "fare intonaci",
      "muro da intonacare",
    ],
  },

  {
    slug: "fare-rasatura",

    name: "Fare rasatura",

    services: ["rasature"],

    aliases: [
      "rasare parete",
      "rasare muro",
      "rasatura muro",
      "rasatura pareti",
      "parete da rasare",
      "rendere parete liscia",
    ],
  },

  {
    slug: "stuccare-muro",

    name: "Stuccare muro",

    services: ["stuccature-murarie"],

    aliases: [
      "stuccare parete",
      "chiudere crepe muro",
      "riparare crepe muro",
      "stuccatura parete",
      "stuccare buchi muro",
    ],
  },

  {
    slug: "ripristinare-muro",

    name: "Ripristinare muro",

    services: ["ripristino-muri"],

    aliases: [
      "ripristinare parete",
      "muro rovinato",
      "parete rovinata",
      "sistemare parete danneggiata",
      "sistemare muro rovinato",
      "ripristino parete interna",
    ],
  },
];
