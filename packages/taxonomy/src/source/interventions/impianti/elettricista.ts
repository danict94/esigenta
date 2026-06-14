import type { TaxonomyIntervention } from "../../../shared/types";

export const elettricistaInterventions: TaxonomyIntervention[] = [
  {
    slug: "impianto-elettrico-nuovo",

    name: "Impianto elettrico nuovo",

    services: ["impianto-elettrico"],

    aliases: [
      "rifare impianto elettrico",
      "nuovo impianto elettrico",
      "impianto elettrico casa",
      "impianto elettrico appartamento",
    ],
  },

  {
    slug: "saltata-corrente",

    name: "corrente saltata",

    services: ["riparazione-guasti-elettrici", "salvavita"],

    aliases: [
      "manca corrente",
      "non c'è corrente",
      "salta la corrente",
      "blackout casa",
    ],
  },

  {
    slug: "aggiungere-presa-elettrica",

    name: "Aggiungere presa elettrica",

    services: ["prese-elettriche"],

    aliases: [
      "nuova presa elettrica",
      "montare presa",
      "spostare presa elettrica",
      "presa corrente",
    ],
  },

  {
    slug: "sostituire-interruttore",

    name: "Sostituire interruttore",

    services: ["interruttori"],

    aliases: [
      "interruttore rotto",
      "cambiare interruttore",
      "interruttore non funziona",
      "sostituire pulsante luce",
    ],
  },

  {
    slug: "riparare-quadro-elettrico",

    name: "Riparare quadro elettrico",

    services: ["quadro-elettrico", "salvavita"],

    aliases: [
      "quadro elettrico guasto",
      "problema quadro elettrico",
      "riparazione salvavita",
      "centralina elettrica",
    ],
  },

  {
    slug: "montare-lampadario",

    name: "Montare lampadario",

    services: ["lampadari", "illuminazione"],

    aliases: [
      "installare lampadario",
      "sostituire lampadario",
      "montaggio lampadario",
      "lampadario nuovo",
    ],
  },

  {
    slug: "riparare-citofono",

    name: "Riparare citofono",

    services: ["citofoni", "videocitofoni"],

    aliases: [
      "citofono non funziona",
      "aggiustare citofono",
      "riparazione citofono",
      "videocitofono guasto",
    ],
  },
];
