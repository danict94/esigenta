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
 * Manodopera/fornitura/a corpo: SOLO quando includes/excludes lo rendono
 * inequivocabile (es. excludes "fornitura" → manodopera; excludes
 * "montaggio" → fornitura). Se il pacchetto mescola lavoro e materiali senza
 * un include/excludes che lo separi con certezza, resta "corpo" (pacchetto
 * misto) invece di forzare una scelta. Le righe "Panoramica generale" e le
 * righe qualitative (categoria "Da valutare...") non hanno mai questo campo:
 * sono scenari aggregati o troppo variabili per un singolo tipo.
 */
export type PriceRowType = "manodopera" | "fornitura" | "corpo";

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
 * Cosa comprende economicamente il prezzo (asse "Composizione", Scope 1B).
 * Distinto da `unit`, che descrive COME si quantifica il prezzo ("a corpo",
 * "al mq", "a punto"...), e distinto dal vecchio `priceType` qui sotto, che
 * mescolava i due assi — vedi il commento di deprecazione su `priceType`.
 * - "complete": prezzo della lavorazione comprensivo delle componenti
 *   necessarie previste dal suo perimetro (manodopera+materiali non
 *   scorporati con certezza dalle fonti).
 * - "work": prestazione/servizio senza la fornitura del prodotto finale.
 *   Può comprendere manodopera, posa, demolizione, trasporto, conferimento
 *   e oneri operativi analoghi — NON va letto come "sola manodopera fisica".
 * - "supply": sola fornitura/materiale/componente, posa esclusa.
 * Opzionale in questo Scope: nessuna riga esistente viene riclassificata
 * automaticamente (la migrazione da `priceType` resta un audit successivo,
 * riga per riga, per famiglia).
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
   * @deprecated Transitorio (Scope 1C, audit Scope 1A/1B). Mescola due assi
   * che ora sono separati: "manodopera"/"fornitura" descrivevano la
   * composizione economica (vedi `costType`), "corpo" descriveva invece una
   * modalità di quantificazione già vicina a `unit`. Inoltre "corpo" oggi
   * copre casi semanticamente diversi nella stessa SSOT (un pacchetto
   * completo come "Ristrutturazione completa" E un prezzo a punto come
   * "Punto acqua completo", letto con lo stesso priceType) e NON è
   * migrabile automaticamente a `costType`: richiede audit editoriale riga
   * per riga, in uno Scope successivo. Il campo resta attivo e letto dal
   * template (cost-page-template.tsx): non rimuoverlo né riclassificarlo
   * qui.
   */
  priceType?: PriceRowType;
  /**
   * Cosa comprende economicamente il prezzo — vedi PriceRowCostType.
   * Opzionale: le righe legacy non lo impostano finché non sono riclassificate
   * (nessuna migrazione automatica da `priceType` in questo Scope).
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

/**
 * Esportata (Scope 1C) solo per permettere a validatePriceRowIntegrity di
 * essere richiamata sui dati reali (vedi la chiamata subito dopo questa
 * costante) e per i test di non-regressione dell'SSOT — resta comunque il
 * punto di accesso ai dati grezzi, non aggirare `getBasePriceRange` per il
 * codice applicativo, quella resta l'unica API pubblica pensata per i
 * consumer.
 */
export const basePriceRangesByFamily: Record<string, BasePriceRange> = {
  // Ricerca Fase 5.D (2024–2026): Edilnet, Cronoshare, Bottegadomus,
  // Parmatek, IdeaCasaPlan, EdiliziaService, Idealista, Homedeal, kvstore,
  // Megarestauri. Ogni range numerico è coperto da almeno due fonti coerenti.
  // Fase 5.F: approfondimento su punto acqua e demolizione/smaltimento
  // (PreventivONE, PGCasa) — split delle due voci in sottocasi per evitare
  // range che fondevano unità o casi diversi (es. "solo demolizione" vs
  // "demolizione+smaltimento" espressi entrambi come €/mq).
  // Revisione 2026-08: il precedente "Ristrutturazione completa" unico
  // (3.500-12.000 €, confidence "alta") fondeva scenari molto diversi in un
  // solo numero, senza collegarlo a una metratura. Sostituito da tre scenari
  // espliciti — rinnovo leggero / ristrutturazione completa standard 5-6 mq
  // / ristrutturazione complessa o di fascia alta — con la fascia principale
  // (4.500-8.000 €) riferita chiaramente al bagno standard. Prezzo al mq
  // ristretto a 800-1.200 €/mq (era 800-1.500) e ridotto a riferimento
  // secondario: il costo del bagno non cresce linearmente con i mq, perché
  // sanitari, scarichi e collegamenti pesano quasi allo stesso modo a
  // qualunque metratura (vedi note delle righe sotto). confidence "alta"
  // riservata alle sole voci puntuali con unità e perimetro documentati
  // (punto acqua completo, posa piastrelle): le fasce complessive e gli
  // esempi dimensionali restano "media", elaborazioni multi-fonte.
  "costGuide:ristrutturare-bagno": {
    nationalRange: "da 4.500 € a 8.000 €",
    pricePerSquareMeter: "da 800 € a 1.200 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        // Scope 2B.4: role corretto da "alternative" a "scenario". Rinnovo
        // leggero e ristrutturazione completa NON sono lo stesso lavoro
        // calcolato con un metodo di prezzo diverso (quello è "alternative",
        // riservato a casi come impianto idraulico ↔ punto acqua): sono due
        // scenari di intervento diversi per ampiezza. Rimossa la relation
        // alternativeTo per lo stesso motivo — non era una vera alternativa
        // economica, avrebbe sporcato il significato del modello. "complete"
        // invariato: il pacchetto mescola elementi opzionali senza separare
        // manodopera/fornitura per singola voce (coerente con priceType
        // "corpo").
        id: "bagno-rinnovo-leggero",
        label: "Rinnovo leggero bagno",
        category: "Rinnovo leggero",
        unit: "a corpo",
        range: "da 1.500 € a 4.000 €",
        plainExplanation: "È un intervento senza demolire e rifare tutto il bagno. Può comprendere la sostituzione di alcuni sanitari, della rubinetteria, del mobile o del box doccia, insieme alla posa e a piccoli ripristini: non sono mai tutti compresi insieme, il totale dipende dal numero e dalla qualità degli elementi scelti.",
        note: "Utile quando impianti e struttura sono già in buono stato e serve solo rinnovare l'aspetto o sostituire pochi elementi.",
        includes: "secondo gli elementi scelti nel preventivo: sostituzione di alcuni sanitari, della rubinetteria, nuovo mobile bagno, box doccia standard, tinteggiatura, posa e collegamenti ordinari, piccoli ripristini",
        excludes: "demolizione completa del bagno, nuovo pavimento e nuovi rivestimenti completi, rifacimento dell'impianto idrico, spostamento degli scarichi, doccia a filo pavimento e materiali o arredi di fascia alta",
        confidence: "media",
        priceType: "corpo",
        costType: "complete",
        role: "scenario",
      },
      {
        // Scope 2B.2 (audit Scope 2A): perimetro chiarito senza toccare
        // prezzo/range. (1) "quando previsti dal preventivo" era l'unica
        // clausola condizionale di un elenco altrimenti sempre affermativo,
        // decisione 2 la rende incondizionata (vedi "Smaltimento macerie"
        // qui sopra). (2) "adeguamento ordinario delle tubazioni" riformulato
        // per nominare esplicitamente l'impianto idraulico e allineare il
        // linguaggio a "Impianto idraulico bagno" qui sopra (decisione 3).
        // (3) "sanitari standard" reso esplicito come fornitura+installazione
        // (decisione 6), con "di fascia premium" aggiunto agli esclusi per
        // coerenza con la stessa logica già usata per rubinetteria/piastrelle
        // pregiate.
        // Scope 2B.3: chiude i due blocker lasciati aperti dallo Scope 2B.2.
        // (1) Rubinetteria: la posa/collegamento ordinario della rubinetteria
        // scelta dal cliente rientra nella normale lavorazione (nuovo item
        // negli includes), ma la FORNITURA resta sempre una voce separata,
        // qualunque sia la fascia — "rubinetteria di fascia alta" sostituito
        // con "fornitura della rubinetteria (qualunque fascia)" negli
        // excludes: non è più una questione di fascia economica/alta, è una
        // questione di fornitura vs posa (vedi "Rubinetteria" qui sotto).
        // (2) Elettrico: "collegamenti elettrici essenziali" precisato con
        // un inciso (collegamento di punti/prese previsti, senza modifiche
        // significative) e aggiunto un item esplicito negli excludes per il
        // caso opposto — confine ora certo, vedi "Adeguamento elettrico del
        // bagno" qui sotto.
        id: "bagno-ristrutturazione-completa",
        label: "Ristrutturazione completa",
        category: "Ristrutturazione completa standard (circa 5–6 mq)",
        unit: "a corpo",
        range: "da 4.500 € a 8.000 €",
        note: "Perimetro tipico di una ristrutturazione completa su un bagno di circa 5–6 mq: le voci scelte nel preventivo possono spostare il totale verso l'alto o verso il basso. Demolizione, smaltimento macerie, impianto idraulico, posa piastrelle e montaggio sanitari hanno anche un prezzo autonomo più sotto in tabella: sono già compresi in questo pacchetto e non vanno sommati di nuovo. La fornitura della rubinetteria resta sempre una voce a parte (vedi \"Rubinetteria\" qui sotto); per un adeguamento elettrico più esteso dei soli collegamenti essenziali, vedi \"Adeguamento elettrico del bagno\" qui sotto.",
        includes: "rimozione dei sanitari esistenti, demolizione ordinaria di pavimento e rivestimenti, trasporto e smaltimento ordinari delle macerie, rimozione o ripristino del sottofondo (lo strato sotto le piastrelle che crea una base piana e stabile), impianto idraulico interno ordinario (adeguamento delle linee acqua e degli scarichi del bagno), impermeabilizzazione nelle zone necessarie, nuovo pavimento e rivestimenti di fascia standard con posa, sanitari standard forniti e installati, collegamento e posa ordinaria della rubinetteria fornita a parte, collegamenti elettrici essenziali (collegamento dei punti luce e prese previsti, senza modifiche significative all'impianto esistente), finiture finali",
        excludes: "spostamento importante degli scarichi, modifica della colonna condominiale, tubazioni fuori dal bagno, opere murarie estese, mobile bagno, specchio, illuminazione decorativa, box doccia, fornitura della rubinetteria (qualunque fascia), piastrelle pregiate o di grande formato, nicchie, mobili su misura, doccia a filo pavimento complessa, sanitari sospesi, con telai o di fascia premium, adeguamento elettrico con nuovi punti, nuove linee o interventi sul quadro, modifiche strutturali, pratiche tecniche e problemi emersi dopo la demolizione",
        confidence: "media",
        priceType: "corpo",
        costType: "complete",
        role: "primary",
      },
      {
        // Scope 2B.3: stessa struttura di "Ristrutturazione completa" (unit
        // "a corpo", range reale, non un mero riferimento) applicata a un
        // bagno fuori dallo standard 5–6 mq.
        // Scope 2B.4: role corretto da "alternative" a "scenario" — non è lo
        // stesso lavoro della ristrutturazione completa calcolato con un
        // metodo di prezzo diverso, è la stessa NATURA di intervento
        // (nucleo identico) su un'estensione/configurazione maggiore.
        // "alternative" resta riservato alle vere alternative economiche
        // (impianto idraulico ↔ punto acqua) — relation alternativeTo
        // rimossa per lo stesso motivo. Perimetro proprio scritto qui sotto:
        // stesso nucleo di "Ristrutturazione completa" qui sopra (demolizione
        // → smaltimento → impianto interno → impermeabilizzazione → posa →
        // sanitari standard installati → finiture), scalato per maggiore
        // superficie/complessità; restano fuori gli stessi extra già
        // separati altrove nella tabella (spostamento importante scarichi,
        // rubinetteria, box doccia, materiali premium, adeguamento elettrico
        // esteso, opere strutturali, imprevisti) — così lo Scope 3 confronta
        // lo stesso perimetro della fascia standard, a una scala diversa.
        id: "bagno-ristrutturazione-complessa",
        label: "Bagno più grande o più complesso",
        category: "Ristrutturazione complessa o di fascia alta",
        unit: "a corpo",
        range: "da 8.000 € a 12.000 €",
        note: "Stesso perimetro di lavorazioni della ristrutturazione completa standard qui sopra, applicato a un bagno oltre i 5–6 mq o con una disposizione più articolata (più sanitari, più punti acqua, superficie maggiore): l'incidenza aumenta per la maggiore quantità di pavimento e rivestimenti e per la maggiore complessità della lavorazione, non perché cambi il tipo di intervento.",
        includes: "lo stesso nucleo della ristrutturazione completa standard, su una superficie maggiore o con una disposizione meno semplice: rimozione dei sanitari esistenti, demolizione ordinaria di pavimento e rivestimenti, trasporto e smaltimento ordinari delle macerie, rimozione o ripristino del sottofondo, impianto idraulico interno ordinario, impermeabilizzazione nelle zone necessarie, maggiore quantità di pavimento e rivestimenti di fascia standard con posa, sanitari standard forniti e installati, collegamento e posa ordinaria della rubinetteria fornita a parte, collegamenti elettrici essenziali, finiture finali",
        excludes: "spostamento importante degli scarichi, fornitura della rubinetteria (qualunque fascia), box doccia, piastrelle o materiali di fascia premium, adeguamento elettrico con nuovi punti, nuove linee o interventi sul quadro, opere strutturali e imprevisti rilevanti scoperti dopo la demolizione",
        confidence: "media",
        priceType: "corpo",
        costType: "complete",
        role: "scenario",
      },
      {
        // Scope 2B.3: "oltre 12.000 €, senza un massimo definito" non è un
        // prezzo determinato (né uno scenario a sé, né un extra quantificato
        // da sommare): è una soglia/avviso su cosa fa salire il costo oltre
        // la fascia complessa qui sopra. role "reference" — non un totale
        // alternativo né un extra sommabile. Nessun costType (non descrive
        // la composizione di UNA lavorazione, coerente con "Costo indicativo
        // al mq" qui sotto, stesso trattamento). Nessuna relation aggiunta:
        // la contiguità con la riga precedente è già chiara dalla categoria
        // condivisa, una relation qui sarebbe ridondante.
        id: "bagno-forniture-pregiate-imprevisti",
        label: "Forniture pregiate, modifiche importanti o imprevisti",
        category: "Ristrutturazione complessa o di fascia alta",
        range: "oltre 12.000 €, senza un massimo definito",
        note: "Può comprendere spostamento importante degli scarichi, doccia a filo pavimento complessa, sanitari sospesi con telai incassati, nicchie, piastrelle di grande formato, arredi su misura, materiali di pregio, modifiche distributive, impianti deteriorati da rifare o imprevisti scoperti dopo la demolizione.",
        role: "reference",
      },
      {
        // Scope 2B.3: già "riferimento secondario" per costruzione (vedi
        // category e note) — role "reference" lo rende esplicito nel
        // modello. Nessuna relation alternativeTo preesisteva da correggere.
        // Nessun costType: non descrive la composizione di una singola
        // lavorazione ma una lettura aggregata dell'intero progetto al mq.
        id: "bagno-costo-al-mq",
        label: "Costo indicativo al mq",
        category: "Prezzo al mq (riferimento secondario)",
        unit: "al mq",
        range: "da 800 € a 1.200 € al mq",
        note: "Riferimento secondario, utile solo per confrontare preventivi già ricevuti: in un bagno piccolo il costo al mq può essere più alto, perché sanitari, scarichi e collegamenti pesano quasi allo stesso modo indipendentemente dalla metratura. Il totale non è una semplice moltiplicazione tra superficie e questo valore.",
        includes: "demolizioni, impianti, posa e manodopera con materiali di fascia media",
        confidence: "media",
        role: "reference",
      },
      {
        // Scope 2B.2: demolizione ordinaria di pavimento/rivestimenti è
        // esplicitamente compresa negli includes di "Ristrutturazione
        // completa" qui sotto — includedIn, resta comunque autonoma per
        // lavori parziali e come riferimento al mq.
        // Chiusura Scope 3: range corretto a 20-40 €/mq. La tariffa al mq
        // incorporava anche la rimozione dei vecchi sanitari (un elemento
        // non areale) sotto la stessa tariffa di pavimento/rivestimenti —
        // segnalato dall'audit Scope 3A.1 come rischio di confronto con
        // fonti esterne. La riga copre ora solo pavimenti e rivestimenti:
        // la rimozione dei sanitari resta dov'era già dichiarata, dentro gli
        // includes di "Ristrutturazione completa" ("rimozione dei sanitari
        // esistenti"), non qui — nessuna nuova PriceRow creata. costType,
        // role e relations invariati.
        id: "bagno-demolizione-pavimenti-rivestimenti",
        label: "Demolizione pavimenti e rivestimenti",
        category: "Demolizione e smaltimento",
        unit: "al mq",
        range: "da 20 € a 40 € al mq",
        note: "sola rimozione di pavimenti e rivestimenti, prima del conferimento in discarica (vedi la voce smaltimento qui sotto); la rimozione dei sanitari è compresa nella ristrutturazione completa, non in questa tariffa al mq",
        includes: "rimozione di pavimenti e rivestimenti",
        excludes: "smaltimento delle macerie, demolizione del massetto quando necessaria, rimozione dei sanitari",
        confidence: "media",
        priceType: "manodopera",
        costType: "work",
        role: "primary",
        relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
      },
      {
        // Scope 2B.2: il precedente "quando previsti dal preventivo" negli
        // includes della ristrutturazione completa era l'unica clausola
        // condizionale in un elenco altrimenti sempre affermativo — letta
        // insieme alla nota della demolizione qui sopra ("prima del
        // conferimento in discarica", le due righe già presentate come le
        // due fasi dello stesso processo) risolta come: il trasporto e lo
        // smaltimento ORDINARI sono compresi nella ristrutturazione
        // completa, come la demolizione che li precede. includedIn, resta
        // comunque autonoma per lavori parziali.
        // Chiusura Scope 3: range corretto a 300-600 € per rappresentare la
        // situazione ordinaria (1-2 mc, bagno standard); i fattori che
        // possono farlo salire restano in nota, non nel range. costType,
        // role e relations invariati.
        id: "bagno-smaltimento-macerie",
        label: "Smaltimento macerie",
        category: "Demolizione e smaltimento",
        unit: "a corpo",
        range: "da 300 € a 600 €",
        plainExplanation: "È il trasporto e lo smaltimento autorizzato dei materiali demoliti in un impianto apposito (il conferimento in discarica).",
        note: "la fascia rappresenta la situazione ordinaria: un bagno standard produce circa 1-2 metri cubi di macerie. Il costo può salire con un volume maggiore, un accesso difficoltoso al cantiere, piani alti o logistica complessa e una maggiore distanza dal centro di conferimento",
        confidence: "media",
        priceType: "manodopera",
        costType: "work",
        role: "primary",
        relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
      },
      {
        // Scope 2B.2: "distribuzione acqua e scarichi interni al bagno" con
        // "opere murarie estese e colonne condominiali" escluse è la stessa
        // lavorazione descritta come "impianto idraulico interno ordinario"
        // negli includes della ristrutturazione completa qui sotto (stesso
        // confine ordinario/interno vs esteso/condominiale) — includedIn,
        // resta comunque autonoma per chi rifà solo l'impianto. L'alternativa
        // di calcolo verso le righe "punto acqua" qui sotto resta dichiarata
        // solo lì (relazione simmetrica, vedi isAlternativeTo): nessuna
        // relation ridondante aggiunta qui.
        // Chiusura Scope 3: nota riformulata. La vecchia formulazione ("due
        // modi di leggere lo stesso lavoro, a corpo o punto per punto")
        // poteva far intendere che il prezzo a corpo fosse la somma
        // matematica dei prezzi a punto — l'audit Scope 3A.1 aveva mostrato
        // che non torna nemmeno per un bagno minimo (3 punti completi =
        // 450-840 €, sotto il floor del pacchetto a corpo). Il prezzo a
        // punto resta utile per interventi puntuali; il prezzo a corpo
        // resta il riferimento per il rifacimento completo perché comprende
        // anche la distribuzione complessiva interna, non solo la somma dei
        // singoli punti. Prezzo, perimetro e relations invariati.
        id: "bagno-impianto-idraulico",
        label: "Impianto idraulico bagno",
        category: "Impianti",
        unit: "a corpo",
        range: "da 1.000 € a 2.500 €",
        note: "vale come pacchetto per rifare tutti i punti del bagno insieme, dal bagno piccolo con impianto semplice al bagno grande con più punti. Il prezzo a punto qui sotto è utile per interventi puntuali o per leggere singole voci del preventivo: per il rifacimento completo dell'impianto è più significativo questo prezzo a corpo, che comprende anche la distribuzione complessiva interna e non va sommato punto per punto",
        includes: "distribuzione acqua e scarichi interni al bagno",
        excludes: "opere murarie estese e colonne condominiali",
        confidence: "media",
        priceType: "corpo",
        costType: "complete",
        role: "primary",
        relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
      },
      {
        // Scope 2B.2: alternativeTo dichiarata una sola volta (simmetrica per
        // costruzione, vedi isAlternativeTo) verso "Impianto idraulico
        // bagno". Nessun includedIn diretto verso la ristrutturazione
        // completa: sarebbe ridondante e semanticamente confuso, dato che
        // "Impianto idraulico bagno" è già includedIn quella riga — modello
        // minimo, non transitivo automaticamente ma non serve duplicarlo.
        id: "bagno-punto-acqua-semplice",
        label: "Punto acqua semplice",
        category: "Impianti",
        unit: "a punto",
        range: "da 75 € a 150 €",
        plainExplanation: "È l'allaccio di un singolo elemento, per esempio la lavatrice, alla tubazione che porta l'acqua (l'adduzione) e allo scarico, quando il punto è già pronto e serve poca opera muraria.",
        note: "singola adduzione (es. lavatrice) o punto già predisposto, con poca muratura da aprire",
        includes: "attacco di carico o scarico del singolo elemento",
        confidence: "media",
        priceType: "corpo",
        // Scope 2B.3: role assente equivaleva silenziosamente a "primary",
        // impreciso per una riga che è per definizione un modo alternativo
        // di leggere lo stesso lavoro di "Impianto idraulico bagno" — non un
        // prezzo principale a sé stante. relation invariata.
        role: "alternative",
        relations: [{ type: "alternativeTo", target: "bagno-impianto-idraulico" }],
      },
      {
        // Scope 2B.2: alternativeTo verso "Impianto idraulico bagno".
        // Scope 2B.3: idem correzione di role, vedi commento sopra.
        id: "bagno-punto-acqua-completo",
        label: "Punto acqua completo",
        category: "Impianti",
        unit: "a punto",
        range: "da 150 € a 280 €",
        plainExplanation: "È l'allaccio completo di un sanitario — lavabo, WC, bidet o doccia — all'acqua calda e fredda e allo scarico, comprese le aperture nel muro o nel pavimento necessarie per far passare i tubi.",
        note: "carico acqua calda e fredda più scarico per lo stesso elemento (lavabo, wc, bidet, doccia), con tracce e posa",
        includes: "carico caldo/freddo, scarico e opere murarie localizzate per il punto",
        confidence: "alta",
        priceType: "corpo",
        role: "alternative",
        relations: [{ type: "alternativeTo", target: "bagno-impianto-idraulico" }],
      },
      {
        // Scope 2B.1: classificata come extra condizionale (role "extra"),
        // coerente con la nota della trasformazione vasca-doccia qui sotto
        // ("aggiungi anche questa voce") e con l'esclusione esplicita dello
        // spostamento importante degli scarichi negli excludes della
        // ristrutturazione completa più sotto — relations verso entrambe.
        // Chiusura Scope 3: label e plainExplanation chiariscono che la riga
        // rappresenta lo spostamento di UN SOLO scarico, non un numero
        // indefinito. Prezzo, costType, role e relations invariati.
        id: "bagno-spostamento-scarichi",
        label: "Spostamento di uno scarico",
        category: "Impianti",
        unit: "a corpo",
        range: "da 200 € a 800 €",
        plainExplanation: "Riguarda il riposizionamento di un singolo scarico rispetto alla sua posizione originale (per esempio quello della doccia o della vasca), non di più scarichi contemporaneamente.",
        note: "il range è ampio perché dipende dalla distanza dalla posizione originale: uno spostamento minimo resta nella parte bassa, un nuovo tracciato esteso su pavimento o muratura sale verso la parte alta",
        confidence: "media",
        priceType: "corpo",
        costType: "complete",
        role: "extra",
        relations: [
          { type: "addsTo", target: "bagno-trasformazione-vasca-doccia" },
          { type: "addsTo", target: "bagno-ristrutturazione-completa" },
        ],
      },
      {
        // Scope 2B.2: la posa "di fascia standard" descritta negli includes
        // della ristrutturazione completa qui sotto è questa stessa
        // lavorazione — includedIn, resta comunque autonoma per lavori
        // parziali e come riferimento al mq (invariato). Fornitura piastrelle
        // resta sempre esclusa ed è un'altra cosa, invariato.
        id: "bagno-posa-piastrelle-rivestimenti",
        label: "Posa piastrelle e rivestimenti",
        category: "Posa e finiture",
        unit: "al mq",
        range: "da 25 € a 80 € al mq",
        note: "formati grandi, mosaici o pose complesse stanno nella parte alta",
        includes: "sola posa in opera",
        excludes: "fornitura delle piastrelle",
        confidence: "alta",
        priceType: "manodopera",
        costType: "work",
        role: "primary",
        relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
      },
      {
        // Scope 2B.2: "sanitari standard" nel pacchetto completo qui sotto
        // significa fornitura E installazione (vedi il commento sulla
        // ristrutturazione completa) — il montaggio descritto qui è quindi
        // già compreso quando si tratta di sanitari standard. includedIn,
        // resta comunque autonoma per sostituzioni/lavori parziali fuori dal
        // pacchetto. Fornitura sanitario e predisposizione punto acqua
        // restano sempre escluse, invariato.
        id: "bagno-montaggio-sanitari",
        label: "Montaggio sanitari",
        category: "Posa e finiture",
        unit: "a elemento",
        range: "da 40 € a 150 €",
        note: "per wc, bidet o lavabo; i modelli sospesi richiedono più lavorazione (staffe e cassetta incassata) dei modelli a terra",
        includes: "solo montaggio e allaccio del singolo elemento agli attacchi già predisposti",
        excludes: "fornitura del sanitario, opere di predisposizione del punto acqua",
        confidence: "media",
        priceType: "manodopera",
        costType: "work",
        role: "primary",
        relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
      },
      {
        // Scope 2B.1 (audit Scope 2A): la fascia precedente (1.000-3.500 €)
        // mescolava sola lavorazione e fornitura del piatto doccia sotto lo
        // stesso prezzo — "piatto doccia standard" negli includes lasciava
        // credere che la fornitura fosse compresa. Ridefinita come SOLA
        // LAVORAZIONE (fascia e perimetro approvati in sede di decisione
        // editoriale, non ridiscussi qui): la fornitura del piatto doccia,
        // del box e della rubinetteria resta sempre a parte. priceType
        // corretto da "corpo" a "manodopera" applicando la regola già
        // esistente su PriceRowType qui sopra (excludes "fornitura" ->
        // manodopera): non una nuova regola, solo un'applicazione corretta
        // ora che includes/excludes lo rendono inequivocabile.
        id: "bagno-trasformazione-vasca-doccia",
        label: "Trasformazione vasca in doccia",
        category: "Posa e finiture",
        unit: "a corpo",
        range: "da 500 € a 1.000 €",
        plainExplanation: "È la sola lavorazione per sostituire la vasca con un piatto doccia: rimozione della vasca, adattamenti locali e posa del piatto. Il piatto doccia, il box doccia e la rubinetteria sono forniture separate, non comprese in questo prezzo; il montaggio del box doccia ha una voce propria qui sotto.",
        note: "Se lo scarico va spostato in modo importante rispetto alla posizione della vasca, aggiungi anche la voce \"Spostamento di uno scarico\" qui sopra. Per un rifacimento più esteso dei rivestimenti della zona doccia, vedi la voce \"Posa piastrelle e rivestimenti\". Una doccia a filo pavimento che richiede lavorazione del massetto, nuove pendenze, impermeabilizzazione specifica o una modifica significativa dello scarico non rientra in questa fascia: il prezzo specifico sarà verificato in un audit economico successivo.",
        includes: "rimozione della vasca esistente, preparazione della zona, adattamento localizzato dei collegamenti idraulici e dello scarico quando resta sostanzialmente nella stessa posizione, posa del piatto doccia fornito a parte, piccoli ripristini localizzati",
        excludes: "fornitura del piatto doccia, del box doccia, della rubinetteria o colonna doccia e dei rivestimenti o materiali decorativi, montaggio del box doccia, modifica importante della posizione dello scarico, rifacimento esteso dei rivestimenti, demolizioni estese, interventi importanti sul massetto o sul sottofondo e doccia a filo pavimento complessa",
        confidence: "media",
        priceType: "manodopera",
        costType: "work",
        role: "primary",
      },
      {
        // Scope 2B.1: chiarita esplicitamente come sola fornitura, per
        // rimuovere l'ambiguità con "piatto doccia standard" che compariva
        // negli includes della trasformazione vasca-doccia prima di questa
        // revisione. Range invariato (non oggetto di revisione economica in
        // questo Scope).
        id: "bagno-box-doccia-fornitura",
        label: "Box doccia (fornitura)",
        category: "Posa e finiture",
        unit: "a elemento",
        range: "da 250 € a 1.500 €",
        plainExplanation: "È la sola fornitura del box doccia: il prezzo del box, non compreso nella \"Trasformazione vasca in doccia\" qui sopra. Il montaggio ha una voce propria qui sotto.",
        note: "scorrevoli base in fascia bassa, cristallo temperato in fascia media, walk-in in fascia alta",
        excludes: "montaggio",
        confidence: "media",
        priceType: "fornitura",
        costType: "supply",
        role: "primary",
      },
      {
        // Scope 2B.1: nuova riga, colma il buco individuato nello Scope 2A
        // ("manca una voce montaggio box doccia" — necessità ALTA). Sola
        // installazione: fornitura del box, piatto doccia, spostamento
        // scarichi, rivestimenti e opere murarie estese restano sempre
        // fuori, così come smontaggio/smaltimento di un vecchio box, mai
        // dato per incluso di default.
        id: "bagno-montaggio-box-doccia",
        label: "Montaggio box doccia",
        category: "Posa e finiture",
        unit: "a elemento",
        range: "da 150 € a 500 €",
        plainExplanation: "È la sola installazione del box doccia già acquistato, con il piatto doccia già posato e il punto pronto per il montaggio: la fascia bassa riguarda box standard con montaggio semplice, la fascia alta box più grandi, con più lati, vetri pesanti, sistemi complessi o pareti fuori squadra che richiedono adattamenti.",
        note: "Non comprende la fornitura del box doccia (vedi la voce \"Box doccia\" qui sopra) né il piatto doccia. Lo smontaggio e lo smaltimento di un vecchio box, quando servono, non sono dati per inclusi: vanno verificati a parte.",
        includes: "montaggio del box su un piatto doccia già posato e un punto già predisposto, regolazioni e fissaggi ordinari",
        excludes: "fornitura del box doccia, fornitura e posa del piatto doccia, spostamento degli scarichi, rifacimento dei rivestimenti, opere murarie estese, smontaggio e smaltimento di un vecchio box",
        confidence: "media",
        priceType: "manodopera",
        costType: "work",
        role: "primary",
      },
      {
        // Scope 2B.3: chiude il blocker editoriale lasciato aperto dallo
        // Scope 2B.2. Decisione applicata: la fornitura della rubinetteria
        // (qualunque fascia) resta sempre una voce separata dal pacchetto
        // standard — coerente con l'excludes riformulato di "Ristrutturazione
        // completa" qui sopra ("fornitura della rubinetteria (qualunque
        // fascia)", non più "solo di fascia alta"). La posa/collegamento
        // ordinario, quando la rubinetteria è fornita a parte, rientra
        // invece nella normale lavorazione (vedi includes della
        // ristrutturazione completa). category invariata ("Da valutare con
        // il professionista" è letta dal template per il rendering
        // qualitativo, cost-page-template.tsx). Nessun range inventato.
        id: "bagno-rubinetteria",
        label: "Rubinetteria",
        category: "Da valutare con il professionista",
        range: "variabile per marca e finitura",
        plainExplanation: "Il prezzo riguarda la sola fornitura dei miscelatori e degli accessori scelti: il collegamento e la posa, quando la rubinetteria è fornita a parte, rientrano nella normale lavorazione del pacchetto o della voce di posa.",
        note: "la differenza tra fascia economica e design è troppo ampia per un range affidabile: chiedi la fornitura come voce separata del preventivo",
        costType: "supply",
        role: "primary",
        priceStatus: "quoteRequired",
      },
      {
        // Scope 2B.3: chiude la relazione lasciata NON DECIDIBILE dallo
        // Scope 2B.2, riscrivendo il confine (vedi anche l'inciso aggiunto a
        // "collegamenti elettrici essenziali" negli includes della
        // ristrutturazione completa qui sopra): questa riga rappresenta
        // interventi elettrici ulteriori rispetto ai collegamenti essenziali
        // già compresi nel pacchetto standard — role "extra" + addsTo.
        // priceStatus "quoteRequired": nessun numero affidabile, invariato
        // (range qualitativo). costType volutamente NON compilato: il testo
        // non permette di stabilire se il prezzo di questi interventi sia
        // "work" (sola posa, materiali già presenti) o "complete" (materiali
        // e manodopera non scorporabili, es. una nuova linea dedicata che
        // comprende sia il cavo sia la posa) — nessun includes/excludes lo
        // separa con certezza, a differenza di altre righe di questo Scope.
        id: "bagno-adeguamento-elettrico",
        label: "Adeguamento elettrico del bagno",
        category: "Da valutare con il professionista",
        range: "da valutare con sopralluogo",
        plainExplanation: "Riguarda gli interventi elettrici che vanno oltre i collegamenti essenziali già compresi nella ristrutturazione completa: aggiunta o spostamento di punti luce e prese, nuove linee dedicate, interventi sul quadro o sulle protezioni, o comunque lavori che richiedono una valutazione dedicata.",
        note: "incidono numero di punti luce e prese, stato dell'impianto esistente ed eventuale nuova linea dedicata",
        role: "extra",
        priceStatus: "quoteRequired",
        relations: [{ type: "addsTo", target: "bagno-ristrutturazione-completa" }],
      },
    ],
    sizeExamples: [
      {
        label: "Bagno da 4 mq",
        sizeRange: "4 mq",
        range: "da 3.200 € a 5.000 €",
        note: "Bagno piccolo: WC, lavabo e doccia pesano quasi come in un bagno più grande, per questo il costo al mq resta alto.",
      },
      {
        label: "Bagno da 6 mq",
        sizeRange: "6 mq",
        range: "da 4.500 € a 8.000 €",
        note: "La metratura più comune per un bagno completo: coincide con la fascia standard di questa guida.",
      },
      {
        label: "Bagno da 8 mq",
        sizeRange: "8 mq",
        range: "da 6.000 € a 10.000 €",
        note: "Più spazio per rivestimenti e finiture, ma sanitari e impianti restano lo stesso costo di base visto nei bagni più piccoli.",
      },
      {
        label: "Bagno da 10 mq",
        sizeRange: "10 mq",
        range: "da 7.500 € a 12.000 €",
        note: "Bagno grande: la superficie in più incide meno del previsto, perché il costo resta guidato soprattutto da sanitari, impianti e finiture.",
      },
    ],
  },
  // Revisione 2026-08: il precedente "range complessivo" (8.000-25.000 €) e
  // "Rifacimento parziale tetto" (2.500-8.000 €) erano fasce assolute senza
  // una superficie associata e senza fonte esterna tracciabile (verificato
  // via audit + ricognizione Git). Sostituiti con un'unica fascia al mq
  // (120-300 €/mq, invariata) applicata a tre scenari espliciti — solo
  // manto / rifacimento senza struttura / rifacimento con struttura — così
  // il lettore vede da cosa dipende il totale invece di un numero assoluto
  // non riconducibile a una metratura. sourceLabel/sourceYear dichiarano
  // esplicitamente che è una stima multi-fonte (prezzari regionali per le
  // singole lavorazioni + fasce di mercato nazionale), mai un prezzo
  // ufficiale unico di una singola Regione per il pacchetto completo.
  // Revisione 2026-08 (richiesta editoriale esplicita): la guida aveva UNA
  // sola riga quotata (120-300 €/mq, nessuna distinzione di scenario) e sei
  // righe qualitative "da valutare" — troppo vaga per rispondere a "quanto
  // costa rifare un tetto e perché due tetti della stessa superficie possono
  // avere costi molto diversi?". Sostituita con 4 scenari di rifacimento
  // (solo manto 60-120, standard 120-180 come fascia principale, con
  // isolamento/ventilazione 180-300, con interventi strutturali 280-500) +
  // 4 lavorazioni specifiche quotate autonomamente (isolamento termico
  // 50-120, rimozione e smaltimento del vecchio manto 15-30 con includedIn
  // verso lo scenario standard, grondaie fornitura+posa 40-120 al metro
  // lineare, ponteggio 15-30 AL MQ DI FACCIATA — non del tetto, per non
  // confonderlo con l'unità degli scenari). Fasce editoriali già approvate,
  // non ricercate ex novo in questa revisione. Amianto/eternit, danni
  // strutturali eccezionali, edifici vincolati e lucernari particolari
  // restano deliberatamente non prezzati (nessuna fascia affidabile senza
  // sopralluogo/bonifica specifica) — citati nelle note delle righe
  // pertinenti, mai con un numero inventato.
  //
  // LIMITE NOTO (da non correggere in questo Scope, solo dati/contenuti):
  // isGuideScenarioRow in templates/cost-guide-price-model.ts riconosce uno
  // scenario/primary SOLO con `unit === "a corpo"`. Qui l'unità corretta per
  // uno scenario di rifacimento tetto è "al mq" — un tetto non ha una
  // "metratura standard" come il bagno (5-6 mq): il prezzo scala sempre con
  // la superficie, un "a corpo" sarebbe un numero inventato. Risultato: le
  // sezioni "Scenari"/"Cosa comprende" del template condiviso NON si
  // attivano oggi per questa guida nonostante role/costType corretti — le 8
  // righe restano tutte nel Breakdown, raggruppate per category (da qui i
  // due categoryNote qui sotto, pensati apposta per compensare in prosa
  // l'assenza delle card Scenario).
  "costGuide:rifare-tetto": {
    nationalRange: "120–180 € al mq",
    pricePerSquareMeter: "da 120 € a 180 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "tetto-sostituzione-manto",
        label: "Sostituzione del solo manto",
        category: "Scenari di rifacimento",
        categoryNote: "Questi quattro scenari rappresentano modi diversi di rifare un tetto, in ordine di ampiezza dell'intervento: scegli quello più vicino al tuo caso, non sommare le fasce tra loro.",
        unit: "al mq",
        range: "da 60 € a 120 € al mq",
        plainExplanation: "È la sola sostituzione della copertura esterna — tegole, coppi o un altro manto standard — quando la struttura sottostante (travi, orditura, solaio) è ancora in buone condizioni e non serve intervenire su di essa.",
        note: "Fascia più bassa tra gli scenari di questa guida: si applica solo quando il supporto esistente è già utilizzabile. Non comprende automaticamente rifacimento strutturale, isolamento termico completo, tetto ventilato o interventi importanti su travi e solaio — quando servono anche questi interventi, il lavoro rientra negli altri scenari di questa guida.",
        includes: "rimozione del vecchio manto, posa del nuovo manto (tegole, coppi o copertura equivalente) secondo il capitolato scelto",
        excludes: "rifacimento strutturale, isolamento termico completo, tetto ventilato, interventi importanti su travi o solaio",
        confidence: "media",
        costType: "complete",
        role: "scenario",
      },
      {
        id: "tetto-rifacimento-copertura",
        label: "Rifacimento standard della copertura",
        category: "Scenari di rifacimento",
        unit: "al mq",
        range: "da 120 € a 180 € al mq",
        plainExplanation: "È il rifacimento completo della copertura — rimozione e smaltimento del vecchio manto, preparazione del supporto, impermeabilizzazione e posa del nuovo manto — quando non servono interventi sulla struttura portante né un nuovo isolamento termico completo.",
        note: "È la fascia principale di questa guida: rappresenta il modo più comune di rifare un tetto, con lavorazioni ordinarie e senza interventi importanti sulla struttura. Non comprende automaticamente un nuovo isolamento termico completo (vedi lo scenario con isolamento/ventilazione) né interventi su travi, orditura o solaio (vedi lo scenario con interventi strutturali). Stima elaborata confrontando singole lavorazioni quotate nei prezzari regionali ufficiali 2025–2026 con fasce di mercato nazionale: nessun prezzario pubblico quota un pacchetto unico per il rifacimento completo del tetto.",
        includes: "rimozione e smaltimento del vecchio manto, preparazione ordinaria del supporto, impermeabilizzazione, nuovo manto e posa, secondo il capitolato scelto",
        excludes: "isolamento termico completo, tetto ventilato o stratigrafie più evolute, interventi sulla struttura portante (travi, orditura, solaio), grondaie, ponteggio",
        confidence: "media",
        costType: "complete",
        role: "primary",
      },
      {
        id: "tetto-rifacimento-isolamento-ventilazione",
        label: "Rifacimento con isolamento o ventilazione",
        category: "Scenari di rifacimento",
        unit: "al mq",
        range: "da 180 € a 300 € al mq",
        plainExplanation: "È il nucleo del rifacimento standard con in più un isolamento termico e/o una stratigrafia più evoluta, come un tetto ventilato.",
        note: "Rappresenta uno scenario più completo del rifacimento standard: un isolamento relativamente semplice tende alla parte bassa della fascia, mentre un tetto ventilato o una stratigrafia più articolata tende alla parte alta.",
        includes: "lo stesso nucleo del rifacimento standard (rimozione e smaltimento del vecchio manto, preparazione del supporto, impermeabilizzazione, nuovo manto e posa) più isolamento termico e/o una stratigrafia più evoluta",
        excludes: "interventi sulla struttura portante (travi, orditura, solaio), grondaie, ponteggio",
        confidence: "media",
        costType: "complete",
        role: "scenario",
      },
      {
        id: "tetto-rifacimento-struttura",
        label: "Rifacimento con interventi strutturali",
        category: "Scenari di rifacimento",
        unit: "al mq",
        range: "da 280 € a 500 € al mq",
        plainExplanation: "Rappresenta i casi in cui non si interviene solo sulla copertura ma anche su elementi strutturali come travi, orditura o solaio.",
        note: "Fascia più alta tra gli scenari di questa guida: si applica quando la struttura portante richiede consolidamento o sostituzione, non solo la copertura esterna. Danni strutturali particolarmente importanti possono richiedere una valutazione tecnica specifica e superare anche questa fascia.",
        includes: "lo stesso nucleo del rifacimento standard più consolidamento o sostituzione di travi, orditura o solaio e le opere accessorie collegate",
        excludes: "grondaie, ponteggio, progettazione strutturale, pratiche tecniche, casi eccezionali da valutare con un professionista",
        confidence: "media",
        costType: "complete",
        role: "scenario",
      },
      {
        id: "tetto-isolamento-coibentazione",
        label: "Isolamento termico del tetto",
        category: "Lavorazioni specifiche",
        categoryNote: "Queste voci sono lavorazioni autonome, richiedibili anche da sole: quando una lavorazione è già compresa in uno degli scenari di rifacimento qui sopra, la riga lo indica esplicitamente.",
        unit: "al mq",
        range: "da 50 € a 120 € al mq",
        plainExplanation: "È la lavorazione di isolamento termico (coibentazione) come intervento a sé, comprensiva di materiale isolante e posa — non l'intero rifacimento della copertura.",
        note: "Il costo cambia soprattutto in base a materiale, spessore, sistema di posa, intervento dall'interno o dall'esterno e necessità di rimuovere la copertura esistente per posarlo. Se stai già valutando un rifacimento completo, guarda invece lo scenario \"Rifacimento con isolamento o ventilazione\" qui sopra, che comprende questo lavoro nel pacchetto.",
        includes: "fornitura del materiale isolante e posa, secondo il sistema scelto",
        excludes: "rimozione e posa del manto di copertura, interventi sulla struttura portante",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "tetto-smaltimento-copertura",
        label: "Rimozione e smaltimento del vecchio manto",
        category: "Lavorazioni specifiche",
        unit: "al mq",
        range: "da 15 € a 30 € al mq",
        plainExplanation: "È la sola rimozione della vecchia copertura (tegole, coppi o manto ordinario) e il suo conferimento/smaltimento, come lavorazione a sé — non la posa del nuovo manto.",
        note: "Comprende movimentazione ordinaria, trasporto e conferimento/smaltimento del vecchio manto. Non comprende amianto o eternit: la rimozione di coperture in amianto/eternit richiede una bonifica specifica con procedure e costi propri, non quotabile con questa fascia — serve una valutazione dedicata con un professionista specializzato.",
        includes: "rimozione di tegole, coppi o copertura ordinaria, movimentazione ordinaria, trasporto, conferimento/smaltimento",
        excludes: "amianto o eternit (richiedono una bonifica specifica, non quotabile qui), posa del nuovo manto",
        confidence: "media",
        costType: "work",
        relations: [{ type: "includedIn", target: "tetto-rifacimento-copertura" }],
      },
      {
        id: "tetto-grondaie-lattoneria",
        label: "Grondaie — fornitura e posa",
        category: "Lavorazioni specifiche",
        unit: "al metro lineare",
        range: "da 40 € a 120 € al metro lineare",
        plainExplanation: "È la fornitura e posa delle grondaie in una configurazione ordinaria, non l'intera lattoneria del tetto.",
        note: "Il costo cambia soprattutto in base a materiale, dimensioni, altezza/accessibilità e complessità del percorso. Converse, scossaline o lattonerie molto particolari non rientrano in questo range e vanno valutate separatamente con il professionista.",
        includes: "fornitura e posa delle grondaie in una configurazione ordinaria",
        excludes: "converse, scossaline e lattonerie particolari (da valutare separatamente), pluviali con percorsi complessi",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "tetto-ponteggi-accessibilita",
        label: "Ponteggio standard",
        category: "Lavorazioni specifiche",
        unit: "al mq di facciata",
        range: "da 15 € a 30 € al mq di facciata",
        plainExplanation: "È il costo del ponteggio necessario per lavorare in sicurezza sul tetto, calcolato sulla superficie della facciata da ponteggiare — non sui mq del tetto.",
        note: "Il costo può aumentare con maggiore altezza dell'edificio, durata del cantiere, occupazione di suolo pubblico e geometrie complesse. L'accessibilità difficile del cantiere resta un fattore che può far salire il costo complessivo del lavoro, non una voce di prezzo a sé in questa tabella.",
        includes: "montaggio, nolo per la durata del cantiere e smontaggio del ponteggio standard",
        excludes: "occupazione di suolo pubblico e pratiche collegate, geometrie complesse, altezze eccezionali",
        confidence: "media",
        costType: "work",
      },
    ],
    sizeExamples: [
      {
        label: "Tetto da 70 mq",
        sizeRange: "70 mq",
        range: "da 8.400 € a 12.600 €",
        note: "Calcolo per il rifacimento standard: 70 mq × 120–180 €/mq.",
      },
      {
        label: "Tetto da 100 mq",
        sizeRange: "100 mq",
        range: "da 12.000 € a 18.000 €",
        note: "Calcolo per il rifacimento standard: 100 mq × 120–180 €/mq.",
      },
      {
        label: "Tetto da 150 mq",
        sizeRange: "150 mq",
        range: "da 18.000 € a 27.000 €",
        note: "Calcolo per il rifacimento standard: 150 mq × 120–180 €/mq.",
      },
      {
        label: "Tetto da 200 mq",
        sizeRange: "200 mq",
        range: "da 24.000 € a 36.000 €",
        note: "Calcolo per il rifacimento standard: 200 mq × 120–180 €/mq.",
      },
    ],
  },
  // Revisione 2026-08 (richiesta editoriale esplicita): la guida era troppo
  // vicina a un prezzario tecnico (10 voci puntuali "official", nationalRange
  // "Nessun totale complessivo" come risposta principale) per un lettore che
  // cerca "quanto costa impermeabilizzare un tetto". Sostituita con 8 righe
  // orientate al cliente:
  // - 5 nuove impermeabilizzazioni (guaina liscia 25-40, ardesiata 30-50,
  //   doppio strato 35-55, alluminio 45-60, rame 75-90 €/mq — tutte
  //   "materiale + posa", costType "complete"), unificando le due varianti
  //   di grammatura del rame (4 kg/4,5 kg) in un'unica voce cliente: per un
  //   proprietario di casa sono due opzioni troppo simili per giustificare
  //   due prezzi separati, la differenza resta citata in nota come dettaglio
  //   tecnico.
  // - Preparazione e livellamento della superficie (10-20 €/mq, ex
  //   "Lisciatura del piano di posa"): lavorazione autonoma, non un lavoro
  //   sempre necessario — condizione esplicita nella nota, non promessa come
  //   automatica.
  // - Rimozione e smaltimento della vecchia guaina (10-20 €/mq): SOSTITUISCE
  //   come informazione principale il vecchio "Conferimento in impianto
  //   della guaina bituminosa" (19,53 €/100 kg, un'unità a peso poco utile
  //   per stimare un tetto) — id riutilizzato ma RINOMINATO (stessa identità
  //   evolutiva: "cosa succede alla vecchia copertura", vedi micro-fix sotto),
  //   perimetro allargato a rimozione+movimentazione+trasporto+smaltimento,
  //   non solo il conferimento finale. Il valore a peso del prezzario resta
  //   citato in nota come riferimento tecnico, non più come voce cliente
  //   principale.
  // - Ricerca e riparazione di una perdita localizzata: priceStatus
  //   "quoteRequired", unifica "Riparazione di manto bituminoso fessurato"
  //   (id rimosso: la nuova label era già praticamente il nome dell'altra
  //   voce, "Ricerca e riparazione di infiltrazione isolata" — id
  //   sopravvissuto) — 56,56 €/mq e 82,63 €/cadauna restano citati in nota
  //   come riferimento tecnico puntuale, mai promessi come prezzo di mercato
  //   per un intervento privato senza sopralluogo.
  //
  // sourceType passa da "official" a "mixed": le righe non riportano più il
  // prezzo puntuale del prezzario come unico numero mostrato, ma una fascia
  // editoriale arrotondata attorno a quell'ancora — stesso pattern già usato
  // per rifare-tetto/ristrutturare-bagno. confidence "media" ovunque
  // (ancoraggio a un'unica voce ufficiale puntuale per riga, non un
  // confronto multi-fonte indipendente: "media", non "alta", per non
  // dichiarare più affidabilità di quella reale). Il valore puntuale del
  // prezzario resta sempre citato in `note` — mai spacciato per il numero
  // mostrato al cliente, mai perso.
  //
  // Nessun sizeExample aggiunto: fuori perimetro esplicito di questa
  // revisione (non richiesto, "non ampliare il perimetro").
  //
  // Nessuna dipendenza da isGuideScenarioRow qui (a differenza di
  // rifare-tetto): nessuna riga usa role "scenario"/"primary" in questa
  // guida, quindi il limite noto su quel classificatore (vedi il commento
  // sopra "costGuide:rifare-tetto") non si applica — le 5 nuove
  // impermeabilizzazioni sono semplicemente lavorazioni autonome parallele,
  // mai pensate per la UI "Scenari".
  //
  // Micro-fix 2026-08 (verifica di coerenza sul lavoro sopra, 3 correzioni):
  // 1) ID rinominati: "-conferimento-guaina" → "-rimozione-smaltimento-guaina"
  //    (il vecchio nome descriveva solo il conferimento a peso, non il nuovo
  //    perimetro cliente rimozione+smaltimento); "-doppia-membrana-rame-4kg"
  //    → "-doppia-membrana-rame" (la riga rappresenta ORA l'intera fascia
  //    rame unificata, non più la sola variante da 4 kg — tenere "-4kg" nell'id
  //    avrebbe implicitamente e silenziosamente ristretto il significato).
  //    Verificato: nessuna dipendenza esterna a market-data/test su nessuno
  //    dei due vecchi id, rename sicuro.
  // 2) role "extra" rimosso da "Preparazione e livellamento della superficie":
  //    ripensandoci, non è un costo che si aggiunge a UN pacchetto specifico
  //    (a differenza di es. bagno-adeguamento-elettrico, addsTo verso un
  //    unico target reale) — è una lavorazione autonoma con perimetro proprio
  //    ("regolarizzazione della superficie prima della posa"), richiedibile
  //    a sé, esattamente come "Rimozione e smaltimento" qui sotto: entrambe
  //    condizionali nell'uso reale, entrambe "primary" nel modello. Un
  //    "extra" senza addsTo era tecnicamente permesso dal validator (leniency
  //    pensata per la migrazione progressiva di dati legacy, non per
  //    dichiarare stabilmente una riga nuova) ma non intenzionalmente
  //    corretto qui: differenziare le due righe analoghe non aveva una
  //    ragione semantica, solo una differenza di formulazione nella richiesta
  //    originale. Nessuna relation "addsTo" inventata verso le 5 guaine
  //    (sarebbe stata una relazione vera ma non informativa, uguale su tutte
  //    e 5 e quindi priva di segnale reale). Conseguenza: la sezione "Cosa
  //    può far salire il prezzo" non ha più righe da mostrare per questa
  //    guida — nessuna sezione Extra renderizzata, la riga si legge nel
  //    Breakdown come le altre lavorazioni specifiche.
  // 3) Provenance di "Rimozione e smaltimento" resa esplicita: il prezzario
  //    ufficiale copre SOLO il conferimento a peso, non la manodopera di
  //    rimozione — la fascia al mq per l'intero perimetro è una stima
  //    editoriale (non un secondo valore ufficiale), ora dichiarata come
  //    tale in nota con un confronto di plausibilità verso la fascia
  //    analoga di rifare-tetto. Range/confidence invariati (non modificabili
  //    in questo micro-fix): la fascia 10-20 €/mq resta la stessa decisione
  //    editoriale già approvata, qui solo meglio documentata.
  "costGuide:impermeabilizzare-tetto": {
    nationalRange: "25–60 € al mq",
    pricePerSquareMeter: "da 25 € a 60 € al mq",
    sourceLabel: "Prezzari ufficiali delle Regioni Friuli Venezia Giulia e Lombardia, elaborati in fasce di mercato",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "impermeabilizzare-tetto-guaina-liscia",
        label: "Guaina bituminosa standard (liscia)",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "da 25 € a 40 € al mq",
        plainExplanation: "È una membrana impermeabilizzante bituminosa con superficie liscia, senza la finitura minerale della guaina ardesiata: la soluzione più diffusa per una nuova impermeabilizzazione, materiale e posa comprese nel prezzo.",
        note: "Fascia editoriale basata sul prezzo ufficiale del Prezzario Regione Friuli Venezia Giulia 2025 (27,43 €/m² per la voce di capitolato equivalente), allargata per riflettere la variabilità reale del mercato privato: il valore del prezzario resta il riferimento tecnico puntuale, non è il prezzo esatto mostrato qui.",
        includes: "fornitura della membrana bituminosa e posa in opera",
        excludes: "rimozione della vecchia guaina, ripristini importanti del supporto, ponteggi, difficoltà particolari di accesso",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-tetto-guaina-ardesiata",
        label: "Guaina ardesiata per copertura a vista",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "da 30 € a 50 € al mq",
        plainExplanation: "È una membrana bituminosa (guaina bituminosa ardesiata) con una protezione superficiale in scaglie minerali: si usa quando la copertura resta a vista, perché le scaglie proteggono la membrana dai raggi UV senza bisogno di un manto sopra.",
        note: "Fascia editoriale basata sul prezzo ufficiale del Prezzario Regione Friuli Venezia Giulia 2025 (29,10 €/m² per la voce di capitolato equivalente, distinta dalla guaina liscia), allargata per riflettere la variabilità reale del mercato privato.",
        includes: "fornitura della membrana e posa in opera",
        excludes: "rimozione della vecchia guaina, ripristini importanti del supporto, ponteggi, difficoltà particolari di accesso",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-tetto-membrana-standard",
        label: "Impermeabilizzazione bituminosa a doppio strato",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "da 35 € a 55 € al mq",
        plainExplanation: "Rispetto a una guaina in un solo strato, qui il sistema prevede due membrane bituminose sovrapposte: una tenuta all'acqua maggiore, utile su coperture più esposte o con pendenze minime.",
        note: "Fascia editoriale basata sul prezzo ufficiale del Prezzario Regione Friuli Venezia Giulia 2025 (35,32 €/m² per la voce di capitolato equivalente, indicata nel prezzario come \"membrana bituminosa standard\"), allargata per riflettere la variabilità reale del mercato privato.",
        includes: "fornitura delle due membrane e posa in opera",
        excludes: "rimozione della vecchia guaina, ripristini importanti del supporto, ponteggi, difficoltà particolari di accesso",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-tetto-doppia-membrana-alluminio",
        label: "Doppia guaina con protezione in alluminio",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "da 45 € a 60 € al mq",
        plainExplanation: "È un sistema a doppio strato autoprotetto, con una finitura metallica riflettente in alluminio che protegge la membrana senza bisogno di un manto sopra: utile quando il tetto resta a vista e serve anche una buona resistenza ai raggi UV.",
        note: "Fascia editoriale basata sul prezzo ufficiale del Prezzario Regione Friuli Venezia Giulia 2025 (44,40 €/m² per la voce di capitolato equivalente), allargata per riflettere la variabilità reale del mercato privato.",
        includes: "fornitura del sistema a doppio strato e posa in opera",
        excludes: "rimozione della vecchia guaina, ripristini importanti del supporto, ponteggi, difficoltà particolari di accesso",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-tetto-doppia-membrana-rame",
        label: "Doppia guaina con protezione in rame",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "da 75 € a 90 € al mq",
        plainExplanation: "È lo stesso principio della versione in alluminio, ma con una lamina di rame al posto della finitura in alluminio: più costosa, con una resa estetica e una durata nel tempo superiori.",
        note: "Fascia editoriale che unifica i prezzi ufficiali del Prezzario Regione Friuli Venezia Giulia 2025 per le due varianti di grammatura del rame (4 kg/m²: 79,24 €/m²; 4,5 kg/m²: 81,36 €/m²): per un cliente privato sono due varianti troppo simili per giustificare due voci separate. La grammatura esatta resta un dettaglio da confermare con il professionista, non cambia la fascia mostrata qui.",
        includes: "fornitura del sistema a doppio strato con lamina di rame e posa in opera",
        excludes: "rimozione della vecchia guaina, ripristini importanti del supporto, ponteggi, difficoltà particolari di accesso",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-tetto-lisciatura-piano-posa",
        label: "Preparazione e livellamento della superficie",
        category: "Preparazione della superficie",
        unit: "al mq",
        range: "da 10 € a 20 € al mq",
        plainExplanation: "Serve quando la superficie, dopo la rimozione della vecchia impermeabilizzazione, deve essere regolarizzata prima di posare la nuova guaina — non è automaticamente necessaria in ogni intervento: dipende dalle condizioni della superficie esistente.",
        note: "Tecnicamente è la preparazione del \"piano di posa\". Fascia editoriale basata sul prezzo ufficiale del Prezzario Regione Lombardia 1/2026 (13,22 €/m² per la voce di capitolato equivalente), allargata per riflettere la variabilità reale del mercato privato.",
        includes: "regolarizzazione della superficie prima della posa della nuova guaina",
        excludes: "rimozione della vecchia guaina (vedi voce dedicata), ponteggi",
        confidence: "media",
        costType: "work",
      },
      {
        id: "impermeabilizzare-tetto-rimozione-smaltimento-guaina",
        label: "Rimozione e smaltimento della vecchia guaina",
        category: "Rimozione e riparazioni mirate",
        categoryNote: "Queste lavorazioni non sono comprese nel prezzo delle nuove impermeabilizzazioni qui sopra: si aggiungono solo quando il tuo caso lo richiede.",
        unit: "al mq",
        range: "da 10 € a 20 € al mq",
        plainExplanation: "È la rimozione della vecchia guaina e il suo conferimento/smaltimento, come lavorazione a sé: utile per capire quanto incide sul totale quando si rifà l'impermeabilizzazione di un tetto già impermeabilizzato in passato.",
        note: "Perimetro ordinario: rimozione, movimentazione, trasporto, smaltimento/conferimento. Il prezzario ufficiale di riferimento (Prezzario Regione Lombardia 1/2026) quota SOLO il conferimento a peso del materiale già rimosso (19,53 € ogni 100 kg) — non l'intera rimozione: la manodopera di rimozione della guaina non è direttamente quotata da nessun prezzario ufficiale consultato per questa guida, la fascia al mq qui mostrata è una stima editoriale. Come ordine di grandezza è coerente con la lavorazione analoga sul manto di copertura (rimozione e smaltimento del vecchio manto, 15–30 €/mq, guida \"Quanto costa rifare un tetto\"), proporzionalmente più leggera perché qui si rimuove una membrana sottile, non l'intera copertura in tegole o coppi. Il valore ufficiale a peso resta un riferimento tecnico utile per chi ha già una stima del peso del materiale, non equivalente a questa fascia al mq.",
        includes: "rimozione della vecchia guaina, movimentazione ordinaria, trasporto, smaltimento/conferimento",
        // "rifiuti" e non "materiali che richiedono...": la parola "materiali"
        // fa scattare per costruzione il badge "Materiali esclusi" su
        // costType "work" (describeCostTypeBadge, cost-guide-price-model.ts)
        // — corretto quando significa "fornitura esclusa", fuorviante qui
        // (amianto/eternit sono uno scarto speciale da bonificare, non un
        // materiale da fornire). Stesso perimetro, parola diversa.
        excludes: "amianto, eternit o altri rifiuti che richiedono una bonifica specifica (non quotabile qui), ponteggi",
        confidence: "media",
        costType: "work",
      },
      {
        id: "impermeabilizzare-tetto-ricerca-infiltrazione",
        label: "Ricerca e riparazione di una perdita localizzata",
        category: "Rimozione e riparazioni mirate",
        unit: "a intervento",
        range: "da valutare con il professionista",
        plainExplanation: "È l'intervento mirato per trovare e riparare una perdita isolata — un manto fessurato in un punto preciso o un'infiltrazione localizzata — senza rifare tutta l'impermeabilizzazione della copertura.",
        note: "Il prezzo richiede sempre una valutazione: incidono il tempo necessario per individuare la perdita, l'accessibilità, la quantità di superficie danneggiata, i raccordi/comignoli/bocchettoni coinvolti e l'eventuale necessità di estendere la riparazione oltre il punto individuato. I prezzari ufficiali di riferimento (Prezzario Regione Lombardia 1/2026) quotano voci puntuali per casi specifici — riparazione di un manto fessurato 56,56 €/m², ricerca e riparazione di un'infiltrazione isolata 82,63 € cadauna — utili come riferimento tecnico, ma non promettibili come prezzo di mercato per un intervento privato senza sopralluogo.",
        includes: "ricerca del punto di perdita ed eliminazione, secondo l'estensione del danno",
        excludes: "posa di una nuova impermeabilizzazione su tutta la superficie (vedi le voci dedicate qui sopra), ponteggi",
        priceStatus: "quoteRequired",
      },
    ],
    sizeExamples: [],
  },
  // Fase terrazzo (2026-08): impermeabilizzare-terrazzo resta
  // publicationStatus "draft" — questa guida è registrata e compilabile ma
  // non pubblica finché il lifecycle non cambia stato (vedi
  // pages/costi/impermeabilizzare-terrazzo). Ricognizione dati: nessun dato
  // economico preesisteva per impermeabilizzare-balcone-ballatoio o concetti
  // equivalenti in market-data, pagine o funnel (verificato read-only prima
  // di questa guida) — nessuna base da riusare, fascia costruita ex novo.
  // Fonti confrontate: prezzari regionali ufficiali 2025–2026 (Emilia-
  // Romagna 2026, Friuli Venezia Giulia, Sicilia vigente) e mercato
  // nazionale (Instapro, Edilnet, Homedeal, altre fonti tecniche). I
  // prezzari mostrano valori molto differenti in base al sistema, da
  // lavorazioni semplici nell'ordine di circa 20–40 €/mq fino a sistemi
  // specialistici oltre 70–90 €/mq: nessuna singola voce ufficiale è
  // attribuibile come prezzo universale. La fascia 30–70 €/mq è
  // un'elaborazione editoriale multi-fonte (confidence "media"), non il
  // prezzo puntuale di un singolo prezzario — a differenza del blocco
  // impermeabilizzare-tetto qui sopra, che riporta prezzi ufficiali puntuali
  // senza fascia. NON è il range 120–300 €/mq di rifare-tetto: quella fascia
  // riguarda il rifacimento completo (demolizione, massetto, nuova
  // pavimentazione), fuori perimetro da questa guida per esplicita decisione
  // editoriale — vedi priceRows sotto ed exclusion nella riga principale.
  "costGuide:impermeabilizzare-terrazzo": {
    nationalRange: "30–70 € al mq",
    pricePerSquareMeter: "da 30 € a 70 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "terrazzo-impermeabilizzazione-standard",
        label: "Impermeabilizzazione standard della superficie",
        category: "Impermeabilizzazione della superficie",
        unit: "al mq",
        range: "da 30 € a 70 € al mq",
        note: "Stima elaborata confrontando le voci di impermeabilizzazione dei prezzari regionali ufficiali 2025–2026 con le fasce di mercato nazionale: nessun prezzario pubblico quota un pacchetto unico per impermeabilizzare un terrazzo, dalla preparazione del supporto (la superficie su cui viene applicato il sistema) alla posa del sistema scelto.",
        includes: "sopralluogo e valutazione del supporto, preparazione della superficie, trattamento di raccordi perimetrali, soglie, scarichi e bocchettoni (il punto in cui l'acqua del terrazzo entra nello scarico), applicazione del sistema impermeabilizzante scelto, verifica finale della tenuta",
        excludes: "demolizione completa, ricostruzione del massetto (lo strato sotto le piastrelle che crea la base e di norma le pendenze), rifacimento generale delle pendenze, nuova pavimentazione completa, opere strutturali e, più in generale, il rifacimento completo del terrazzo",
        confidence: "media",
        priceType: "corpo",
      },
      // Scenario A e C non hanno un numero verificato da fonti di settore
      // (a differenza della riga sopra): restano qualitative sotto "Da
      // valutare", stesso pattern delle righe non quotabili di bagno e
      // tetto — mai un numero o un tetto massimo inventato (vedi anche
      // categoryNote).
      {
        id: "terrazzo-riparazione-localizzata",
        label: "Riparazione o impermeabilizzazione localizzata",
        category: "Da valutare con il professionista",
        categoryNote: "Queste voci non hanno una fascia in euro affidabile senza un sopralluogo: comprendono sia interventi più mirati della fascia principale qui sopra (riparazioni localizzate) sia interventi più complessi (sistemi ad alte prestazioni), oltre a fattori che dipendono dal singolo cantiere.",
        range: "da valutare con il professionista",
        note: "Può riguardare uno scarico, un bocchettone, una soglia, un raccordo, un giunto o una piccola zona deteriorata. Per lavori di questo tipo il prezzo al mq è poco significativo: esistono costi minimi di intervento, preparazione e manodopera che non scendono sotto una certa soglia anche per superfici piccole.",
      },
      {
        id: "terrazzo-sistema-complesso",
        label: "Sistema complesso o ad alte prestazioni",
        category: "Da valutare con il professionista",
        range: "oltre 70 € al mq, senza un massimo definito",
        note: "Può riguardare sistemi impermeabilizzanti multistrato o specialistici, un supporto molto deteriorato che richiede una preparazione importante, molti raccordi o scarichi complessi, oppure la correzione delle pendenze: lavorazioni preliminari rilevanti che spostano il lavoro fuori dalla fascia 30–70 €/mq.",
      },
    ],
    sizeExamples: [
      {
        label: "Terrazzo da 20 mq",
        sizeRange: "20 mq",
        range: "da 600 € a 1.400 €",
        note: "Calcolo: 20 mq × 30–70 €/mq. Nei terrazzi piccoli il costo al mq può risultare più alto: preparazione, accesso, raccordi, scarichi e i costi minimi di cantiere non diminuiscono proporzionalmente alla superficie.",
      },
      {
        label: "Terrazzo da 50 mq",
        sizeRange: "50 mq",
        range: "da 1.500 € a 3.500 €",
        note: "Calcolo: 50 mq × 30–70 €/mq.",
      },
      {
        label: "Terrazzo da 100 mq",
        sizeRange: "100 mq",
        range: "da 3.000 € a 7.000 €",
        note: "Calcolo: 100 mq × 30–70 €/mq.",
      },
    ],
  },
  // Prezzi ufficiali da prezzari regionali dei lavori pubblici, forniti
  // direttamente per questa revisione: Prezzario Regione Emilia-Romagna 2025
  // (fonte principale) e Prezzario Regione Friuli Venezia Giulia 2025 (solo
  // per il blocco "Esempi da un altro prezzario regionale", mai fuso con le
  // voci Emilia-Romagna). Prezzi Lombardia esclusi: la struttura OPERA + LV
  // del prezzario 2026 non è stata ricostruita con sufficienza certezza.
  // "Colonna montante" esclusa: prezzo e descrizione leggibili, ma nessun
  // codice di capitolato attribuibile con certezza in due estrazioni
  // indipendenti del PDF ufficiale — mai un codice inventato.
  // Revisione 2026-08: l'H1 ("Quanto costa rifare un impianto elettrico?")
  // otteneva solo "Nessun totale complessivo" — mismatch tra intento e
  // risposta. Aggiunta una fascia editoriale 45–80 €/mq per il rifacimento
  // completo standard (prima riga di priceRows, confidence "media",
  // sourceType ora "mixed", stesso pattern di rifare-tetto/ristrutturare-
  // bagno/impermeabilizzare-terrazzo). Le righe ufficiali sottostanti
  // restano prezzi puntuali invariati, senza confidence: continuano a non
  // dover mai essere sommate tra loro né aggiunte alla fascia, che è già una
  // stima complessiva alternativa, non cumulativa.
  "costGuide:rifare-impianto-elettrico": {
    nationalRange: "45–80 € al mq",
    pricePerSquareMeter: "da 45 € a 80 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "elettrico-rifacimento-completo",
        label: "Rifacimento completo, fascia standard",
        category: "Rifacimento completo",
        unit: "al mq",
        range: "da 45 € a 80 € al mq",
        note: "Stima elaborata confrontando le voci di impianto elettrico dei prezzari regionali ufficiali 2025–2026 con le fasce di mercato nazionale: nessun prezzario pubblico quota un pacchetto unico per il rifacimento completo di un impianto. Vale per un impianto residenziale esistente, con configurazione ordinaria, senza domotica avanzata e senza ripristini murari eccezionalmente estesi.",
        includes: "punti luce, punti presa e punti comando, distribuzione interna, quadro elettrico e dispositivi di protezione, opere murarie ordinarie, verifiche finali",
        excludes: "domotica avanzata, ripristini murari eccezionalmente estesi, aumento della potenza contrattuale, progettazioni specialistiche e documentazione tecnica ulteriore rispetto a quella ordinaria",
        confidence: "media",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-luce-incassato-singolo",
        label: "Punto luce incassato singolo",
        simpleLabel: "Nuovo punto luce a incasso",
        plainExplanation: "Punto luce realizzato sotto traccia. Comprende gli elementi indicati dal capitolato; non comprende le opere murarie e la linea principale a monte.",
        technicalCode: "D01.001.005",
        category: "Lavorazioni complete",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "26,85 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo. Misurato a partire dalla scatola di derivazione in dorsale, questa esclusa.",
        includes: "tubazione, cavi, scatola da incasso, supporto, apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-luce-incassato-doppio",
        label: "Punto luce incassato doppio",
        simpleLabel: "Due punti luce nello stesso collegamento",
        plainExplanation: "Permette di collegare due punti luce dalla stessa derivazione. Le opere murarie restano escluse quando non indicate.",
        technicalCode: "D01.001.010.a",
        category: "Lavorazioni complete",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "28,96 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo.",
        includes: "tubazione, cavi, scatola da incasso, supporto, doppio apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-luce-vista-ip40",
        label: "Punto luce a vista, grado di protezione IP40",
        simpleLabel: "Nuovo punto luce con tubazione esterna",
        plainExplanation: "Il cablaggio viene posato a vista, senza incassarlo nel muro. IP40 resta un dettaglio tecnico della voce ufficiale, non una protezione contro l'acqua.",
        category: "Lavorazioni complete",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "31,88 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico. Codice di capitolato non attribuibile con certezza dal documento ufficiale: prezzo e descrizione riportati, codice volutamente omesso.",
        includes: "tubazione rigida a vista, cavi, supporti e apparecchio IP40",
        excludes: "scatola di derivazione (esclusa dalla voce stessa) e opere murarie",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-presa-incassato-10a",
        label: "Punto presa incassato 2P+T 10A",
        simpleLabel: "Nuova presa elettrica da 10 A",
        plainExplanation: "Presa completa per usi domestici comuni, secondo il capitolato ufficiale. Le tracce e i ripristini murari non sono compresi.",
        technicalCode: "D01.001.020",
        category: "Lavorazioni complete",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "49,72 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo.",
        includes: "tubazione, cavi, scatola da incasso, supporto, apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-presa-incassato-16a",
        label: "Punto presa incassato 2P+T 16A",
        simpleLabel: "Nuova presa elettrica da 16 A",
        plainExplanation: "Presa completa con portata nominale maggiore rispetto alla voce da 10 A. Non attribuire automaticamente usi specifici senza un progetto.",
        technicalCode: "D01.001.020",
        category: "Lavorazioni complete",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "56,07 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo.",
        includes: "tubazione, cavi, scatola da incasso, supporto, apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-comando-deviato",
        label: "Punto comando deviato",
        simpleLabel: "Comando per accendere una luce da due punti",
        plainExplanation: "Consente di comandare la stessa luce da due posizioni diverse.",
        technicalCode: "E.04.12.01.024",
        category: "Lavorazioni complete",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "53,63 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo analitico serie civile: capitolato diverso e più dettagliato delle altre voci di questo blocco, con collaudo compreso nella voce stessa.",
        includes: "tubo corrugato, conduttori con protezione, morsetti, scatola portafrutto, apparecchio, placca e collaudo",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        id: "elettrico-collegamento-equipotenziale",
        label: "Collegamento equipotenziale per vano",
        simpleLabel: "Collegamenti di sicurezza del locale",
        plainExplanation: "Collega tra loro le parti conduttrici previste nel locale. Non è una presa, un punto luce o il rifacimento completo della messa a terra.",
        technicalCode: "D01.001.025",
        category: "Lavorazioni complete",
        unit: "cadauno",
        unitLabel: "per collegamento",
        range: "188,81 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), per vano con masse metalliche da collegare (es. bagno).",
        includes: "conduttore di protezione, collegamenti e morsettiera equipotenziale del vano",
        excludes: "opere murarie e collegamento a dispersore di terra esterno al vano",
        priceType: "corpo",
      },
      {
        id: "elettrico-dorsale-1-5mmq",
        label: "Dorsale interna 2 x 1,5 mmq + T",
        simpleLabel: "Linea dal quadro alla stanza",
        plainExplanation: "È la linea che collega il quadro alla zona dell'abitazione prima dei singoli punti luce e presa. Le varianti sono alternative tecniche, non fasce di prezzo.",
        technicalCode: "D01.001.030",
        categoryNote: "Le righe seguenti rappresentano configurazioni alternative della stessa tipologia di linea. Non devono essere sommate tra loro.",
        category: "Distribuzione e linee",
        unit: "cadauna",
        unitLabel: "per circuito",
        range: "200,14 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, unità abitativa tipo. Misurata dal centralino di appartamento: non è il montante contatore-centralino.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        id: "elettrico-dorsale-2-5mmq",
        label: "Dorsale interna 2 x 2,5 mmq + T",
        simpleLabel: "Linea dal quadro alla stanza",
        plainExplanation: "È la linea che collega il quadro alla zona dell'abitazione prima dei singoli punti luce e presa. Le varianti sono alternative tecniche, non fasce di prezzo.",
        technicalCode: "D01.001.030",
        category: "Distribuzione e linee",
        unit: "cadauna",
        unitLabel: "per circuito",
        range: "205,09 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, unità abitativa tipo.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        id: "elettrico-dorsale-4mmq",
        label: "Dorsale interna 2 x 4 mmq + T",
        simpleLabel: "Linea dal quadro alla stanza",
        plainExplanation: "È la linea che collega il quadro alla zona dell'abitazione prima dei singoli punti luce e presa. Le varianti sono alternative tecniche, non fasce di prezzo.",
        technicalCode: "D01.001.030",
        category: "Distribuzione e linee",
        unit: "cadauna",
        unitLabel: "per circuito",
        range: "218,75 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, unità abitativa tipo.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        id: "elettrico-dorsale-6mmq",
        label: "Dorsale interna 2 x 6 mmq + T",
        simpleLabel: "Linea dal quadro alla stanza",
        plainExplanation: "È la linea che collega il quadro alla zona dell'abitazione prima dei singoli punti luce e presa. Le varianti sono alternative tecniche, non fasce di prezzo.",
        technicalCode: "D01.001.030",
        category: "Distribuzione e linee",
        unit: "cadauna",
        unitLabel: "per circuito",
        range: "253,05 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, unità abitativa tipo.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        id: "elettrico-dorsale-10mmq",
        label: "Dorsale interna 2 x 10 mmq + T",
        simpleLabel: "Linea dal quadro alla stanza",
        plainExplanation: "È la linea che collega il quadro alla zona dell'abitazione prima dei singoli punti luce e presa. Le varianti sono alternative tecniche, non fasce di prezzo.",
        technicalCode: "D01.001.030",
        category: "Distribuzione e linee",
        unit: "cadauna",
        unitLabel: "per circuito",
        range: "361,86 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, unità abitativa tipo. Sezione maggiore, tipicamente per linee dedicate a carichi specifici.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-luce-vista-ip54-fvg",
        label: "Punto luce a vista, grado di protezione IP54",
        simpleLabel: "Punto luce a vista con maggiore protezione",
        plainExplanation: "Voce FVG con grado IP54, che indica una maggiore protezione contro ingresso di polvere e spruzzi. Non implica automaticamente idoneità a qualsiasi ambiente.",
        categoryNote: "Questi prezzi non sono alternative equivalenti alla tabella principale: cambiano regione, capitolato e contenuto della lavorazione.",
        category: "Esempi da un altro prezzario regionale (Friuli Venezia Giulia)",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "40,55 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Non è una media nazionale: il capitolato di questa regione può differire da quello Emilia-Romagna, e il grado di protezione IP54 non è confrontabile con la voce IP40 del blocco principale.",
        includes: "tubazione a vista, cavi, supporti e apparecchio IP54",
        excludes: "scatola di derivazione e opere murarie",
        priceType: "corpo",
      },
      {
        id: "elettrico-punto-presa-10a-fvg",
        label: "Punto presa 2P+T 10A",
        simpleLabel: "Presa completa in una specifica modalità di posa",
        plainExplanation: "Il prezzo riguarda il particolare sistema di posa descritto dal prezzario FVG e non è direttamente equivalente alla presa Emilia-Romagna.",
        category: "Esempi da un altro prezzario regionale (Friuli Venezia Giulia)",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "79,12 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Voce con una modalità di posa specifica di questo prezzario: non confrontare direttamente con il punto presa Emilia-Romagna senza verificare il capitolato.",
        includes: "tubazione, cavi, scatola, supporto, apparecchio e placca secondo il capitolato FVG",
        excludes: "opere murarie",
        priceType: "corpo",
      },
      {
        id: "elettrico-posa-presa-scatola-predisposta-fvg",
        label: "Sola posa di presa in scatola predisposta",
        simpleLabel: "Solo montaggio della presa",
        plainExplanation: "Comprende la sola installazione in una scatola già predisposta. Materiali, tubazioni, scatola e linee devono essere già presenti.",
        category: "Esempi da un altro prezzario regionale (Friuli Venezia Giulia)",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "15,18 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Voce di sola posa: non include materiali, tubo o scatola, già presenti. Non va fusa con la voce di punto presa completo qui sopra.",
        includes: "montaggio dell'apparecchio in una scatola già predisposta",
        excludes: "materiali, tubazione, scatola, cavi e assistenza muraria",
        priceType: "manodopera",
      },
      {
        id: "elettrico-magnetotermico-differenziale",
        label: "Magnetotermico differenziale",
        simpleLabel: "Singolo interruttore di protezione",
        plainExplanation: "È un dispositivo installato dentro il quadro. Non comprende l'intero quadro, gli altri interruttori, il cablaggio o la configurazione.",
        categoryNote: "Questi valori riguardano singoli componenti o carpenterie e non rappresentano il costo di un quadro elettrico completo, cablato e configurato.",
        category: "Singoli componenti del quadro, non quadro completo",
        unit: "cadauno",
        unitLabel: "per dispositivo",
        range: "173,32 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025.",
        includes: "fornitura e posa in opera del dispositivo nel quadro",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        id: "elettrico-centralino-incasso-6-moduli",
        label: "Centralino da incasso vuoto, 6 moduli",
        simpleLabel: "Contenitore vuoto del quadro elettrico (6 posti)",
        plainExplanation: "È la sola scatola che ospita i dispositivi. Non comprende magnetotermici, differenziali, cablaggio e configurazione.",
        technicalCode: "E.02.13.20.001",
        category: "Singoli componenti del quadro, non quadro completo",
        unit: "cadauno",
        unitLabel: "per contenitore",
        range: "66,61 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025. Involucro vuoto, non un quadro cablato: il prezzo del centralino comprende le verifiche dell'involucro stesso, non del quadro completato.",
        includes: "fornitura e posa dell'involucro da incasso",
        excludes: "magnetotermici, differenziali, cablaggio e frontalino",
        priceType: "corpo",
      },
      {
        id: "elettrico-centralino-incasso-12-moduli",
        label: "Centralino da incasso vuoto, 12 moduli",
        simpleLabel: "Contenitore vuoto del quadro elettrico (12 posti)",
        plainExplanation: "È la sola scatola che ospita i dispositivi. Non comprende magnetotermici, differenziali, cablaggio e configurazione.",
        category: "Singoli componenti del quadro, non quadro completo",
        unit: "cadauno",
        unitLabel: "per contenitore",
        range: "85,57 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025. Involucro vuoto, non un quadro cablato.",
        includes: "fornitura e posa dell'involucro da incasso",
        excludes: "magnetotermici, differenziali, cablaggio e frontalino",
        priceType: "corpo",
      },
      {
        id: "elettrico-blocco-differenziale-base",
        label: "Blocco differenziale, configurazione base",
        simpleLabel: "Componente di protezione differenziale",
        plainExplanation: "È un singolo componente o gruppo di protezione da installare nel quadro. Non rappresenta il prezzo del quadro completo.",
        category: "Singoli componenti del quadro, non quadro completo",
        unit: "cadauno",
        unitLabel: "per dispositivo",
        range: "151,66 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025.",
        includes: "fornitura e posa in opera del blocco differenziale",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        id: "elettrico-blocco-differenziale-intermedia",
        label: "Blocco differenziale, configurazione intermedia",
        simpleLabel: "Componente di protezione differenziale",
        plainExplanation: "È un singolo componente o gruppo di protezione da installare nel quadro. Non rappresenta il prezzo del quadro completo.",
        category: "Singoli componenti del quadro, non quadro completo",
        unit: "cadauno",
        unitLabel: "per dispositivo",
        range: "184,87 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025.",
        includes: "fornitura e posa in opera del blocco differenziale",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        id: "elettrico-blocco-differenziale-maggiorata",
        label: "Blocco differenziale, configurazione maggiorata",
        simpleLabel: "Componente di protezione differenziale",
        plainExplanation: "È un singolo componente o gruppo di protezione da installare nel quadro. Non rappresenta il prezzo del quadro completo.",
        category: "Singoli componenti del quadro, non quadro completo",
        unit: "cadauno",
        unitLabel: "per dispositivo",
        range: "281,37 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025.",
        includes: "fornitura e posa in opera del blocco differenziale",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        id: "elettrico-traccia-muratura-mattoni-forati",
        label: "Traccia su muratura in mattoni forati",
        simpleLabel: "Apertura e chiusura del muro per i cavi — mattoni forati",
        plainExplanation: "Prezzo per metro di traccia. Può aggiungersi alle lavorazioni elettriche quando occorre aprire il muro: a differenza delle varianti di dorsale, questa voce è complementare e si somma ai punti a cui serve.",
        technicalCode: "B01.013",
        category: "Opere murarie",
        unit: "al metro",
        unitLabel: "per metro di traccia",
        range: "15,92 € al metro",
        note: "Prezzario Regione Emilia-Romagna 2025, capitolato generale edilizia (non specifico dell'impiantistica elettrica), fino a 100 cmq di sezione.",
        includes: "apertura, chiusura e avvicinamento delle macerie, quando previsto",
        excludes: "intonaco, rasatura, tinteggiatura, trasporto e smaltimento delle macerie",
        priceType: "manodopera",
      },
      {
        id: "elettrico-traccia-muratura-mattoni-pieni",
        label: "Traccia su muratura in mattoni pieni",
        simpleLabel: "Apertura e chiusura del muro per i cavi — mattoni pieni",
        plainExplanation: "Prezzo per metro di traccia su una muratura più impegnativa da lavorare.",
        technicalCode: "B01.010.020",
        category: "Opere murarie",
        unit: "al metro",
        unitLabel: "per metro di traccia",
        range: "20,61 € al metro",
        note: "Prezzario Regione Emilia-Romagna 2025, capitolato generale edilizia (non specifico dell'impiantistica elettrica), fino a 100 cmq di sezione.",
        includes: "apertura, chiusura e avvicinamento delle macerie, quando previsto",
        excludes: "intonaco, rasatura, tinteggiatura, trasporto e smaltimento delle macerie",
        priceType: "manodopera",
      },
    ],
    sizeExamples: [
      {
        label: "Impianto per 50 mq",
        sizeRange: "50 mq",
        range: "da 2.250 € a 4.000 €",
        note: "Calcolo: 50 mq × 45–80 €/mq. Su un appartamento piccolo il costo al mq può risultare più alto: quadro, nuova uscita, verifiche e lavorazioni minime non diminuiscono in proporzione alla superficie.",
      },
      {
        label: "Impianto per 80 mq",
        sizeRange: "80 mq",
        range: "da 3.600 € a 6.400 €",
        note: "Calcolo: 80 mq × 45–80 €/mq.",
      },
      {
        label: "Impianto per 100 mq",
        sizeRange: "100 mq",
        range: "da 4.500 € a 8.000 €",
        note: "Calcolo: 100 mq × 45–80 €/mq.",
      },
      {
        label: "Impianto per 150 mq",
        sizeRange: "150 mq",
        range: "da 6.750 € a 12.000 €",
        note: "Calcolo: 150 mq × 45–80 €/mq.",
      },
    ],
  },
  // Fascia 60–120 €/mq: elaborazione orientativa da confronto di mercato
  // nazionale 2026 (stesso metodo di rifare-tetto/ristrutturare-bagno), NON
  // una voce di un prezzario. Prezzario Regione Siciliana 2024 (vigente fino
  // al 31/12/2026) autorizzato come fonte SOLO per singole lavorazioni
  // realmente verificabili: il PDF ufficiale (regione.sicilia.it, sia
  // "Prezzario 2024.pdf" sia "prezzario 2024 definitivo.pdf") ha risposto
  // 404 a ogni tentativo di download in questa sessione (verificato anche
  // dalla pagina "prezziario-vigente" stessa, che lo linka con lo stesso URL
  // non raggiungibile): nessuna voce di quel prezzario è quindi citata qui,
  // per non rischiare un codice o un prezzo inventato. sourceType "mixed"
  // come rifare-tetto: nessuna riga è un prezzo ufficiale puntuale verificato.
  "costGuide:rifare-facciata": {
    nationalRange: "60–120 € al mq",
    pricePerSquareMeter: "da 60 € a 120 € al mq",
    // Etichetta onesta sulla natura del dato: il range 60–120 €/mq nasce da
    // un confronto di mercato nazionale, non da una voce del Prezzario
    // Sicilia (vedi commento sopra) — non deve leggersi come un prezzo
    // ufficiale di capitolato.
    sourceLabel: "Confronto di mercato nazionale",
    sourceYear: "2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "facciata-rifacimento-ordinario",
        label: "Rifacimento ordinario della facciata, senza cappotto né interventi strutturali",
        category: "Rifacimento ordinario della facciata",
        unit: "al mq",
        range: "da 60 € a 120 € al mq",
        note: "Stima elaborata da confronto di mercato nazionale 2026: nessun prezzario pubblico quota un pacchetto unico per il rifacimento ordinario della facciata.",
        includes: "rimozione delle parti di intonaco ammalorato, preparazione del supporto, ripristino dell'intonaco nelle zone rimosse, rasatura, finitura e tinteggiatura",
        excludes: "ponteggio, cappotto termico, consolidamenti strutturali importanti, restauro specialistico o storico, ripristino di balconi, ballatoi e frontalini",
        confidence: "media",
        priceType: "corpo",
      },
      // Nessuna di queste voci ha un numero verificato da fonti di settore
      // (a differenza della riga sopra): restano qualitative sotto "Da
      // valutare", stesso pattern delle righe non quotabili di rifare-tetto —
      // mai un numero o un tetto massimo inventato.
      {
        id: "facciata-ponteggio",
        label: "Ponteggio",
        category: "Da valutare con il professionista",
        categoryNote: "Queste voci non hanno una fascia in euro affidabile senza un sopralluogo: sono lavorazioni diverse dal rifacimento ordinario qui sopra, o fattori che dipendono dal singolo cantiere.",
        range: "variabile in base ad altezza, accesso e durata del cantiere",
        note: "Non è compreso nella fascia 60–120 €/mq: viene spesso quotato come voce separata nel preventivo.",
      },
      {
        id: "facciata-cappotto-termico",
        label: "Cappotto termico della facciata",
        category: "Da valutare con il professionista",
        range: "da valutare con il professionista",
        note: "Intervento di isolamento termico, distinto dal rifacimento ordinario: comporta lavorazioni, spessori e costi propri.",
      },
      {
        id: "facciata-consolidamento-strutturale",
        label: "Consolidamento strutturale della facciata",
        category: "Da valutare con il professionista",
        range: "da valutare con il professionista",
        note: "Necessario quando ci sono problemi strutturali importanti, non un semplice ripristino di intonaco e finitura.",
      },
      {
        id: "facciata-restauro-specialistico",
        label: "Restauro specialistico o facciata storica/vincolata",
        category: "Da valutare con il professionista",
        range: "da valutare con il professionista",
        note: "Richiede tecniche e materiali specifici, spesso con vincoli della soprintendenza: non rientra nella fascia ordinaria.",
      },
      {
        id: "facciata-ripristino-balconi",
        label: "Ripristino di balconi, ballatoi e frontalini",
        category: "Da valutare con il professionista",
        range: "da valutare con il professionista",
        note: "Interventi distinti sulla struttura di balconi, ballatoi e frontalini, non compresi nella fascia facciata.",
      },
    ],
    sizeExamples: [
      {
        label: "Facciata da 100 mq",
        sizeRange: "100 mq",
        range: "da 6.000 € a 12.000 €",
        note: "Calcolo: 100 mq × 60–120 €/mq.",
      },
      {
        label: "Facciata da 200 mq",
        sizeRange: "200 mq",
        range: "da 12.000 € a 24.000 €",
        note: "Calcolo: 200 mq × 60–120 €/mq.",
      },
      {
        label: "Facciata da 300 mq",
        sizeRange: "300 mq",
        range: "da 18.000 € a 36.000 €",
        note: "Calcolo: 300 mq × 60–120 €/mq.",
      },
    ],
  },
};

export function getBasePriceRange(familyKey: string): BasePriceRange | null {
  return basePriceRangesByFamily[familyKey] ?? null;
}

const PRICE_ROW_ID_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Invarianti strutturali dell'SSOT dei prezzi (Scope 1C). Parametrizzata
 * (non legge direttamente `basePriceRangesByFamily`) per restare testabile
 * con fixture sintetiche, senza toccare i dati reali — vedi la chiamata più
 * sotto, che la esegue una sola volta sui dati di produzione al
 * caricamento del modulo.
 *
 * Verifica SOLO l'infrastruttura introdotta da questo Scope:
 * - ogni PriceRow ha un `id`, kebab-case, univoco sull'INTERA SSOT (non solo
 *   dentro la propria famiglia);
 * - ogni `relations[].target` esiste ed appartiene alla stessa famiglia
 *   della riga che lo dichiara, nessuna riga punta a se stessa, nessuna
 *   relation duplicata (stesso type+target) sulla stessa riga;
 * - una riga con `role: "extra"` che dichiara `relations` ne ha almeno una
 *   di tipo "addsTo".
 *
 * Deliberatamente NON richiede che `costType`/`role`/`priceStatus`/
 * `relations` siano compilati: la migrazione dei dati legacy resta
 * progressiva, questo Scope introduce solo l'infrastruttura (vedi il
 * commento di deprecazione su `priceType` in PriceRow).
 */
export function validatePriceRowIntegrity(
  byFamily: Record<string, BasePriceRange>,
): void {
  const idToFamily = new Map<string, string>();

  for (const [familyKey, range] of Object.entries(byFamily)) {
    for (const row of range.priceRows) {
      if (!row.id) {
        throw new Error(
          `PriceRow "${row.label}" in family "${familyKey}" has no id: every PriceRow must declare a stable id.`,
        );
      }
      if (!PRICE_ROW_ID_PATTERN.test(row.id)) {
        throw new Error(
          `PriceRow id "${row.id}" (family "${familyKey}") is not valid kebab-case.`,
        );
      }

      const existingFamily = idToFamily.get(row.id);
      if (existingFamily) {
        throw new Error(
          existingFamily === familyKey
            ? `Duplicate PriceRow id "${row.id}" within family "${familyKey}".`
            : `PriceRow id "${row.id}" is used in both "${existingFamily}" and "${familyKey}": ids must be globally unique across the whole SSOT.`,
        );
      }
      idToFamily.set(row.id, familyKey);
    }
  }

  for (const [familyKey, range] of Object.entries(byFamily)) {
    for (const row of range.priceRows) {
      const relations = row.relations ?? [];
      const seenRelations = new Set<string>();

      for (const relation of relations) {
        const relationKey = `${relation.type}:${relation.target}`;
        if (seenRelations.has(relationKey)) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares the relation "${relationKey}" more than once.`,
          );
        }
        seenRelations.add(relationKey);

        if (relation.target === row.id) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares a relation targeting itself.`,
          );
        }

        const targetFamily = idToFamily.get(relation.target);
        if (!targetFamily) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares a relation targeting unknown id "${relation.target}".`,
          );
        }
        if (targetFamily !== familyKey) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares a relation targeting "${relation.target}", which belongs to family "${targetFamily}": relation targets must belong to the same family.`,
          );
        }
      }

      if (row.role === "extra" && relations.length > 0) {
        const hasAddsTo = relations.some((relation) => relation.type === "addsTo");
        if (!hasAddsTo) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") has role "extra" and declares relations, but none is "addsTo".`,
          );
        }
      }
    }
  }
}

// Fail-fast a caricamento del modulo, una sola volta: qualunque pagina che
// importa questo file (via pricing-resolver.ts -> compose-cost-guide.ts)
// beneficia della stessa garanzia, senza rivalidare a ogni render.
validatePriceRowIntegrity(basePriceRangesByFamily);

/**
 * Interroga la relazione "alternativeTo" trattandola come simmetrica, senza
 * richiedere che l'SSOT la duplichi in entrambe le direzioni (vedi
 * PriceRowRelationType): vero se `a` dichiara `alternativeTo` verso `b`, O
 * se `b` dichiara `alternativeTo` verso `a`. `rows` deve essere l'array
 * `priceRows` di UNA sola famiglia (le relazioni non attraversano famiglie,
 * vedi validatePriceRowIntegrity).
 */
export function isAlternativeTo(
  rows: readonly PriceRow[],
  a: PriceRowId,
  b: PriceRowId,
): boolean {
  const declaresAlternative = (fromId: PriceRowId, toId: PriceRowId): boolean =>
    rows.some(
      (row) =>
        row.id === fromId &&
        (row.relations ?? []).some(
          (relation) => relation.type === "alternativeTo" && relation.target === toId,
        ),
    );

  return declaresAlternative(a, b) || declaresAlternative(b, a);
}
