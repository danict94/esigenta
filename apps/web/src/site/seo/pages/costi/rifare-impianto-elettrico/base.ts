import type { CostGuideBaseContent } from "../types";

export const rifareImpiantoElettricoBase: CostGuideBaseContent = {
  slug: "rifare-impianto-elettrico",
  funnelSlug: "rifare-impianto-elettrico",
  interventionSeoSlug: "rifare-impianto-elettrico",
  title: "Costi impianto elettrico",
  h1: "Quanto costa rifare un impianto elettrico?",
  metaTitle: "Quanto costa rifare un impianto elettrico? Guida ai costi",
  // Data reale dell'ultima revisione editoriale sostanziale (commit
  // d3a9d81, fascia 45–80 €/mq per il rifacimento completo), non del
  // deploy: vedi engine/editorial-date.ts.
  lastModified: "2026-08-09",
  metaDescription:
    "Prezzi ufficiali da prezzari regionali per punti luce, punti presa, distribuzione, componenti del quadro e opere murarie di un impianto elettrico.",
  heroImage: {
    src: "/assets/images/impianto-elettrico.webp",
    alt: "Intervento su impianto elettrico domestico",
  },
  hubCategory: { slug: "impianti-e-manutenzioni-elettriche", name: "Impianti e manutenzioni elettriche" },
  hubOrder: 10,
  hubDescription:
    "Costi di punti luce, prese, linee, componenti del quadro e opere murarie, spiegati in linguaggio semplice.",
  topicLabel: "rifare un impianto elettrico",
  // Revisione 2026-08: prima diceva "usali... non per stimare un totale",
  // in contraddizione diretta con la nuova fascia 45–80 €/mq qui sotto.
  summary:
    "Rifare un impianto elettrico costa indicativamente da 45 € a 80 € al mq per un rifacimento completo standard, ma il preventivo reale dipende soprattutto da punti luce, punti presa, distribuzione interna, quadro elettrico e opere murarie: la tabella più sotto riporta i prezzi ufficiali di ogni singola lavorazione, utile per verificare nel dettaglio cosa comprende un preventivo.",
  factors: [
    "superficie e numero di stanze dell'abitazione",
    "numero di punti luce, punti presa e punti comando richiesti",
    "numero e tipo di circuiti dedicati (es. cucina, climatizzazione, ricarica veicolo)",
    "quadro elettrico e dispositivi di protezione necessari",
    "stato dell'impianto esistente e possibilità di riutilizzare le tubazioni già presenti",
    "necessità di nuove tracce murarie e dei relativi ripristini",
    "tipo di posa: incassata, a vista, o sola posa su predisposizione esistente",
    "serie civile e materiali scelti (placche, apparecchi, componenti del quadro)",
    "accessibilità dell'abitazione e del cantiere",
    "eventuali dotazioni aggiuntive, come predisposizioni per usi futuri",
    "necessità di adeguamenti o nuova documentazione tecnica",
  ],
  savingTips: [
    "Chiedi che il preventivo distingua punti elettrici, distribuzione interna, componenti del quadro e opere murarie: sono voci diverse con prezzi diversi.",
    "Verifica se ogni punto luce o presa è a incasso o a vista: la posa a vista ha un prezzo diverso da quella incassata.",
    "Chiedi se le tracce murarie comprendono anche la chiusura e il ripristino, o solo l'apertura.",
    "Fai indicare separatamente i componenti del quadro elettrico (magnetotermici, differenziali, carpenteria) dal loro cablaggio.",
    "Chiedi quali prove e quali documenti tecnici sono compresi nel preventivo: non sono sempre inclusi allo stesso modo.",
  ],
  // Revisione 2026-08: prima "Come si compone il costo" +
  // "PREZZI PER SINGOLA LAVORAZIONE" (guida senza totale). Ora esiste una
  // vera fascia editoriale complessiva: le etichette lo riflettono, stesso
  // pattern testuale di rifare-tetto/impermeabilizzare-terrazzo.
  nationalRangeLabel: "Fascia orientativa al mq",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  nationalRangeNote:
    "Indicativamente 45–80 € al mq per il rifacimento completo di un impianto elettrico residenziale esistente, con configurazione ordinaria, senza domotica avanzata e senza ripristini murari eccezionalmente estesi. Il preventivo reale dipende soprattutto dal numero e dal tipo di punti, linee, quadro elettrico, opere murarie e dalle condizioni dell'impianto esistente da sostituire.",
  priceTableIntro:
    "La prima riga della tabella riporta la fascia 45–80 €/mq come stima complessiva; le righe successive sono invece i prezzi ufficiali di ogni singola lavorazione (punti elettrici, distribuzione, componenti del quadro, opere murarie), utili per capire nel dettaglio cosa contiene un preventivo e cosa può farlo salire oltre la fascia standard — per esempio in una casa vecchia che richiede più tracce, più linee o un quadro più esteso.",
  priceTableNote:
    "I valori delle singole lavorazioni derivano dai prezzari regionali dei lavori pubblici Emilia-Romagna 2025 e Friuli Venezia Giulia 2025: non sono un tariffario nazionale né un preventivo per lavori privati, e le voci di categorie diverse (punti elettrici, distribuzione, componenti del quadro, opere murarie) non vanno sommate tra loro né aggiunte alla fascia 45–80 €/mq, che è già una stima complessiva alternativa. Nei prezzari consultati non è stata individuata una voce autonoma e omogenea per dichiarazione di conformità, verifiche finali, progetto o collaudo: il preventivo che ricevi deve indicare esplicitamente quali prove e quali documenti sono compresi.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie dell'abitazione moltiplicata per la fascia 45–80 €/mq — non da quattro rilevazioni di mercato indipendenti: su appartamenti piccoli il costo al mq può risultare più alto, perché quadro elettrico, nuova uscita, verifiche e lavorazioni minime non diminuiscono in proporzione alla superficie. Un impianto con domotica avanzata, molti ripristini murari o condizioni di partenza complesse può superare questa fascia.",
  relatedWork: [
    {
      slug: "riparare-guasto-elettrico",
      title: "Riparare un guasto elettrico",
      description: "Se il problema è un guasto puntuale, non un rifacimento dell'impianto.",
    },
    {
      slug: "riparare-quadro-elettrico",
      title: "Sistemare o sostituire il quadro elettrico",
      description: "Se serve intervenire solo sul quadro, non su tutto l'impianto.",
    },
  ],
};
