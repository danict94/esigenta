import type { CostGuideBaseContent } from "../types";

export const rifareTettoBase: CostGuideBaseContent = {
  slug: "rifare-tetto",
  funnelSlug: "rifare-tetto",
  interventionSeoSlug: "rifare-tetto",
  title: "Costi rifacimento tetto",
  h1: "Quanto costa rifare un tetto?",
  metaTitle: "Quanto costa rifare un tetto? Prezzi indicativi",
  // Data reale dell'ultima revisione editoriale sostanziale (revisione
  // 2026-08: 4 scenari di rifacimento con fasce concrete + 4 lavorazioni
  // specifiche quotate, sostituiscono la vecchia riga unica 120–300 €/mq e
  // le sei voci "da valutare" — vedi il commento dettagliato sopra
  // "costGuide:rifare-tetto" in market-data/base-price-ranges.ts), non del
  // deploy: vedi engine/editorial-date.ts.
  lastModified: "2026-08-18",
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
  // Revisione 2026-08: 120–180 €/mq è ORA la fascia del solo rifacimento
  // standard (non più "rifare una copertura" in generale), con un rimando
  // esplicito agli altri scenari — coerente con la richiesta che l'Hero
  // chiarisca che isolamento/ventilazione e struttura hanno fasce proprie.
  nationalRangeNote:
    "Indicativamente 120–180 € al mq per un rifacimento standard della copertura, senza interventi importanti sulla struttura. Isolamento termico, tetto ventilato o interventi sulla struttura portante hanno fasce proprie più alte (vedi gli scenari qui sotto): il totale dipende soprattutto dal tipo di intervento, non solo dalla superficie.",
  // priceTableIntro/priceTableNote: campi non più letti da
  // cost-page-template.tsx (sostituito dal nuovo template condiviso, che non
  // ha un'intro dedicata alla tabella prezzi) — restano nel tipo
  // CostGuideBaseContent per le altre guide che potrebbero ancora usarli.
  // Aggiornati comunque per non lasciare un riferimento a "tre scenari" e
  // "120–300 €/mq" ormai sbagliato nel sorgente, anche se oggi non renderizzato.
  priceTableIntro:
    "La tabella distingue quattro scenari di rifacimento — solo manto, standard, con isolamento o ventilazione, con interventi sulla struttura — più le lavorazioni specifiche richiedibili separatamente: isolamento termico, rimozione e smaltimento del vecchio manto, grondaie e ponteggio.",
  priceTableNote:
    "Le fasce sono elaborazioni orientative: i prezzari pubblici quotano le singole lavorazioni e non un pacchetto standard unico per il rifacimento completo del tetto.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo per il rifacimento standard — superficie del tetto moltiplicata per la fascia 120–180 €/mq — non da un preventivo: la superficie del tetto può differire da quella calpestabile dell'abitazione, e pendenza, forma, accessibilità e lavorazioni escluse possono cambiare il totale. La sola sostituzione del manto costa meno, isolamento/ventilazione o interventi sulla struttura costano di più: vedi gli altri scenari nella tabella qui sopra.",
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
