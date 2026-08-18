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
  // market-data/base-price-ranges.ts) e summary/nationalRangeNote sono
  // riorganizzati per rispondere prima, spiegare la metodologia dopo.
  lastModified: "2026-08-18",
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
  // prima (coerente con nationalRangeNote, mostrato subito sopra questo
  // paragrafo nell'Hero), la metodologia resta ma come garanzia di
  // attendibilità, non come risposta principale.
  summary:
    "Il costo cambia soprattutto in base al sistema di guaina scelto e alle condizioni della superficie: i prezzi delle principali impermeabilizzazioni di questa guida comprendono materiale e posa. Le fasce sono elaborate a partire dai prezzari regionali ufficiali dei lavori pubblici, usati come riferimento tecnico: non sono un tariffario ufficiale né un preventivo, e il prezzo reale dipende sempre dal cantiere.",
  factors: [
    "tipo di lavorazione richiesta: nuova impermeabilizzazione, riparazione o sola preparazione",
    "tipo di guaina scelta",
    "condizioni della superficie su cui deve essere posata la nuova guaina",
    "estensione dell'area interessata",
    "accessibilità della copertura e necessità di ponteggi",
    "numero di punti critici: bocchettoni, comignoli, lucernari",
    "eventuale rimozione e smaltimento della vecchia guaina",
  ],
  savingTips: [
    "Chiedi sempre quale lavorazione tecnica è prevista nel preventivo (nuova posa, riparazione, sola preparazione): voci diverse hanno prezzi molto diversi e non sono intercambiabili.",
    "Descrivi con precisione il problema: infiltrazione localizzata, guaina diffusamente deteriorata o entrambe.",
    "Allega foto delle zone interessate, anche scattate dall'interno.",
    "Indica una superficie approssimativa dell'area da trattare.",
    "Segnala accessibilità del tetto e presenza di raccordi, comignoli o lucernari vicino alla zona.",
    "Chiedi sempre se il preventivo include la rimozione della guaina esistente.",
    "Se hai già chiesto un preventivo per il rifacimento completo, chiedi se include l'impermeabilizzazione, per evitare di pagarla due volte.",
  ],
  // priceTableNote: campo non più letto da cost-page-template.tsx (sostituito
  // dal nuovo template condiviso), aggiornato comunque per non lasciare un
  // riferimento a "lavorazioni tecniche specifiche" ormai disallineato dalle
  // fasce editoriali arrotondate, anche se oggi non renderizzato.
  priceTableNote:
    "Le fasce sono elaborazioni editoriali a partire da prezzari regionali dei lavori pubblici 2025–2026, arrotondate per il mercato privato. Non costituiscono un tariffario nazionale né un preventivo. Il costo reale può variare in base alla regione, alle condizioni della superficie, all'accessibilità, ai dettagli costruttivi e alle lavorazioni escluse dal sistema scelto.",
  // Revisione 2026-08: nationalRange ora è una fascia editoriale reale
  // (25–60 €/mq), non più "nessun totale complessivo" — "Prezzi per singola
  // lavorazione" era l'etichetta corretta SOLO per quella vecchia
  // formulazione (stessa correzione di rifare-impianto-elettrico all'epoca).
  // Allineata a "Fascia orientativa"/"FASCIA ORIENTATIVA AL MQ", stessa
  // coppia di etichette già usata da rifare-tetto per una fascia al mq.
  nationalRangeLabel: "Fascia orientativa",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  // Mostrato subito sotto il numero grande dell'Hero (vedi CostGuideHero):
  // chiarisce perimetro ed esclusioni PRIMA che il lettore arrivi al resto
  // della pagina — risposta economica prima, dettaglio dopo.
  nationalRangeNote:
    "Vale per una normale impermeabilizzazione bituminosa con materiale e posa. Restano spesso a parte: rimozione della vecchia guaina, ripristini importanti della superficie, ponteggi, difficoltà particolari di accesso e lavorazioni aggiuntive non comprese nel sistema scelto.",
  // Collegamento obbligatorio con rifare-tetto (confine editoriale: le due
  // guide si richiamano a vicenda) + il confine più diretto (riparare-tetto).
  // Risolti da resolveBestHrefForIntervention: "rifare-tetto" va alla sua
  // guida costi (esiste), "riparare-tetto" al funnel (non ha guida propria).
  relatedWork: [
    {
      slug: "rifare-tetto",
      title: "Rifare il tetto",
      description: "Se il problema riguarda l'intera copertura, non solo la tenuta all'acqua.",
    },
    {
      slug: "riparare-tetto",
      title: "Riparare il tetto",
      description: "Se il danno è puntuale sul manto, tegole o coppi, non sulla guaina.",
    },
  ],
};
