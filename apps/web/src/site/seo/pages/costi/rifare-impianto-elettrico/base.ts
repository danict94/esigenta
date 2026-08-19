import type { CostGuideBaseContent } from "../types";

// Revisione 2026-08 (Scope 3 + Scope 4): il modello economico passa da 1
// fascia unica (45–80 €/mq) + 23 prezzi ufficiali puntuali senza gerarchia a
// 3 scenari di ampiezza (40–60 / 55–90 / 80–110 €/mq) + 12 lavorazioni
// cliente + 3 costi da valutare — vedi il commento di revisione su
// "costGuide:rifare-impianto-elettrico" in market-data/base-price-ranges.ts
// per il dettaglio completo (Scope 3, PriceRow congelate da qui in poi).
// Scope 4 completa l'allineamento editoriale: summary/nationalRangeNote/
// priceTableIntro/priceTableNote/sizeExamplesIntro/metaDescription/factors/
// savingTips aggiornati al nuovo modello, copy normativo DiCo/progetto
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
  lastModified: "2026-08-18",
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
    "Rifare un impianto elettrico costa indicativamente da 55 € a 90 € al mq per un rifacimento completo standard, ma il preventivo reale dipende soprattutto da punti luce, punti presa, distribuzione interna, quadro elettrico e opere murarie: la tabella più sotto distingue tre scenari di ampiezza (da 40–60 €/mq quando le canalizzazioni esistenti sono in buona parte riutilizzabili, a 80–110 €/mq per un impianto più articolato) dalle singole lavorazioni, utili per verificare nel dettaglio cosa comprende un preventivo.",
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
    "Decidi in anticipo la posizione di prese, punti luce e comandi: le modifiche in corso d'opera, dopo che tracce e cablaggi sono già stati eseguiti, costano di più.",
    "Chiedi un sopralluogo per verificare quali canalizzazioni esistenti sono davvero riutilizzabili: è la differenza principale tra lo scenario 40–60 €/mq e il rifacimento completo standard.",
    "Chiedi che il preventivo distingua scenario scelto, punti elettrici, circuiti, quadro e opere murarie: sono voci diverse, utili per capire cosa stai pagando.",
    "Chiedi esplicitamente se il ripristino estetico delle pareti dopo le tracce (intonaco, rasatura, tinteggiatura) è compreso o resta a parte: nella maggior parte dei preventivi non lo è.",
    "Coordina i tempi tra elettricista e imbianchino/impresa edile: chiudere le tracce e ripristinare le pareti nello stesso intervento evita doppi sopralluoghi e doppi costi di accesso.",
    "Chiedi se la Dichiarazione di conformità è compresa (di norma lo è, per legge, in un lavoro eseguito da un'impresa abilitata) e se serve un progetto tecnico, per evitare sorprese a fine lavori.",
  ],
  nationalRangeLabel: "Fascia orientativa al mq",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  // Revisione 2026-08 (Scope 3): formula obbligatoria "normali tracce e
  // chiusura grezza comprese; finitura estetica della parete esclusa" al
  // posto della vecchia dicitura generica "opere murarie ordinarie" — vedi
  // il commento di revisione sul primary in base-price-ranges.ts.
  nationalRangeNote:
    "Indicativamente 55–90 € al mq per il rifacimento completo standard di un impianto elettrico residenziale esistente: normali tracce e chiusura grezza comprese, finitura estetica della parete esclusa — non una formula generica di \"opere murarie comprese\". Un rifacimento con canalizzazioni esistenti in buona parte riutilizzabili costa indicativamente meno, da 40 a 60 €/mq; un impianto più articolato, con molte linee dedicate e nuove tracce diffuse, costa indicativamente di più, da 80 a 110 €/mq (vedi gli scenari più sotto). Le tre fasce non vanno sommate: rappresentano ampiezze diverse dello stesso tipo di intervento.",
  priceTableIntro:
    "La tabella distingue tre scenari di ampiezza del lavoro — dal rifacimento con canalizzazioni riutilizzabili all'impianto più articolato — dalle singole lavorazioni (punti elettrici, circuiti, quadro elettrico completo, opere murarie), utili per capire nel dettaglio cosa contiene un preventivo o per stimare un intervento parziale.",
  // Revisione 2026-08 (Scope 4, micro-fix chiusura finale): copy normativo
  // corretto due volte. Prima citava solo l'assenza di una voce di
  // prezzario per la DiCo, senza mai spiegare cosa sia realmente. Poi
  // dichiarava che "non è una prestazione aggiuntiva a pagamento" /
  // "non come prestazione a parte o un optional commerciale" — formulazione
  // troppo assoluta (poteva far leggere la DiCo come "sempre gratuita per
  // definizione", invece di un obbligo dell'impresa che va comunque
  // verificato nel preventivo). Ora: non è un optional del rifacimento
  // (l'impresa abilitata DEVE rilasciarla, D.M. 37/2008 art. 7), ma il
  // preventivo va comunque verificato. Nessun prezzo autonomo creato per
  // questo (resta fuori dal modello PriceRow, come da vincolo).
  priceTableNote:
    "Le fasce sono elaborazioni editoriali Esigenta, ancorate a prezzari regionali ufficiali (Emilia-Romagna 2025, Friuli Venezia Giulia 2025) e al confronto con il mercato nazionale: non sono la voce di un singolo prezzario né un tariffario nazionale. I valori ufficiali puntuali che hanno guidato ogni fascia restano citati nella nota di dettaglio della riga corrispondente, con fonte e anno originali. Le voci di categorie diverse (scenari, punti elettrici, circuiti, quadro, opere murarie) non vanno sommate tra loro: sono letture parallele dello stesso lavoro, non prezzi cumulativi. La Dichiarazione di conformità non è un optional del rifacimento: al termine dei lavori, dopo le verifiche previste, l'impresa installatrice abilitata deve rilasciarla al committente (D.M. 37/2008, art. 7). Nel preventivo è bene verificare che la documentazione finale prevista sia compresa nel prezzo dell'intervento.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie dell'abitazione moltiplicata per la fascia 55–90 €/mq del rifacimento completo standard — non da quattro rilevazioni di mercato indipendenti: su appartamenti piccoli il costo al mq può risultare più alto, perché quadro elettrico, nuova uscita, verifiche e lavorazioni minime non diminuiscono in proporzione alla superficie. Un impianto con molte canalizzazioni riutilizzabili costa indicativamente meno di questi esempi; un impianto più articolato, con domotica avanzata o molti ripristini murari, può superare questa fascia.",
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
