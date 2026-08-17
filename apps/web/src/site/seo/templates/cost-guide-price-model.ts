import { isAlternativeTo, type PriceRow } from "../market-data/base-price-ranges";

/**
 * Scope 4B — logica pura condivisa da tutte le sezioni della Cost Guide che
 * leggono il nuovo modello semantico (role/costType/priceStatus/relations).
 * Nessun componente React qui: solo classificazione e traduzione in
 * linguaggio utente, così ogni sezione (Hero, Scenari, Extra, Breakdown,
 * Reference) usa la STESSA logica invece di reimplementarla e rischiare
 * incoerenze tra una sezione e l'altra.
 *
 * Principio di fallback (Scope 4B, "altre 5 Cost Guide"): SOLO il bagno ha
 * oggi `role`/`costType`/`relations` compilati. Le funzioni qui sotto non
 * inventano mai una classificazione: quando il campo è assente il
 * comportamento converge su quello di sempre (riga di dettaglio normale,
 * nessun badge, nessuna sezione "Scenari/Extra/Reference" per quella guida).
 */

/** Categorie legacy riconosciute come qualitative (nessun prezzo affidabile),
 * stesso criterio già usato da cost-page-template.tsx prima di questo Scope
 * — centralizzato qui per non duplicare la stringa in più componenti. */
const QUALITATIVE_CATEGORIES = new Set<string>([
  "Da valutare con il professionista",
  "Costi aggiuntivi che possono incidere sul preventivo",
]);

/**
 * Vero se la riga non ha un prezzo numerico affidabile da mostrare — via
 * `priceStatus` (Scope 1C+) quando presente, altrimenti via lo stesso
 * riconoscimento per categoria già in uso prima di questo Scope. Non
 * introduce un nuovo comportamento per le guide senza `priceStatus`.
 */
export function isQuoteRequired(row: PriceRow): boolean {
  return row.priceStatus === "quoteRequired" || QUALITATIVE_CATEGORIES.has(row.category);
}

/**
 * `costType` effettivo per la resa in UI: usa il campo nuovo quando esiste,
 * altrimenti lo deriva dal legacy `priceType` con la corrispondenza già
 * documentata nel commento di deprecazione di `priceType` (manodopera→work,
 * fornitura→supply, corpo→complete). Non è una riclassificazione nuova: è
 * la stessa mappa concettuale già scritta in market-data/base-price-ranges.ts,
 * qui solo applicata per non lasciare le 5 guide non ancora auditate senza
 * alcuna etichetta.
 */
export function effectiveCostType(row: PriceRow): "complete" | "work" | "supply" | undefined {
  if (row.costType) return row.costType;
  switch (row.priceType) {
    case "manodopera":
      return "work";
    case "fornitura":
      return "supply";
    case "corpo":
      return "complete";
    default:
      return undefined;
  }
}

export type PriceRowClassification = {
  /** Riga role "primary" candidata a scenario (vedi isGuideScenarioRow): l'ancora dello scenario principale, non una qualunque riga "primary". Assente sulle guide senza `role` compilato. */
  primary: PriceRow | null;
  /** Righe role "scenario", nell'ordine dell'SSOT. */
  scenarios: PriceRow[];
  /** Riga primary + righe scenario, nell'ordine originale dell'SSOT (per la sezione "Quanto può costare"). */
  scenarioCards: PriceRow[];
  /** Righe role "extra". */
  extras: PriceRow[];
  /** Righe role "reference". */
  references: PriceRow[];
  /** Tutto il resto: dettaglio delle singole lavorazioni. Su una guida senza `role`, è l'intero array (comportamento equivalente a prima). */
  breakdown: PriceRow[];
};

/**
 * Identifica una PriceRow candidata alla fascia/scenario complessivo della
 * Cost Guide, distinguendola dalle normali lavorazioni autonome `primary`.
 *
 * NOTA SEMANTICA: `role: "primary"` è il default logico del modello
 * (assente = primary) e viene impostato — legittimamente, non per errore —
 * anche su molte righe che sono lavorazioni autonome a sé stanti e non
 * hanno nulla a che fare con lo scenario complessivo della guida: es.
 * "Impianto idraulico bagno", "Demolizione pavimenti e rivestimenti",
 * "Montaggio sanitari", "Rubinetteria". Sono dati corretti: `role: "primary"`
 * significa "lavorazione principale/autonoma", non "prezzo headline della
 * guida". Questo helper esiste apposta per non confondere le due cose a
 * livello di UI, senza toccare né reinterpretare i dati.
 *
 * Distinzione robusta e generica (nessun riferimento hardcoded al bagno):
 * una riga candidata a scenario è un prezzo "a corpo" per l'INTERO lavoro
 * (`costType: "complete"`, `unit: "a corpo"`) che non è a sua volta
 * `includedIn` un'altra riga — condizione che, in pratica, seleziona
 * correttamente "Ristrutturazione completa"/"Rinnovo leggero"/"Bagno più
 * grande o complesso" (la superano) ed esclude le lavorazioni autonome come
 * "Impianto idraulico bagno" (pur essendo "a corpo"/"complete", dichiara
 * `includedIn` verso la ristrutturazione completa) o "Demolizione pavimenti
 * e rivestimenti" (`costType: "work"`, prezzo al mq). Legge solo campi già
 * esistenti.
 */
function isGuideScenarioRow(row: PriceRow): boolean {
  const hasOutgoingIncludedIn = row.relations?.some((relation) => relation.type === "includedIn") ?? false;
  return row.costType === "complete" && row.unit === "a corpo" && !hasOutgoingIncludedIn;
}

/**
 * Ripartisce le PriceRow di UNA guida nei livelli della nuova UI. Su una
 * guida senza `role` compilato, primary/scenarios/extras/references sono
 * tutti vuoti e `breakdown` contiene semplicemente tutte le righe, nello
 * stesso ordine dell'SSOT: fallback conservativo esplicito (Scope 4B).
 */
export function classifyPriceRows(rows: readonly PriceRow[]): PriceRowClassification {
  const primary = rows.find((row) => row.role === "primary" && isGuideScenarioRow(row)) ?? null;
  const scenarios = rows.filter((row) => row.role === "scenario" && isGuideScenarioRow(row));
  const scenarioCards = rows.filter(
    (row) => (row.role === "primary" || row.role === "scenario") && isGuideScenarioRow(row),
  );
  const extras = rows.filter((row) => row.role === "extra");
  const references = rows.filter((row) => row.role === "reference");

  const promotedIds = new Set<string>([
    ...(primary ? [primary.id] : []),
    ...scenarios.map((row) => row.id),
    ...extras.map((row) => row.id),
    ...references.map((row) => row.id),
  ]);

  const breakdown = rows.filter((row) => !promotedIds.has(row.id));

  return { primary, scenarios, scenarioCards, extras, references, breakdown };
}

export type PriceRowGroup = { category: string; rows: PriceRow[] };

/** Raggruppa preservando l'ordine di prima apparizione di ogni categoria — stessa logica già in uso prima di questo Scope, ora condivisa. */
export function groupPriceRowsByCategory(rows: readonly PriceRow[]): PriceRowGroup[] {
  const groups: PriceRowGroup[] = [];
  const byCategory = new Map<string, PriceRowGroup>();

  for (const row of rows) {
    const existing = byCategory.get(row.category);
    if (existing) {
      existing.rows.push(row);
    } else {
      const group: PriceRowGroup = { category: row.category, rows: [row] };
      byCategory.set(row.category, group);
      groups.push(group);
    }
  }

  return groups;
}

/**
 * Divide una lista in prosa separata da virgole in singole voci, senza
 * spezzare una virgola interna a una parentesi — es. "collegamenti elettrici
 * essenziali (collegamento dei punti luce e prese previsti, senza modifiche
 * significative all'impianto esistente)" resta UNA voce, non due. Usata per
 * mostrare `includes`/`excludes` come elenco puntato senza toccare il testo
 * sorgente (nessuna modifica ai dati, solo diversa presentazione).
 */
export function splitCommaList(text: string | undefined): string[] {
  if (!text) return [];

  const items: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);

    if (char === "," && depth === 0) {
      items.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) items.push(current.trim());

  return items.filter(Boolean);
}

const SUMMARY_SOFT_TARGET = 170;
const SUMMARY_HARD_CAP = 260;
const SENTENCE_END = /[.!?]/;
const CLAUSE_END = /:/;

function findBoundaryIndex(text: string, boundary: RegExp, limit: number): number {
  return text.slice(0, limit).search(boundary);
}

/**
 * Sintesi breve di un testo prosa lungo (`plainExplanation`/`note`), per
 * contesti compatti come le card Scenario — MAI un'ellissi CSS (line-clamp)
 * che tronca a metà parola o a metà elenco, sempre un confine di frase reale.
 *
 * 1) Se il testo è già breve, lo ritorna invariato (nessuna modifica quando
 *    non serve).
 * 2) Cerca il primo punto/!/? entro SUMMARY_HARD_CAP caratteri: una frase
 *    intera è sempre la scelta migliore, anche se più lunga del target.
 * 3) Se il testo è UN'unica frase molto lunga senza punteggiatura forte in
 *    quell'intervallo (es. costruita con incisi tra parentesi e due punti),
 *    usa il primo ":" entro lo stesso limite, chiudendolo con un punto: una
 *    clausola introduttiva chiusa resta comunque un pensiero compiuto,
 *    meglio di un taglio a metà elenco.
 * 4) Solo come ultima risorsa, se non c'è alcun confine utile, accorcia
 *    all'ultima parola intera entro SUMMARY_SOFT_TARGET e aggiunge "…" — mai
 *    a metà parola.
 */
export function shortSummary(text: string | undefined): string | undefined {
  if (!text) return undefined;
  if (text.length <= SUMMARY_SOFT_TARGET) return text;

  const sentenceIndex = findBoundaryIndex(text, SENTENCE_END, SUMMARY_HARD_CAP);
  if (sentenceIndex !== -1) return text.slice(0, sentenceIndex + 1).trim();

  const clauseIndex = findBoundaryIndex(text, CLAUSE_END, SUMMARY_HARD_CAP);
  if (clauseIndex !== -1) return `${text.slice(0, clauseIndex).trim()}.`;

  const truncated = text.slice(0, SUMMARY_SOFT_TARGET);
  const lastSpace = truncated.lastIndexOf(" ");
  const safe = (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim();
  return `${safe}…`;
}

export type VisibleAndRestItems = {
  /** Prime voci, da mostrare come elenco puntato pieno. */
  visible: string[];
  /** Voci restanti — nessun dato perso, solo peso visivo minore (mai un accordion). */
  rest: string[];
};

/**
 * Divide un elenco già pronto (es. l'output di `splitCommaList`) in una
 * parte "in vista" e un resto — usata per non mostrare capitolati interi
 * come muro di elenco puntato: le prime voci restano scannabili, le
 * restanti si leggono comunque per intero, solo in un formato più leggero
 * (frase compatta, non bullet list). Nessun contenuto nascosto/troncato: sia
 * `visible` che `rest` insieme ricostruiscono l'intero elenco originale.
 */
export function splitVisibleAndRest(items: readonly string[], limit: number): VisibleAndRestItems {
  return { visible: items.slice(0, limit), rest: items.slice(limit) };
}

/**
 * Classe Tailwind per la griglia degli esempi per dimensione — evita
 * composizioni sbilanciate tipo "3 in una riga + 1 da solo sotto" scegliendo
 * il numero di colonne in base al conteggio reale degli esempi, non un
 * valore fisso. Le classi sono scritte per intero (mai interpolate) perché
 * il compilatore Tailwind scansiona solo stringhe statiche nel sorgente.
 */
export function sizeExamplesGridClassName(count: number): string {
  if (count <= 1) return "grid grid-cols-1 gap-4";
  if (count === 2) return "grid grid-cols-1 gap-4 sm:grid-cols-2";
  if (count === 3) return "grid grid-cols-1 gap-4 sm:grid-cols-3";
  return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";
}

function labelOf(row: PriceRow): string {
  return row.simpleLabel ?? row.label;
}

function findRowById(rows: readonly PriceRow[], id: string): PriceRow | undefined {
  return rows.find((row) => row.id === id);
}

/** “X”, “X” o “Y”, “X”, “Y” o “Z” — stesso stile di quoting già usato da describeIncludedIn, così le label citate si distinguono sempre dalla frase attorno. */
function joinLabelsWithOr(names: readonly string[]): string {
  const quoted = names.map((name) => `“${name}”`);
  if (quoted.length === 1) return quoted[0]!;
  return `${quoted.slice(0, -1).join(", ")} o ${quoted[quoted.length - 1]}`;
}

/**
 * Traduce la relation `includedIn` in una frase per l'utente. Ritorna null
 * quando la riga non la dichiara (nessun testo mostrato, nessun fallback
 * inventato).
 */
export function describeIncludedIn(row: PriceRow, allRows: readonly PriceRow[]): string | null {
  const relation = row.relations?.find((entry) => entry.type === "includedIn");
  if (!relation) return null;

  const target = findRowById(allRows, relation.target);
  return target
    ? `Già compreso in “${labelOf(target)}”`
    : "Già compreso in un altro prezzo di questa guida";
}

/**
 * Traduce le relation `addsTo` in una frase per l'utente — mai il nome
 * tecnico della relation, mai un formato "ETICHETTA: elenco" che sembri la
 * lettura diretta del metadato interno. Ritorna null quando la riga non ne
 * dichiara nessuna.
 */
export function describeAddsTo(row: PriceRow, allRows: readonly PriceRow[]): string | null {
  const targets = (row.relations ?? [])
    .filter((entry) => entry.type === "addsTo")
    .map((entry) => findRowById(allRows, entry.target))
    .filter((target): target is PriceRow => Boolean(target));

  if (targets.length === 0) return null;

  return `Si aggiunge al prezzo di ${joinLabelsWithOr(targets.map(labelOf))}.`;
}

/**
 * Righe alternative a `row` in ENTRAMBE le direzioni — `alternativeTo` è
 * simmetrica per costruzione (vedi isAlternativeTo in market-data), quindi
 * anche una riga che non dichiara nulla ma è target di un'altra riga risulta
 * qui. Necessario perché, ad es., "Impianto idraulico bagno" non dichiara
 * alcuna relation ma è comunque alternativa a "Punto acqua semplice/completo".
 */
export function findAlternativePartners(row: PriceRow, allRows: readonly PriceRow[]): PriceRow[] {
  return allRows.filter(
    (other) => other.id !== row.id && isAlternativeTo(allRows, row.id, other.id),
  );
}

const WHOLE_JOB_UNIT = "a corpo";

/**
 * Traduce `alternativeTo` in un consiglio orientato al caso reale, non nella
 * spiegazione di un "metodo di calcolo" — usa `unit` (campo già esistente,
 * nessun dato nuovo) per capire la direzione del confronto: quando la riga è
 * "a corpo" (l'intero lavoro) e le alternative sono a un'unità più piccola
 * (a punto, a elemento, al mq…), il consiglio utile è "per un intervento
 * parziale guarda il prezzo più granulare"; quando è il contrario, è "per un
 * rifacimento completo guarda il prezzo a corpo". Se le unità non permettono
 * questa distinzione, resta una frase neutra ma comunque naturale — mai il
 * lessico interno "alternativeTo"/"modo di calcolare".
 */
export function describeAlternative(row: PriceRow, allRows: readonly PriceRow[]): string | null {
  const partners = findAlternativePartners(row, allRows);
  if (partners.length === 0) return null;

  const joined = joinLabelsWithOr(partners.map(labelOf));
  const rowIsWholeJob = row.unit === WHOLE_JOB_UNIT;
  const rowIsGranular = Boolean(row.unit) && !rowIsWholeJob;
  const partnersAreGranular = partners.every((partner) => Boolean(partner.unit) && partner.unit !== WHOLE_JOB_UNIT);
  const partnersAreWholeJob = partners.every((partner) => partner.unit === WHOLE_JOB_UNIT);

  if (rowIsWholeJob && partnersAreGranular) {
    const partnerUnit = partners[0]?.unit;
    const unitPhrase = partnerUnit ? `il prezzo ${partnerUnit}` : "il prezzo per singola voce";
    return `Per un intervento parziale, confronta anche ${unitPhrase} di ${joined}.`;
  }

  if (rowIsGranular && partnersAreWholeJob) {
    return `Per un rifacimento completo, confronta anche il prezzo a corpo di ${joined}.`;
  }

  return `Confronta anche il prezzo di ${joined} per lo stesso lavoro.`;
}

/**
 * Etichetta breve del "tipo di prezzo" per una riga di dettaglio, in
 * linguaggio cliente — mai i nomi interni "work"/"supply"/"complete". Null
 * per "complete" (o quando non determinabile): è il caso di default, non
 * richiede un'etichetta.
 *
 * Principio (fix UI review): un badge si mostra SOLO quando chiarisce
 * davvero cosa comprende o esclude il prezzo — mai come traduzione
 * automatica di `costType`. `work` copre lavorazioni molto diverse tra loro
 * (demolizione, smaltimento, posa...): "Solo posa" ha senso per una posa,
 * non per una demolizione o uno smaltimento, che non hanno materiali da
 * fornire. Il segnale affidabile è quindi SOLO un `excludes` che nomina
 * esplicitamente fornitura/materiali — in assenza di quel segnale, nessun
 * badge è più corretto di un'etichetta generica potenzialmente fuorviante.
 * `supply` invece significa per costruzione "prezzo di sola fornitura": qui
 * "Solo fornitura" resta un'etichetta sempre vera, con o senza un `excludes`
 * a confermarlo esplicitamente.
 */
export function describeCostTypeBadge(row: PriceRow): string | null {
  const costType = effectiveCostType(row);
  const excludesLower = (row.excludes ?? "").toLowerCase();
  const excludesMaterials = excludesLower.includes("fornitura") || excludesLower.includes("materiali");
  const excludesInstallation = excludesLower.includes("montaggio") || excludesLower.includes("posa");

  if (costType === "work") {
    return excludesMaterials ? "Materiali esclusi" : null;
  }

  if (costType === "supply") {
    return excludesInstallation ? "Montaggio escluso" : "Solo fornitura";
  }

  return null;
}

/** Vero se `nationalRange` è un prezzo reale (contiene "€") e non un disclaimer testuale (es. impermeabilizzare-tetto). Regola generica, non guida-specifica. */
export function hasNumericNationalRange(nationalRange: string | undefined): boolean {
  return Boolean(nationalRange && nationalRange.includes("€"));
}
