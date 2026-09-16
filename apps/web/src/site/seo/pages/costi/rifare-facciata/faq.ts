// Revisione 2026-08: FAQ riviste per restare coerenti con il nuovo listino
// (3 scenari di ampiezza + 10 lavorazioni del ciclo reale + ponteggio, vedi
// market-data/base-price-ranges.ts). Copre i concetti esplicitamente
// richiesti — quanto costa al mq, tinteggiatura vs rifacimento, intonaco
// ammalorato, quando serve la rasatura, rasatura semplice vs armata, quando
// serve il fissativo/primer, incidenza del ponteggio, pittura standard vs
// silossanica, cappotto termico non compreso — senza keyword stuffing: ogni
// risposta resta una spiegazione utile, non un elenco di termini ripetuti.
export const rifareFacciataFaq = [
  {
    question: "Quanto costa rifare la facciata al mq?",
    answer:
      "Per un rifacimento esteso della facciata la fascia orientativa è 70–120 €/mq, ponteggio escluso. Un rinnovo della finitura o un ripristino localizzato può costare meno, mentre lavorazioni aggiuntive o condizioni più complesse possono aumentare il preventivo.",
  },
  {
    question: "Quanto costa rifare la facciata di una casa da 100, 200 o 300 mq?",
    answer:
      "Applicando la fascia del rifacimento esteso, 100 mq corrispondono indicativamente a 7.000–12.000 €, 200 mq a 14.000–24.000 € e 300 mq a 21.000–36.000 €. Sono stime sulla superficie esterna della facciata e non comprendono il ponteggio.",
  },
  {
    question: "Che differenza c'è tra una semplice tinteggiatura e un rifacimento della facciata?",
    answer:
      "La tinteggiatura è una finitura su un supporto già sano e preparato. Il rifacimento comprende anche ripristini dell’intonaco e preparazione del fondo quando necessari.",
  },
  {
    question: "Cosa significa \"intonaco ammalorato\"?",
    answer:
      "Per intonaco ammalorato si intende un intonaco deteriorato, fessurato, distaccato o non più ben aderente al supporto. Le parti compromesse devono essere individuate e, quando necessario, rimosse prima del ripristino.",
  },
  {
    question: "Quando serve la rasatura?",
    answer:
      "La rasatura serve a regolarizzare e uniformare la superficie prima della finitura, soprattutto dopo ripristini dell’intonaco o quando il fondo presenta disomogeneità.",
  },
  {
    question: "Che differenza c'è tra rasatura semplice e rasatura armata?",
    answer:
      "La rasatura semplice utilizza il rasante per uniformare un fondo già idoneo. La rasatura armata incorpora una rete in fibra di vetro ed è indicata quando serve maggiore continuità e resistenza del sistema.",
  },
  {
    question: "Quando serve il fissativo o un primer?",
    answer:
      "Fissativo, consolidante o primer possono essere necessari quando il fondo è assorbente, sfarinante o presenta problemi di adesione. La scelta dipende dal supporto e dal ciclo di finitura previsto.",
  },
  {
    question: "Quanto incide il ponteggio sul costo della facciata?",
    answer:
      "Il ponteggio può incidere in modo significativo sul totale: la fascia indicativa della guida è 15–30 €/mq di facciata da ponteggiare. Il costo reale dipende da altezza, durata, configurazione e accessibilità del cantiere.",
  },
  {
    question: "Che differenza c'è tra una pittura standard e una silossanica?",
    answer:
      "La pittura standard acrilica o al quarzo è una finitura esterna comune. La silossanica offre caratteristiche differenti di traspirabilità e idrorepellenza e richiede un ciclo compatibile con il supporto.",
  },
  {
    question: "Il cappotto termico è compreso in questi prezzi?",
    answer:
      "No. Il cappotto termico non è compreso nelle fasce di rifacimento della facciata indicate in questa guida: è un intervento distinto che aggiunge isolamento esterno, pannelli e un ciclo di posa specifico.",
  },
  {
    question: "Quali dati servono per un preventivo accurato?",
    answer:
      "Per un preventivo più preciso servono almeno superficie della facciata, stato dell’intonaco, presenza di balconi o elementi particolari, tipo di finitura desiderata e necessità di ponteggio. Il sopralluogo permette poi di verificare quantità e condizioni reali delle lavorazioni.",
  },
];
