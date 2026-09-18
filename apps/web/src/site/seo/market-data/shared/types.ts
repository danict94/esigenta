/**
 * UNICA fonte numerica dei prezzi (nessun numero nei content). Le righe con
 * un range in euro devono avere confidence "alta" (più fonti coerenti) o
 * "media" (fonti coerenti ma range ampio): mai inserire un numero da una
 * fonte sola o divergente — quelle voci restano qualitative, con una nota
 * che spieghi perché serve il sopralluogo. sourceLabel/sourceYear
 * documentano la base dati mostrata in pagina.
 */
export type PriceRowConfidence = "alta" | "media";


/**
 * Identificatore stabile di una PriceRow (Scope 1C, audit Scope 1A/1B su
 * /costi/ristrutturare-bagno). Kebab-case, namespace-izzato per famiglia
 * (es. "bagno-punto-acqua-completo", "elettrico-punto-presa-incassato-10a")
 * ma univoco sull'INTERA SSOT, non solo dentro la propria famiglia — vedi
 * validatePriceRowIntegrity più sotto, che lo impone a livello globale.
 * Assegnato una volta e mai più cambiato: è la chiave con cui `relations`
 * riferisce un'altra riga (sempre della stessa famiglia). Deliberatamente
 * NON deriva da `label` né lo sostituisce: `label` resta testo editoriale
 * libero di essere riscritto senza rompere alcun riferimento — motivo per
 * cui l'audit Scope 1B ha scartato sia `label` sia `technicalCode` (sparso,
 * presente solo sulle righe con un codice di capitolato ufficiale) come
 * identificatore.
 */
export type PriceRowId = string;

/**
 * Cosa comprende economicamente il prezzo.
 * - "complete": prezzo della lavorazione comprensivo delle componenti
 *   necessarie previste dal suo perimetro.
 * - "work": prestazione o servizio senza la fornitura del prodotto finale.
 * - "supply": sola fornitura o componente, posa esclusa.
 */
export type PriceRowCostType = "complete" | "work" | "supply";

/**
 * Ruolo della voce rispetto al preventivo (asse "Ruolo", Scope 1B).
 * - "primary": prezzo autonomo/principale — default logico quando il campo
 *   è assente, non va impostato esplicitamente solo per dichiararlo.
 * - "scenario": stesso tipo di lavoro (es. una ristrutturazione completa) ma
 *   con un'estensione/configurazione diversa da "primary" — non lo stesso
 *   lavoro calcolato con un metodo di prezzo diverso (quello è
 *   "alternative"), ma un intervento a sé con perimetro proprio, dello
 *   stesso genere del pacchetto principale. Aggiunto in Scope 2B.4 per non
 *   sovraccaricare "alternative" con due significati diversi (vedi sotto).
 * - "extra": costo che si aggiunge solo quando una condizione si verifica.
 *   Se la riga dichiara `relations`, almeno una deve essere "addsTo" (vedi
 *   validatePriceRowIntegrity).
 * - "alternative": modo alternativo di CALCOLARE/rappresentare lo STESSO
 *   lavoro di un'altra riga (es. impianto idraulico a corpo vs punto acqua)
 *   — non va mai sommata a quella riga. Non usarlo per scenari di ampiezza
 *   diversa dello stesso tipo di intervento: quello è "scenario".
 * - "reference": valore informativo/di confronto, mai una voce sommabile in
 *   un totale.
 * Opzionale in questo Scope, stesso motivo di PriceRowCostType.
 */
export type PriceRowRole = "primary" | "scenario" | "extra" | "alternative" | "reference";

/**
 * Stato del prezzo (asse separato da `role`, Scope 1B): una voce può essere
 * primaria/extra/alternativa/di riferimento indipendentemente dal fatto che
 * abbia o meno un numero affidabile da mostrare. NON sostituisce, in questo
 * Scope, il riconoscimento attuale delle righe qualitative (categoria "Da
 * valutare con il professionista", oggi risolto dal template via string-match
 * su `category` — vedi cost-page-template.tsx): il campo viene introdotto ma
 * nessuna riga legacy viene migrata qui né per string-match automatico.
 * - "priced": la riga ha un prezzo affidabile mostrabile — default logico
 *   quando il campo è assente.
 * - "quoteRequired": la riga richiede valutazione/sopralluogo, nessun
 *   prezzo affidabile disponibile.
 */
export type PriceRowPriceStatus = "priced" | "quoteRequired";

/**
 * Tipo di relazione strutturata fra due PriceRow della stessa famiglia (asse
 * "Relazione", Scope 1B). Tutte direzionali A -> B ECCETTO "alternativeTo",
 * che il sistema interpreta come simmetrica per costruzione: dichiarare
 * `{ type: "alternativeTo", target: B }` su A basta, NON serve duplicare
 * anche `{ type: "alternativeTo", target: A }` su B — vedi isAlternativeTo
 * più sotto, l'unico modo corretto per interrogare la relazione (mai
 * assumere che l'assenza della dichiarazione inversa significhi "non
 * alternative").
 * - "includedIn": questa riga ha un proprio prezzo autonomo ma è già
 *   compresa nel target quando si considera quel pacchetto — non implica da
 *   sola che la riga vada nascosta o riclassificata, solo che sommarla al
 *   target rischia un doppio conteggio.
 * - "alternativeTo": stesso lavoro, modo alternativo di calcolarlo/
 *   rappresentarlo rispetto al target — non sommabile al target.
 * - "addsTo": questa riga è un extra che può aggiungersi al target quando
 *   applicabile (condizione descritta in prosa da `note`/`plainExplanation`,
 *   non ancora modellata come dato strutturato in questo Scope).
 */
export type PriceRowRelationType = "includedIn" | "alternativeTo" | "addsTo";

export type PriceRowRelation = {
  type: PriceRowRelationType;
  /** Id di un'altra PriceRow, sempre della stessa famiglia — vedi validatePriceRowIntegrity. */
  target: PriceRowId;
};

export type PriceRow = {
  /**
   * Identificatore stabile — vedi PriceRowId. Obbligatorio da Scope 1C in
   * poi per ogni riga (migrazione meccanica di identità, non semantica: non
   * implica alcuna riclassificazione dei campi esistenti).
   */
  id: PriceRowId;
  label: string;
  /**
   * Raggruppamento della tabella prezzi (es. "Impianti", "Posa e finiture").
   * Obbligatorio: ogni nuova riga deve dichiarare a quale sezione appartiene,
   * l'ordine delle righe nell'array determina l'ordine dei gruppi in tabella.
   */
  category: string;
  /** Unità/criterio: "a corpo", "al mq", "a punto acqua", "a elemento"... */
  unit?: string;
  /**
   * Traduzione editoriale di `unit` in linguaggio cliente (es. "per punto"
   * per "cadauno", "per circuito" per una dorsale). Mostrata ACCANTO a
   * `unit`, mai al suo posto: l'unità ufficiale resta sempre visibile.
   * Opzionale — le righe che non la impostano mostrano solo `unit`, come
   * sempre.
   */
  unitLabel?: string;
  range: string;
  note: string;
  /** Cosa il range di solito comprende — solo se le fonti lo permettono. */
  includes?: string;
  /** Cosa di solito resta fuori — solo se le fonti lo permettono. */
  excludes?: string;
  /** Presente solo sulle righe con numeri; le righe qualitative non ce l'hanno. */
  confidence?: PriceRowConfidence;
  /**
   * Cosa comprende economicamente il prezzo — vedi PriceRowCostType.
   */
  costType?: PriceRowCostType;
  /**
   * Ruolo della voce nel preventivo — vedi PriceRowRole. Opzionale, assente
   * = "primary" (le righe primarie non devono impostarlo esplicitamente).
   */
  role?: PriceRowRole;
  /**
   * Stato del prezzo — vedi PriceRowPriceStatus. Opzionale, assente =
   * "priced". Nessuna migrazione automatica delle righe qualitative
   * esistenti in questo Scope.
   */
  priceStatus?: PriceRowPriceStatus;
  /**
   * Relazioni strutturate con altre righe della stessa famiglia — vedi
   * PriceRowRelation. Opzionale: assente o vuoto = nessuna relazione
   * dichiarata, stesso comportamento di sempre.
   */
  relations?: PriceRowRelation[];
  /**
   * Nome comprensibile per un lettore senza competenze tecniche, mostrato
   * come titolo della riga al posto di `label` quando presente. `label`
   * resta la denominazione tecnica ufficiale e torna visibile in una riga
   * secondaria quando differisce da `simpleLabel`. Opzionale e generico:
   * nessun effetto sulle righe che non lo impostano.
   */
  simpleLabel?: string;
  /**
   * Spiegazione pratica di una o due frasi (cosa comprende/non comprende in
   * linguaggio corrente), mostrata sotto il nome cliente. Non sostituisce
   * `note`, che resta il dettaglio tecnico/fonte. Opzionale.
   */
  plainExplanation?: string;
  /**
   * Codice di capitolato isolato come dato strutturato invece che annegato
   * nel testo libero di `note`. Mostrato come dettaglio secondario, mai come
   * titolo. Assente quando il codice non è attribuibile con certezza dalla
   * fonte — mai un codice inventato.
   */
  technicalCode?: string;
  /**
   * Nota mostrata una sola volta sopra le righe della categoria a cui questa
   * riga appartiene (es. per chiarire che varianti di una stessa linea non
   * sono fasce di prezzo alternative). Basta impostarla su una riga della
   * categoria: il template la mostra una volta sola, alla prima apparizione
   * della categoria. Opzionale, generica, riutilizzabile da qualunque guida.
   */
  categoryNote?: string;
};

export type SizeExample = {
  label: string;
  range: string;
  note: string;
  /** Solo dove abbiamo un riferimento reale (oggi solo ristrutturare-bagno). */
  sizeRange?: string;
};

/**
 * Provenienza dei numeri della guida, esplicita e indipendente da
 * PriceRowConfidence: confidence descrive quanto è solida UNA riga
 * editoriale ("alta"/"media", multi-fonte), sourceType descrive cosa SONO i
 * numeri della guida nel suo complesso.
 * - "official": ogni riga è un prezzo ufficiale puntuale copiato da un
 *   prezzario regionale (impermeabilizzare-tetto, rifare-impianto-elettrico)
 *   — nessuna riga ha confidence, per costruzione.
 * - "mixed": fascia editoriale elaborata confrontando prezzari ufficiali con
 *   il mercato nazionale (rifare-tetto, ristrutturare-bagno,
 *   impermeabilizzare-terrazzo) — le righe quotabili hanno confidence.
 * Il Cost Hub deriva il badge SOLO da questo campo (mai da confidence, mai
 * da sourceLabel): vedi templates/cost-hub-template.tsx.
 */
export type CostGuideSourceType = "official" | "mixed";

export type BasePriceRange = {
  nationalRange: string;
  pricePerSquareMeter: string;
  priceRows: readonly PriceRow[];
  sizeExamples: readonly SizeExample[];
  /** Es. "Dati indicativi elaborati da più fonti di settore". */
  sourceLabel?: string;
  /** Es. "2024–2026". */
  sourceYear?: string;
  /** Obbligatorio: ogni famiglia con prezzi reali dichiara esplicitamente la propria provenienza. */
  sourceType: CostGuideSourceType;
};
