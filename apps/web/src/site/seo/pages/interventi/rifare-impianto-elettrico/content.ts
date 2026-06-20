import type { SeoInterventionLanding } from "../types";

export const rifareImpiantoElettricoLanding: SeoInterventionLanding = {
  slug: "rifare-impianto-elettrico",
  title: "Rifare impianto elettrico",
  h1: "Rifare impianto elettrico: adegua casa con un elettricista qualificato",
  description:
    "Rifare l'impianto elettrico permette di aumentare sicurezza, affidabilità e conformità dell'abitazione. Descrivi il lavoro e confronta preventivi da elettricisti qualificati.",
  metaTitle: "Rifare impianto elettrico: preventivi elettricista",
  metaDescription:
    "Devi rifare o adeguare l'impianto elettrico? Scopri cosa incide sul costo e richiedi preventivi da elettricisti qualificati.",
  funnelSlug: "impianto-elettrico-nuovo",
  domainSlug: "impianti-elettrici",
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
    "aggiungere-presa-elettrica",
    "montare-lampadario",
    "installare-fotovoltaico",
  ],
  professionalCategorySlugs: ["elettricista"],
  costSlug: "impianto-elettrico",
  requestItems: [
    "nuovo impianto elettrico domestico",
    "adeguamento impianto esistente",
    "sostituzione quadro elettrico",
    "aggiunta prese e punti luce",
  ],
  costSection: {
    title: "Quanto costa rifare un impianto elettrico?",
    summary:
      "Il costo varia in base a dimensioni dell'abitazione, numero di punti luce, quadro elettrico, tracce murarie e livello di finitura richiesto. La verifica sul posto aiuta a definire un preventivo realistico.",
    priceRange: "indicativamente da 2.000 € a 8.000 €",
    factors: [
      "numero di stanze e punti elettrici",
      "presenza di tracce da aprire o richiudere",
      "quadro elettrico e dispositivi di protezione",
      "necessità di certificazioni o adeguamenti",
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
        "Conviene valutarlo se l'impianto è datato, non ha protezioni adeguate, presenta guasti ricorrenti o se stai ristrutturando casa e vuoi predisporre nuovi punti elettrici.",
    },
    {
      question: "Serve un elettricista abilitato?",
      answer:
        "Sì. Gli interventi sull'impianto elettrico devono essere eseguiti da professionisti qualificati, soprattutto quando servono conformità, adeguamenti o nuove linee.",
    },
  ],
};
