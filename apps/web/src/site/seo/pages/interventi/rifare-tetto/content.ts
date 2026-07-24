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
  costSlug: "rifare-tetto",
  requestItems: [
    "rifacimento completo della copertura",
    "riparazione o sostituzione manto del tetto",
    "isolamento e impermeabilizzazione",
    "grondaie, scossaline e lattoneria",
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
