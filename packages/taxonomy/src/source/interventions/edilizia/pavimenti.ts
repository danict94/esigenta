import type { TaxonomyIntervention } from "../../../shared/types";

export const pavimentiInterventions: TaxonomyIntervention[] = [
  {
    slug: "fare-massetto",

    name: "Fare massetto",

    services: ["massetti"],

    aliases: [
      "massetto pavimento",
      "rifare massetto",
      "massetto nuovo",
      "fare massetto casa",
      "preparare massetto",
      "massetto per piastrelle",
    ],
  },

  {
    slug: "fare-sottofondo",

    name: "Fare sottofondo",

    services: ["sottofondi"],

    aliases: [
      "sottofondo pavimento",
      "preparare sottofondo",
      "sottofondo nuovo",
      "sottofondo per pavimento",
    ],
  },

  {
    slug: "livellare-pavimento",

    name: "Livellare pavimento",

    services: ["livellamento-pavimenti"],

    aliases: [
      "pavimento non in piano",
      "pareggiare pavimento",
      "pavimento storto",
      "autolivellante pavimento",
    ],
  },

  {
    slug: "posare-pavimento",

    name: "Posare pavimento",

    services: ["posa-pavimenti"],

    aliases: [
      "posa pavimento",
      "mettere pavimento",
      "installare pavimento",
      "pavimento nuovo",
      "rifare pavimento",
      "posare pavimenti",
    ],
  },

  {
    slug: "posare-rivestimento",

    name: "Posare rivestimento",

    services: ["posa-rivestimenti"],

    aliases: [
      "posa rivestimento",
      "mettere rivestimento",
      "rivestire parete",
      "rivestimento nuovo",
      "rivestimenti casa",
      "rivestimento bagno",
      "rivestimento cucina",
    ],
  },

  {
    slug: "posare-piastrelle",

    name: "Posare piastrelle",

    services: ["posa-piastrelle"],

    aliases: [
      "posa piastrelle",
      "mettere piastrelle",
      "piastrellare",
      "piastrelle nuove",
      "rifare piastrelle",
      "posare mattonelle",
    ],
  },
];
