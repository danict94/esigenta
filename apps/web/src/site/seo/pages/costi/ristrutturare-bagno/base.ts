import type { CostGuideBaseContent } from "../types";

export const ristrutturareBagnoBase: CostGuideBaseContent = {
  slug: "ristrutturare-bagno",
  funnelSlug: "ristrutturare-bagno",
  interventionSeoSlug: "ristrutturare-bagno",
  title: "Costi ristrutturazione bagno",
  h1: "Quanto costa ristrutturare un bagno?",
  metaTitle: "Quanto costa ristrutturare un bagno? Prezzi indicativi",
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
    "Ristrutturare un bagno significa coordinare demolizioni, impianto idraulico, rivestimenti, sanitari, rubinetteria e finiture. Il preventivo cambia soprattutto in base a metratura, stato di partenza, materiali scelti e complessità del cantiere.",
  factors: [
    "metratura del bagno e superficie da rivestire",
    "stato di impianto idraulico, scarichi e sottofondi",
    "demolizioni, smaltimento e accessibilità del cantiere",
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
  // Revisione 2026-08: "Costo complessivo" da solo (4.500-8.000 €) non
  // diceva a quale bagno si riferisse. nationalRangeLabel lo lega subito
  // alla metratura standard; nationalRangeNote spiega, nel primo box
  // economico, da dove parte un intervento essenziale e quando si supera la
  // fascia — nessuna riga di interventionRangeLabel: il valore resta un vero
  // totale complessivo anche nel modulo di /interventi/ristrutturare-bagno,
  // la didascalia fissa "RANGE INDICATIVO COMPLESSIVO" resta corretta.
  nationalRangeLabel: "Standard, 5–6 mq",
  nationalRangeNote:
    "Per ristrutturare completamente un bagno standard di circa 5–6 mq, considera orientativamente 4.500–8.000 €. Un intervento essenziale può partire da circa 3.000 €, mentre spostamento degli scarichi, doccia a filo pavimento, materiali di pregio e problemi nascosti possono portare il costo oltre 10.000–12.000 €.",
  priceTableIntro:
    "La tabella distingue tre scenari: rinnovo leggero (senza rifacimento completo), ristrutturazione completa standard (la fascia orientativa 4.500–8.000 € per circa 5–6 mq) e ristrutturazione complessa o di fascia alta.",
  priceTableNote:
    "Le fasce sono elaborazioni orientative costruite confrontando singole lavorazioni dei prezzari regionali e stime nazionali per ristrutturazioni complete. I prezzari pubblici non quotano un pacchetto standard unico per il rifacimento del bagno.",
  sizeExamplesIntro:
    "Le fasce non derivano soltanto dalla superficie: sanitari, scarichi, doccia, rivestimenti e impianti incidono sul totale quasi allo stesso modo in un bagno piccolo o grande, per questo un bagno piccolo può avere un costo al mq più alto. Sono fasce orientative multi-fonte, non un preventivo: materiali, complessità e problemi nascosti dopo la demolizione possono modificare il risultato.",
};
