import type { CostGuideBaseContent } from "../types";

// Revisione 2026-08 (richiesta editoriale esplicita): la guida precedente
// riduceva l'intero rifacimento a un'unica fascia 60–120 €/mq "a corpo" più
// 5 righe "Da valutare con il professionista" senza numero — vedi il
// commento di revisione su "costGuide:rifare-facciata" in
// market-data/base-price-ranges.ts per il dettaglio completo delle 14
// PriceRow (3 macro-scenari di ampiezza + 10 lavorazioni del ciclo reale +
// ponteggio) che sostituiscono quel modello povero. Qui sotto solo editoriale
// nazionale: nessun numero è definito in questo file, tutti i prezzi vivono
// nella SSOT di market-data (vedi CostGuideBaseContent).
export const rifareFacciataBase: CostGuideBaseContent = {
  slug: "rifare-facciata",
  funnelSlug: "rifare-facciata",
  interventionSeoSlug: "rifare-facciata",
  title: "Costi rifacimento facciata",
  h1: "Quanto costa rifare la facciata?",
  metaTitle: "Quanto costa rifare la facciata? Prezzi al mq",
  // Data reale dell'ultima revisione editoriale sostanziale, non del deploy
  // (vedi engine/editorial-date.ts): la guida passa da 6 righe (1 prezzata +
  // 5 qualitative) a un modello a 3 scenari di ampiezza + 10 lavorazioni del
  // ciclo reale + ponteggio, Hero da 60–120 a 70–120 €/mq.
  lastModified: "2026-08-18",
  metaDescription:
    "Scopri quanto costa rifare la facciata: fascia orientativa al mq per il rifacimento esteso, scenari più leggeri, prezzi delle singole lavorazioni e quanto incide il ponteggio.",
  hubCategory: { slug: "tetti-e-facciate", name: "Tetti e facciate" },
  hubOrder: 30,
  hubDescription:
    "Fasce orientative per rifare la facciata, dal semplice rinnovo della finitura al rifacimento esteso con ripristino dell'intonaco e rasatura.",
  topicLabel: "rifare la facciata",
  summary:
    "Rifare la facciata segue un ciclo di lavorazioni, non un unico prezzo fisso: controllo delle parti distaccate, pulizia, rimozione dell'intonaco ammalorato, ripristino, rasatura, preparazione del fondo e nuova finitura. Un rifacimento esteso, con degrado significativo, costa indicativamente 70–120 € al mq (ponteggio escluso): interventi più leggeri — un semplice rinnovo della finitura o un ripristino solo delle zone ammalorate — costano meno. Questa guida non copre il cappotto termico, un intervento diverso con lavorazioni e costi propri.",
  factors: [
    "superficie della facciata da trattare",
    "estensione del degrado dell'intonaco: localizzato o diffuso",
    "quantità di intonaco da rimuovere e da rifare",
    "necessità e tipo di rasatura (semplice o armata con rete)",
    "necessità di un fissativo o primer sul fondo esistente",
    "tipo di finitura scelta (tinteggiatura standard, silossanica, rivestimento a spessore)",
    "necessità e durata del ponteggio",
    "accessibilità dell'edificio e vincoli condominiali",
  ],
  savingTips: [
    "Fai verificare lo stato reale dell'intonaco prima di scegliere tra un semplice rinnovo della finitura e un rifacimento più esteso: sono lavori diversi, con prezzi molto diversi.",
    "Chiedi preventivi con voci separate per ponteggio, rimozione e ripristino dell'intonaco, rasatura e finitura: capisci meglio cosa stai pagando.",
    "Se l'edificio è condominiale, valuta insieme ad altri proprietari per dividere i costi del ponteggio.",
    "Chiedi se il preventivo prevede una rasatura semplice o armata con rete: non sono la stessa lavorazione allo stesso prezzo.",
    "Chiarisci il tipo di finitura previsto: tinteggiatura standard, silossanica e rivestimento a spessore hanno prezzi e caratteristiche diverse.",
    "Verifica se sono necessarie pratiche edilizie o comunicazioni per lavori sulla facciata.",
  ],
  nationalRangeLabel: "Fascia orientativa",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  nationalRangeNote:
    "Indicativamente 70–120 € al mq per un rifacimento esteso della facciata, con degrado significativo: controllo delle parti distaccate, rimozione dell'intonaco ammalorato, ripristino, rasatura, preparazione e nuova finitura — non una semplice tinteggiatura. Il ponteggio e il cappotto termico sono sempre esclusi da questa fascia. Interventi più leggeri costano meno: un rinnovo della finitura su facciata sana parte da 25–40 €/mq, un ripristino solo delle zone ammalorate da 45–80 €/mq (vedi gli scenari più sotto). Consolidamenti strutturali importanti e restauro specialistico o storico non rientrano in nessuna di queste fasce.",
  priceTableIntro:
    "La tabella distingue tre scenari di ampiezza del lavoro — dal semplice rinnovo della finitura al rifacimento esteso — dalle singole lavorazioni del ciclo (controllo, pulizia, rimozione e ripristino dell'intonaco, rasatura, preparazione del fondo, finiture) e dal ponteggio, sempre una voce a parte.",
  priceTableNote:
    "Le fasce sono elaborazioni editoriali Esigenta, ancorate a prezzari regionali ufficiali, confronto tra lavorazioni comparabili e mercato privato come controllo secondario — non la voce di un singolo prezzario regionale: utili per farsi un'idea prima del preventivo, non per sostituirlo. Il cappotto termico non è compreso nei prezzi di questa guida: aggiunge isolamento esterno, pannelli e un ciclo di posa specifico (vedi \"Ti serve solo una parte del lavoro?\" più sotto).",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie della facciata moltiplicata per la fascia 70–120 €/mq del rifacimento esteso, ponteggio escluso — non da un preventivo reale: sono mq di superficie della facciata esterna, non della superficie abitativa interna, e non sommano tutte le singole lavorazioni della tabella. Per uno scenario più leggero (rinnovo della finitura o ripristino parziale), il totale è inferiore a questi esempi.",
  // Interventi specifici spesso confusi con un rifacimento della facciata:
  // slug reali del gruppo taxonomy "facciate-e-balconi" (verificati contro
  // project-groups/facciate-e-balconi.ts), tenuti distinti su richiesta
  // esplicita — nessuno ha oggi una landing o guida propria, risolvono al
  // funnel via resolveBestHrefForIntervention finché non ne nascerà una.
  // Preservati invariati in questa revisione (nessuna modifica a slug/title,
  // solo la description del cappotto allineata alla frase richiesta
  // esplicitamente per questa guida — vedi anche priceTableNote sopra).
  relatedWork: [
    {
      slug: "realizzare-cappotto-termico-facciata",
      title: "Realizzare il cappotto termico della facciata",
      description:
        "Il cappotto termico non è compreso nei prezzi di questa guida: aggiunge isolamento esterno, pannelli e un ciclo di posa specifico.",
    },
    {
      slug: "ripristinare-balconi-e-ballatoi",
      title: "Ripristinare balconi e ballatoi",
      description: "Per distacchi di intonaco o cemento ammalorato su balconi e ballatoi, non sulla facciata.",
    },
    {
      slug: "ripristino-frontalino",
      title: "Ripristinare il frontalino del balcone",
      description: "Per il frontalino del balcone, un intervento specifico e distinto dalla facciata.",
    },
  ],
};
