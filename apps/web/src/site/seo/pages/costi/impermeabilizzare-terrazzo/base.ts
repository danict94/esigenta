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
  // Ultima revisione editoriale sostanziale, non del deploy: vedi
  // engine/editorial-date.ts. Revisione 2026-08: la guida passa da una
  // riga quotata "pacchetto misto" a 8 sistemi di impermeabilizzazione
  // paralleli + riparazione mirata + lavorazioni accessorie (vedi il
  // commento di revisione su "costGuide:impermeabilizzare-terrazzo" in
  // market-data/pricing/guides/impermeabilizzare-terrazzo.ts per il dettaglio completo).
  lastModified: "2026-09-18",
  editorial: {
    datePublished: "2026-08-08",
  },
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
    "Per impermeabilizzare un terrazzo considera indicativamente 30–70 €/m² come fascia di riferimento per un intervento ordinario, materiale e posa compresi. Il costo cambia soprattutto in base al sistema scelto, alle condizioni del supporto e alla possibilità di intervenire sopra o sotto la pavimentazione esistente; soluzioni calpestabili a vista o sistemi specialistici possono costare di più. Il rifacimento completo del terrazzo, con demolizione, nuovo massetto e nuova pavimentazione, è un intervento diverso e non rientra in questa fascia.",
  extrasPresentation: {
    title: "Cosa può far aumentare il prezzo",
    intro: "Alcune lavorazioni possono aggiungersi al sistema impermeabilizzante quando le condizioni del terrazzo richiedono demolizioni, ripristini del fondo o correzioni delle pendenze.",
  },
  breakdownIntro:
    "Le voci qui sotto descrivono sistemi alternativi di impermeabilizzazione e lavorazioni accessorie. I diversi sistemi non vanno sommati tra loro: il preventivo deve indicare quale soluzione viene utilizzata e quali eventuali lavorazioni aggiuntive sono necessarie.",
  hideBreakdownSourceNote: true,
  sizeExamplesTable: {
    title: "Esempi di costo per metratura",
    intro: "Stime ottenute applicando la fascia di riferimento 30–70 €/m² per un intervento ordinario di impermeabilizzazione.",
    notes: ["Sono stime aritmetiche basate sulla fascia 30–70 €/m², non rilevazioni indipendenti per ciascuna metratura. Sistemi calpestabili, membrane specialistiche, demolizioni, ripristini del massetto o correzioni delle pendenze possono modificare il totale; nei terrazzi piccoli il costo al m² può inoltre risultare più alto per i costi minimi di cantiere."],
    surfaceLabel: "Superficie",
    sizeUnit: "m²",
  },
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
    "eventuale nuova pavimentazione da posare in seguito",
  ],
  locationFactors: [
    "accesso al cantiere",
    "piano dell'immobile e disponibilità dell'ascensore",
    "parcheggio e carico/scarico dei materiali",
    "regole condominiali sugli orari di cantiere",
    "trasporto dei materiali fino al cantiere",
    "smaltimento delle macerie",
    "disponibilità dei professionisti nella zona",
  ],
  savingTips: [
    "Chiedi sempre se il preventivo prevede una riparazione localizzata o un'impermeabilizzazione dell'intera superficie: sono lavori diversi, con prezzi diversi.",
    "Segnala fin da subito se il terrazzo è pavimentato, con guaina a vista o a superficie grezza.",
    "Indica dove si manifesta l'infiltrazione e se ci sono ristagni d'acqua.",
    "Allega fotografie del terrazzo e dei danni visibili, anche dall'interno.",
    "Chiedi esplicitamente se il sistema proposto è compatibile con la pavimentazione esistente o richiede di rimuoverla.",
    "Se il preventivo supera nettamente la fascia orientativa, chiedi quali lavorazioni aggiuntive lo giustificano.",
  ],
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  // Micro-fix 2026-08 (verifica esplicita): non più "fascia media tra i
  // sistemi" — non è stata calcolata alcuna media statistica degli 8
  // sistemi, è la fascia orientativa di un'impermeabilizzazione STANDARD.
};
