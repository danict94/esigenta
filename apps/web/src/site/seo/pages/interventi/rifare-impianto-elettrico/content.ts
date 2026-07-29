import type { SeoInterventionLanding } from "../types";

// Fase 2 — contenuti tecnici verificati su:
// - DM 22 gennaio 2008, n. 37, artt. 3-4-5-7 (imprese abilitate; progetto
//   obbligatorio per nuova realizzazione/trasformazione/ampliamento, redatto
//   dal responsabile tecnico dell'impresa nella maggior parte dei casi, da un
//   professionista iscritto agli albi per utenze condominiali o unità
//   abitative singole sopra soglie di potenza/superficie; dichiarazione di
//   conformità con relazione materiali + progetto/schema; dichiarazione di
//   rispondenza è documento diverso, retrospettivo, non la via ordinaria per
//   un rifacimento attuale).
// - CEI 64-8, cap. 37 (concetto dei livelli prestazionali 1-2-3: dotazione e
//   fruibilità, non sicurezza — nessuna quantità numerica della norma
//   riportata qui).
// Nessun testo normativo copiato, nessun valore numerico non verificabile.
export const rifareImpiantoElettricoLanding: SeoInterventionLanding = {
  slug: "rifare-impianto-elettrico",
  title: "Rifare impianto elettrico",
  h1: "Rifare impianto elettrico: adegua casa con un elettricista qualificato",
  description:
    "Rifare l'impianto elettrico permette di aumentare sicurezza, affidabilità e conformità dell'abitazione. Descrivi il lavoro e confronta preventivi da elettricisti qualificati.",
  metaTitle: "Rifare impianto elettrico: preventivi elettricista",
  metaDescription:
    "Devi rifare o adeguare l'impianto elettrico? Scopri cosa incide sul costo e richiedi preventivi da elettricisti qualificati.",
  funnelSlug: "rifare-impianto-elettrico",
  groupSlug: "impianti-e-manutenzioni-elettriche",
  requestCtaLabel: "Richiedi preventivi per l'impianto elettrico",
  image: {
    src: "/assets/images/impianto-elettrico.webp",
    alt: "Intervento su impianto elettrico domestico",
  },
  geoSection: {
    title: "Trova elettricisti per il tuo impianto nella tua zona",
    summary:
      "Indica dove si trova l'abitazione e confronta professionisti attivi nella tua area per adeguare o rifare l'impianto elettrico.",
  },
  relatedInterventionSlugs: [
    "riparare-quadro-elettrico",
    "installare-illuminazione",
    "installare-fotovoltaico",
  ],
  // Fix audit: questi interventi sono più mirati, non "più ampi" — l'etichetta
  // di sezione è resa neutra senza toccare le altre landing (default invariato).
  relatedInterventionsTitle: "Interventi collegati",
  professionalCategorySlugs: ["elettricista"],
  // Interventi taxonomy reali del gruppo "impianti-e-manutenzioni-elettriche",
  // verificati contro packages/taxonomy/src/frozen/source/project-groups/
  // impianti-e-manutenzioni-elettriche.ts — confini e lavori più mirati,
  // distinti da quelli già in relatedInterventionSlugs. fare-impianto-
  // elettrico-nuovo aggiunto per marcare il confine con questa landing: non
  // ha una landing propria, risolve al funnel, nessuna duplicazione.
  relatedFunnelWork: [
    "riparare-guasto-elettrico",
    "installare-prese-interruttori-punti-luce",
    "fare-impianto-elettrico-nuovo",
  ],
  // Corretto da "impianto-elettrico" (slug inesistente, non risolveva a
  // nessuna guida): deve corrispondere allo slug reale della guida costi.
  costSlug: "rifare-impianto-elettrico",
  requestItems: [
    // Era "nuovo impianto elettrico domestico": si sovrapponeva concettualmente
    // a fare-impianto-elettrico-nuovo (intervento tassonomico distinto, per
    // edifici/unità senza impianto esistente). Questa landing riguarda solo
    // la sostituzione o trasformazione di un impianto già esistente.
    "rifacimento integrale dell'impianto esistente",
    "adeguamento impianto esistente",
    "sostituzione quadro elettrico",
    "aggiunta prese e punti luce",
  ],
  scopeIncluded: [
    "sopralluogo e definizione del perimetro del lavoro",
    "quadro elettrico e dispositivi di protezione",
    "linee e circuiti",
    "tubazioni e scatole",
    "prese, comandi e punti luce",
    "collegamento di terra e coordinamento con le protezioni",
    "verifiche finali",
    "documentazione tecnica prevista",
    "opere murarie, solo quando indicate nel preventivo",
  ],
  scopeExcluded: [
    "tinteggiatura e ripristini decorativi",
    "apparecchi illuminanti ed elettrodomestici",
    "rete dati, antifurto e domotica, se non esplicitamente incluse",
    "impianto fotovoltaico o colonnina di ricarica, trattati come interventi separati",
    "aumento della potenza contrattuale",
    "progettazioni specialistiche non indicate nel preventivo",
  ],
  scopeNote:
    "Ogni impresa compone il preventivo in modo diverso: usa queste liste per chiedere esplicitamente cosa è compreso e cosa no, prima di confrontare i prezzi.",
  variants: [
    {
      title: "Adeguamento",
      summary:
        "Intervento circoscritto su parti, protezioni o componenti specifici dell'impianto esistente, dopo una valutazione tecnica.",
    },
    {
      title: "Rifacimento parziale",
      summary:
        "Sostituzione o aggiunta di circuiti, linee o punti elettrici su una porzione dell'impianto, lasciando invariato il resto.",
    },
    {
      title: "Rifacimento completo",
      summary:
        "Nuova distribuzione, quadro, linee, protezioni e punti di utilizzo, con verifiche e documentazione finale su tutto l'impianto.",
    },
  ],
  preparationItems: [
    "quante stanze o quali zone sono interessate dal lavoro",
    "età e stato apparente dell'impianto attuale",
    "se hai notato guasti, protezioni che scattano o altri segnali di allarme",
    "se l'impianto elettrico è un lavoro a sé stante o parte di una ristrutturazione più ampia",
    "quanti punti luce, prese e comandi vorresti aggiungere o spostare",
    "accessibilità dell'abitazione e vincoli condominiali, se presenti",
  ],
  detailSections: [
    {
      id: "quando-valutare",
      title: "Quando valutare il rifacimento",
      intro:
        "Alcuni segnali possono rendere opportuna una verifica tecnica dell'impianto, anche se non indicano da soli una non conformità.",
      items: [
        "impianto molto datato",
        "componenti visibilmente danneggiati",
        "quadro elettrico non adatto ai carichi attuali",
        "interruzioni frequenti da parte delle protezioni",
        "necessità di nuove prese o linee",
        "ristrutturazione degli ambienti",
        "introduzione di apparecchi con carichi importanti",
        "ampliamenti o modifiche significative dell'abitazione",
      ],
      note: "Nessuno di questi segnali, da solo, permette di stabilire a distanza se l'impianto è conforme: la valutazione richiede sempre un sopralluogo.",
    },
    {
      id: "pianificazione",
      title: "Come viene progettato e organizzato l'impianto",
      intro: "Prima di intervenire, il professionista organizza il lavoro in base alle esigenze reali dell'abitazione.",
      items: [
        "raccolta delle esigenze e degli usi previsti",
        "valutazione dei carichi elettrici complessivi",
        "suddivisione dei circuiti",
        "posizione di prese, comandi e punti luce",
        "eventuali predisposizioni per usi futuri",
        "coordinamento con altri impianti: cucina, climatizzazione, pompa di calore, fotovoltaico, rete dati o ricarica del veicolo",
      ],
    },
    {
      id: "quadro-elettrico",
      title: "Quadro elettrico e protezioni",
      paragraphs: [
        "Il quadro elettrico distribuisce l'energia ai vari circuiti dell'abitazione e ospita i dispositivi che proteggono impianto e persone. Un quadro adeguato è organizzato per essere leggibile e sicuro, non solo per contenere più interruttori possibile.",
        "Il dispositivo generale interrompe l'alimentazione dell'intero impianto. I magnetotermici proteggono i singoli circuiti da sovraccarichi e cortocircuiti. I differenziali intervengono in caso di dispersione di corrente, a tutela delle persone.",
        "Un impianto ben organizzato prevede una suddivisione dei circuiti che permette di isolare una zona senza togliere corrente a tutta la casa, un'identificazione chiara di ogni linea nel quadro, e uno spazio residuo per eventuali ampliamenti futuri.",
      ],
      note: "Il numero e il tipo di dispositivi necessari dipendono dall'impianto specifico: la valutazione spetta al professionista.",
    },
    {
      id: "linee-e-punti",
      title: "Linee, tubazioni, scatole e punti elettrici",
      paragraphs: [
        "Questi termini vengono spesso usati come sinonimi, ma indicano cose diverse. Una linea, o circuito, è il percorso elettrico che alimenta uno o più utilizzatori a partire dal quadro.",
        "La canalizzazione o tubazione è il contenitore fisico che protegge i cavi lungo il loro percorso, incassato a muro o esterno. Il cavo, o conduttore, è l'elemento che trasporta la corrente all'interno della tubazione.",
        "La scatola è il contenitore, a muro o da incasso, dove i cavi si collegano o dove viene installato un dispositivo. Da qui nascono i diversi punti elettrici: il punto presa, per collegare un apparecchio, il punto comando, come interruttori e deviatori, e il punto luce, l'uscita dedicata a un corpo illuminante.",
      ],
      note: "\"Punto elettrico\" non è un sinonimo di tutte queste lavorazioni: nel preventivo conviene farsi specificare a cosa si riferisce ogni voce.",
    },
    {
      id: "messa-a-terra",
      title: "Messa a terra",
      paragraphs: [
        "L'impianto di terra ha la funzione di disperdere nel terreno eventuali correnti di guasto, riducendo il rischio per le persone in caso di malfunzionamento. È una parte strutturale dell'impianto elettrico, non un accessorio.",
        "I conduttori di protezione collegano le masse metalliche, come involucri di apparecchi o tubazioni, all'impianto di terra, così che restino allo stesso potenziale in caso di guasto. Lavorano insieme alle altre protezioni del quadro, come i differenziali, ma non sono la stessa cosa: il differenziale interrompe la corrente in caso di dispersione, la messa a terra è il percorso che rende efficace quella protezione.",
      ],
      note: "Sostituire il quadro elettrico non aggiorna automaticamente la messa a terra: sono interventi distinti, anche se spesso eseguiti insieme in un rifacimento completo.",
    },
    {
      id: "locali-e-carichi",
      title: "Cucina, bagno e carichi dedicati",
      intro: "Alcuni ambienti e apparecchi richiedono un'attenzione specifica in fase di progettazione.",
      items: [
        "cucina, con piano a induzione e forno",
        "bagno",
        "lavatrice e lavastoviglie",
        "climatizzazione e pompa di calore",
        "boiler o scaldacqua elettrico",
        "ricarica del veicolo elettrico",
      ],
      note: "Il numero e il tipo di circuiti dedicati dipendono dagli apparecchi effettivamente previsti: va valutato caso per caso con il professionista.",
    },
    {
      id: "livelli-prestazionali",
      title: "Livelli prestazionali 1, 2 e 3",
      paragraphs: [
        "Nel contesto residenziale, l'impianto elettrico può essere descritto secondo tre livelli prestazionali: un riferimento tecnico su quanto l'impianto è dotato e fruibile, non su quanto è sicuro.",
        "Il livello 1 rappresenta una dotazione di base. Il livello 2 offre una maggiore fruibilità, con più punti e circuiti dedicati. Il livello 3 introduce dotazioni più ampie e funzioni di automazione, come il controllo di luci, temperatura o scenari.",
      ],
      note: "Il livello prestazionale non indica se un impianto è più o meno sicuro: tutti gli impianti devono rispettare i requisiti di sicurezza applicabili, indipendentemente dal livello scelto.",
    },
    {
      id: "come-si-svolge",
      title: "Come si svolge il lavoro",
      intro: "La sequenza può variare da cantiere a cantiere: questo è un ordine indicativo, non un elenco rigido.",
      items: [
        "sopralluogo",
        "definizione del perimetro del lavoro",
        "eventuale progetto, quando previsto",
        "disalimentazione dell'impianto",
        "rimozione delle parti interessate",
        "realizzazione di tracce e canalizzazioni",
        "posa di scatole, linee e quadro elettrico",
        "installazione dei componenti",
        "collegamenti",
        "verifiche",
        "ripristini",
        "consegna della documentazione",
      ],
    },
    {
      id: "verifiche-e-documentazione",
      title: "Verifiche finali e documentazione",
      paragraphs: [
        "Al termine del lavoro, l'impresa installatrice esegue le verifiche finali e rilascia la dichiarazione di conformità, il documento con cui attesta che l'impianto è stato realizzato a regola d'arte.",
        "La dichiarazione di conformità comprende, tra gli allegati, la relazione con la tipologia dei materiali utilizzati e, a seconda dei casi, il progetto oppure lo schema dell'impianto. Per gli interventi più semplici il progetto può essere redatto dal responsabile tecnico dell'impresa installatrice. Il DM 37/2008 richiede invece un professionista iscritto agli albi professionali nei casi che individua espressamente, come le utenze condominiali o alcune unità abitative singole di maggiori dimensioni.",
        "La dichiarazione di rispondenza è un documento diverso: riguarda impianti più datati, privi della dichiarazione di conformità originale, e non è la via ordinaria per un rifacimento o un adeguamento eseguito oggi.",
      ],
      note: "Chiedi sempre al professionista quale documentazione è prevista per il tuo intervento specifico.",
    },
  ],
  costSection: {
    title: "Quanto costa rifare un impianto elettrico?",
    summary:
      "Il costo varia in base a dimensioni dell'abitazione, numero di punti luce, quadro elettrico, tracce murarie e livello di finitura richiesto. La verifica sul posto aiuta a definire un preventivo realistico.",
    factors: [
      "numero di stanze e punti elettrici",
      "presenza di tracce da aprire o richiudere",
      "quadro elettrico e dispositivi di protezione",
      "necessità di adeguamenti o nuova documentazione tecnica",
    ],
    examples: [
      "adeguamento di un piccolo appartamento",
      "rifacimento completo in ristrutturazione",
      "aggiunta linee dedicate per nuovi carichi",
    ],
  },
  faq: [
    {
      question: "Quando conviene rifare l'impianto elettrico?",
      answer:
        "Può convenire quando l'impianto è molto datato, presenta componenti danneggiati, le protezioni intervengono spesso, o servono nuove prese e linee per esigenze cambiate. Una verifica tecnica aiuta a stabilire l'intervento più adatto.",
    },
    {
      question: "Un impianto vecchio deve essere rifatto completamente?",
      answer:
        "Non necessariamente: dipende dallo stato reale dell'impianto. In alcuni casi basta un adeguamento su parti specifiche, in altri conviene un rifacimento più esteso. Lo stabilisce una valutazione tecnica, non l'età da sola.",
    },
    {
      question: "Qual è la differenza tra adeguamento, rifacimento parziale e completo?",
      answer:
        "Un adeguamento interviene su parti o componenti specifici dell'impianto esistente. Un rifacimento parziale sostituisce o aggiunge circuiti solo su una porzione dell'impianto. Un rifacimento completo riguarda l'intero impianto: quadro, linee, punti elettrici e messa a terra.",
    },
    {
      question: "Rifare il quadro significa rifare tutto l'impianto?",
      answer:
        "No. Il quadro elettrico può essere sostituito o adeguato come intervento a sé, se il resto dell'impianto è in condizioni adeguate. Un rifacimento completo riguarda invece l'intero impianto, quadro compreso.",
    },
    {
      question: "Le opere murarie sono comprese?",
      answer:
        "Le tracce necessarie alla posa dei nuovi cavi sono spesso incluse nel preventivo, mentre il ripristino estetico delle pareti, come stuccatura e tinteggiatura, può essere una voce separata. Chiedilo esplicitamente al professionista.",
    },
    {
      question: "Che differenza c'è tra livelli 1, 2 e 3?",
      answer:
        "Sono un riferimento tecnico sulla dotazione e sulla fruibilità dell'impianto: il livello 1 è una dotazione di base, il livello 2 offre maggiore fruibilità, il livello 3 introduce funzioni di automazione. Non indicano un livello di sicurezza diverso: tutti gli impianti devono rispettare i requisiti di sicurezza applicabili.",
    },
    {
      question: "Chi può eseguire il lavoro e rilasciare la dichiarazione di conformità?",
      answer:
        "Il lavoro deve essere eseguito da un'impresa abilitata, che al termine rilascia la dichiarazione di conformità. Il DM 37/2008 richiede che il progetto sia redatto da un professionista iscritto agli albi professionali nei casi che individua espressamente, come le utenze condominiali o alcune unità abitative singole di maggiori dimensioni; negli altri casi può essere il responsabile tecnico dell'impresa stessa.",
    },
    {
      question: "Si possono predisporre linee per esigenze future?",
      answer:
        "Sì, è una scelta comune in fase di rifacimento: si possono prevedere circuiti o tubazioni aggiuntive per usi non ancora attivi, come la ricarica del veicolo elettrico o un futuro ampliamento, da attivare in un secondo momento.",
    },
  ],
};
