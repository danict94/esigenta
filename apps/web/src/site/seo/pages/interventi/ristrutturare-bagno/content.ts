import type { SeoInterventionLanding } from "../types";

export const ristrutturareBagnoLanding: SeoInterventionLanding = {
  slug: "ristrutturare-bagno",
  title: "Ristrutturare bagno",
  h1: "Ristrutturare bagno: trova professionisti qualificati nella tua zona",
  description:
    "Ristrutturare un bagno significa coordinare demolizioni, impianti, sanitari, rivestimenti e finiture. Confronta professionisti adatti al lavoro e ricevi preventivi per il tuo intervento.",
  metaTitle: "Ristrutturare bagno: preventivi da professionisti",
  metaDescription:
    "Devi ristrutturare un bagno? Scopri cosa puoi richiedere, da cosa dipende il costo e confronta preventivi da professionisti qualificati.",
  funnelSlug: "ristrutturare-bagno",
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
  costSection: {
    title: "Quanto costa ristrutturare un bagno?",
    summary:
      "Il costo dipende soprattutto da dimensioni, materiali, demolizioni, spostamento degli impianti e livello delle finiture. Per un preventivo attendibile serve descrivere lo stato attuale e il risultato desiderato.",
    priceRowLabels: [
      "Rinnovo leggero bagno",
      "Ristrutturazione completa",
      "Costo indicativo al mq",
    ],
    factors: [
      "metratura del bagno",
      "qualità di sanitari, rubinetteria e rivestimenti",
      "modifiche a impianto idraulico o scarichi",
      "necessità di demolizioni e smaltimento",
    ],
    examples: [
      "rinnovo leggero con sostituzione sanitari",
      "rifacimento completo con nuove piastrelle",
      "trasformazione vasca in doccia",
    ],
  },
  faq: [
    {
      question: "Serve sempre rifare anche gli impianti?",
      answer:
        "Non sempre. Se gli impianti sono recenti e in buono stato possono bastare sostituzioni mirate, ma in una ristrutturazione completa conviene farli verificare prima di chiudere pareti e rivestimenti.",
    },
    {
      question: "Quanto tempo richiede ristrutturare un bagno?",
      answer:
        "I tempi cambiano in base alla complessità. Un intervento completo richiede in genere più fasi: demolizione, impianti, sottofondi, posa rivestimenti, sanitari e finiture.",
    },
  ],
};
