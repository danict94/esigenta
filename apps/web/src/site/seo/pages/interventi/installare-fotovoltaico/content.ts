import type { SeoInterventionLanding } from "../types";

export const installareFotovoltaicoLanding: SeoInterventionLanding = {
  slug: "installare-fotovoltaico",
  title: "Installare fotovoltaico",
  h1: "Installare fotovoltaico: confronta professionisti per il tuo impianto solare",
  description:
    "Un impianto fotovoltaico può ridurre i consumi e valorizzare l'abitazione. Valuta sopralluogo, dimensionamento, posa dei pannelli e collegamento dell'impianto con professionisti qualificati.",
  metaTitle: "Installare fotovoltaico: preventivi impianto solare",
  metaDescription:
    "Vuoi installare un impianto fotovoltaico? Scopri cosa valutare e confronta preventivi da professionisti per pannelli solari domestici.",
  funnelSlug: "installare-fotovoltaico",
  domainSlug: "clima-energia",
  image: {
    src: "/assets/images/installazione-fotovoltaico.webp",
    alt: "Installazione di pannelli fotovoltaici su abitazione",
  },
  geoSection: {
    title: "Trova installatori fotovoltaico nella tua zona",
    summary:
      "Indica dove vuoi realizzare l'intervento e confronta professionisti attivi nella tua area.",
  },
  relatedInterventionSlugs: [
    "impianto-elettrico-nuovo",
    "installare-climatizzatore",
    "rifare-tetto",
    "riparare-quadro-elettrico",
  ],
  professionalCategorySlugs: ["impiantista", "elettricista"],
  costSlug: "fotovoltaico",
  requestItems: [
    "installazione pannelli fotovoltaici",
    "dimensionamento impianto solare",
    "sopralluogo tecnico su tetto o copertura",
    "collegamento e configurazione dell'impianto",
  ],
  costSection: {
    title: "Quanto costa installare il fotovoltaico?",
    summary:
      "Il costo dipende dalla potenza dell'impianto, dal tipo di pannelli, dalla complessità della copertura, dall'eventuale accumulo e dagli adeguamenti elettrici necessari.",
    priceRange: "indicativamente da 5.000 € a 18.000 €",
    factors: [
      "potenza richiesta e consumi dell'abitazione",
      "numero e qualità dei pannelli",
      "accessibilità e stato della copertura",
      "presenza di batterie di accumulo",
    ],
    examples: [
      "impianto domestico senza accumulo",
      "impianto con batteria",
      "installazione su tetto da verificare",
    ],
  },
  faq: [
    {
      question: "Serve un sopralluogo per il fotovoltaico?",
      answer:
        "Di solito sì, perché orientamento, ombre, spazio disponibile e stato della copertura incidono sul dimensionamento e sul preventivo.",
    },
    {
      question: "Il fotovoltaico richiede modifiche all'impianto elettrico?",
      answer:
        "Può richiederle. Un tecnico verifica quadro, linee e protezioni per capire se servono adeguamenti prima dell'installazione.",
    },
  ],
};
