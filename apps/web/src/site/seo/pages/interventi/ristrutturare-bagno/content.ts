import type { SeoInterventionLanding } from "../types";

export const ristrutturareBagnoLanding: SeoInterventionLanding = {
  slug: "ristrutturare-bagno",
  title: "Ristrutturare bagno",
  h1: "Ristrutturare bagno: trova professionisti qualificati nella tua zona",
  description:
    "Ristrutturare un bagno significa coordinare demolizioni, impianti, sanitari, rivestimenti e finiture. Confronta professionisti adatti al lavoro e ricevi preventivi per il tuo intervento.",
  metaTitle: "Ristrutturare bagno: preventivi da professionisti",
  metaDescription:
    "Devi ristrutturare un bagno? Scopri cosa comprende il lavoro, da cosa dipende il costo e confronta preventivi da professionisti qualificati.",
  funnelSlug: "ristrutturare-bagno",
  groupSlug: "ristrutturazioni",
  requestCtaLabel: "Richiedi preventivi per il bagno",
  image: {
    src: "/assets/images/rifacimento-bagno.webp",
    alt: "Ristrutturazione bagno con sanitari e rivestimenti moderni",
  },
  geoSection: {
    title: "Trova professionisti per ristrutturare il bagno nella tua zona",
    summary:
      "Descrivi il lavoro e confronta preventivi da professionisti disponibili nella tua zona.",
  },
  relatedInterventionSlugs: [
    "ristrutturare-casa",
    "ristrutturare-cucina",
    "tinteggiare-interni",
  ],
  professionalCategorySlugs: ["impresa-edile", "idraulico"],
  // Pilota Phase 19.8 — solo TaxonomyIntervention reali, verificate contro
  // @esigenta/taxonomy da templates/related-funnel-work.tsx.
  relatedFunnelWork: [
    "installare-sanitari",
    "sostituire-box-doccia",
    "rifare-impianto-idraulico-bagno",
  ],
  costSlug: "ristrutturare-bagno",
  requestItems: [
    "rifacimento completo del bagno",
    "sostituzione sanitari e rubinetteria",
    "posa piastrelle e rivestimenti",
    "adeguamento impianto idraulico",
  ],
  scopeIncluded: [
    "demolizione di pavimenti, rivestimenti e vecchi sanitari",
    "smaltimento delle macerie, se concordato nel preventivo",
    "modifiche all'impianto idraulico e ai punti acqua",
    "adeguamento dei punti luce e delle prese del bagno",
    "impermeabilizzazione e preparazione dei sottofondi",
    "posa di pavimento e rivestimenti",
    "installazione di sanitari, rubinetteria e box doccia o vasca",
    "finiture: sigillature, profili e ritocchi interni al bagno",
  ],
  scopeExcluded: [
    "sanitari, rubinetteria e piastrelle acquistati direttamente da te",
    "arredo bagno, specchi e accessori",
    "materiali di fascia alta oltre quanto concordato",
    "modifiche strutturali o lavori fuori dal bagno",
    "eventuali pratiche tecniche, quando necessarie",
    "imprevisti scoperti in corso d'opera, come scarichi o tubazioni da rifare",
  ],
  scopeNote:
    "Ogni impresa compone il preventivo in modo diverso: usa queste liste per chiedere esplicitamente cosa è compreso e cosa no, prima di confrontare i prezzi.",
  variants: [
    {
      title: "Rinnovo leggero",
      summary:
        "Sostituzioni mirate senza rifacimento completo: sanitari, rubinetteria, box doccia o singole finiture, con impianti esistenti in buono stato.",
    },
    {
      title: "Rifacimento parziale",
      summary:
        "Si interviene solo su una parte del bagno, ad esempio la zona doccia, il pavimento o i rivestimenti. Il perimetro esatto va definito con il professionista.",
    },
    {
      title: "Ristrutturazione completa",
      summary:
        "Demolizione, impianti, sottofondi, posa e finiture ripartendo da zero: il caso più frequente quando il bagno è datato o si cambia la disposizione.",
    },
  ],
  preparationItems: [
    "qualche foto del bagno attuale",
    "misure indicative: bastano larghezza e lunghezza",
    "cosa vuoi cambiare e cosa invece tenere",
    "se doccia, sanitari o lavabo cambieranno posizione",
    "se hai già scelto i materiali o preferisci ricevere proposte",
    "se è l'unico bagno in casa",
    "problemi visibili: muffa, perdite, scarichi lenti",
    "quando vorresti iniziare i lavori",
  ],
  costSection: {
    title: "Quanto costa ristrutturare un bagno?",
    summary:
      "Il costo dipende soprattutto da dimensioni, materiali, demolizioni, spostamento degli impianti e livello delle finiture. Per un preventivo attendibile serve descrivere lo stato attuale e il risultato desiderato.",
    priceRowLabels: [
      "Rinnovo leggero bagno",
      "Ristrutturazione completa",
      "Costo indicativo al mq",
      "Punto acqua completo",
      "Trasformazione vasca in doccia",
    ],
    factors: [
      "metratura del bagno e superficie da rivestire",
      "quantità di demolizioni e smaltimento delle macerie",
      "stato di impianto idraulico e scarichi esistenti",
      "spostamento di doccia, vasca, lavabo o wc",
      "qualità di piastrelle, sanitari e rubinetteria",
      "accesso al cantiere, piano e uso dell'ascensore",
      "vincoli condominiali o tecnici dell'edificio",
      "urgenza o finestre di lavoro ristrette",
    ],
    examples: [
      "rinnovo leggero con sostituzione sanitari",
      "rifacimento completo con nuove piastrelle",
      "trasformazione vasca in doccia",
    ],
  },
  faq: [
    {
      question: "Quanto può variare il costo di una ristrutturazione bagno?",
      answer:
        "Molto: metratura, materiali, stato degli impianti e complessità del cantiere spostano il preventivo in modo significativo. I range indicativi di questa pagina servono a orientarsi, non sono un'offerta: il valore reale arriva dal confronto tra più preventivi.",
    },
    {
      question: "Serve sempre rifare anche gli impianti?",
      answer:
        "Non sempre. Se gli impianti sono recenti e in buono stato possono bastare sostituzioni mirate, ma in una ristrutturazione completa conviene farli verificare prima di chiudere pareti e rivestimenti.",
    },
    {
      question: "Posso chiedere preventivi senza aver scelto i materiali?",
      answer:
        "Sì. Puoi indicare una fascia di qualità desiderata e chiedere che il preventivo tenga separata la fornitura dei materiali, così resti libero di sceglierli in un secondo momento.",
    },
    {
      question: "Devo sapere già le misure precise?",
      answer:
        "No: per la richiesta bastano misure indicative. Le misure esatte vengono verificate dal professionista, in genere durante il sopralluogo.",
    },
    {
      question: "Posso allegare foto alla richiesta?",
      answer:
        "Sì, durante la richiesta puoi caricare foto del bagno attuale: aiutano i professionisti a capire il lavoro e a rispondere in modo più pertinente.",
    },
    {
      question: "Il sopralluogo è sempre necessario?",
      answer:
        "Per un rinnovo leggero può bastare una descrizione accurata con foto; per un rifacimento completo il sopralluogo è in genere il passaggio che rende il preventivo affidabile.",
    },
    {
      question: "Quanto tempo richiede ristrutturare un bagno?",
      answer:
        "I tempi cambiano in base alla complessità. Un intervento completo richiede in genere più fasi: demolizione, impianti, sottofondi, posa rivestimenti, sanitari e finiture.",
    },
  ],
};
