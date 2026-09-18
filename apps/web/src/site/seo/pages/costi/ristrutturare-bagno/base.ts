import type { CostGuideBaseContent } from "../types";

export const ristrutturareBagnoBase: CostGuideBaseContent = {
  slug: "ristrutturare-bagno",
  funnelSlug: "ristrutturare-bagno",
  interventionSeoSlug: "ristrutturare-bagno",
  title: "Costi ristrutturazione bagno",
  h1: "Quanto costa ristrutturare un bagno?",
  metaTitle: "Quanto costa ristrutturare un bagno? Prezzi indicativi",
  // Data reale dell'ultima revisione editoriale sostanziale della sessione
  // corrente, non del deploy: vedi engine/editorial-date.ts.
  lastModified: "2026-09-18",
  editorial: {
    datePublished: "2026-06-07",
  },
  metaDescription:
    "Scopri quanto costa ristrutturare un bagno, con range indicativi, costo al mq, esempi per dimensione, fattori di prezzo e preventivi.",
  heroImage: {
    src: "/assets/images/rifare-bagno.webp",
    alt: "Ristrutturazione bagno con sanitari e rivestimenti moderni",
  },
  hubCategory: { slug: "ristrutturazioni", name: "Ristrutturazioni" },
  hubOrder: 10,
  hubDescription:
    "Prezzi delle lavorazioni principali, opere comprese ed elementi che possono cambiare il preventivo.",
  topicLabel: "ristrutturare un bagno",
  summary:
    "Per ristrutturare completamente un bagno standard di circa 5–6 mq, considera orientativamente 4.500–8.000 €. Una ristrutturazione completa essenziale, su un bagno piccolo e senza lavorazioni particolari, può partire da circa 3.000 €; spostamento degli scarichi, doccia a filo pavimento, materiali di pregio e problemi nascosti possono invece portare il costo oltre 10.000–12.000 €.",
  extrasPresentation: {
    title: "Cosa può far aumentare il prezzo",
    intro:
      "Alcune lavorazioni possono aggiungersi alla ristrutturazione standard in base alla disposizione del bagno, alle condizioni esistenti e alle scelte progettuali.",
  },
  factors: [
    "metratura del bagno e superficie da rivestire",
    "stato di impianto idraulico, scarichi e sottofondi",
    "quantità di demolizioni e stato di sottofondi e superfici esistenti",
    "qualità di piastrelle, sanitari, rubinetteria e arredo",
    "spostamento di doccia, lavabo, wc o bidet",
    "tempi richiesti e coordinamento tra più professionisti",
  ],
  savingTips: [
    "Mantieni, se possibile, la stessa posizione di scarichi e punti acqua.",
    "Definisci prima materiali, sanitari e rubinetteria per evitare varianti in corso d'opera.",
    "Chiedi preventivi con voci separate per demolizione, impianti, posa e finiture.",
    "Valuta un rinnovo leggero se gli impianti sono recenti e in buono stato.",
    "Confronta professionisti disponibili nella tua zona prima di fissare il sopralluogo.",
  ],
  interventionRangeLabel: "RANGE INDICATIVO, BAGNO STANDARD 5–6 MQ",
  sizeExamplesTable: {
    title: "Esempi di costo per metratura",
    intro:
      "Stime indicative per una ristrutturazione completa, considerando dimensioni del bagno e normale complessità dell’intervento.",
    notes: [
      "La metratura da sola non determina il preventivo: spostamento degli impianti, demolizioni, formato dei rivestimenti, sanitari e condizioni esistenti possono incidere in modo significativo sul costo finale.",
    ],
    sizeUnit: "m²",
  },
};
