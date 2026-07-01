import type { FrozenProjectGroup } from "../types/project-group"

export const idraulica: FrozenProjectGroup = {
  id: "idraulica",
  slug: "idraulica",
  name: "Idraulica",
  interventions: [
    {
      id: "rifare-impianto-idraulico-bagno",
      slug: "rifare-impianto-idraulico-bagno",
      name: "Rifare impianto idraulico bagno",
      aliases: ["rifacimento tubazioni bagno", "rifacimento impianto idraulico bagno"],
    },
    {
      id: "riparare-perdita-acqua",
      slug: "riparare-perdita-acqua",
      name: "Riparare perdita acqua",
      aliases: ["perdita acqua", "tubo che perde", "riparazione perdita acqua"],
    },
    {
      id: "disostruire-scarichi",
      slug: "disostruire-scarichi",
      name: "Disostruire scarichi",
      aliases: ["scarico otturato", "tubo intasato", "disostruzione scarichi"],
    },
    {
      id: "sostituire-box-doccia",
      slug: "sostituire-box-doccia",
      name: "Sostituire box doccia",
      // Alias mirati solo su box/cabina doccia. Rimosso "nuova doccia": troppo
      // largo (poteva significare rifare doccia completa, piatto doccia,
      // trasformazione vasca→doccia o ristrutturazione bagno).
      aliases: [
        "cambiare box doccia",
        "sostituzione box doccia",
        "installare box doccia",
        "montare box doccia",
        "cambiare cabina doccia",
        "sostituire cabina doccia",
      ],
    },
    {
      id: "installare-sanitari",
      slug: "installare-sanitari",
      name: "Installare sanitari",
      aliases: ["montare sanitari bagno", "sostituire sanitari", "installazione sanitari"],
    },
  ],
}
