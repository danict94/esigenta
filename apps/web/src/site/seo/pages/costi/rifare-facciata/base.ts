import type { CostGuideBaseContent } from "../types";

export const rifareFacciataBase: CostGuideBaseContent = {
  slug: "rifare-facciata",
  funnelSlug: "rifare-facciata",
  interventionSeoSlug: "rifare-facciata",
  title: "Costi rifacimento facciata",
  h1: "Quanto costa rifare la facciata?",
  metaTitle: "Quanto costa rifare la facciata? Prezzi al mq",
  lastModified: "2026-08-09",
  metaDescription:
    "Scopri quanto costa rifare la facciata: fascia indicativa al mq, esempi di spesa, cosa comprende il rifacimento e quanto incide il ponteggio.",
  hubCategory: { slug: "tetti-e-facciate", name: "Tetti e facciate" },
  hubOrder: 30,
  hubDescription:
    "Fascia orientativa al mq per il rifacimento ordinario della facciata: intonaco, rasatura e tinteggiatura.",
  topicLabel: "rifare la facciata",
  summary:
    "Rifare la facciata significa intervenire su intonaco ammalorato, rasatura e tinteggiatura della superficie esterna. Il preventivo cambia soprattutto in base a superficie, stato dell'intonaco esistente, tipo di finitura scelta e necessità di ponteggio.",
  factors: [
    "superficie della facciata da trattare",
    "stato dell'intonaco esistente e quantità di parti da rimuovere",
    "tipo di rasatura e finitura scelta",
    "tipo di tinteggiatura (traspirante, silossanica, ai silicati)",
    "necessità e complessità del ponteggio",
    "accessibilità dell'edificio e vincoli condominiali",
  ],
  savingTips: [
    "Fai verificare lo stato reale dell'intonaco prima di scegliere tra sola tinteggiatura e rifacimento dell'intonaco.",
    "Chiedi preventivi con voci separate per ponteggio, intonaco, rasatura e tinteggiatura.",
    "Se l'edificio è condominiale, valuta insieme ad altri proprietari per dividere i costi del ponteggio.",
    "Chiarisci il tipo di finitura e pittura previsti: silossanica, ai silicati o tradizionale hanno prezzi diversi.",
    "Verifica se sono necessarie pratiche edilizie o comunicazioni per lavori sulla facciata.",
  ],
  nationalRangeLabel: "Fascia orientativa",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  nationalRangeNote:
    "Indicativamente 60–120 € al mq per il rifacimento ordinario della facciata: rimozione delle parti di intonaco ammalorato, ripristino dell'intonaco, rasatura, finitura e tinteggiatura. Il totale dipende dalla superficie, dallo stato dell'intonaco esistente e dalle lavorazioni incluse. Il ponteggio è una voce a parte, spesso quotata separatamente. Cappotto termico, consolidamenti strutturali importanti, restauro specialistico o storico e ripristino di balconi, ballatoi e frontalini non rientrano in questa fascia.",
  priceTableIntro:
    "La tabella distingue il rifacimento ordinario della facciata (la fascia orientativa 60–120 €/mq) dalle lavorazioni che restano fuori da questo range, come il ponteggio, il cappotto termico o interventi più importanti.",
  priceTableNote:
    "La fascia è un'elaborazione orientativa da confronto di mercato nazionale 2026, non la voce di un prezzario regionale: utile per farsi un'idea prima del preventivo, non per sostituirlo.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie della facciata moltiplicata per la fascia 60–120 €/mq — non da un preventivo: sono mq di superficie della facciata esterna, non della superficie abitativa interna. Ponteggio, stato dell'intonaco e tipo di finitura possono cambiare il totale.",
  // Interventi specifici spesso confusi con un rifacimento ordinario: slug
  // reali del gruppo taxonomy "facciate-e-balconi" (verificati contro
  // project-groups/facciate-e-balconi.ts), tenuti distinti su richiesta
  // esplicita — nessuno ha oggi una landing o guida propria, risolvono al
  // funnel via resolveBestHrefForIntervention finché non ne nascerà una.
  relatedWork: [
    {
      slug: "realizzare-cappotto-termico-facciata",
      title: "Realizzare il cappotto termico della facciata",
      description: "Per l'isolamento termico dell'edificio, un intervento diverso dal rifacimento ordinario.",
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
