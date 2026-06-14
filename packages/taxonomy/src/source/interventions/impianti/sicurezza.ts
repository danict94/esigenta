import type { TaxonomyIntervention } from "../../../shared/types"

export const sicurezzaInterventions: TaxonomyIntervention[] = [
  {
    slug: "installare-antifurto",

    name: "Installare antifurto",

    services: [
      "installazione-antifurto",
      "sensori-allarme",
    ],

    aliases: [
      "allarme casa",
      "impianto antifurto",
      "mettere antifurto",
      "sistema allarme",
    ],
  },

  {
    slug: "installare-telecamere",

    name: "Installare telecamere",

    services: [
      "videosorveglianza",
      "telecamere-sicurezza",
      "videoregistratori",
    ],

    aliases: [
      "telecamere sicurezza",
      "impianto videosorveglianza",
      "montare telecamere",
      "telecamere esterne",
    ],
  },

  {
    slug: "installare-controllo-accessi",

    name: "Installare controllo accessi",

    services: [
      "controllo-accessi",
    ],

    aliases: [
      "badge accessi",
      "controllo ingressi",
      "lettore badge",
      "sistema accessi",
    ],
  },
]