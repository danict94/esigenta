import type { FrozenProjectGroup } from "../types/project-group"

// Esterni e giardino (categoria `giardiniere`, sector edilizia): verde/prato,
// irrigazione, pavimentazioni esterne, muretti/recinzioni da giardino, potatura
// e manutenzione del verde. Confini: pavimento interno/massetto/parquet →
// pavimentazioni; muratura interna/strutturale → opere-murarie; cancello
// metallico → fabbro; idraulica interna → idraulica. Fuori scope: barbecue/forni.
export const esterniEGiardino: FrozenProjectGroup = {
  id: "esterni-e-giardino",
  slug: "esterni-e-giardino",
  name: "Esterni e giardino",
  interventions: [
    {
      id: "realizzare-o-sistemare-giardino",
      slug: "realizzare-o-sistemare-giardino",
      name: "Realizzare o sistemare giardino",
      aliases: [
        "realizzare giardino",
        "sistemare giardino",
        "rifare giardino",
        "progettare giardino",
        "fare un giardino",
        "creare giardino",
        "sistemazione giardino",
        "posa prato",
        "realizzare prato",
        "prato a rotoli",
        "semina prato",
        "giardinaggio",
      ],
    },
    {
      id: "installare-impianto-irrigazione",
      slug: "installare-impianto-irrigazione",
      name: "Installare impianto di irrigazione",
      // Irrigazione giardino/esterni. Idraulica interna → idraulica.
      aliases: [
        "impianto di irrigazione",
        "impianto irrigazione",
        "irrigazione automatica",
        "installare irrigazione",
        "irrigazione giardino",
        "irrigazione interrata",
        "irrigazione a goccia",
        "impianto irrigazione giardino",
        "centralina irrigazione",
        "irrigatori giardino",
      ],
    },
    {
      id: "posare-pavimentazione-esterna",
      slug: "posare-pavimentazione-esterna",
      name: "Posare pavimentazione esterna",
      // Autobloccanti/porfido/vialetti/cortili. Pavimento interno → pavimentazioni.
      aliases: [
        "pavimentazione esterna",
        "pavimento esterno",
        "autobloccanti",
        "posa autobloccanti",
        "vialetto giardino",
        "pavimentare cortile",
        "pavimentazione cortile",
        "porfido esterno",
        "posa porfido",
        "pavimentazione giardino",
        "masselli autobloccanti",
        "pavimento da esterno",
      ],
    },
    {
      id: "costruire-muretto-o-recinzione",
      slug: "costruire-muretto-o-recinzione",
      name: "Costruire muretto o recinzione",
      // Muretti/recinzioni da giardino (assorbe backlog opere-murarie). Cancello
      // metallico → fabbro; muratura interna/strutturale → opere-murarie.
      aliases: [
        "costruire muretto",
        "muretto giardino",
        "muretto di recinzione",
        "recinzione giardino",
        "installare recinzione",
        "recinzione in rete",
        "staccionata",
        "recinzione legno",
        "muro di recinzione",
        "muretto esterno",
        "realizzare recinzione",
        "cordoli giardino",
      ],
    },
    {
      id: "potare-e-curare-il-verde",
      slug: "potare-e-curare-il-verde",
      name: "Potare e curare il verde",
      // Potatura (skilled) + manutenzione ricorrente. Non il taglio-erba una tantum.
      aliases: [
        "potatura alberi",
        "potare alberi",
        "potatura siepi",
        "potare siepe",
        "taglio siepe",
        "manutenzione giardino",
        "cura giardino",
        "manutenzione verde",
        "abbattimento albero",
        "potatura",
        "sfalcio erba",
        "taglio erba",
      ],
    },
  ],
}
