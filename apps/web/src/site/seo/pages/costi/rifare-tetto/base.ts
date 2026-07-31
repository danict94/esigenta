import type { CostGuideBaseContent } from "../types";

export const rifareTettoBase: CostGuideBaseContent = {
  slug: "rifare-tetto",
  funnelSlug: "rifare-tetto",
  interventionSeoSlug: "rifare-tetto",
  title: "Costi rifacimento tetto",
  h1: "Quanto costa rifare un tetto?",
  metaTitle: "Quanto costa rifare un tetto? Prezzi indicativi",
  metaDescription:
    "Scopri quanto costa rifare un tetto, con range indicativi, costo al mq, esempi e fattori di prezzo per la tua copertura.",
  heroImage: {
    src: "/assets/images/rifacimento-tetto.webp",
    alt: "Rifacimento tetto e copertura",
  },
  hubCategory: { slug: "tetti-e-facciate", name: "Tetti e facciate" },
  hubOrder: 10,
  hubDescription:
    "Guida ai costi delle principali lavorazioni sul tetto, con voci tecniche e fattori che incidono sul preventivo.",
  topicLabel: "rifare un tetto",
  summary:
    "Rifare un tetto significa intervenire su struttura, isolamento, copertura e lattoneria. Il preventivo cambia soprattutto in base a superficie, materiali, stato della struttura e accessibilità del cantiere.",
  factors: [
    "superficie e pendenza della copertura",
    "materiale scelto per il manto (tegole, lamiera, altro)",
    "stato della struttura portante in legno o cemento",
    "necessità di isolamento termico e ventilazione",
    "accessibilità del cantiere e necessità di ponteggi",
    "smaltimento della vecchia copertura, incluse eventuali bonifiche",
  ],
  savingTips: [
    "Fai verificare la struttura prima di scegliere tra riparazione e rifacimento completo.",
    "Valuta l'isolamento termico in fase di rifacimento: farlo dopo costa di più.",
    "Chiedi preventivi con voci separate per smontaggio, struttura, isolamento e copertura.",
    "Pianifica i lavori in un periodo con clima stabile per ridurre rischi e tempi.",
    "Confronta imprese disponibili nella tua zona prima di fissare il sopralluogo.",
  ],
  // Interventi specifici spesso confusi con un rifacimento completo: slug
  // reali del gruppo taxonomy "tetti" (verificati contro
  // project-groups/tetti.ts), nessuno ha oggi una landing o guida propria —
  // risolvono al funnel via resolveBestHrefForIntervention finché non ne
  // nascerà una.
  relatedWork: [
    {
      slug: "impermeabilizzare-tetto",
      title: "Impermeabilizzare il tetto",
      description: "Per guaina e impermeabilizzazione senza rifare tutta la copertura.",
    },
    {
      slug: "isolare-o-coibentare-tetto",
      title: "Isolare o coibentare il tetto",
      description: "Per migliorare l'isolamento termico come lavoro specifico.",
    },
    {
      slug: "sistemare-grondaie",
      title: "Sistemare grondaie e lattoneria",
      description: "Per intervenire su grondaie, pluviali e scossaline.",
    },
    {
      slug: "riparare-tetto",
      title: "Riparare il tetto",
      description: "Per infiltrazioni, tegole rotte e danni localizzati.",
    },
    {
      slug: "bonificare-amianto-eternit-tetto",
      title: "Bonificare amianto o eternit",
      description: "Per rimozione e smaltimento tramite una gestione specifica.",
    },
  ],
};
