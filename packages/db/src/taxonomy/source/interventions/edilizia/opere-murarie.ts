import type { TaxonomyIntervention } from "../../../shared/types";

export const opereMurarieInterventions: TaxonomyIntervention[] = [
  {
    slug: "fare-opere-murarie",

    name: "Fare opere murarie",

    services: ["opere-murarie"],

    aliases: [
      "lavori di muratura",
      "lavori murari",
      "lavori da muratore",
      "piccoli lavori edili",
      "interventi murari",
      "fare lavori in muratura",
    ],
  },

  {
    slug: "fare-demolizioni",

    name: "Fare demolizioni",

    services: ["demolizioni"],

    aliases: [
      "demolire muro",
      "abbattere muro",
      "abbattere parete",
      "rimuovere muro",
      "demolire parete",
      "fare demolizione",
      "demolizioni interne",
    ],
  },

  {
    slug: "costruire-tramezzo",

    name: "Costruire tramezzo",

    services: ["costruzione-tramezzi"],

    aliases: [
      "fare tramezzo",
      "costruire muro interno",
      "fare muro divisorio",
      "dividere stanza con muro",
      "realizzare divisorio",
      "costruire parete interna",
    ],
  },

  {
    slug: "aprire-chiudere-vano",

    name: "Aprire o chiudere vano",

    services: ["apertura-chiusura-vani"],

    aliases: [
      "aprire vano nel muro",
      "chiudere vano nel muro",
      "aprire porta nel muro",
      "chiudere una porta",
      "chiudere apertura muro",
      "modificare apertura parete",
      "spostare apertura porta",
    ],
  },

  {
    slug: "riparare-muratura",

    name: "Riparare muratura",

    services: ["riparazioni-muratura"],

    aliases: [
      "riparare muro",
      "sistemare muro",
      "aggiustare muro",
      "muro danneggiato",
      "riparare parete in muratura",
      "sistemare muratura",
      "riparazione muro interno",
    ],
  },

  {
    slug: "consolidare-muratura",

    name: "Consolidare muratura",

    services: ["consolidamenti-murari"],

    aliases: [
      "consolidare muro",
      "rinforzare muro",
      "rinforzare muratura",
      "muro lesionato",
      "crepe muro portante",
      "consolidamento parete",
      "muratura da consolidare",
    ],
  },
];
