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
  lastModified: "2026-08-19",
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
    "Rifare il pavimento costa indicativamente da 60 € a 100 € al mq per un rifacimento standard — rimozione del vecchio pavimento, massetto esistente recuperabile, nuovo gres standard/medio e posa — ma il prezzo dipende soprattutto da quanto lavoro serve sul fondo: una semplice posa sopra il pavimento esistente costa meno (40–75 €/mq), mentre un rifacimento con nuovo massetto, quando il sottofondo non è recuperabile, costa di più (90–140 €/mq). La tabella distingue anche le singole lavorazioni — sola posa, materiale e posa, demolizione, massetto, livellamento, battiscopa — utili se ti serve solo una parte del lavoro o vuoi verificare un preventivo voce per voce.",
  factors: [
    "superficie del pavimento da rifare",
    "stato del pavimento e del massetto esistenti, e possibilità di conservarli",
    "necessità di demolire il solo pavimento o anche il sottofondo",
    "necessità di un nuovo massetto o di un semplice livellamento del fondo",
    "materiale scelto: gres, parquet, laminato o SPC",
    "formato delle piastrelle (standard, rettificato/medio, grande formato, lastre XXL)",
    "schema di posa e complessità dei tagli",
    "necessità di sola posa (materiale già acquistato) o materiale e posa insieme",
    "necessità di adattare porte, portoncini e soglie al nuovo spessore",
    "battiscopa: sola posa o materiale e posa",
    "accessibilità dell'abitazione e del cantiere",
  ],
  savingTips: [
    "Fai verificare lo stato reale del massetto prima di scegliere tra posa sopra il pavimento esistente, rifacimento standard o rifacimento con nuovo massetto: sono lavori diversi, con prezzi diversi.",
    "Chiedi preventivi con voci separate per demolizione, massetto/livellamento, materiale e posa: capisci meglio cosa stai pagando.",
    "Se hai già scelto o acquistato il materiale, chiedi esplicitamente il prezzo di sola posa: è diverso da materiale e posa insieme.",
    "Segnala il formato delle piastrelle scelte (standard, medio, grande formato o XXL): incide sul prezzo della posa più della semplice superficie.",
    "Chiedi se l'adattamento di porte e soglie al nuovo spessore del pavimento è compreso nel preventivo o resta a parte.",
    "Chiedi se il battiscopa è compreso, e se è sola posa o materiale e posa.",
  ],
  nationalRangeLabel: "Fascia orientativa al mq",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  nationalRangeNote:
    "Indicativamente 60–100 € al mq per il rifacimento standard del pavimento: rimozione del vecchio pavimento, gestione ordinaria dello smaltimento, massetto esistente recuperabile, nuovo gres standard/medio e posa. Non è il prezzo della sola posa: una posa sopra il pavimento esistente, senza demolizione, costa indicativamente meno (40–75 €/mq); un rifacimento con nuovo massetto, quando il sottofondo non è recuperabile, costa indicativamente di più (90–140 €/mq). Le tre fasce non vanno sommate: rappresentano ampiezze diverse dello stesso tipo di intervento.",
  priceTableIntro:
    "La tabella distingue tre scenari di ampiezza del lavoro — dalla posa sopra il pavimento esistente al rifacimento con nuovo massetto — dalle singole lavorazioni (posa, materiale e posa, demolizione, massetto, livellamento, battiscopa), utili per capire nel dettaglio cosa contiene un preventivo o per stimare un intervento parziale.",
  priceTableNote:
    "Le fasce sono elaborazioni editoriali Esigenta da confronto di mercato nazionale, non la voce di un singolo prezzario regionale. Le voci di categorie diverse (scenari, posa, materiale e posa, demolizione, massetto, livellamento, battiscopa) non vanno sommate tra loro: sono letture parallele dello stesso lavoro, non prezzi cumulativi. Parquet, laminato e SPC sono alternative di materiale all'interno della stessa categoria (materiale e posa su fondo pronto), non scenari a sé della guida.",
  sizeExamplesIntro:
    "Ogni valore nasce da un calcolo — superficie del pavimento moltiplicata per la fascia 60–100 €/mq del rifacimento standard, nuovo massetto escluso — non da un preventivo reale: sono mq effettivi di pavimento interessato dal lavoro, non necessariamente la superficie catastale dell'abitazione. Una semplice posa sopra il pavimento esistente costa indicativamente meno di questi esempi; un rifacimento con nuovo massetto può costare di più.",
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
    },
    {
      slug: "posare-levigare-o-ripristinare-parquet",
      title: "Posare, levigare o ripristinare il parquet",
      description: "Per la levigatura o il ripristino di un parquet esistente, non una nuova posa.",
    },
    {
      slug: "riparare-pavimento",
      title: "Riparare piastrelle o pavimento rotto",
      description: "Se il problema è localizzato — piastrelle rotte, sollevate o fughe da rifare — non un rifacimento completo.",
    },
  ],
};
