import type { CostGuideBaseContent } from "../types";

export const rifareTettoBase: CostGuideBaseContent = {
  slug: "rifare-tetto",
  funnelSlug: "rifare-tetto",
  interventionSeoSlug: "rifare-tetto",
  title: "Costi rifacimento tetto",
  h1: "Quanto costa rifare un tetto?",
  metaTitle: "Quanto costa rifare un tetto? Prezzi indicativi",
  // Ultima revisione editoriale sostanziale: la revisione corrente completa
  // il lavoro 2026-08 su 4 scenari di rifacimento con fasce concrete + 4 lavorazioni
  // specifiche quotate, sostituiscono la vecchia riga unica 120–300 €/mq e
  // le sei voci "da valutare" — vedi il commento dettagliato sopra
  // "costGuide:rifare-tetto" in market-data/pricing/guides/rifare-tetto.ts), non del
  // deploy: vedi engine/editorial-date.ts.
  lastModified: "2026-09-18",
  editorial: {
    datePublished: "2026-06-20",
  },
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
  // Revisione 2026-08 (SEO, dati reali Search Console — query dominanti su
  // "quanto costa/costo rifacimento tetto/prezzo al mq"): prima non arrivava
  // al costo nel testo, solo "dipende da...". Ora apre subito con la fascia
  // standard in €/mq (stessa risposta immediata dell'H1/meta, già coerenti
  // e non toccati) e spiega SUBITO perché due tetti della stessa superficie
  // possono costare cifre molto diverse — il tipo di intervento, non la sola
  // superficie — coerente con i 4 scenari qui sotto. Nessuna keyword forzata:
  // "sostituzione del manto"/"isolamento termico"/"interventi sulla
  // struttura" sono gli stessi termini già usati dagli scenari, non aggiunte.
  summary:
    "Rifare un tetto costa indicativamente da 120 a 180 € al mq per il rifacimento standard, ma il prezzo cambia molto in base al tipo di intervento: dalla sola sostituzione del manto, più economica, al rifacimento con isolamento termico o con interventi sulla struttura, più costoso. Il preventivo dipende anche da superficie, materiali e accessibilità del cantiere.",
  scenarioExclusions: { title: "Nel rifacimento standard non sono compresi", items: ["isolamento termico completo", "tetto ventilato o stratigrafie più evolute", "interventi sulla struttura portante", "grondaie", "ponteggio"] },
  breakdownIntro: "Alcune lavorazioni possono essere già comprese negli scenari indicati sopra: in questi casi non vanno sommate una seconda volta.",
  compactFactors: { title: "Altri fattori che possono incidere sul preventivo", intro: "Oltre al tipo di intervento e alle condizioni della copertura, il preventivo può variare in base alla configurazione del tetto e alla logistica del cantiere." },
  sizeExamplesTable: { title: "Esempi di costo per metratura", intro: "Le stime sono calcolate sulla fascia 120–180 €/mq del rifacimento standard. La superficie del tetto può differire da quella calpestabile dell’abitazione.", notes: ["Le stime derivano da superficie × fascia standard e non rappresentano preventivi indipendenti per ciascuna metratura. Pendenza, forma, accessibilità ed eventuali lavorazioni escluse possono modificare il totale."] },
  factors: [
    "altezza dell’edificio e modalità di accesso alla copertura",
    "presenza di più falde, comignoli, lucernari, abbaini o altri elementi che rendono la posa più articolata",
    "necessità di mezzi di sollevamento per materiali e attrezzature",
    "spazio disponibile per carico, scarico e deposito temporaneo dei materiali",
    "eventuali vincoli condominiali o limitazioni agli orari di lavoro",
    "distanza, trasporto dei materiali e logistica dello smaltimento",
    "disponibilità e costo dei professionisti nella zona",
  ],
  savingTips: [
    "Fai verificare la struttura prima di scegliere tra riparazione e rifacimento completo.",
    "Valuta l’isolamento termico durante il rifacimento: aggiungerlo in un secondo momento può richiedere nuove lavorazioni.",
    "Chiedi preventivi con voci separate per smontaggio, struttura, isolamento e copertura.",
    "Pianifica i lavori in un periodo con condizioni meteo favorevoli, quando possibile.",
    "Confronta più imprese disponibili nella tua zona prima di affidare il lavoro.",
  ],
  // Il modulo Costi della landing /interventi usa una didascalia dedicata
  // perché questa fascia è espressa al mq, non come totale complessivo.
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
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
      linkLabel: "Scopri costi e dettagli",
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
