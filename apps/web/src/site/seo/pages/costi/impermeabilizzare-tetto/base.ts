import type { CostGuideBaseContent } from "../types";

export const impermeabilizzareTettoBase: CostGuideBaseContent = {
  slug: "impermeabilizzare-tetto",
  funnelSlug: "impermeabilizzare-tetto",
  interventionSeoSlug: "impermeabilizzare-tetto",
  title: "Costi impermeabilizzazione tetto",
  h1: "Quanto costa impermeabilizzare un tetto?",
  metaTitle: "Quanto costa impermeabilizzare un tetto? Prezzi indicativi",
  // Revisione 2026-08 (richiesta editoriale esplicita): la guida rispondeva
  // troppo poco alla domanda "quanto costa impermeabilizzare un tetto?" —
  // nationalRange diceva letteralmente "nessun totale complessivo", summary
  // apriva con la metodologia dei prezzari prima ancora di un numero. Ora
  // nationalRange è una fascia editoriale reale (25–60 €/mq, vedi il
  // commento dettagliato sopra "costGuide:impermeabilizzare-tetto" in
  // market-data/pricing/guides/impermeabilizzare-tetto.ts) e summary sono
  // riorganizzati per rispondere prima, spiegare la metodologia dopo.
  lastModified: "2026-09-18",
  editorial: {
    datePublished: "2026-07-28",
  },
  metaDescription:
    "Scopri quanto costa impermeabilizzare un tetto: prezzo al mq, cosa comprende l'intervento e quando è già incluso in un rifacimento completo.",
  heroImage: {
    src: "/assets/images/rifare-tetto.webp",
    alt: "Impermeabilizzazione e guaina di una copertura",
  },
  hubCategory: { slug: "tetti-e-facciate", name: "Tetti e facciate" },
  hubOrder: 20,
  hubDescription:
    "Prezzi ufficiali per membrane, guaine, riparazioni e preparazione del supporto.",
  topicLabel: "impermeabilizzare un tetto",
  // Prima leggeva "i prezzi di questa guida provengono da prezzari
  // regionali..." — metodologia come primo messaggio. Ora il costo viene
  // prima; la metodologia resta come garanzia di
  // attendibilità, non come risposta principale.
  summary:
    "Per impermeabilizzare un tetto con una normale guaina bituminosa, considera orientativamente 25–60 €/m², materiale e posa compresi, in base al sistema scelto e alle condizioni della superficie. Soluzioni autoprotette più costose, come quelle con finitura in rame, possono arrivare a circa 75–90 €/m². La rimozione della vecchia guaina e la preparazione del fondo si valutano separatamente quando necessarie.",
  extrasPresentation: {
    title: "Cosa può far aumentare il prezzo",
    intro:
      "Alcune lavorazioni possono aggiungersi al costo della nuova impermeabilizzazione in base alle condizioni della copertura esistente e alla preparazione necessaria prima della posa.",
  },
  breakdownIntro:
    "Le voci qui sotto servono a leggere nel dettaglio le singole lavorazioni e i diversi sistemi di impermeabilizzazione. Le voci già rappresentate negli scenari o negli Extra non vanno sommate una seconda volta quando sono già comprese nel preventivo complessivo.",
  factors: [
    "sistema impermeabilizzante scelto",
    "condizioni del supporto su cui posare la nuova guaina",
    "estensione della superficie da trattare",
    "presenza e complessità di raccordi, bocchettoni, comignoli e lucernari",
    "necessità di rimuovere la vecchia guaina",
    "eventuali preparazioni o ripristini del fondo",
  ],
  savingTips: [
    "Descrivi con precisione il problema e allega foto delle zone interessate, anche scattate dall'interno.",
    "Indica una superficie approssimativa e segnala raccordi, comignoli, lucernari o altri punti critici vicini alla zona.",
    "Chiedi se il preventivo include rimozione della guaina esistente e preparazione del fondo quando necessarie.",
    "Confronta preventivi riferiti allo stesso sistema impermeabilizzante e allo stesso perimetro di lavorazioni.",
  ],
  // Revisione 2026-08: nationalRange ora è una fascia editoriale reale
  // (25–60 €/mq), non più "nessun totale complessivo" — "Prezzi per singola
  // lavorazione" era l'etichetta corretta SOLO per quella vecchia
  // formulazione (stessa correzione di rifare-impianto-elettrico all'epoca).
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  // Collegamento obbligatorio con rifare-tetto (confine editoriale: le due
  // guide si richiamano a vicenda) + il confine più diretto (riparare-tetto).
  // Risolti da resolveBestHrefForIntervention: "rifare-tetto" va alla sua
  // guida costi (esiste), "riparare-tetto" al funnel (non ha guida propria).
  relatedWork: [
    {
      slug: "rifare-tetto",
      title: "Rifare il tetto",
      description: "Se il problema riguarda l'intera copertura, non solo la tenuta all'acqua.",
      linkLabel: "Vedi i costi per rifare il tetto",
    },
    {
      slug: "riparare-tetto",
      title: "Riparare il tetto",
      description: "Per richiedere un preventivo quando il danno è puntuale e non serve rifare l'impermeabilizzazione completa.",
      linkLabel: "Richiedi un preventivo per riparare il tetto",
    },
  ],
};
