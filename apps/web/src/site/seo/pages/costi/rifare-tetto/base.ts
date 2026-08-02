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
  // Revisione 2026-08 (audit + ricognizione Git): il "Costo complessivo"
  // fisso non aveva più senso una volta rimosso il totale assoluto
  // 8.000-25.000 € (nessuna fonte esterna tracciabile, nessuna superficie
  // associata). nationalRangeNote spiega in prosa, nel primo box economico,
  // da cosa dipende il totale — cosa che i due soli numeri di Sintesi non
  // comunicano da soli su questa guida.
  nationalRangeLabel: "Fascia orientativa",
  // Micro-rifinitura 2026-08 (problema 2): "RANGE INDICATIVO COMPLESSIVO" nel
  // modulo Costi di /interventi/rifare-tetto è una didascalia pensata per un
  // totale, non per una fascia al mq. nationalRangeLabel resta per il box
  // Sintesi di questa pagina ("Fascia orientativa", accanto al box "Costo al
  // mq" che già disambigua); nel modulo isolato della landing intervento,
  // senza quel secondo box a fianco, la didascalia deve dirlo da sola.
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  nationalRangeNote:
    "Indicativamente 120–300 € al mq per rifare una copertura. Il totale dipende dalla superficie, dalla stratigrafia da ricostruire e dalle lavorazioni incluse. Interventi strutturali, ponteggi complessi, accessibilità difficile e materiali particolari possono portare il costo oltre questa fascia.",
  priceTableIntro:
    "La tabella distingue tre scenari: sostituzione del solo manto, rifacimento senza interventi sulla struttura (la fascia orientativa 120–300 €/mq) e rifacimento con intervento sulla struttura o alta complessità.",
  // Micro-rifinitura 2026-08 (problema 1): non ripete più fonte/anno, già
  // detti da sourceLabel/sourceYear appena sotto la tabella — resta solo il
  // perché una fascia e non un prezzo puntuale unico.
  priceTableNote:
    "Le fasce sono elaborazioni orientative: i prezzari pubblici quotano le singole lavorazioni e non un pacchetto standard unico per il rifacimento completo del tetto.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie del tetto moltiplicata per la fascia 120–300 €/mq — non da un preventivo: la superficie del tetto può differire da quella calpestabile dell'abitazione, e pendenza, forma, accessibilità e lavorazioni escluse possono cambiare il totale. Un intervento sulla struttura può superare questa fascia.",
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
