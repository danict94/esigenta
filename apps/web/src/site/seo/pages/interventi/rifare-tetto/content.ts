import type { SeoInterventionLanding } from "../types";

export const rifareTettoLanding: SeoInterventionLanding = {
  slug: "rifare-tetto",
  title: "Rifare tetto",
  h1: "Rifare tetto: trova imprese qualificate per copertura e lattoneria",
  description:
    "Rifare un tetto può includere rimozione della vecchia copertura, isolamento, posa dei nuovi materiali, grondaie e lattoneria. Confronta imprese qualificate per il tuo intervento.",
  metaTitle: "Rifare tetto: preventivi per copertura casa",
  metaDescription:
    "Devi rifare il tetto? Scopri cosa incide sul costo, quali lavori puoi richiedere e confronta preventivi da imprese qualificate.",
  funnelSlug: "rifare-tetto",
  groupSlug: "tetti",
  requestCtaLabel: "Richiedi preventivi per il tetto",
  image: {
    src: "/assets/images/rifacimento-tetto.webp",
    alt: "Rifacimento tetto e copertura",
  },
  geoSection: {
    title: "Trova imprese per rifare il tetto nella tua zona",
    summary:
      "Descrivi copertura, accessibilità e tipo di intervento per confrontare preventivi da imprese disponibili nella tua area.",
  },
  relatedInterventionSlugs: [
    "riparare-tetto",
    "sistemare-grondaie",
  ],
  professionalCategorySlugs: ["impresa-edile"],
  // Interventi taxonomy reali del gruppo "tetti", verificati contro
  // packages/taxonomy/src/frozen/source/project-groups/tetti.ts — lavori
  // specifici spesso aggiunti a un rifacimento tetto, senza landing propria.
  relatedFunnelWork: [
    "impermeabilizzare-tetto",
    "isolare-o-coibentare-tetto",
    "installare-o-sostituire-lucernario",
  ],
  costSlug: "rifare-tetto",
  requestItems: [
    "rifacimento completo della copertura",
    "riparazione o sostituzione manto del tetto",
    "isolamento e impermeabilizzazione",
    "grondaie, scossaline e lattoneria",
  ],
  scopeIncluded: [
    "rimozione della vecchia copertura",
    "verifica ed eventuale rinforzo della struttura portante",
    "posa del nuovo manto di copertura",
    "impermeabilizzazione e guaina",
    "isolamento termico, se previsto nel capitolato",
    "grondaie, scossaline e lattoneria",
    "sistemazione di comignoli e uscite in copertura",
    "smaltimento dei materiali rimossi, se concordato nel preventivo",
  ],
  scopeExcluded: [
    "materiali di fascia alta oltre quanto concordato",
    "ponteggi, se non inclusi esplicitamente nel preventivo",
    "bonifica di coperture in amianto o eternit, trattata come intervento a parte",
    "eventuali pratiche tecniche o autorizzazioni edilizie, quando necessarie",
    "imprevisti scoperti in corso d'opera, come travi o guaine da sostituire",
  ],
  scopeNote:
    "Ogni impresa compone il preventivo in modo diverso: usa queste liste per chiedere esplicitamente cosa è compreso e cosa no, prima di confrontare i prezzi.",
  variants: [
    {
      title: "Rifacimento parziale",
      summary:
        "Ripristino localizzato di una porzione di copertura, ad esempio una falda o un'area danneggiata. Il perimetro esatto va definito con l'impresa.",
    },
    {
      title: "Rifacimento completo",
      summary:
        "Rimozione della vecchia copertura, verifica della struttura, isolamento e nuovo manto: il caso più frequente quando il tetto è datato o diffusamente danneggiato.",
    },
  ],
  preparationItems: [
    "qualche foto del tetto attuale, anche dall'esterno",
    "superficie indicativa della copertura",
    "tipo di copertura attuale: tegole, coppi, lamiera o altro",
    "eventuali infiltrazioni o danni visibili",
    "se vuoi valutare anche l'isolamento della copertura",
    "accessibilità del tetto ed eventuali ponteggi già presenti",
    "vincoli condominiali o del piano casa, se ci sono",
    "quando vorresti iniziare i lavori",
  ],
  costSection: {
    title: "Quanto costa rifare un tetto?",
    summary:
      "Il prezzo cambia in base a superficie, materiali, isolamento, accessibilità, ponteggi e stato della struttura. Per lavori importanti è essenziale una valutazione tecnica.",
    factors: [
      "superficie della copertura",
      "materiale scelto per il manto",
      "isolamento e impermeabilizzazione",
      "ponteggi e accessibilità del cantiere",
    ],
    examples: [
      "ripristino localizzato del manto",
      "rifacimento completo con isolamento",
      "sostituzione grondaie e lattoneria",
    ],
  },
  faq: [
    {
      question: "Quando è meglio rifare il tetto invece di ripararlo?",
      answer:
        "Quando infiltrazioni, danni diffusi o materiali deteriorati rendono le riparazioni frequenti e poco efficaci. Una verifica tecnica aiuta a scegliere l'intervento corretto.",
    },
    {
      question: "Nel rifacimento del tetto si può migliorare l'isolamento?",
      answer:
        "Sì. Il rifacimento è spesso il momento giusto per valutare isolamento, impermeabilizzazione e ventilazione della copertura.",
    },
  ],
};
