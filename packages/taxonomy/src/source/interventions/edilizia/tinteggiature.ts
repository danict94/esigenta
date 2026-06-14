import type { TaxonomyIntervention } from "../../../shared/types";

export const tinteggiatureInterventions: TaxonomyIntervention[] = [
  {
    slug: "tinteggiare-pareti",

    name: "Tinteggiare pareti",

    services: ["tinteggiatura-pareti"],

    aliases: [
      "pitturare pareti",
      "dipingere pareti",
      "imbiancare pareti",
      "verniciare pareti",
      "tinteggiare muri",
      "pitturare muri",
      "dipingere muri",
      "imbiancare muri",
      "pareti da pitturare",
      "pareti da imbiancare",
    ],
  },

  {
    slug: "tinteggiare-interni",

    name: "Tinteggiare interni",

    services: ["tinteggiatura-interni"],

    aliases: [
      "imbiancare casa",
      "pitturare casa",
      "dipingere casa",
      "tinteggiare casa",
      "imbiancare appartamento",
      "pitturare appartamento",
      "dipingere appartamento",
      "imbiancare stanze",
      "pitturare stanze",
      "tinteggiatura interna",
    ],
  },

  {
    slug: "tinteggiare-esterni",

    name: "Tinteggiare esterni",

    services: ["tinteggiatura-esterni"],

    aliases: [
      "pitturare esterni",
      "dipingere esterni",
      "imbiancare esterno casa",
      "tinteggiare esterno casa",
      "pitturare muro esterno",
      "dipingere muro esterno",
      "tinteggiatura esterna",
      "verniciare esterni",
      "pitturare facciata",
      "tinteggiare facciata",
    ],
  },
];
