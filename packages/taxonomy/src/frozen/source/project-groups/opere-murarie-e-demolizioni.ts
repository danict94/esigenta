import type { FrozenProjectGroup } from "../types/project-group"

// Il muratore "puro": costruire/demolire muri, aprire/chiudere vani, demolizioni
// interne, piccole opere murarie/assistenze. Sotto la categoria `impresa-edile`.
// Confini (NON duplicare qui): massetto→pavimentazioni; intonaco/rasatura/
// pittura→finiture; cappotto/facciata/balconi→facciate-e-balconi; pareti in
// cartongesso→cartongesso; bagno/cucina/casa/appartamento→ristrutturazioni;
// tetti→tetti. Fuori scope: nuove costruzioni, ampliamenti, piscine, muretti/
// recinzioni/giardino, cemento armato strutturale, ripristino pilastri/travi,
// progettazione tecnica, pratiche edilizie come intervento a sé.
export const opereMurarieEDemolizioni: FrozenProjectGroup = {
  id: "opere-murarie-e-demolizioni",
  slug: "opere-murarie-e-demolizioni",
  name: "Opere murarie e demolizioni",
  interventions: [
    {
      id: "aprire-o-chiudere-vano",
      slug: "aprire-o-chiudere-vano",
      name: "Aprire o chiudere un vano",
      // "cerchiatura muro portante" resta alias/sotto-caso (delicato/normativo),
      // NON intervento separato: sarà un branch prudente nel funnel.
      aliases: [
        "aprire vano porta",
        "aprire una porta nel muro",
        "aprire un varco nel muro",
        "aprire finestra nel muro",
        "aprire un muro",
        "cerchiatura muro portante",
        "aprire muro portante",
        "apertura vano",
        "chiudere una porta nel muro",
        "spostare una porta",
      ],
    },
    {
      id: "demolire-parete-o-tramezzo",
      slug: "demolire-parete-o-tramezzo",
      name: "Demolire parete o tramezzo",
      aliases: [
        "demolire tramezzo",
        "demolizione tramezzi",
        "demolire una parete",
        "abbattere un muro",
        "abbattere una parete",
        "buttare giù un muro",
        "demolizione muri interni",
        "demolire muro non portante",
        "togliere una parete",
        "demolizione pareti",
      ],
    },
    {
      id: "costruire-parete-o-tramezzo",
      slug: "costruire-parete-o-tramezzo",
      name: "Costruire parete o tramezzo in muratura",
      // Muratura vera (mattoni/forati). "tramezzo/parete cartongesso" NON stanno
      // qui: restano nel gruppo `cartongesso`.
      aliases: [
        "costruire tramezzo",
        "costruire parete",
        "alzare un muro",
        "alzare una parete",
        "fare una parete in muratura",
        "tramezzo in muratura",
        "muro in mattoni",
        "muro in forati",
        "costruire muro interno",
        "tramezzatura",
      ],
    },
    {
      id: "demolizioni-interne",
      slug: "demolizioni-interne",
      name: "Demolizioni interne",
      // "demolizioni interne" NON è alias: normalizzato coincide con slug e name
      // (vietato dal validator), già coperto dalla ricerca via slug.
      aliases: [
        "demolizione interna",
        "svuotare appartamento",
        "demolizioni per ristrutturazione",
        "rimozione pareti e pavimenti",
        "demolire per ristrutturare",
        "demolizione pavimento",
      ],
    },
    {
      id: "piccole-opere-murarie",
      slug: "piccole-opere-murarie",
      name: "Piccole opere murarie e assistenze",
      aliases: [
        "assistenza muraria",
        "assistenze murarie",
        "opere murarie",
        "tracce muri",
        "fare tracce",
        "chiusura tracce",
        "rappezzi murari",
        "nicchia nel muro",
        "murare",
        "rifare soglia",
      ],
    },
  ],
}
