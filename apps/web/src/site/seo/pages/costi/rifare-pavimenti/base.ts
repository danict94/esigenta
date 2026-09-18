import type { CostGuideBaseContent } from "../types";

// Nuova Cost Guide 2026-08. Nota architetturale (prima guida di questo
// engagement a farlo): `slug` ("rifare-pavimenti", determina l'URL
// /costi/rifare-pavimenti e la chiave SSOT "costGuide:rifare-pavimenti" —
// vedi engine/compose-cost-guide.ts, familyKey deriva da base.slug) è
// DIVERSO da `funnelSlug`/`interventionSeoSlug`, impostati sul vero slug
// della frozen taxonomy: "posare-o-rifare-pavimento-interno" (intervento
// pubblicato, packages/taxonomy/src/frozen/source/project-groups/
// pavimentazioni.ts — "rifare-pavimenti" da solo NON esiste come slug
// taxonomy, "posare-o-rifare-pavimento-interno" è l'unico intervento reale
// per questo argomento). Verificato che l'architettura lo supporta
// correttamente: getCostGuideStaticParams() (engine/static-params.ts) usa
// `guide.slug` per l'URL e SOLO `guide.interventionSeoSlug` per il gate di
// pubblicazione — i due campi sono per costruzione indipendenti, non
// un'invenzione di questa revisione. funnelSlug DEVE essere lo slug
// taxonomy reale (resolveInterventionForFunnel fa un lookup DB esatto,
// nessuna tolleranza sugli alias): con "rifare-pavimenti" il CTA
// "Richiedi preventivi" risolverebbe a un 404. Nessuna landing
// /interventi/posare-o-rifare-pavimento-interno esiste ancora: il pulsante
// secondario "Scopri come funziona" si nasconde correttamente da solo
// (resolveInterventionHrefForCostGuide ritorna null in modo esplicito,
// verificato leggendo engine/resolve-seo-page.ts), nessun link rotto.
export const rifarePavimentiBase: CostGuideBaseContent = {
  slug: "rifare-pavimenti",
  funnelSlug: "posare-o-rifare-pavimento-interno",
  interventionSeoSlug: "posare-o-rifare-pavimento-interno",
  title: "Costi rifacimento pavimento",
  h1: "Quanto costa rifare il pavimento?",
  metaTitle: "Quanto costa rifare il pavimento? Prezzi al mq",
  lastModified: "2026-09-18",
  editorial: {
    datePublished: "2026-08-25",
  },
  metaDescription:
    "Scopri quanto costa rifare il pavimento: fasce orientative al mq per la posa sopra il pavimento esistente, il rifacimento standard e il rifacimento con nuovo massetto, più i prezzi di gres, parquet, laminato e SPC.",
  hubCategory: { slug: "pavimenti-e-rivestimenti", name: "Pavimenti e rivestimenti" },
  hubOrder: 10,
  hubDescription:
    "Fasce orientative per rifare un pavimento, dalla posa sopra il pavimento esistente al rifacimento completo con nuovo massetto, più i prezzi delle singole lavorazioni.",
  topicLabel: "rifare il pavimento",
  // Intento principale: "quanto costa RIFARE il pavimento", non solo
  // "quanto costa la posa" — la posa resta un sotto-intento importante
  // (coperto dalle righe di sola posa e materiale+posa più sotto), ma non
  // deve diventare la lettura principale della guida: per questo l'Hero è
  // il rifacimento standard (60–100 €/mq, comprende anche rimozione del
  // vecchio pavimento e gestione dello smaltimento), non una riga di sola
  // posa su fondo pronto.
  summary:
    "Per rifare un pavimento in modo standard, considera indicativamente 60–100 €/m², comprendendo rimozione del vecchio pavimento, normale gestione dello smaltimento, fondo esistente recuperabile, nuovo gres standard/medio e posa. Se il pavimento esistente può essere mantenuto e si posa sopra, la fascia può scendere a circa 40–75 €/m²; quando invece è necessario rifare anche il massetto, il costo può salire a circa 90–140 €/m².",
  extrasPresentation: {
    title: "Cosa può far aumentare il prezzo",
    intro: "Alcune lavorazioni possono aggiungersi al rifacimento del pavimento in base alle condizioni del fondo, agli spessori e alle caratteristiche dei materiali scelti.",
  },
  breakdownIntro:
    "Le voci qui sotto servono a distinguere le singole lavorazioni, la sola posa e le soluzioni che comprendono anche il materiale. Le voci già comprese negli scenari sopra non vanno sommate una seconda volta quando fanno parte dello stesso preventivo.",
  hideBreakdownSourceNote: true,
  locationFactors: [
    "accesso al cantiere",
    "piano dell'immobile e disponibilità dell'ascensore",
    "parcheggio e carico/scarico dei materiali",
    "regole condominiali sugli orari di cantiere",
    "trasporto dei materiali fino al cantiere",
    "smaltimento delle macerie",
    "disponibilità dei professionisti nella zona",
  ],
  sizeExamplesTable: {
    title: "Esempi di costo per metratura",
    intro: "Stime calcolate sulla fascia 60–100 €/m² del rifacimento standard, con massetto esistente recuperabile.",
    notes: ["Le stime si riferiscono ai metri quadrati effettivamente interessati dal lavoro, non necessariamente alla superficie catastale dell’abitazione. La posa sopra il pavimento esistente può costare meno; il rifacimento con nuovo massetto può costare di più."],
    surfaceLabel: "Superficie",
    sizeUnit: "m²",
  },
  factors: [
    "superficie interessata",
    "stato di pavimento e massetto esistenti e possibilità di conservare il sottofondo",
    "demolizione del solo pavimento o anche del sottofondo",
    "nuovo massetto oppure semplice livellamento",
    "materiale scelto",
    "formato delle piastrelle",
    "schema di posa e complessità dei tagli",
    "sola posa oppure materiale e posa",
    "adattamento di porte e soglie",
    "battiscopa",
  ],
  savingTips: [
    "Fai verificare lo stato del massetto prima di scegliere il tipo di intervento.",
    "Chiedi un preventivo con demolizione, fondo, materiale e posa indicati separatamente.",
    "Se hai già acquistato il materiale, chiedi esplicitamente il prezzo di sola posa.",
    "Segnala formato delle piastrelle, battiscopa e interventi su porte o soglie prima del preventivo.",
  ],
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  // Interventi specifici spesso confusi con un rifacimento del pavimento:
  // slug reali del gruppo taxonomy "pavimentazioni" (verificati contro
  // project-groups/pavimentazioni.ts, tutti publicationStatus "published"),
  // tenuti distinti perché rispondono a bisogni diversi da questa guida —
  // nessuno ha oggi una landing propria, risolvono al funnel via
  // resolveBestHrefForIntervention finché non ne nascerà una.
  relatedWork: [
    {
      slug: "fare-massetto",
      title: "Realizzare o rifare il massetto",
      description: "Se ti serve solo il massetto, non l'intero rifacimento del pavimento.",
      linkLabel: "Richiedi un preventivo per il massetto",
      ctaOnly: true,
    },
    {
      slug: "posare-levigare-o-ripristinare-parquet",
      title: "Posare, levigare o ripristinare il parquet",
      description: "Per la levigatura o il ripristino di un parquet esistente, non una nuova posa.",
      linkLabel: "Richiedi un preventivo per il parquet",
      ctaOnly: true,
    },
    {
      slug: "riparare-pavimento",
      title: "Riparare piastrelle o pavimento rotto",
      description: "Se il problema è localizzato — piastrelle rotte, sollevate o fughe da rifare — non un rifacimento completo.",
      linkLabel: "Richiedi un preventivo per una riparazione del pavimento",
      ctaOnly: true,
    },
  ],
};
