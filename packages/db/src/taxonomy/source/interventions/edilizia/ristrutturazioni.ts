import type { TaxonomyIntervention } from "../../../shared/types";

export const ristrutturazioniInterventions: TaxonomyIntervention[] = [
  {
    slug: "rifare-cucina",

    name: "Rifare cucina",

    services: ["ristrutturazione-cucina"],

    aliases: [
      "cucina nuova",
      "rifare la cucina",
      "rinnovare cucina",
      "rimodernare cucina",
      "cucina da rifare",
      "rifare cucina completa",
      "lavori cucina",
    ],
  },

  {
    slug: "ristrutturare-appartamento",

    name: "Ristrutturare appartamento",

    services: ["ristrutturazione-appartamento"],

    aliases: [
      "rifare appartamento",
      "rinnovare appartamento",
      "rimodernare appartamento",
      "appartamento da ristrutturare",
      "rifare alloggio",
      "ristrutturare alloggio",
      "lavori appartamento",
      "ristrutturare interni appartamento",
    ],
  },

  {
    slug: "ristrutturare-casa",

    name: "Ristrutturare casa",

    services: ["ristrutturazione-casa"],

    aliases: [
      "rifare casa",
      "rinnovare casa",
      "rimodernare casa",
      "casa da ristrutturare",
      "rifare abitazione",
      "ristrutturare abitazione",
      "lavori ristrutturazione casa",
      "ristrutturazione completa casa",
    ],
  },
];
