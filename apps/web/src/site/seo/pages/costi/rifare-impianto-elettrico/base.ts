import type { CostGuideBaseContent } from "../types";

// Revisione 2026-08 (Scope 3 + Scope 4): il modello economico passa da 1
// fascia unica (45–80 €/mq) + 23 prezzi ufficiali puntuali senza gerarchia a
// 3 scenari di ampiezza (40–60 / 55–90 / 80–110 €/mq) + 12 lavorazioni
// cliente + 3 costi da valutare — vedi il commento di revisione su
// "costGuide:rifare-impianto-elettrico" in market-data/pricing/guides/rifare-impianto-elettrico.ts
// per il dettaglio completo (Scope 3, PriceRow congelate da qui in poi).
// Scope 4 completa l'allineamento editoriale: summary, metaDescription,
// factors e savingTips aggiornati al nuovo modello, copy normativo DiCo/progetto
// corretto (prima ometteva del tutto la spiegazione), FAQ interamente
// riscritte in faq.ts (nessun vecchio numero residuo come risposta
// principale).
export const rifareImpiantoElettricoBase: CostGuideBaseContent = {
  slug: "rifare-impianto-elettrico",
  funnelSlug: "rifare-impianto-elettrico",
  interventionSeoSlug: "rifare-impianto-elettrico",
  title: "Costi impianto elettrico",
  h1: "Quanto costa rifare un impianto elettrico?",
  metaTitle: "Quanto costa rifare un impianto elettrico? Guida ai costi",
  // Data reale dell'ultima revisione editoriale sostanziale, non del
  // deploy: vedi engine/editorial-date.ts.
  lastModified: "2026-09-18",
  editorial: {
    datePublished: "2026-07-29",
    technicalReferences: [
      { label: "CEI 64-8", type: "standard" },
      { label: "DM 37/08", type: "law" },
    ],
    relatedGuides: [
      {
        slug: "ristrutturare-bagno",
        description: "Se il rifacimento dell’impianto rientra nei lavori del bagno: distingue i collegamenti essenziali dall’adeguamento elettrico più esteso.",
      },
    ],
  },
  metaDescription:
    "Fasce orientative Esigenta e prezzi di riferimento per punti luce, prese, circuiti, quadro elettrico completo e opere murarie di un impianto elettrico, in linguaggio semplice.",
  heroImage: {
    src: "/assets/images/impianto-elettrico.webp",
    alt: "Intervento su impianto elettrico domestico",
  },
  hubCategory: { slug: "impianti-e-manutenzioni-elettriche", name: "Impianti e manutenzioni elettriche" },
  hubOrder: 10,
  hubDescription:
    "Costi di punti luce, prese, circuiti, quadro elettrico completo e opere murarie, spiegati in linguaggio semplice.",
  topicLabel: "rifare un impianto elettrico",
  summary:
    "Il costo varia in base alla metratura, al numero di punti luce e prese, allo stato dell’impianto esistente, alla possibilità di riutilizzare le canalizzazioni e alla complessità delle opere murarie.\n\nIndicativamente, un rifacimento completo standard può costare da 55 a 90 €/mq. Le fasce 40–60 €/mq e 80–110 €/mq descrivono invece perimetri diversi: la prima si applica quando le canalizzazioni esistenti sono riutilizzabili, la seconda a impianti più articolati. Per confrontare i preventivi, verifica sempre che lavorazioni e opere murarie comprese coincidano.",
  extrasPresentation: { title: "Cosa può far aumentare il prezzo", intro: "Alcune lavorazioni possono aggiungersi solo quando necessarie, in base alle condizioni dell’impianto e dell’immobile.", layout: "columns" },
  compactFactors: { title: "Altri fattori che possono incidere sul preventivo", intro: "Oltre alle caratteristiche dell’impianto, il preventivo può variare in base al contesto del cantiere e ad altre esigenze tecniche." },
  breakdownIntro: "Alcune lavorazioni possono essere già comprese negli scenari indicati sopra: in questi casi non vanno sommate una seconda volta.",
  sizeExamplesTable: { title: "Esempi di costo per metratura", intro: "Stime calcolate sulla fascia 55–90 €/m² del rifacimento completo standard.", sizeUnit: "m²", notes: ["Le stime per metratura sono ottenute applicando la fascia standard di 55–90 €/m² alla superficie: non sono rilevazioni di mercato indipendenti per ciascun taglio.", "Negli appartamenti piccoli il costo al m² può risultare più alto, perché quadro elettrico, verifiche e alcune lavorazioni minime non diminuiscono in proporzione alla superficie."] },
  factors: [
    "superficie e numero di stanze dell'abitazione",
    "quanto delle canalizzazioni esistenti (corrugati, scatole, percorsi) è realmente riutilizzabile",
    "numero di punti luce, punti presa e comandi richiesti",
    "numero e tipo di circuiti: standard o dedicati a un'utenza specifica (es. cucina, climatizzazione, ricarica veicolo)",
    "articolazione del quadro elettrico, in base al numero di circuiti da proteggere",
    "quantità di nuove tracce murarie necessarie",
    "tipo di muratura da lavorare (laterizio forato o muratura piena, più impegnativa)",
    "necessità di un ripristino estetico delle pareti dopo le tracce (intonaco, rasatura, tinteggiatura)",
    "stato e percorso del montante tra contatore e quadro, quando va rifatto",
    "necessità di un adeguamento dell'impianto di terra",
    "eventuale progettazione tecnica esterna, quando richiesta dal caso o dalla normativa",
    "accessibilità dell'abitazione e del cantiere",
  ],
  savingTips: [
    "Definisci prima prese, punti luce e comandi. Cambiare disposizione durante i lavori, quando tracce e cablaggi sono già stati realizzati, può aumentare i costi.",
    "Verifica cosa può essere realmente riutilizzato. Un sopralluogo permette di capire se canalizzazioni e percorsi esistenti sono ancora utilizzabili, evitando demolizioni e nuove tracce non necessarie.",
    "Chiedi un preventivo con voci ben distinte. Punti elettrici, circuiti, quadro, opere murarie ed eventuali finiture dovrebbero essere indicati separatamente, così è più semplice confrontare le offerte.",
    "Coordina elettricista e opere di finitura. Se dopo le tracce servono rasatura e tinteggiatura, organizzare in anticipo le diverse lavorazioni può evitare interventi separati e costi aggiuntivi.",
  ],
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
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
