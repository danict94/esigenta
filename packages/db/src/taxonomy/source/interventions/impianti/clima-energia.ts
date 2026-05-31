import type { TaxonomyIntervention } from "../../../shared/types";

export const climaEnergiaInterventions: TaxonomyIntervention[] = [
  {
    slug: "installare-fotovoltaico",

    name: "Installare fotovoltaico",

    services: ["impianti-fotovoltaici"],

    aliases: [
      "installazione fotovoltaico",
      "impianto fotovoltaico",
      "pannelli fotovoltaici",
      "pannelli solari",
      "fotovoltaico casa",
      "impianto solare",
    ],
  },

  {
    slug: "installare-climatizzatore",

    name: "Installare climatizzatore",

    services: ["climatizzatori"],

    aliases: [
      "installazione climatizzatore",
      "montare climatizzatore",
      "installare condizionatore",
      "montare condizionatore",
      "climatizzazione casa",
      "sostituire climatizzatore",
    ],
  },
];
