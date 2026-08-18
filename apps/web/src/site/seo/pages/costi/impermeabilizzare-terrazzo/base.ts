import type { CostGuideBaseContent } from "../types";

// Micro-fix 2026-08 (verifica esplicita): questo commento diceva
// "publicationStatus 'draft'... NON deve diventare pubblica" — non più vero.
// packages/taxonomy/src/frozen/source/project-groups/facciate-e-balconi.ts
// dichiara oggi publicationStatus "published" per l'intervention sorgente
// "impermeabilizzare-terrazzo" (deciso in una fase precedente, non in questa
// revisione): il gate (static-params.ts + resolve-seo-page.ts + cost-hub.ts
// + sitemap.ts, tutti frozen-only) la include già in generateStaticParams,
// hub /costi, sitemap e lookup pubblico — verificato direttamente
// (getCostGuideStaticParams() la restituisce, 6/6 Cost Guide generate). La
// guida è quindi già pubblica: il commento "draft" era testo non aggiornato
// dopo quella decisione. Non toccare publicationStatus da qui: resta un
// campo della SSOT taxonomy, non di questo file.
//
// Nessuna heroImage: stesso motivo della landing intervento collegata
// (nessun asset reale per un terrazzo) — heroImage è opzionale in
// CostGuideBaseContent proprio per questo caso, il template renderizza
// correttamente senza il blocco immagine (verificato via QA visiva). La
// guida è già pubblica senza foto: resta comunque da aggiungere una foto
// reale non appena disponibile, non come precondizione bloccante già
// superata dai fatti.
export const impermeabilizzareTerrazzoBase: CostGuideBaseContent = {
  slug: "impermeabilizzare-terrazzo",
  funnelSlug: "impermeabilizzare-terrazzo",
  interventionSeoSlug: "impermeabilizzare-terrazzo",
  title: "Costi impermeabilizzazione terrazzo",
  h1: "Quanto costa impermeabilizzare un terrazzo?",
  metaTitle: "Costo impermeabilizzazione terrazzo: prezzi al mq",
  // Data reale dell'ultima revisione editoriale sostanziale, non del deploy:
  // vedi engine/editorial-date.ts. Revisione 2026-08: la guida passa da una
  // riga quotata "pacchetto misto" a 8 sistemi di impermeabilizzazione
  // paralleli + riparazione mirata + lavorazioni accessorie (vedi il
  // commento di revisione su "costGuide:impermeabilizzare-terrazzo" in
  // market-data/base-price-ranges.ts per il dettaglio completo).
  lastModified: "2026-08-18",
  metaDescription:
    "Quanto costa impermeabilizzare un terrazzo? Fasce orientative al mq, sistemi disponibili, cosa incide sul prezzo e cosa comprende il preventivo.",
  // Audit 2026-08: hubCategory NON deriva dalla taxonomy (deliberatamente
  // disaccoppiata, vedi CostGuideBaseContent.hubCategory) né dal ProjectGroup
  // "facciate-e-balconi" della landing. L'hub /costi raggruppa già oggi
  // rifare-tetto e impermeabilizzare-tetto sotto "Tetti e facciate": creare
  // qui una nuova macro-sezione "Facciate e balconi" con una sola guida
  // sarebbe incoerente con quell'architettura editoriale già esistente.
  hubCategory: { slug: "tetti-e-facciate", name: "Tetti e facciate" },
  hubOrder: 30,
  hubDescription:
    "Fasce orientative per impermeabilizzare un terrazzo, dalla riparazione localizzata al rifacimento del sistema impermeabilizzante.",
  topicLabel: "impermeabilizzare un terrazzo",
  summary:
    "Impermeabilizzare un terrazzo costa indicativamente da 30 € a 70 € al mq per un intervento standard, ma il prezzo dipende soprattutto dal sistema scelto: un'impermeabilizzazione cementizia da ricoprire con un pavimento, una soluzione trasparente sopra le piastrelle esistenti, un sistema realmente calpestabile a vista o un rivestimento pensato solo per un traffico leggero hanno prezzi e prestazioni molto diverse tra loro. Questa guida non copre il rifacimento completo del terrazzo (demolizione, nuovo massetto, nuova pavimentazione): per quel tipo di lavoro serve una valutazione più ampia.",
  factors: [
    "superficie del terrazzo da trattare",
    "sistema impermeabilizzante scelto (sotto pavimento, sopra le piastrelle esistenti, calpestabile a vista o a traffico leggero)",
    "necessità che la superficie resti calpestabile o venga ricoperta da una nuova pavimentazione",
    "stato della pavimentazione esistente",
    "stato del massetto e del supporto sottostante",
    "necessità di demolire il pavimento esistente",
    "correzione delle pendenze e presenza di ristagni",
    "numero di scarichi e bocchettoni da trattare",
    "soglie e raccordi perimetrali",
    "accessibilità del cantiere",
    "smaltimento dei materiali rimossi",
    "eventuale nuova pavimentazione da posare in seguito",
  ],
  savingTips: [
    "Chiedi sempre se il preventivo prevede una riparazione localizzata o un'impermeabilizzazione dell'intera superficie: sono lavori diversi, con prezzi diversi.",
    "Segnala fin da subito se il terrazzo è pavimentato, con guaina a vista o a superficie grezza.",
    "Indica dove si manifesta l'infiltrazione e se ci sono ristagni d'acqua.",
    "Allega fotografie del terrazzo e dei danni visibili, anche dall'interno.",
    "Chiedi esplicitamente se il sistema proposto è compatibile con la pavimentazione esistente o richiede di rimuoverla.",
    "Se il preventivo supera nettamente la fascia orientativa, chiedi quali lavorazioni aggiuntive lo giustificano.",
  ],
  nationalRangeLabel: "Fascia orientativa al mq",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  // Micro-fix 2026-08 (verifica esplicita): non più "fascia media tra i
  // sistemi" — non è stata calcolata alcuna media statistica degli 8
  // sistemi, è la fascia orientativa di un'impermeabilizzazione STANDARD.
  nationalRangeNote:
    "Indicativamente 30–70 € al mq per una normale impermeabilizzazione professionale del terrazzo — materiale e posa comprese — su una superficie in condizioni ragionevoli, senza rifacimento completo di massetto e pavimentazione. È la fascia orientativa di un intervento standard, non una media statistica tra i sistemi: alcune soluzioni partono più in basso, mentre quelle pensate per restare calpestabili a vista o i sistemi ad alte prestazioni possono costare di più, fino a circa 120 €/mq in questa guida; una riparazione localizzata ha invece un costo minimo indipendente dai mq.",
  priceTableIntro:
    "La tabella distingue gli otto sistemi di impermeabilizzazione disponibili — dalle soluzioni pensate per essere ricoperte da una nuova pavimentazione ai sistemi progettati per restare calpestabili a vista — più la riparazione localizzata di un'infiltrazione e le lavorazioni accessorie (demolizione del pavimento esistente, ripristino del massetto o delle pendenze), che si aggiungono solo quando il tuo caso lo richiede.",
  priceTableNote:
    "Le fasce sono elaborazioni editoriali per committenza privata: i prezzari pubblici quotano singoli sistemi e lavorazioni di impermeabilizzazione, non un pacchetto standard unico per ogni configurazione di terrazzo. Preparazione del supporto, eventuale demolizione della pavimentazione esistente, ripristino del massetto e nuova pavimentazione finale restano voci a parte quando non esplicitamente comprese nella singola riga.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie del terrazzo moltiplicata per la fascia 30–70 €/mq di un'impermeabilizzazione standard — non da un preventivo reale né da tre rilevazioni di mercato indipendenti. Non rappresenta una resina calpestabile, un sistema in poliurea, un rifacimento completo del terrazzo o un altro sistema specialistico tra quelli elencati in tabella: per quei sistemi il costo può essere più alto. Nei terrazzi piccoli il costo al mq può risultare più alto, perché preparazione, accesso, raccordi, scarichi e i costi minimi di cantiere non diminuiscono proporzionalmente alla superficie.",
};
