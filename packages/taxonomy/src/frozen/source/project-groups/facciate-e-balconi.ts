import type { FrozenProjectGroup } from "../types/project-group"

// Dominio: facciate esterne, cappotto termico, balconi/ballatoi, frontalini,
// pavimentazioni e impermeabilizzazioni di balconi.
//
// TODO backlog facciate-e-balconi (non riaggiungere senza audit + decisione
// prodotto + modello funnel coerente): impermeabilizzare-terrazzo, rifare-terrazzo,
// facciata-ventilata, restauro-facciata-storica, ponteggi (resta una DOMANDA di
// accesso in quota nel funnel, non un intervento), linee-vita,
// consolidamento-strutturale-balcone, cornicioni, decorazioni-facciata.
//
// Nota coerenza: silossanico, silicati e quarzo/acrilica NON sono interventi
// separati — restano alias/opzioni di finitura dentro il funnel di
// `rifare-facciata`. La tinteggiatura pura di superfici esterne resta coperta
// anche da `tinteggiare-esterni` nel gruppo Finiture: `rifare-facciata` è
// l'intervento madre (intonaco/crepe/rasatura/tinteggiatura/finitura), non un
// duplicato della sola tinteggiatura.
export const facciateEBalconi: FrozenProjectGroup = {
  id: "facciate-e-balconi",
  slug: "facciate-e-balconi",
  name: "Facciate e balconi",

  interventions: [
    {
      id: "rifare-facciata",
      slug: "rifare-facciata",
      name: "Rifare facciata",

      aliases: [
        "rifacimento facciata",
        "ristrutturare facciata",
        "ripristino facciata",
        "intonaco facciata",
        "rasatura facciata",
        "tinteggiare facciata",
        "tinteggiatura facciata",
        "pittura facciata",
        "pittura esterna",
        "rivestimento facciata",
        "pittura silossanica facciata",
        "finitura silossanica facciata",
        "pittura ai silicati facciata",
        "finitura ai silicati facciata",
      ],
    },

    {
      id: "realizzare-cappotto-termico-facciata",
      slug: "realizzare-cappotto-termico-facciata",
      name: "Realizzare cappotto termico facciata",

      aliases: [
        "cappotto termico",
        "cappotto esterno",
        "isolamento termico facciata",
        "coibentazione facciata",
        "fare cappotto casa",
        "cappotto condominio",
        "isolamento esterno edificio",
        "realizzare cappotto termico",
        "rifare facciata con cappotto",
      ],
    },

    {
      id: "ripristinare-balconi-e-ballatoi",
      slug: "ripristinare-balconi-e-ballatoi",
      name: "Ripristinare balconi e ballatoi",

      aliases: [
        "ripristino balcone",
        "ripristino ballatoio",
        "rifacimento balcone",
        "rifacimento ballatoio",
        "balcone ammalorato",
        "ballatoio ammalorato",
        "ferri scoperti balcone",
        "calcestruzzo balcone rovinato",
        "sottobalcone rovinato",
        "cemento balcone che cade",
        "ripristino sottobalcone",
      ],
    },

    {
      id: "rifare-pavimentazione-balcone-ballatoio",
      slug: "rifare-pavimentazione-balcone-ballatoio",
      name: "Rifare pavimentazione balcone o ballatoio",

      aliases: [
        "pavimentazione balcone",
        "pavimentazione ballatoio",
        "rifare pavimento balcone",
        "rifare pavimento ballatoio",
        "piastrelle balcone",
        "piastrelle ballatoio",
        "posare piastrelle balcone",
        "posare piastrelle ballatoio",
        "rifare piastrelle balcone",
      ],
    },

    {
      id: "impermeabilizzare-balcone-ballatoio",
      slug: "impermeabilizzare-balcone-ballatoio",
      name: "Impermeabilizzare balcone o ballatoio",

      aliases: [
        "impermeabilizzazione balcone",
        "impermeabilizzazione ballatoio",
        "impermeabilizzare balcone",
        "impermeabilizzare ballatoio",
        "infiltrazioni balcone",
        "perdita acqua balcone",
        "guaina balcone",
        "rifare guaina balcone",
        "acqua sotto balcone",
        "balcone con infiltrazioni",
      ],
    },

    {
      id: "ripristino-frontalino",
      slug: "ripristino-frontalino",
      name: "Ripristinare frontalino balcone",

      // Caso specifico e riconoscibile: resta valido anche se
      // `ripristinare-balconi-e-ballatoi` copre i frontalini come caso generale.
      aliases: [
        "ripristinare frontalino",
        "rifacimento frontalino",
        "rifacimento frontalino balcone",
        "frontalino balcone rovinato",
        "frontalino balcone ammalorato",
        "cemento frontalino balcone",
        "frontalino balcone che cade",
      ],
    },
  ],
}
