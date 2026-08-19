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
      "Indicativamente da 70 € a 120 € al mq per un rifacimento esteso, con degrado significativo: controllo delle parti distaccate, rimozione dell'intonaco ammalorato, ripristino, rasatura, preparazione e nuova finitura — ponteggio escluso. Non è il prezzo di una semplice tinteggiatura: interventi più leggeri costano meno, da 25–40 €/mq per un rinnovo della finitura su facciata sana a 45–80 €/mq per un ripristino solo delle zone ammalorate.",
  },
  {
    question: "Quanto costa rifare la facciata di una casa da 100, 200 o 300 mq?",
    answer:
      "Applicando la fascia 70–120 €/mq del rifacimento esteso: una facciata da 100 mq indicativamente 7.000–12.000 €, da 200 mq 14.000–24.000 € e da 300 mq 21.000–36.000 €. Sono calcoli — superficie moltiplicata per la fascia orientativa, ponteggio escluso — non preventivi: sono mq di superficie della facciata esterna, non della superficie abitativa interna. Per uno scenario più leggero il totale è inferiore.",
  },
  {
    question: "Che differenza c'è tra una semplice tinteggiatura e un rifacimento della facciata?",
    answer:
      "La tinteggiatura da sola (16–25 €/mq) è solo la nuova pittura su un fondo già preparato e in buone condizioni. Il rifacimento comprende anche la rimozione dell'intonaco che si sta staccando, il suo ripristino e la rasatura, quando il degrado lo richiede: per questo la fascia 70–120 €/mq del rifacimento esteso non va confusa con il prezzo di una semplice tinteggiatura, che da sola costa molto meno.",
  },
  {
    question: "Cosa significa \"intonaco ammalorato\"?",
    answer:
      "Sono le zone di intonaco che si stanno staccando dal supporto: crepe diffuse, rigonfiamenti, distacchi visibili o parti che suonano vuote quando vengono battute (il controllo manuale che individua queste zone, chiamato anche battitura o picchettatura di verifica). Solo un sopralluogo permette di stabilire con certezza quanto intonaco va rimosso e rifatto.",
  },
  {
    question: "Quando serve la rasatura?",
    answer:
      "Serve per regolarizzare la superficie prima della finitura, soprattutto dopo un ripristino dell'intonaco: un fondo rappezzato in più punti raramente è già abbastanza uniforme per ricevere direttamente la pittura. Su una facciata sostanzialmente sana, con poco o nessun ripristino, può non essere necessaria.",
  },
  {
    question: "Che differenza c'è tra rasatura semplice e rasatura armata?",
    answer:
      "La rasatura semplice (15–25 €/mq) è un rasante applicato in due mani su un fondo già idoneo. La rasatura armata (25–40 €/mq) aggiunge una rete in fibra di vetro annegata nel rasante, per una superficie più resistente e uniforme: è la scelta più adatta su fondi più critici o dopo un ripristino esteso dell'intonaco. Non sono due fasi da sommare sulla stessa superficie: si sceglie quella più adatta al proprio caso.",
  },
  {
    question: "Quando serve il fissativo o un primer?",
    answer:
      "Su un fondo assorbente o sfarinante può servire un fissativo o un consolidante prima della finitura; su alcuni supporti può servire invece un primer di adesione. Non è una lavorazione obbligatoria su ogni facciata, e non va sommata automaticamente al prezzo della tinteggiatura: alcuni cicli di pittura, in particolare alcune pitture silossaniche, lo comprendono già.",
  },
  {
    question: "Quanto incide il ponteggio sul costo della facciata?",
    answer:
      "Il ponteggio non è mai compreso nei range principali di questa guida: costa indicativamente 15–30 € al mq di facciata (montaggio, un periodo iniziale di utilizzo e smontaggio), quotato sempre come voce a parte. Periodi di noleggio più lunghi possono far salire il costo.",
  },
  {
    question: "Che differenza c'è tra una pittura standard e una silossanica?",
    answer:
      "La tinteggiatura acrilica o al quarzo (16–25 €/mq) è la finitura più diffusa. La pittura silossanica (22–35 €/mq) è più traspirante e idrorepellente, più resistente agli agenti atmosferici: il prezzo più alto riflette la tecnologia del prodotto, non solo l'aspetto estetico. Diverso ancora è il rivestimento a spessore o intonachino (25–40 €/mq), una finitura granulata o frattazzata, non una semplice pittura più costosa.",
  },
  {
    question: "Il cappotto termico è compreso in questi prezzi?",
    answer:
      "No. Il cappotto termico non è compreso nei prezzi di questa guida: aggiunge isolamento esterno, pannelli e un ciclo di posa specifico, con lavorazioni e costi propri distinti dal rifacimento della facciata.",
  },
  {
    question: "Quali dati servono per un preventivo accurato?",
    answer:
      "Superficie indicativa della facciata, stato attuale dell'intonaco (crepe, distacchi localizzati o diffusi, macchie o umidità), tipo di finitura desiderata, altezza dell'edificio e necessità di ponteggio, eventuali vincoli condominiali, storici o paesaggistici.",
  },
];
