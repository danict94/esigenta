import type { CostGuideBaseContent } from "../types";

// Intervention sorgente: publicationStatus "draft" (packages/taxonomy/...
// project-groups/facciate-e-balconi.ts). Questa guida è registrata e
// compilabile ma NON deve diventare pubblica finché quello stato resta
// "draft" — il gate (static-params.ts + resolve-seo-page.ts + cost-hub.ts +
// sitemap.ts, tutti frozen-only) la esclude automaticamente da
// generateStaticParams, hub /costi, sitemap e da qualunque lookup pubblico.
// Non toccare publicationStatus da qui: è un campo della SSOT taxonomy, non
// di questo file.
//
// Nessuna heroImage: stesso motivo della landing intervento collegata
// (nessun asset reale per un terrazzo) — heroImage è opzionale in
// CostGuideBaseContent proprio per questo caso. Va aggiunta una foto reale
// prima di qualunque pubblicazione.
export const impermeabilizzareTerrazzoBase: CostGuideBaseContent = {
  slug: "impermeabilizzare-terrazzo",
  funnelSlug: "impermeabilizzare-terrazzo",
  interventionSeoSlug: "impermeabilizzare-terrazzo",
  title: "Costi impermeabilizzazione terrazzo",
  h1: "Quanto costa impermeabilizzare un terrazzo?",
  metaTitle: "Costo impermeabilizzazione terrazzo: prezzi al mq",
  // Data reale dell'ultima revisione editoriale sostanziale (commit 30c4090,
  // creazione della guida), non del deploy: vedi engine/editorial-date.ts.
  lastModified: "2026-08-08",
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
    "Impermeabilizzare un terrazzo ha un costo molto diverso a seconda che si tratti di una riparazione localizzata, di un'impermeabilizzazione standard della superficie o di un sistema più complesso su un supporto deteriorato. Questa guida non copre il rifacimento completo del terrazzo (demolizione, nuovo massetto, nuova pavimentazione): per quel tipo di lavoro serve una valutazione più ampia.",
  factors: [
    "superficie del terrazzo da trattare",
    "stato della pavimentazione esistente",
    "stato del supporto sottostante",
    "necessità di demolire parte della pavimentazione",
    "sistema impermeabilizzante scelto",
    "preparazione e regolarizzazione della superficie",
    "numero di scarichi e bocchettoni da trattare",
    "soglie e raccordi perimetrali",
    "pendenze e presenza di ristagni",
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
  nationalRangeNote:
    "Indicativamente 30–70 € al mq per un'impermeabilizzazione professionale standard, su un supporto in condizioni ragionevoli e senza rifacimento completo di massetto e pavimentazione. Riparazioni localizzate hanno un costo minimo indipendente dai mq, mentre un supporto molto deteriorato o un sistema più complesso possono superare questa fascia.",
  priceTableIntro:
    "La tabella distingue tre scenari: riparazione o impermeabilizzazione localizzata, impermeabilizzazione standard della superficie (la fascia orientativa 30–70 €/mq) e sistema complesso o ad alte prestazioni.",
  priceTableNote:
    "Le fasce sono elaborazioni orientative: i prezzari pubblici quotano singoli sistemi e lavorazioni di impermeabilizzazione, non un pacchetto standard unico per un terrazzo; preparazione del supporto, eventuali demolizioni, massetto e nuova pavimentazione possono restare esclusi dalle singole voci.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie del terrazzo moltiplicata per la fascia 30–70 €/mq — non da un preventivo o da tre rilevazioni di mercato indipendenti. Nei terrazzi piccoli il costo al mq può risultare più alto, perché preparazione, accesso, raccordi, scarichi e i costi minimi di cantiere non diminuiscono proporzionalmente alla superficie. Un supporto molto deteriorato o un sistema più complesso possono superare questa fascia.",
};
