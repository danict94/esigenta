import type { FrozenProjectGroup } from "../types/project-group"

// Dominio: facciate esterne, cappotto termico, balconi/ballatoi/terrazzi,
// frontalini, pavimentazioni e impermeabilizzazioni di balconi e terrazzi.
//
// TODO backlog facciate-e-balconi (non riaggiungere senza audit + decisione
// prodotto + modello funnel coerente): rifare-terrazzo (intervento più ampio
// e distinto da impermeabilizzare-terrazzo: può comprendere demolizione,
// massetto, impermeabilizzazione e nuova pavimentazione — non sovrapporre),
// facciata-ventilata, restauro-facciata-storica, ponteggi (resta una DOMANDA
// di accesso in quota nel funnel, non un intervento), linee-vita,
// consolidamento-strutturale-balcone, cornicioni, decorazioni-facciata.
//
// impermeabilizzare-terrazzo: implementato (audit dedicato completato,
// 2026-08). Impermeabilizzazione mirata di terrazzi/terrazze calpestabili,
// distinta da impermeabilizzare-balcone-ballatoio (altra superficie) e da
// impermeabilizzare-tetto (copertura non calpestabile). Alias "lastrico
// solare" volutamente NON incluso in questa fase: resta fuori scope finché
// non c'è una decisione di prodotto dedicata (implicazioni condominiali/
// legali distinte, art. 1126 c.c., non equivalenti a un terrazzo privato).
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
      publicationStatus: "published",

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
      publicationStatus: "published",

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
      publicationStatus: "published",

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
      publicationStatus: "published",

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
      publicationStatus: "published",

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
      id: "impermeabilizzare-terrazzo",
      slug: "impermeabilizzare-terrazzo",
      name: "Impermeabilizzare terrazzo",
      publicationStatus: "published",

      // Impermeabilizzazione mirata di terrazzi/terrazze calpestabili:
      // guaina, raccordi perimetrali, scarichi/bocchettoni collegati
      // all'impermeabilizzazione, pendenze locali quando strettamente
      // necessarie al lavoro. Distinto da impermeabilizzare-balcone-ballatoio
      // (altra superficie, altro intervento) e da impermeabilizzare-tetto
      // (copertura non calpestabile). NON rifacimento completo del terrazzo
      // (demolizione/nuovo massetto/nuova pavimentazione integrale — resta
      // rifare-terrazzo, futuro/non implementato), NON posa generica di
      // pavimentazioni esterne, NON lastrico solare (fuori scope).
      //
      // "impermeabilizzare terrazzo"/"impermeabilizzazione terrazzo" NON
      // sono alias: normalizzati coincidono con slug/name (vietato dal
      // validator), già coperti dalla ricerca via slug/name diretti.
      // "impermeabilizzare il terrazzo" resta alias (stesso pattern già
      // usato da impermeabilizzare-tetto per la stessa collisione).
      aliases: [
        "impermeabilizzare il terrazzo",
        "impermeabilizzazione terrazzo",
        "impermeabilizzare terrazza",
        "impermeabilizzazione terrazza",
        "guaina terrazzo",
        "rifare guaina terrazzo",
        "infiltrazioni terrazzo",
        "infiltrazione terrazzo",
        "terrazzo con infiltrazioni",
        "perdita acqua terrazzo",
        "impermeabilizzare pavimento terrazzo",
      ],
    },

    {
      id: "ripristino-frontalino",
      slug: "ripristino-frontalino",
      name: "Ripristinare frontalino balcone",
      publicationStatus: "published",

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
