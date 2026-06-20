import type { SeoInterventionLanding } from "../types";

export const cartongessoeFiniture: SeoInterventionLanding = {
  slug: "cartongesso-e-finiture",
  title: "Cartongesso e finiture",
  h1: "Cartongesso e finiture: pareti, controsoffitti e lavori su misura",
  description:
    "I lavori in cartongesso permettono di creare pareti, controsoffitti, velette, nicchie e finiture interne. Trova professionisti qualificati per progettare e realizzare l'intervento.",
  metaTitle: "Cartongesso e finiture: preventivi cartongessista",
  metaDescription:
    "Devi realizzare lavori in cartongesso o finiture interne? Scopri cosa puoi richiedere e confronta preventivi da professionisti qualificati.",
  funnelSlug: "fare-lavori-cartongesso",
  domainSlug: "ristrutturazione",
  image: {
    src: "/assets/images/cartongesso.webp",
    alt: "Lavori in cartongesso e finiture interne",
  },
  geoSection: {
    title: "Trova cartongessisti e professionisti per finiture nella tua zona",
    summary:
      "Descrivi pareti, controsoffitti o finiture da realizzare e confronta professionisti disponibili nella tua area.",
  },
  relatedInterventionSlugs: [
    "fare-parete-cartongesso",
    "abbassare-soffitto",
    "fare-rasatura",
    "tinteggiare-interni",
  ],
  professionalCategorySlugs: ["cartongessista", "imbianchino", "impresa-edile"],
  requestItems: [
    "pareti e contropareti in cartongesso",
    "controsoffitti e velette",
    "nicchie, librerie e pareti attrezzate",
    "rasature, stuccature e finiture",
  ],
  costSection: {
    title: "Quanto costano cartongesso e finiture?",
    summary:
      "Il costo dipende da metri quadri, complessità della struttura, presenza di faretti o impianti, livello di finitura e tinteggiatura finale.",
    priceRange: "indicativamente da 35 € a 90 € al mq",
    factors: [
      "dimensione della struttura",
      "tipo di lavorazione richiesta",
      "integrazione con luci o impianti",
      "rasatura, stuccatura e tinteggiatura",
    ],
    examples: [
      "parete divisoria semplice",
      "controsoffitto con faretti",
      "parete attrezzata su misura",
    ],
  },
  faq: [
    {
      question: "Il cartongesso è adatto anche per dividere una stanza?",
      answer:
        "Sì. Una parete in cartongesso può dividere ambienti, creare nuovi spazi o integrare isolamento e passaggi impiantistici.",
    },
    {
      question: "Le finiture sono incluse nei lavori in cartongesso?",
      answer:
        "Dipende dal preventivo. È utile specificare se servono anche stuccatura, rasatura, tinteggiatura, faretti o altre finiture finali.",
    },
  ],
};
