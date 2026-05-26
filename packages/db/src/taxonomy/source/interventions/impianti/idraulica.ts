import type { TaxonomyIntervention } from "../../../shared/types";

export const idraulicaInterventions: TaxonomyIntervention[] = [
  {
    slug: "perdita-acqua",

    name: "Perdita acqua",

    services: ["riparazione-perdite-acqua"],

    runtimePresetSlugs: [
      "PLUMBING_EMERGENCY",
    ],

    aliases: [
      "perde acqua",
      "tubo che perde",
      "perdita tubo",
      "acqua che perde",
    ],
  },

  {
    slug: "cambiare-rubinetto",

    name: "Cambiare rubinetto",

    services: ["installazione-rubinetteria"],

    aliases: ["sostituire rubinetto", "montare rubinetto", "rubinetto nuovo"],
  },

  {
    slug: "sostituire-sanitari",

    name: "Sostituire sanitari",

    services: ["installazione-sanitari"],

    aliases: ["cambiare wc", "cambiare lavabo", "sostituire bidet"],
  },

  {
    slug: "sostituire-tubi",

    name: "Sostituire tubi",

    services: ["sostituzione-tubi"],

    aliases: ["cambiare tubi", "rifare tubature", "tubi nuovi"],
  },
];
