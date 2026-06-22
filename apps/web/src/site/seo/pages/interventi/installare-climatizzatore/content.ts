import type { SeoInterventionLanding } from "../types";

export const installareClimatizzatoreLanding: SeoInterventionLanding = {
  slug: "installare-climatizzatore",
  title: "Installare climatizzatore",
  h1: "Installare climatizzatore: trova tecnici per casa e ufficio",
  description:
    "Installare un climatizzatore richiede scelta della macchina, posizionamento delle unità, collegamenti e verifica dell'impianto. Confronta tecnici qualificati per climatizzazione domestica o ufficio.",
  metaTitle: "Installare climatizzatore: preventivi tecnici qualificati",
  metaDescription:
    "Devi installare o sostituire un climatizzatore? Scopri cosa valutare e richiedi preventivi da tecnici qualificati nella tua zona.",
  funnelSlug: "installare-climatizzatore",
  image: {
    src: "/assets/images/climatizzazione.webp",
    alt: "Installazione climatizzatore in abitazione",
  },
  geoSection: {
    title: "Trova tecnici per climatizzatori nella tua zona",
    summary:
      "Indica dove installare il climatizzatore e confronta preventivi da professionisti attivi nella tua area.",
  },
  relatedInterventionSlugs: [
    "installare-fotovoltaico",
    "rifare-impianto-elettrico",
    "riparare-quadro-elettrico",
  ],
  professionalCategorySlugs: ["tecnico-climatizzazione", "elettricista"],
  costSlug: "installare-climatizzatore",
  requestItems: [
    "installazione nuovo climatizzatore",
    "sostituzione unità esistente",
    "posa unità interna ed esterna",
    "verifica collegamenti elettrici e scarico condensa",
  ],
  costSection: {
    title: "Quanto costa installare un climatizzatore?",
    summary:
      "Il costo dipende da numero di split, potenza, predisposizione esistente, distanza tra unità interna ed esterna e complessità dei collegamenti.",
    priceRange: "indicativamente da 700 € a 2.500 €",
    factors: [
      "numero di unità interne",
      "potenza e modello del climatizzatore",
      "predisposizione già presente o da creare",
      "distanza tra unità interna ed esterna",
    ],
    examples: [
      "installazione monosplit",
      "sostituzione climatizzatore esistente",
      "impianto multisplit per più stanze",
    ],
  },
  faq: [
    {
      question: "Serve predisposizione per installare un climatizzatore?",
      answer:
        "Non è sempre necessaria, ma se manca vanno valutati passaggi tubazioni, scarico condensa, alimentazione e posizione dell'unità esterna.",
    },
    {
      question: "Posso sostituire solo il vecchio climatizzatore?",
      answer:
        "Sì, se tubazioni, staffe, scarichi e collegamenti sono compatibili e in buono stato. Il tecnico può verificare cosa riutilizzare.",
    },
  ],
};
