import type { FrozenProjectGroup } from "../types/project-group"

export const cartongesso: FrozenProjectGroup = {
  id: "cartongesso",
  slug: "cartongesso",
  name: "Cartongesso",

  aliases: [
    "lavori in cartongesso",
    "cartongesso e pareti"
  ],

  // TODO backlog Cartongesso: isolamento acustico autonomo solo se emerge domanda frequente;
  // isolamento termico/muffa con copy prudente; antincendio con percorso tecnico dedicato.
  interventions: [
    {
      id: "realizzare-parete-cartongesso",
      slug: "realizzare-parete-cartongesso",
      name: "Realizzare parete in cartongesso",

      aliases: [
        "parete in cartongesso",
        "divisorio in cartongesso",
        "tramezza in cartongesso"
      ]
    },

    {
      id: "realizzare-controsoffitto",
      slug: "realizzare-controsoffitto",
      name: "Realizzare controsoffitto",

      aliases: [
        "controsoffitto in cartongesso",
        "abbassamento soffitto",
        "soffitto in cartongesso"
      ]
    },

    {
      id: "realizzare-controparete",
      slug: "realizzare-controparete",
      name: "Realizzare controparete",

      aliases: [
        "controparete in cartongesso",
        "isolamento parete interna"
      ]
    },

    {
      id: "realizzare-struttura-in-cartongesso-su-misura",
      slug: "realizzare-struttura-in-cartongesso-su-misura",
      name: "Realizzare una struttura in cartongesso su misura",

      aliases: [
        "parete tv in cartongesso",
        "cabina armadio in cartongesso",
        "libreria in cartongesso",
        "nicchie in cartongesso",
        "mensole in cartongesso",
        "veletta decorativa in cartongesso",
        "copertura tubi in cartongesso"
      ]
    },

    {
      id: "riparare-o-modificare-cartongesso",
      slug: "riparare-o-modificare-cartongesso",
      name: "Riparare o modificare cartongesso",

      aliases: [
        "riparazione cartongesso",
        "modificare struttura in cartongesso",
        "rimuovere cartongesso",
        "buchi nel cartongesso",
        "crepe nel cartongesso"
      ]
    }
  ]
}
