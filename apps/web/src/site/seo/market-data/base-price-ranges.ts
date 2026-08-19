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
  // Micro-fix 2026-08 (cost-guide-price-model.ts, condiviso — non dati):
  // isGuideScenarioRow riconosceva uno scenario/primary SOLO con
  // `unit === "a corpo"`, escludendo SEMPRE questa guida dalle sezioni
  // "Scenari"/"Cosa comprende" nonostante role/costType corretti — un tetto
  // non ha una "metratura standard" come il bagno (5-6 mq), il prezzo scala
  // sempre con la superficie, "a corpo" sarebbe stato un numero inventato.
  // Il vincolo sull'unità è stato rimosso dal classificatore condiviso (vedi
  // il commento di revisione su isGuideScenarioRow in
  // templates/cost-guide-price-model.ts): i 4 scenari qui sotto vengono ora
  // promossi alla sezione Scenari/Cosa-comprende, le 4 righe restanti
  // ("Lavorazioni specifiche") restano nel Breakdown come sempre. Effetto
  // collaterale verificato (nessuna azione richiesta): il `categoryNote`
  // qui sotto ("Questi quattro scenari...") non ha più un gruppo Breakdown
  // da introdurre per queste righe (promosse fuori dal Breakdown) e
  // CostScenarioCards non legge `categoryNote` — quel testo non compare più
  // da nessuna parte della pagina. Non è una perdita di contenuto grave: la
  // sezione Scenari ha già un'intro fissa propria ("Scegli lo scenario più
  // vicino al tuo caso") con lo stesso messaggio; il `categoryNote` resta
  // nella SSOT solo come documentazione interna.
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
  // Nessuna dipendenza da isGuideScenarioRow qui: nessuna riga usa role
  // "scenario"/"primary" in questa guida — le 5 nuove impermeabilizzazioni
  // sono semplicemente lavorazioni autonome parallele, mai pensate per la UI
  // "Scenari". (Micro-fix 2026-08: il vincolo `unit === "a corpo"` di quel
  // classificatore, citato qui in una revisione precedente di questo
  // commento, è stato rimosso — vedi templates/cost-guide-price-model.ts.
  // Non cambia nulla per questa guida, che non assegna role scenario/primary
  // a nessuna riga per scelta editoriale, non per il vecchio limite tecnico.)
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
  // Micro-fix 2026-08 (verifica esplicita): il commento precedente diceva
  // "resta publicationStatus 'draft'... non pubblica finché il lifecycle non
  // cambia stato" — DISALLINEATO dalla realtà. packages/taxonomy/src/frozen/
  // source/project-groups/facciate-e-balconi.ts dichiara oggi
  // publicationStatus "published" per "impermeabilizzare-terrazzo" (audit
  // dedicato già completato in una fase precedente, non in questa
  // revisione), e getCostGuideStaticParams() la include già correttamente
  // (verificato direttamente: 6/6 Cost Guide generate, questa inclusa). La
  // guida è quindi già pubblica — il commento draft era solo testo rimasto
  // indietro rispetto a quella decisione, mai più aggiornato. Non toccare
  // publicationStatus da qui: resta un campo della SSOT taxonomy, non di
  // questo file — qui si corregge solo il commento, nessun comportamento
  // cambia.
  //
  // Nota separata (fuori perimetro di questo micro-fix, non un blocker per
  // QUESTA guida): packages/taxonomy/src/frozen/publication-status.test.ts e
  // .../queries/publication-lifecycle.integration.test.ts assumono ancora
  // "impermeabilizzare-terrazzo" come L'esempio canonico di intervento
  // draft — 3 test attualmente falliscono contro il dato reale "published".
  // Pre-esistente, non introdotto da questa revisione (mai toccato
  // packages/taxonomy in questo lavoro); next build/apps/web non esegue
  // quella suite, quindi non blocca il build di questo sito, ma resta un
  // test rosso da sistemare a parte.
  //
  // Revisione 2026-08 (richiesta editoriale esplicita): la guida aveva UNA
  // sola riga quotata (30–70 €/mq, "priceType: corpo", nessun costType/unit
  // "a corpo" — un pacchetto misto poco realistico chiamato "standard") più
  // due righe qualitative generiche sotto "Da valutare con il
  // professionista". Troppo vaga per rispondere a "quale sistema scegliere
  // per impermeabilizzare un terrazzo e perché i prezzi sono così diversi
  // tra loro?": un terrazzo può essere impermeabilizzato con sistemi molto
  // diversi (da ricoprire con un pavimento, da lasciare a vista, pensati per
  // un traffico leggero o per l'uso pedonale normale), non con un'unica
  // lavorazione indistinta. Sostituita con 11 righe:
  // - 8 sistemi di impermeabilizzazione (category "Sistemi di
  //   impermeabilizzazione"), tutti costType "complete" (materiale + posa
  //   non scorporati con certezza dalle fonti, stesso criterio delle 5
  //   guaine di impermeabilizzare-tetto): cementizia sotto pavimento 20–35,
  //   impermeabilizzante trasparente sopra piastrelle 45–75, resina
  //   calpestabile a vista 50–90, guaina liquida a vista per traffico
  //   leggero 35–55, guaina bituminosa ardesiata a vista 25–45, doppia
  //   guaina bituminosa 35–55, membrana sintetica TPO/PVC 60–100, sistema ad
  //   alte prestazioni 70–120 €/mq. Nessuna relation tra loro (né
  //   "scenario", né "alternativeTo"): sono sistemi paralleli che
  //   differiscono per materiale/tecnologia e calpestabilità, non ampiezze
  //   diverse dello stesso intervento né modi alternativi di calcolare lo
  //   stesso lavoro — stesso principio già applicato alle 5 guaine di
  //   impermeabilizzare-tetto, che restano anch'esse senza role/relations
  //   tra loro pur essendo evidentemente variazioni dello stesso principio
  //   bituminoso (guaina ardesiata vs doppia guaina bituminosa qui sotto).
  // - 1 riparazione mirata (category "Riparazioni mirate", ex "Da valutare
  //   con il professionista"): "Riparazione localizzata di
  //   un'infiltrazione", priceStatus "quoteRequired", nessuna fascia in
  //   euro affidabile senza sopralluogo — stesso pattern già in uso per
  //   impermeabilizzare-tetto-ricerca-infiltrazione.
  // - 2 lavorazioni accessorie (category "Lavorazioni accessorie"),
  //   condizionali e non comprese nei sistemi qui sopra: demolizione e
  //   smaltimento del pavimento esistente 10–25 €/mq (costType "work":
  //   rimozione, movimentazione, trasporto, smaltimento, nessuna fornitura)
  //   e ripristino del massetto o delle pendenze 20–50 €/mq (costType
  //   "complete"). Nessuna delle due ha role "extra": pur essendo
  //   condizionali nell'uso reale, non hanno un target PriceRow univoco a
  //   cui si applicano sempre (possono precedere qualunque dei sistemi
  //   sotto-pavimento) — stesso principio già applicato dal micro-fix 2026-08
  //   di impermeabilizzare-tetto a "Preparazione e livellamento della
  //   superficie", che per lo stesso motivo non ha role "extra".
  //
  // sourceType resta "mixed": nessuna ancora ufficiale puntuale per singolo
  // sistema è stata reperita nel materiale a disposizione per questa
  // revisione (a differenza della guida gemella impermeabilizzare-tetto, che
  // ha un valore FVG puntuale per ogni guaina) — le 11 fasce restano
  // elaborazioni editoriali multi-fonte (confidence "media" ovunque sia
  // presente un prezzo), calibrate sull'osservazione aggregata già nota per
  // questa guida (lavorazioni semplici nell'ordine di 20–40 €/mq, sistemi
  // specialistici anche oltre 70–90 €/mq), non il prezzo puntuale di un
  // singolo prezzario. Se in futuro emergono ancore ufficiali più specifiche
  // per singolo sistema, andrebbero citate in nota al posto di questo
  // riferimento aggregato.
  //
  // Micro-fix 2026-08 (verifica esplicita): nationalRange resta 30–70 €/mq
  // — è la fascia orientativa di un'impermeabilizzazione STANDARD (materiale
  // + posa, condizioni ragionevoli), NON una media statistica calcolata tra
  // gli 8 sistemi (nessuna media è stata calcolata). Alcuni sistemi partono
  // più in basso (cementizia sotto pavimento, 20 €/mq), altri arrivano più
  // in alto (sistema ad alte prestazioni, fino a 120 €/mq) — il range
  // completo dei sistemi è leggibile nella tabella priceRows, non nella sola
  // fascia Hero. NON è il range 120–300 €/mq di rifare-tetto: quella fascia
  // riguarda il
  // rifacimento completo (demolizione, massetto, nuova pavimentazione),
  // fuori perimetro da questa guida per esplicita decisione editoriale.
  //
  // isGuideScenarioRow (templates/cost-guide-price-model.ts): nessuna riga
  // di questa famiglia usa role "scenario"/"primary" — la scelta editoriale
  // è di NON assegnarlo agli 8 sistemi, perché non sono ampiezze diverse
  // dello stesso intervento (quello giustificherebbe "scenario") ma
  // sistemi paralleli per materiale/tecnologia — la sezione "Scenari" del
  // template non si attiva per questa guida, tutte le righe restano nel
  // Breakdown raggruppate per category (da qui i due categoryNote sotto).
  //
  // id: 2 riusati con il prefisso corto legacy "terrazzo-" (nessun
  // riferimento esterno secondo il grep di verifica — stessa identità di
  // riga, solo perimetro/label affinati, non un concetto nuovo):
  // "terrazzo-sistema-complesso" (da riga qualitativa "oltre 70 €/mq senza
  // massimo" a riga quotata 70–120 €/mq) e "terrazzo-riparazione-localizzata"
  // (da riga qualitativa generica a riparazione mirata con perimetro più
  // preciso). 9 id nuovi con il prefisso completo "impermeabilizzare-
  // terrazzo-", coerente con la convenzione già in uso su tutte le righe
  // della guida gemella impermeabilizzare-tetto. 1 id rimosso:
  // "terrazzo-impermeabilizzazione-standard" (sostituito dagli 8 sistemi
  // paralleli, nessun riferimento esterno secondo il grep di verifica,
  // rimozione sicura).
  "costGuide:impermeabilizzare-terrazzo": {
    nationalRange: "30–70 € al mq",
    pricePerSquareMeter: "da 30 € a 70 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "impermeabilizzare-terrazzo-cementizia-sotto-pavimento",
        label: "Impermeabilizzazione cementizia sotto pavimento",
        category: "Sistemi di impermeabilizzazione",
        categoryNote: "Questi sistemi sono modi alternativi di impermeabilizzare il terrazzo: scegli quello più adatto al tuo caso, non sommare le fasce tra loro. Non tutti sono calpestabili come una vera pavimentazione: alcuni vanno protetti da un pavimento o da un massetto sopra di loro, altri tollerano solo un'ispezione o un traffico leggero, altri ancora sono pensati per il normale utilizzo pedonale del terrazzo — la differenza è spiegata in ogni voce.",
        unit: "al mq",
        range: "da 20 € a 35 € al mq",
        plainExplanation: "È un sistema impermeabilizzante cementizio applicato sotto la finitura finale: va steso sul massetto oppure, quando tecnicamente possibile, in sovrapposizione a un pavimento esistente stabile, prima della posa del nuovo rivestimento. Non è pensato per restare a vista né per essere calpestato direttamente.",
        note: "Fascia editoriale Esigenta elaborata confrontando i prezzari regionali ufficiali 2025–2026 (Emilia-Romagna, Friuli Venezia Giulia, Sicilia) con il mercato nazionale (Instapro, Edilnet, Homedeal e altre fonti tecniche): nessun prezzario pubblico consultato quota un pacchetto specifico per questo sistema, la fascia riflette l'osservazione generale delle fonti su lavorazioni di impermeabilizzazione più semplici (circa 20–40 €/mq), non il prezzo puntuale di una singola fonte.",
        includes: "fornitura del prodotto cementizio e posa a sistema, compreso il trattamento di raccordi e angoli",
        excludes: "nuova pavimentazione o rivestimento finale, demolizione del pavimento esistente quando necessaria, ripristino del massetto o correzione delle pendenze quando necessari",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-terrazzo-trasparente-sopra-piastrelle",
        label: "Impermeabilizzante trasparente sopra piastrelle",
        category: "Sistemi di impermeabilizzazione",
        unit: "al mq",
        range: "da 45 € a 75 € al mq",
        plainExplanation: "È una soluzione per terrazzi pavimentati quando le piastrelle esistenti sono stabili e ben ancorate: mantiene visibile il pavimento sottostante e, quando si usa un prodotto progettato per questo impiego, può costituire una superficie pedonabile. Non è applicabile su qualunque pavimento: distacchi, fessure importanti, problemi del massetto o pendenze errate possono richiedere un intervento diverso.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida (prezzari regionali 2025–2026 e mercato nazionale): nessuna fonte quota un prezzo puntuale per questo specifico sistema applicato sopra una pavimentazione esistente, la fascia è un'elaborazione per committenza privata.",
        includes: "fornitura del prodotto impermeabilizzante trasparente e posa a sistema sopra la pavimentazione esistente",
        excludes: "rimozione o sostituzione delle piastrelle, ripristino del massetto o correzione delle pendenze quando necessari",
        confidence: "media",
        costType: "complete",
      },
      // Micro-fix 2026-08 (verifica esplicita): plainExplanation di questa
      // riga e di "terrazzo-sistema-complesso" più sotto rese esplicitamente
      // distinte — potendosi sovrapporre economicamente (50–90 vs 70–120
      // €/mq), il rischio era che la seconda leggesse come "la stessa resina
      // ma più cara". Ora ciascuna cita esplicitamente l'altra e la
      // differenza chimica/prestazionale concreta, non solo il prezzo.
      {
        id: "impermeabilizzare-terrazzo-resina-calpestabile-vista",
        label: "Resina impermeabilizzante calpestabile a vista",
        category: "Sistemi di impermeabilizzazione",
        unit: "al mq",
        range: "da 50 € a 90 € al mq",
        plainExplanation: "È un ciclo resinoso — poliuretanico, PMMA o sistemi equivalenti — progettato espressamente come impermeabilizzazione continua e insieme come finitura finale del terrazzo: pensato per il normale traffico pedonale di un'abitazione, con la possibilità di una finitura antiscivolo quando il sistema la prevede. È una voce distinta sia da una semplice guaina liquida (perimetro più semplice, qui sotto) sia dai sistemi specialistici ad alte prestazioni in poliurea (in tabella più sotto), pensati per esigenze diverse dal normale uso residenziale.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida: nessun prezzario pubblico consultato distingue un sistema resinoso calpestabile a vista come voce a sé, la fascia riflette l'osservazione generale delle fonti sui sistemi più evoluti/specialistici (oltre 70–90 €/mq nella fascia alta), qui estesa verso il basso per coprire anche cicli resinosi più semplici ma comunque calpestabili.",
        includes: "fornitura del ciclo resinoso e posa, compresa la finitura superficiale (anche antiscivolo, quando prevista dal sistema scelto)",
        excludes: "ripristino del massetto o correzione delle pendenze quando necessari, demolizione della pavimentazione esistente",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-terrazzo-guaina-liquida-traffico-leggero",
        label: "Guaina liquida a vista per traffico leggero",
        category: "Sistemi di impermeabilizzazione",
        unit: "al mq",
        range: "da 35 € a 55 € al mq",
        plainExplanation: "Distingue i rivestimenti impermeabilizzanti esposti che tollerano ispezione, manutenzione o un traffico pedonale leggero dai veri sistemi calpestabili per uso normale (riga sopra): non è una pavimentazione pensata per l'uso quotidiano del terrazzo.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida, posizionata tra i sistemi da ricoprire e i sistemi calpestabili: nessuna fonte quota separatamente una guaina liquida a traffico leggero rispetto a un ciclo calpestabile a uso normale.",
        includes: "fornitura del rivestimento impermeabilizzante liquido e posa in opera",
        excludes: "ripristino del massetto o correzione delle pendenze quando necessari, demolizione della pavimentazione esistente",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-terrazzo-guaina-ardesiata-vista",
        label: "Guaina bituminosa ardesiata a vista",
        category: "Sistemi di impermeabilizzazione",
        unit: "al mq",
        range: "da 25 € a 45 € al mq",
        plainExplanation: "È una guaina bituminosa con una finitura minerale (ardesiata) che resta a vista: indicata soprattutto per lastrici solari, terrazzi non utilizzati come vero spazio abitabile o superfici destinate principalmente a manutenzione e ispezione — non equivalente a una pavimentazione calpestabile.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida: nessuna delle fonti consultate per l'impermeabilizzazione del terrazzo quota un prezzo puntuale per questo sistema in questo contesto applicativo (a differenza della guida gemella sul tetto, che ha un'ancora ufficiale specifica riferita alla copertura inclinata, non riportata qui perché il contesto applicativo è diverso).",
        includes: "fornitura della membrana bituminosa ardesiata e posa in opera",
        excludes: "rimozione della vecchia impermeabilizzazione quando presente, massetto di protezione o pavimentazione sovrastante, ripristino del massetto o correzione delle pendenze quando necessari",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-terrazzo-doppia-guaina-bituminosa",
        label: "Impermeabilizzazione con doppia guaina bituminosa",
        category: "Sistemi di impermeabilizzazione",
        unit: "al mq",
        range: "da 35 € a 55 € al mq",
        plainExplanation: "È lo stesso principio della guaina bituminosa ardesiata qui sopra, realizzato con due membrane sovrapposte invece di una, per una tenuta all'acqua maggiore utile su superfici più esposte o con pendenze minime. Anche questo sistema resta a vista e non è una pavimentazione calpestabile per l'uso quotidiano: valgono le stesse indicazioni della guaina ardesiata qui sopra. Un eventuale massetto di protezione, una pavimentazione o altri quadrotti sopra la guaina restano lavorazioni separate, non comprese qui salvo diverso capitolato.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida: il sistema a doppia membrana comporta un maggiore impiego di materiale e tempo di posa rispetto alla guaina ardesiata a singolo strato (riga precedente), da cui la fascia leggermente più alta.",
        includes: "fornitura delle due membrane bituminose e posa in opera",
        excludes: "massetto di protezione, pavimentazione, quadrotti o altra finitura pedonabile sovrastante salvo diverso capitolato, ripristino del massetto o correzione delle pendenze quando necessari",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "impermeabilizzare-terrazzo-membrana-sintetica-tpo-pvc",
        label: "Membrana sintetica TPO/PVC",
        category: "Sistemi di impermeabilizzazione",
        unit: "al mq",
        range: "da 60 € a 100 € al mq",
        plainExplanation: "È una membrana sintetica (TPO o PVC) termosaldata, la soluzione più tipica su grandi superfici piane, lastrici e terrazze o coperture di questo tipo: rappresenta lo strato impermeabilizzante, non una pavimentazione finale pensata per il normale utilizzo pedonale del terrazzo. Su terrazzi abitabili va di norma protetta da una pavimentazione o da un'altra finitura pedonabile sopra di lei; su lastrici o coperture non abitate può restare esposta.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida: nessuna fonte consultata quota specificamente una membrana sintetica TPO/PVC su terrazzo residenziale, la fascia riflette l'osservazione generale delle fonti sui sistemi più evoluti (oltre 70–90 €/mq nella fascia alta) estesa verso il basso per coprire configurazioni di posa più semplici.",
        includes: "fornitura della membrana sintetica e posa con saldatura dei giunti",
        excludes: "pavimentazione o finitura pedonabile sovrastante quando prevista dal caso d'uso, ripristino del massetto o correzione delle pendenze quando necessari",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "terrazzo-sistema-complesso",
        label: "Sistema impermeabilizzante ad alte prestazioni",
        category: "Sistemi di impermeabilizzazione",
        unit: "al mq",
        range: "da 70 € a 120 € al mq",
        plainExplanation: "Comprende sistemi in poliurea o resine specialistiche, chimicamente diversi dal ciclo poliuretanico/PMMA della resina calpestabile standard qui sopra: pensati per interventi che richiedono prestazioni superiori, come maggiore resistenza all'usura o agli agenti chimici, tempi di applicazione e indurimento più rapidi, o cicli tecnici più complessi. Non è semplicemente la stessa resina calpestabile a un prezzo più alto: il sistema specifico, la preparazione del fondo e la modalità applicativa incidono molto sul preventivo, e non è una fascia universale valida per qualunque configurazione.",
        note: "Fascia editoriale Esigenta: la guida originale (2026-08) osservava, confrontando i prezzari regionali ufficiali con il mercato nazionale, che i sistemi specialistici possono superare 70–90 €/mq senza un tetto definito; questa revisione rende quell'osservazione concreta con una fascia superiore definita (70–120 €/mq) invece di lasciarla aperta, restando comunque un'elaborazione editoriale multi-fonte, non il prezzo puntuale di un singolo prezzario.",
        includes: "fornitura del sistema scelto (poliurea o resina specialistica) e posa a ciclo completo, secondo la preparazione del fondo richiesta",
        excludes: "ripristino del massetto o correzione delle pendenze quando necessari, pavimentazione finale quando non prevista dal sistema",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "terrazzo-riparazione-localizzata",
        label: "Riparazione localizzata di un'infiltrazione",
        category: "Riparazioni mirate",
        unit: "a intervento",
        unitLabel: "per intervento",
        range: "da valutare con il professionista",
        plainExplanation: "È l'intervento mirato per trovare e riparare una perdita isolata — uno scarico, un bocchettone, una soglia, un giunto, un raccordo o una piccola zona deteriorata — senza rifare l'impermeabilizzazione dell'intera superficie.",
        note: "Può riguardare uno scarico, un bocchettone, una soglia, un giunto, un raccordo o una piccola zona deteriorata. Per lavori di questo tipo il prezzo al mq è poco significativo: esistono costi minimi di intervento, diagnosi e manodopera che non scendono sotto una certa soglia anche per un danno piccolo.",
        includes: "ricerca del punto di perdita ed eliminazione, secondo l'estensione del danno",
        excludes: "impermeabilizzazione dell'intera superficie (vedi i sistemi qui sopra), demolizione o ripristino del pavimento quando l'estensione del danno lo richiede",
        priceStatus: "quoteRequired",
      },
      {
        id: "impermeabilizzare-terrazzo-demolizione-pavimento-esistente",
        label: "Demolizione e smaltimento del pavimento esistente",
        category: "Lavorazioni accessorie",
        categoryNote: "Queste lavorazioni non sono comprese nei sistemi di impermeabilizzazione qui sopra: si aggiungono solo quando le condizioni del tuo terrazzo lo richiedono, non in ogni intervento.",
        unit: "al mq",
        range: "da 10 € a 25 € al mq",
        plainExplanation: "Serve solo quando il pavimento esistente va rimosso prima di applicare il sistema scelto: non è compresa automaticamente nei sistemi pensati per essere applicati sopra la pavimentazione esistente (impermeabilizzante trasparente, guaina liquida a traffico leggero) elencati qui sopra.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida (prezzari regionali 2025–2026 e mercato nazionale): comprende rimozione, movimentazione, trasporto e smaltimento del pavimento esistente, non un prezzo ufficiale puntuale.",
        includes: "rimozione della pavimentazione esistente, movimentazione, trasporto e smaltimento del materiale di risulta",
        // "nuova pavimentazione o impermeabilizzazione" e non "materiali
        // esclusi": la parola "materiali" fa scattare per costruzione il
        // badge "Materiali esclusi" su costType "work" (describeCostTypeBadge,
        // templates/cost-guide-price-model.ts) — corretto quando significa
        // "fornitura esclusa", fuorviante qui (una demolizione non ha
        // comunque materiali da fornire). Stesso bug reale già corretto su
        // impermeabilizzare-tetto-rimozione-smaltimento-guaina.
        excludes: "ripristino del massetto o correzione delle pendenze quando necessari (vedi voce dedicata), nuova pavimentazione o impermeabilizzazione",
        confidence: "media",
        costType: "work",
      },
      {
        id: "impermeabilizzare-terrazzo-ripristino-massetto-pendenze",
        label: "Ripristino del massetto o delle pendenze",
        category: "Lavorazioni accessorie",
        unit: "al mq",
        range: "da 20 € a 50 € al mq",
        plainExplanation: "Serve quando il massetto sottostante è deteriorato oppure l'acqua non defluisce correttamente verso gli scarichi: non è una lavorazione necessaria in ogni impermeabilizzazione, solo quando le condizioni della superficie esistente lo richiedono.",
        note: "Fascia editoriale Esigenta elaborata dalle stesse fonti generali di questa guida: il costo cambia molto in base all'estensione dell'intervento (una rasatura localizzata rispetto a una ricostruzione estesa del massetto) e alla correzione delle pendenze necessaria verso gli scarichi.",
        includes: "ricostruzione o rasatura del massetto e/o correzione delle pendenze verso gli scarichi",
        excludes: "demolizione del pavimento esistente quando necessaria (vedi voce dedicata), impermeabilizzazione e nuova pavimentazione",
        confidence: "media",
        costType: "complete",
      },
    ],
    sizeExamples: [
      {
        label: "Terrazzo da 20 mq",
        sizeRange: "20 mq",
        range: "da 600 € a 1.400 €",
        note: "Calcolo per un'impermeabilizzazione standard: 20 mq × 30–70 €/mq. Non rappresenta una resina calpestabile, un sistema in poliurea o un rifacimento completo del terrazzo. Nei terrazzi piccoli il costo al mq può risultare più alto: preparazione, accesso, raccordi, scarichi e i costi minimi di cantiere non diminuiscono proporzionalmente alla superficie.",
      },
      {
        label: "Terrazzo da 50 mq",
        sizeRange: "50 mq",
        range: "da 1.500 € a 3.500 €",
        note: "Calcolo per un'impermeabilizzazione standard: 50 mq × 30–70 €/mq. Non rappresenta una resina calpestabile, un sistema in poliurea o un rifacimento completo del terrazzo.",
      },
      {
        label: "Terrazzo da 100 mq",
        sizeRange: "100 mq",
        range: "da 3.000 € a 7.000 €",
        note: "Calcolo per un'impermeabilizzazione standard: 100 mq × 30–70 €/mq. Non rappresenta una resina calpestabile, un sistema in poliurea o un rifacimento completo del terrazzo.",
      },
    ],
  },
  // Revisione 2026-08 (Scope 1/2/3, richiesta editoriale esplicita): la
  // guida precedente era un prezzario per installatori travestito da Cost
  // Guide — 24 PriceRow, di cui 1 sola fascia editoriale (il Hero) e 23
  // prezzi ufficiali puntuali ER25/FVG25 senza alcuna gerarchia (nessun
  // role/costType compilato su nessuna riga, quindi classifyPriceRows
  // trattava l'intera guida come fallback: tutto in breakdown piatto).
  // Sostituita con un modello a 18 PriceRow interamente migrato
  // (costType/role/confidence su ogni riga prezzata): 1 primary + 2
  // scenario (Scope 2 §1) + 12 breakdown + 3 extra/quoteRequired, **0
  // reference** (correzione vincolante Scope 3: la sezione UI condivisa
  // "role: reference" ha una copy fissa — "Quando il costo può superare la
  // fascia standard" — pensata per valori-soglia tipo l'"oltre 12.000 €" del
  // bagno, non per dati tecnici di confronto capitolato: usarla per 6+
  // componenti del quadro sarebbe stato un uso improprio della sezione,
  // oltre a rischiare una lista ingestibile).
  //
  // - 3 SCENARI (categoria "Scenari di ampiezza del lavoro", mai da sommare
  //   tra loro): Rifacimento con canalizzazioni riutilizzabili (40–60 €/mq,
  //   role "scenario"), Rifacimento completo standard (55–90 €/mq, role
  //   "primary" — nuovo Hero, prima 45–80), Impianto più articolato / nuove
  //   linee diffuse (80–110 €/mq, role "scenario"). L'id
  //   "elettrico-rifacimento-completo" è RIUTILIZZATO per il primary
  //   (stessa identità evolutiva: "il pacchetto complessivo della guida",
  //   il perimetro non cambia natura, solo il range e la precisione del
  //   testo — diverso dal caso punto-luce/presa qui sotto).
  // - 6 PriceRow cliente NUOVE per punti/comandi/circuiti (nessun id
  //   riutilizzato dalle vecchie voci ufficiali punto luce/presa/comando:
  //   quelle escludevano SEMPRE la traccia, le nuove la comprendono —
  //   perimetro economico diverso, nuova identità economica per
  //   costruzione, non una rinomina): "Punto luce completo con un
  //   comando" (70–110 €), "Presa elettrica completa standard" (60–90 €),
  //   "Comando aggiuntivo (deviato/invertito)" (45–70 €, per aggiungere un
  //   comando a un punto luce già cablato, non per crearne uno nuovo),
  //   "Punto su predisposizione esistente" (25–45 €, solo quando
  //   scatola/corrugato sono già presenti), "Circuito interno standard"
  //   (200–300 €/circuito) e "Circuito dedicato / sezione maggiore"
  //   (250–400 €/circuito, sostituiscono visivamente le 5 vecchie dorsali
  //   tecniche 1,5/2,5/4/6/10 mmq — RIMOSSE come PriceRow, valori e fonte
  //   preservati nella `note` delle due nuove righe, non persi).
  // - 3 PriceRow NUOVE per il quadro elettrico completo, gap prima assente
  //   (nessuna vecchia riga rappresentava un quadro cablato e configurato,
  //   solo singoli componenti): "Quadro generale — circa 4/6/8–10 circuiti
  //   protetti" (500–800 / 650–1.000 / 850–1.400 €, materiale + posa).
  //   Deliberatamente NON scenari globali (`role` assente): sono una scelta
  //   interna al breakdown, non un'ampiezza dell'intero lavoro.
  //   `categoryNote` dedicata per chiarire moduli ≠ circuiti. Le 6 vecchie
  //   righe "Singoli componenti del quadro" (magnetotermico differenziale,
  //   2 centralini vuoti, 3 blocchi differenziali FVG) sono RIMOSSE come
  //   PriceRow — non trasformate in `role: "reference"` (vedi sopra) — i
  //   loro 6 valori, fonti e anni restano preservati per intero nella
  //   `note` della riga "Quadro generale — circa 4 circuiti".
  // - 2 righe traccia EVOLVONO IN PLACE (id riutilizzati:
  //   "elettrico-traccia-muratura-mattoni-forati"/"...-pieni"): stesso
  //   perimetro esatto di prima (apertura + chiusura grezza, finiture
  //   sempre escluse), solo il numero passa da prezzo ufficiale puntuale
  //   (15,92 €/20,61 € al metro, ER25) a fascia editoriale Esigenta
  //   (15–25 €/20–35 € al metro) — valori originali preservati in `note`.
  // - `elettrico-collegamento-equipotenziale` EVOLVE IN PLACE (id
  //   riutilizzato, prezzo e provenance ER25 invariati, 188,81 €): solo la
  //   label cambia in "Collegamento equipotenziale locale o di un vano" per
  //   escludere ulteriormente la lettura "rifacimento della messa a terra"
  //   (il `plainExplanation` lo negava già esplicitamente prima di questa
  //   revisione).
  // - 3 nuove righe `role: "extra"` + `priceStatus: "quoteRequired"`, NESSUN
  //   range inventato, NESSUNA relation forzata (né `addsTo` né altro:
  //   ognuna può applicarsi a qualunque dei 3 scenari, un `addsTo` verso
  //   tutti e tre non avrebbe aggiunto informazione utile — la UI condivisa
  //   "Cosa può far salire il prezzo" funziona correttamente anche senza
  //   relations dichiarate, verificato leggendo cost-guide-extras.tsx):
  //   "Ripristino estetico finale dopo le tracce" (intonaco/rasatura/
  //   tinteggiatura, non quotabile al metro perché la porzione di parete
  //   coinvolta varia), "Montante contatore → quadro appartamento" (gap già
  //   riconosciuto in una revisione precedente di questo commento: nessun
  //   codice di capitolato attribuibile con certezza), "Adeguamento /
  //   rifacimento impianto di terra" (intervento generale, distinto dal
  //   collegamento equipotenziale locale qui sopra). Nessuna delle tre ha
  //   `costType`: composizione manodopera/materiali non determinabile senza
  //   un caso reale, stesso trattamento già usato per
  //   `bagno-adeguamento-elettrico`.
  // - RIMOSSE come PriceRow, valore preservato in copy: le 3 righe "Esempi
  //   da un altro prezzario regionale (FVG)" (punto luce IP54 40,55 €,
  //   punto presa 79,12 €, sola posa 15,18 €) — erano già dichiarate "non
  //   alternative equivalenti" dal loro stesso categoryNote, quindi
  //   puramente illustrative: i valori restano citati nelle `note` delle
  //   righe cliente pertinenti (punto luce completo, presa completa, punto
  //   su predisposizione).
  //
  // Provenance: fasce editoriali Esigenta (sourceType "mixed", confidence
  // "media" su ogni riga prezzata) ancorate ai prezzari regionali ufficiali
  // già citati — MAI attribuite a un singolo codice di prezzario. I valori
  // puntuali ER25/FVG25 originali (mai alterati, "2025" non toccato) restano
  // sempre citati per intero nella `note` della riga cliente o tecnica
  // pertinente: nessun dato perso, solo riorganizzato.
  "costGuide:rifare-impianto-elettrico": {
    nationalRange: "55–90 € al mq",
    pricePerSquareMeter: "da 55 € a 90 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "elettrico-scenario-canalizzazioni-riutilizzabili",
        label: "Rifacimento con canalizzazioni esistenti riutilizzabili",
        category: "Scenari di ampiezza del lavoro",
        categoryNote:
          "Questi tre scenari rappresentano modi diversi di rifare un impianto elettrico, in base a quanto delle canalizzazioni esistenti resta riutilizzabile e a quanto l'impianto risultante è articolato: scegli quello più vicino al tuo caso, non sommare le fasce tra loro.",
        unit: "al mq",
        range: "da 40 € a 60 € al mq",
        plainExplanation:
          "È comunque un rifacimento dell'impianto, non una semplice sostituzione dei frutti: buona parte di corrugati, scatole e percorsi esistenti viene però riutilizzata perché ancora idonea, con meno tracce nuove e meno assistenza muraria rispetto al rifacimento completo.",
        note: "Fascia editoriale Esigenta: si applica quando un sopralluogo conferma che le canalizzazioni esistenti sono davvero riutilizzabili, non per definizione su ogni impianto vecchio.",
        includes:
          "nuovi conduttori dove previsti, punti e apparecchi standard, distribuzione interna, protezioni e quadro adeguati alla configurazione, verifiche finali, Dichiarazione di conformità rilasciata dall'impresa abilitata al termine del lavoro",
        excludes: "nuove tracce diffuse, montante quando da rifare, rifacimento generale della messa a terra, domotica avanzata",
        confidence: "media",
        costType: "complete",
        role: "scenario",
      },
      {
        id: "elettrico-rifacimento-completo",
        label: "Rifacimento completo standard dell'impianto elettrico",
        category: "Scenari di ampiezza del lavoro",
        unit: "al mq",
        range: "da 55 € a 90 € al mq",
        plainExplanation:
          "È lo scenario principale di questa guida: nuovo impianto interno, distribuzione e circuiti ordinari, punti luce/prese/comandi standard, quadro generale completo e protezioni, con le normali tracce necessarie e la loro chiusura grezza.",
        note: "Normali tracce e chiusura grezza comprese; finitura estetica della parete esclusa — non è una formula generica di \"opere murarie comprese\". È la fascia principale di questa guida: un rifacimento con canalizzazioni in buona parte riutilizzabili costa indicativamente meno (vedi lo scenario qui sopra), un impianto più articolato con molte linee dedicate costa indicativamente di più (vedi lo scenario qui sotto).",
        includes:
          "nuovo impianto interno, distribuzione e circuiti ordinari, punti luce/prese/comandi standard, quadro generale completo adeguato alla configurazione, protezioni, normali nuove tracce dove necessarie, chiusura grezza ordinaria delle tracce, verifiche finali, Dichiarazione di conformità rilasciata dall'impresa abilitata al termine del lavoro",
        excludes:
          "rasatura finale diffusa, tinteggiatura, ripristino estetico completo delle pareti, domotica avanzata, aumento della potenza contrattuale, montante contatore-quadro quando da rifare, rifacimento generale dell'impianto di terra quando necessario, lavorazioni eccezionali, prestazioni professionali esterne quando richieste dal caso",
        confidence: "media",
        costType: "complete",
        role: "primary",
      },
      {
        id: "elettrico-scenario-impianto-articolato",
        label: "Impianto più articolato / nuove linee diffuse",
        category: "Scenari di ampiezza del lavoro",
        unit: "al mq",
        range: "da 80 € a 110 € al mq",
        plainExplanation:
          "Per impianti con molte linee dedicate, maggiore suddivisione dei circuiti, un quadro più articolato, nuove tracce diffuse o più punti/distribuzione complessa — non un impianto \"premium\", ma un impianto con più lavoro tecnico da eseguire.",
        note: "Domotica avanzata esclusa anche in questo scenario: quando prevista, resta una valutazione a parte.",
        includes: "molte linee dedicate, maggiore suddivisione dei circuiti, quadro più articolato, nuove tracce diffuse, più punti o distribuzione più complessa",
        excludes: "domotica avanzata",
        confidence: "media",
        costType: "complete",
        role: "scenario",
      },
      {
        id: "elettrico-punto-luce-completo",
        label: "Punto luce completo con un comando",
        category: "Punti elettrici",
        categoryNote:
          "Queste voci sono lavorazioni complete, comprensive della normale traccia locale e della sua chiusura grezza: quando fanno già parte di uno degli scenari qui sopra, non vanno sommate di nuovo.",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "da 70 € a 110 € cad",
        plainExplanation:
          "Comprende l'uscita luce, il comando/interruttore standard, il corrugato, i conduttori, le scatole, il frutto/supporto/placca standard, i collegamenti e la normale traccia locale necessaria, con la sua chiusura grezza.",
        note: "Fascia editoriale Esigenta, non un prezzo ufficiale puntuale: non è la stessa voce dei prezzi ufficiali di capitolato, che escludono sempre la traccia — un punto luce sotto traccia costa 26,85 € se singolo o 28,96 € se doppio (due punti dalla stessa derivazione), e un punto luce con tubazione a vista, senza incassarlo nel muro, costa 31,88 € (tutti Prezzario Emilia-Romagna 2025); un altro prezzario regionale (Friuli Venezia Giulia 2025) quota una posa a vista con grado di protezione IP54 a 40,55 €, capitolato non equivalente. Nessuna di queste voci ufficiali comprende la traccia: qui invece è compresa.",
        includes: "uscita luce, comando/interruttore standard, tubo corrugato, conduttori, scatole, frutto/supporto/placca standard, collegamenti, normale traccia locale necessaria, fissaggio, chiusura grezza ordinaria",
        excludes: "lampadario, plafoniera o altro corpo illuminante, linea dedicata lunga dal quadro, rasatura finale, tinteggiatura, murature particolari",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-presa-completa-standard",
        label: "Presa elettrica completa standard",
        category: "Punti elettrici",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "da 60 € a 90 € cad",
        plainExplanation:
          "Comprende la presa standard, la scatola, il supporto/placca, il corrugato, i conduttori, i collegamenti e la derivazione ordinaria, con la normale traccia locale e la sua chiusura grezza.",
        note: "Fascia editoriale Esigenta: non è la stessa voce dei prezzi ufficiali di capitolato, che escludono sempre la traccia — una presa completa 2P+T costa 49,72 € nella versione da 10 A o 56,07 € nella versione da 16 A (Prezzario Emilia-Romagna 2025); un altro prezzario regionale (Friuli Venezia Giulia 2025) quota una presa 2P+T 10A a 79,12 €, con un capitolato di posa diverso, non direttamente equivalente. Nessuna di queste voci ufficiali comprende la traccia: qui invece è compresa.",
        includes: "presa standard, scatola, supporto/placca, tubo/corrugato, conduttori, collegamenti, derivazione ordinaria, normale traccia, fissaggio, chiusura grezza",
        excludes: "linea dedicata lunga, rasatura, tinteggiatura, murature particolari",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-comando-aggiuntivo",
        label: "Comando aggiuntivo (deviato/invertito)",
        category: "Punti elettrici",
        unit: "cadauno",
        unitLabel: "per comando",
        range: "da 45 € a 70 € cad",
        plainExplanation:
          "Riguarda l'aggiunta di un secondo punto di comando a una luce già cablata (per esempio per accenderla da due posizioni diverse), non la creazione di un nuovo punto luce: comprende il comando, il cablaggio, l'apparecchio/placca e la normale traccia locale, con la sua chiusura grezza.",
        note: "Fascia editoriale Esigenta: la vecchia voce ufficiale \"Punto comando deviato\" costava 53,63 € (Prezzario Emilia-Romagna 2025, capitolato analitico con collaudo compreso) ma escludeva la traccia — qui invece è compresa. Se serve invece un punto luce nuovo, vedi \"Punto luce completo con un comando\" qui sopra.",
        includes: "comando aggiuntivo (deviato/invertito) su un punto luce già cablato, traccia locale per il nuovo comando, cablaggio, apparecchio e placca, fissaggio, chiusura grezza",
        excludes: "creazione di un nuovo punto luce indipendente, rasatura finale, tinteggiatura",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-punto-su-predisposizione",
        label: "Punto su predisposizione esistente",
        category: "Punti elettrici",
        unit: "cadauno",
        unitLabel: "per punto",
        range: "da 25 € a 45 € cad",
        plainExplanation:
          "Si applica solo quando scatola, corrugato e percorso sono già presenti e utilizzabili: comprende l'apparecchio, il collegamento, la posa e la verifica, non la creazione della predisposizione.",
        note: "Fascia editoriale Esigenta: un prezzario regionale (Friuli Venezia Giulia 2025) quota una voce simile di sola posa in scatola già predisposta a 15,18 €, senza materiali, tubazione, scatola o cavi. Non è il prezzo di un nuovo punto da creare da zero: se la predisposizione non è già presente e idonea, vedi \"Punto luce completo\" o \"Presa elettrica completa standard\" qui sopra.",
        includes: "apparecchio, collegamento, posa, verifica — solo quando scatola, corrugato/percorso e predisposizione sono già presenti e utilizzabili",
        excludes: "creazione della predisposizione stessa (traccia, scatola, corrugato), verifica dell'idoneità della predisposizione esistente quando richiede lavoro aggiuntivo",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-circuito-standard",
        label: "Circuito interno standard",
        category: "Circuiti e distribuzione",
        categoryNote:
          "Sono i cavi che portano la corrente dal quadro fino alla zona dove si trovano i punti luce e le prese: la sezione viene dimensionata dal professionista in base al carico, non è una scelta libera del cliente.",
        unit: "cadauno",
        unitLabel: "per circuito",
        range: "da 200 € a 300 € cad",
        plainExplanation:
          "È la linea che collega il quadro a una zona dell'abitazione per illuminazione e prese di uso ordinario, comprensiva di tubazione/percorso, conduttori, scatole di derivazione e collegamenti.",
        note: "Fascia editoriale Esigenta: i prezzari ufficiali quotano le sezioni tecniche corrispondenti come \"dorsale interna\" — 2×1,5 mmq + T a 200,14 € e 2×2,5 mmq + T a 205,09 € (Prezzario Emilia-Romagna 2025, unità abitativa tipo, misurata dal centralino di appartamento). Non è il montante contatore-quadro.",
        includes: "linea dal quadro, tubazione/percorso ordinario, conduttori, scatole/derivazioni, collegamenti",
        excludes: "grandi opere murarie, montante contatore-quadro",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-circuito-dedicato",
        label: "Circuito dedicato / sezione maggiore",
        category: "Circuiti e distribuzione",
        unit: "cadauno",
        unitLabel: "per circuito",
        range: "da 250 € a 400 € cad",
        plainExplanation:
          "È la linea dedicata a un carico specifico — forno, climatizzazione, un grande elettrodomestico o un'altra utenza dedicata — dimensionata con una sezione maggiore rispetto a un circuito standard.",
        note: "Fascia editoriale Esigenta: non esiste una sezione fissa universale per \"circuito dedicato\", la sezione viene dimensionata in funzione del carico reale. I prezzari ufficiali quotano le sezioni tecniche corrispondenti come \"dorsale interna\" — 2×4 mmq + T a 218,75 €, 2×6 mmq + T a 253,05 € e 2×10 mmq + T a 361,86 € (Prezzario Emilia-Romagna 2025, unità abitativa tipo, sezioni maggiori tipicamente per linee dedicate a carichi specifici). Non è il montante contatore-quadro.",
        includes: "linea dal quadro dimensionata per il carico specifico, tubazione/percorso, conduttori di sezione adeguata, collegamenti",
        excludes: "grandi opere murarie, montante contatore-quadro",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-quadro-generale-4-circuiti",
        label: "Quadro generale — circa 4 circuiti protetti",
        category: "Quadro elettrico completo",
        categoryNote:
          "Le fasce indicano il numero orientativo di circuiti protetti, non il numero di moduli del centralino. Il contenitore viene dimensionato sulla configurazione reale e può avere più moduli dei circuiti effettivamente cablati. Le tre fasce sono alternative: non vanno sommate tra loro.",
        unit: "a corpo",
        range: "da 500 € a 800 €",
        plainExplanation:
          "Quadro generale completo per una configurazione con circa 4 circuiti protetti: involucro, dispositivi di protezione, cablaggio interno e verifica finale, materiale e posa comprese.",
        note: "Fascia editoriale Esigenta: nessun prezzario consultato quota un quadro completo come pacchetto unico, solo singoli componenti. Valori puntuali preservati come riferimento tecnico (Prezzario Emilia-Romagna 2025, salvo indicazione diversa): magnetotermico differenziale 173,32 €, centralino da incasso vuoto 6 moduli 66,61 €, centralino da incasso vuoto 12 moduli 85,57 €; blocco differenziale, configurazione base 151,66 €, intermedia 184,87 €, maggiorata 281,37 € (Prezzario Friuli Venezia Giulia 2025). Non rappresentano il costo di un quadro completo, cablato e configurato: sono i componenti tecnici con cui viene costruita la fascia editoriale qui sopra, non un totale alternativo da usare al loro posto.",
        includes: "involucro/centralino adeguato, dispositivi di protezione coerenti con la configurazione, protezione dei circuiti, cablaggi interni, morsetti e accessori, identificazione dei circuiti, montaggio, collegamenti, verifica finale",
        excludes: "protezioni o configurazioni particolari non ordinarie (dipendono dal progetto/caso reale), quadro condominiale o di parti comuni",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-quadro-generale-6-circuiti",
        label: "Quadro generale — circa 6 circuiti protetti",
        category: "Quadro elettrico completo",
        unit: "a corpo",
        range: "da 650 € a 1.000 €",
        plainExplanation:
          "Quadro generale completo per una configurazione con circa 6 circuiti protetti: involucro, dispositivi di protezione, cablaggio interno e verifica finale, materiale e posa comprese.",
        note: "Stesso principio della fascia da 4 circuiti qui sopra: nessun prezzario consultato quota un quadro completo come pacchetto unico. Il numero di moduli del centralino necessario dipende dalla configurazione reale (interruttore generale, differenziali, magnetotermici) e può essere superiore a 6.",
        includes: "involucro/centralino adeguato, dispositivi di protezione coerenti con la configurazione, protezione dei circuiti, cablaggi interni, morsetti e accessori, identificazione dei circuiti, montaggio, collegamenti, verifica finale",
        excludes: "protezioni o configurazioni particolari non ordinarie (dipendono dal progetto/caso reale), quadro condominiale o di parti comuni",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-quadro-generale-8-10-circuiti",
        label: "Quadro generale — circa 8–10 circuiti protetti",
        category: "Quadro elettrico completo",
        unit: "a corpo",
        range: "da 850 € a 1.400 €",
        plainExplanation:
          "Quadro generale completo per una configurazione con circa 8–10 circuiti protetti: involucro, dispositivi di protezione, cablaggio interno e verifica finale, materiale e posa comprese.",
        note: "Stesso principio delle fasce qui sopra: nessun prezzario consultato quota un quadro completo come pacchetto unico. Non presuppone un'architettura fissa di differenziali/magnetotermici valida per ogni abitazione: la configurazione reale dipende dal progetto.",
        includes: "involucro/centralino adeguato, dispositivi di protezione coerenti con la configurazione, protezione dei circuiti, cablaggi interni, morsetti e accessori, identificazione dei circuiti, montaggio, collegamenti, verifica finale",
        excludes: "protezioni o configurazioni particolari non ordinarie (dipendono dal progetto/caso reale), quadro condominiale o di parti comuni",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "elettrico-traccia-muratura-mattoni-forati",
        label: "Traccia e chiusura grezza — laterizio/forato",
        simpleLabel: "Apertura e chiusura grezza del muro per i cavi — mattoni forati",
        category: "Opere murarie",
        unit: "al metro",
        unitLabel: "per metro di traccia",
        range: "da 15 € a 25 € al metro",
        plainExplanation:
          "Apertura della traccia, normale assistenza/posa e chiusura grezza (tamponamento), su muratura in mattoni forati: la parete non è pronta da pitturare al termine di questa sola lavorazione.",
        note: "Fascia editoriale Esigenta (era prezzo ufficiale puntuale: 15,92 € al metro, Prezzario Emilia-Romagna 2025, capitolato generale edilizia non specifico dell'impiantistica elettrica, fino a 100 cmq di sezione).",
        includes: "apertura, normale assistenza/posa, fissaggio, chiusura grezza",
        excludes: "intonaco finale diffuso, rasatura, tinteggiatura, finitura estetica uniforme, trasporto e smaltimento delle macerie quando non già compresi",
        confidence: "media",
        costType: "work",
      },
      {
        id: "elettrico-traccia-muratura-mattoni-pieni",
        label: "Traccia e chiusura grezza — muratura piena/difficile",
        simpleLabel: "Apertura e chiusura grezza del muro per i cavi — mattoni pieni",
        category: "Opere murarie",
        unit: "al metro",
        unitLabel: "per metro di traccia",
        range: "da 20 € a 35 € al metro",
        plainExplanation:
          "Stesso perimetro della traccia su mattoni forati, su una muratura più impegnativa da lavorare: la parete non è pronta da pitturare al termine di questa sola lavorazione.",
        note: "Fascia editoriale Esigenta (era prezzo ufficiale puntuale: 20,61 € al metro, Prezzario Emilia-Romagna 2025, capitolato generale edilizia non specifico dell'impiantistica elettrica, fino a 100 cmq di sezione).",
        includes: "apertura, normale assistenza/posa, fissaggio, chiusura grezza",
        excludes: "intonaco finale diffuso, rasatura, tinteggiatura, finitura estetica uniforme, trasporto e smaltimento delle macerie quando non già compresi",
        confidence: "media",
        costType: "work",
      },
      {
        id: "elettrico-collegamento-equipotenziale",
        label: "Collegamento equipotenziale locale o di un vano",
        simpleLabel: "Collegamenti di sicurezza del locale (es. bagno)",
        technicalCode: "D01.001.025",
        category: "Collegamenti di sicurezza",
        unit: "cadauno",
        unitLabel: "per collegamento",
        range: "188,81 € cad",
        plainExplanation:
          "Collega tra loro le parti conduttrici previste in un locale (tipicamente il bagno). Non è una presa, un punto luce o il rifacimento completo della messa a terra dell'abitazione.",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), per vano con masse metalliche da collegare. Se serve un intervento più generale sull'impianto di terra (dispersore, conduttore di protezione principale), vedi \"Adeguamento / rifacimento impianto di terra\" più sotto: sono due lavorazioni diverse.",
        includes: "conduttore di protezione, collegamenti e morsettiera equipotenziale del vano",
        excludes: "opere murarie, collegamento a dispersore di terra esterno al vano",
        costType: "complete",
      },
      {
        id: "elettrico-ripristino-estetico-tracce",
        label: "Ripristino estetico finale dopo le tracce",
        category: "Costi da valutare con il professionista",
        range: "da valutare con il professionista",
        plainExplanation:
          "Riguarda riprese di intonaco, rasatura e tinteggiatura necessarie a uniformare pareti o locali dopo l'apertura di nuove tracce: la chiusura grezza compresa nelle lavorazioni murarie qui sopra non è una parete pronta da pitturare.",
        note: "Non è quotabile con un prezzo al metro: la necessità può riguardare una porzione limitata di parete oppure un'intera parete o stanza, a seconda di quanto le tracce sono estese e visibili una volta chiuse.",
        priceStatus: "quoteRequired",
        role: "extra",
      },
      {
        id: "elettrico-montante-contatore-quadro",
        label: "Montante contatore → quadro appartamento",
        category: "Costi da valutare con il professionista",
        range: "da valutare con il professionista",
        plainExplanation:
          "È il tratto tra il contatore e il quadro generale dell'appartamento, a monte di tutte le altre voci di questa guida: i circuiti interni partono dal quadro, non dal contatore.",
        note: "Il costo dipende da distanza, sezione, piano, percorso, parti comuni e condizioni del cavidotto esistente: nessun prezzario consultato permette di attribuire un codice o un prezzo puntuale affidabile senza queste informazioni.",
        priceStatus: "quoteRequired",
        role: "extra",
      },
      {
        id: "elettrico-adeguamento-impianto-terra",
        label: "Adeguamento / rifacimento impianto di terra",
        category: "Costi da valutare con il professionista",
        range: "da valutare con il professionista",
        plainExplanation:
          "Riguarda un intervento generale sull'impianto di terra dell'edificio (dispersore, conduttore di protezione principale, collegamenti), non il singolo collegamento equipotenziale di un locale.",
        note: "Il costo dipende dall'impianto di terra esistente, dal tipo di edificio (singolo o condominiale), dal dispersore, dai conduttori principali e dalle verifiche necessarie. Non va confuso con \"Collegamento equipotenziale locale o di un vano\" qui sopra, che riguarda solo i collegamenti di un singolo locale.",
        priceStatus: "quoteRequired",
        role: "extra",
      },
    ],
    sizeExamples: [
      {
        label: "Impianto per 50 mq",
        sizeRange: "50 mq",
        range: "da 2.750 € a 4.500 €",
        note: "Calcolo per il rifacimento completo standard: 50 mq × 55–90 €/mq. Su un appartamento piccolo il costo al mq può risultare più alto: quadro, nuova uscita, verifiche e lavorazioni minime non diminuiscono in proporzione alla superficie.",
      },
      {
        label: "Impianto per 80 mq",
        sizeRange: "80 mq",
        range: "da 4.400 € a 7.200 €",
        note: "Calcolo per il rifacimento completo standard: 80 mq × 55–90 €/mq.",
      },
      {
        label: "Impianto per 100 mq",
        sizeRange: "100 mq",
        range: "da 5.500 € a 9.000 €",
        note: "Calcolo per il rifacimento completo standard: 100 mq × 55–90 €/mq.",
      },
      {
        label: "Impianto per 150 mq",
        sizeRange: "150 mq",
        range: "da 8.250 € a 13.500 €",
        note: "Calcolo per il rifacimento completo standard: 150 mq × 55–90 €/mq.",
      },
    ],
  },
  // Revisione 2026-08 (richiesta editoriale esplicita): la guida precedente
  // aveva una sola PriceRow prezzata ("Rifacimento ordinario", 60–120 €/mq,
  // pacchetto unico che fondeva demolizione+ripristino+rasatura+finitura in
  // un solo numero) più 5 righe qualitative "Da valutare con il
  // professionista" senza alcun numero — troppo povera per un lettore che
  // vuole capire il ciclo reale di un rifacimento facciata (controllo →
  // pulizia → rimozione parti ammalorate → ripristino intonaco → rasatura →
  // preparazione → finitura → eventuale ponteggio). Sostituita con un
  // modello dati ricco (14 PriceRow) e UI semplice: stessa architettura
  // Scope 4B già usata da rifare-tetto/impermeabilizzare-terrazzo, nessun
  // componente nuovo.
  //
  // - 3 macro-scenari di AMPIEZZA del lavoro, categoria "Scenari di ampiezza
  //   del lavoro", mai da sommare tra loro: Rinnovo della finitura (25–40
  //   €/mq, role "scenario"), Ripristino parziale + nuova finitura (45–80
  //   €/mq, role "scenario"), Rifacimento esteso della facciata (70–120
  //   €/mq, role "primary" — la nuova fascia Hero di questa guida). L'id
  //   "facciata-rifacimento-ordinario" è RIUTILIZZATO per quest'ultima riga
  //   (stessa identità evolutiva: "il rifacimento più esteso della guida"),
  //   ma il perimetro si restringe da "tutta la guida in un unico numero" a
  //   "lo scenario più ampio tra tre" — label aggiornata da "ordinario" a
  //   "esteso" per marcare la distinzione dagli altri due scenari, oggi
  //   espliciti invece di essere assenti.
  // - 10 singole lavorazioni del ciclo reale, ognuna con la propria fascia
  //   editoriale: controllo/pulizia (battitura, lavaggio), demolizione e
  //   ripristino dell'intonaco, rasature (semplice/armata), preparazione del
  //   fondo (fissativo), finiture (tinteggiatura, silossanica, rivestimento
  //   a spessore). MAI sommate automaticamente tra loro o agli scenari qui
  //   sopra: sono due letture parallele dello stesso lavoro (per scenario di
  //   ampiezza, o lavorazione per lavorazione), non due prezzi cumulativi —
  //   nessuna relation "includedIn" collega le singole lavorazioni ai 3
  //   scenari qui sopra, deliberatamente: ogni scenario elenca già in
  //   `includes` cosa comprende in prosa, un tentativo di collegare con
  //   relation ogni lavorazione a UNO dei tre scenari sarebbe stato
  //   ambiguo/parziale (una stessa lavorazione, es. la rasatura, può far
  //   parte di più di uno scenario) — vedi anche il commento su
  //   describeIncludedIn in cost-guide-price-model.ts, che legge solo la
  //   PRIMA relation "includedIn" dichiarata: dichiararne più di una verso
  //   scenari diversi sarebbe stato silenziosamente fuorviante in UI.
  // - Il fissativo (3–7 €/mq) è l'unica riga con role "extra": si aggiunge
  //   (relations "addsTo") alle 3 finiture quando il fondo lo richiede e non
  //   è già compreso nel ciclo di pittura scelto — semantica reale, non
  //   inventata per organizzare la pagina: è esattamente il caso d'uso
  //   previsto da "extra"/"addsTo" (un costo condizionale legato a un
  //   insieme preciso di righe target), e la sezione "Extra" della UI
  //   condivisa ("non vanno sommati sempre: si applicano solo quando la
  //   condizione è reale") comunica di per sé "non è automaticamente
  //   sommabile" senza bisogno di altro testo ad hoc.
  // - Rasatura semplice e rasatura armata restano DUE righe distinte senza
  //   alcuna relation tra loro (né "alternativeTo" né "includedIn"): non
  //   sono lo stesso lavoro calcolato con un metodo di prezzo diverso (quel
  //   caso è "alternativeTo", es. impianto idraulico ↔ punto acqua nel
  //   bagno), sono due tecnologie diverse (rasante liscio vs rasante + rete
  //   in fibra di vetro) — la distinzione resta in prosa (`note`/
  //   `categoryNote`), non nel modello di relazioni.
  // - "facciata-ponteggio" id RIUTILIZZATO (stessa identità: il ponteggio
  //   della facciata), contenuto riscritto: 15–30 €/mq DI FACCIATA, stessa
  //   fascia editoriale già usata in "costGuide:rifare-tetto" qui sopra
  //   (coerenza editoriale esplicitamente richiesta) al posto della vecchia
  //   riga "variabile, da valutare" senza alcun numero. Categoria "Ponteggio"
  //   dedicata (non condivisa con altre lavorazioni): la riga deve restare
  //   sempre riconoscibile come costo separato dai range principali.
  // - RIMOSSE le 4 righe qualitative "Da valutare con il professionista" mai
  //   quotate (cappotto termico, consolidamento strutturale, restauro
  //   specialistico, ripristino balconi/ballatoi/frontalini): nessuna fa
  //   parte del ciclo di rifacimento descritto in questa guida (fuori
  //   perimetro esplicito). Cappotto termico resta spiegato in prosa nel
  //   relatedWork già esistente, mai come PriceRow (vedi
  //   pages/costi/rifare-facciata/base.ts); consolidamento strutturale e
  //   restauro specialistico restano citati come esclusione in
  //   nationalRangeNote; ripristino balconi/ballatoi/frontalini resta
  //   coperto dai relatedWork già esistenti verso quegli interventi
  //   (preservati invariati, non duplicati qui come riga senza prezzo).
  //
  // Provenienza: fasce editoriali Esigenta ancorate a prezzari regionali
  // ufficiali, confronto tra lavorazioni comparabili e mercato privato come
  // controllo secondario — stesso metodo di
  // rifare-tetto/ristrutturare-bagno/impermeabilizzare-terrazzo, MAI un
  // prezzo ufficiale puntuale di un singolo prezzario. Il Prezzario Regione
  // Siciliana 2024 citato in una revisione precedente di questo commento
  // resta non verificabile in questa sessione (PDF ufficiale non
  // raggiungibile in tentativi precedenti): nessun codice o prezzo puntuale
  // di quella fonte è citato in nessuna riga qui sotto, per non rischiare un
  // dato inventato. sourceType resta "mixed", confidence "media" su ogni
  // riga prezzata (nessuna riga con "alta": ancoraggio a un confronto
  // multi-fonte generale, non una triangolazione verificata voce per voce).
  //
  // Micro-fix 2026-08 (cost-guide-price-model.ts, condiviso — non dati): il
  // vincolo `unit === "a corpo"` di isGuideScenarioRow (che escludeva questi
  // 3 macro-scenari dalla sezione Scenari/Cosa-comprende nonostante
  // role/costType corretti, stesso bug già noto su "costGuide:rifare-tetto"
  // qui sopra) è stato rimosso dal classificatore condiviso — vedi il
  // commento di revisione su isGuideScenarioRow in
  // templates/cost-guide-price-model.ts. I 3 macro-scenari (`unit: "al mq"`,
  // corretto: il prezzo di una facciata scala sempre con la superficie, "a
  // corpo" non avrebbe senso) vengono ora promossi correttamente a
  // scenarioCards/primary e NON restano più duplicati nel breakdown. Il
  // `categoryNote` sulla categoria "Scenari di ampiezza del lavoro" non ha
  // più un gruppo Breakdown da introdurre per queste righe e
  // CostScenarioCards non lo legge: quel testo non compare più da nessuna
  // parte della pagina (la sezione Scenari ha comunque già un'intro fissa
  // propria con lo stesso messaggio — "Scegli lo scenario più vicino al tuo
  // caso"). Il fissativo (role "extra") resta l'unica riga di questa guida
  // che la sezione "Extra" della UI condivisa mostra.
  "costGuide:rifare-facciata": {
    nationalRange: "70–120 € al mq",
    pricePerSquareMeter: "da 70 € a 120 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        id: "facciata-rinnovo-finitura",
        label: "Rinnovo della finitura",
        category: "Scenari di ampiezza del lavoro",
        categoryNote:
          "Questi tre scenari rappresentano modi diversi di rifare una facciata, in ordine di ampiezza del degrado da trattare: scegli quello più vicino al tuo caso, non sommare le fasce tra loro. Il ponteggio, quando serve, resta sempre una voce a parte (vedi più sotto in tabella).",
        unit: "al mq",
        range: "da 25 € a 40 € al mq",
        plainExplanation:
          "È lo scenario più leggero: la facciata è sostanzialmente sana, senza intonaco diffuso da rifare. Si pulisce e prepara la superficie, si applica un fissativo solo se il fondo lo richiede, e si rifà la pittura o la finitura, con piccoli ripristini puntuali dove serve.",
        note: "Si applica quando l'intonaco esistente è compatto, senza crepe diffuse o distacchi importanti: il lavoro resta concentrato su pulizia, eventuale preparazione del fondo e nuova finitura. Non è una semplice tinteggiatura spacciata per rifacimento: se emergono zone di intonaco che si sta staccando, il lavoro rientra negli altri due scenari di questa guida.",
        includes:
          "pulizia e preparazione della superficie, fissativo quando il fondo lo richiede, nuova pittura o finitura, piccoli ripristini limitati",
        excludes: "demolizione diffusa dell'intonaco, nuovo intonaco esteso, rasatura armata estesa, ponteggio",
        confidence: "media",
        costType: "complete",
        role: "scenario",
      },
      {
        id: "facciata-ripristino-parziale",
        label: "Ripristino parziale e nuova finitura",
        category: "Scenari di ampiezza del lavoro",
        unit: "al mq",
        range: "da 45 € a 80 € al mq",
        plainExplanation:
          "È l'intervento adatto a un degrado localizzato: alcune zone della facciata hanno intonaco che si sta staccando, mentre il resto della superficie è ancora in condizioni accettabili. Si rimuovono solo le parti ammalorate, si ripristina l'intonaco dove serve, si regolarizza con la rasatura e si applica la nuova finitura.",
        note: "Perimetro intermedio tra il rinnovo della finitura e il rifacimento esteso qui sotto: la quantità di intonaco da rimuovere e rifare resta circoscritta a zone specifiche, non a tutta la facciata. Il ponteggio, quando serve per raggiungere quelle zone, resta una voce a parte.",
        includes:
          "rimozione delle zone di intonaco ammalorato, ripristino dell'intonaco dove necessario, rasatura delle zone interessate, preparazione, nuova finitura",
        excludes: "ponteggio",
        confidence: "media",
        costType: "complete",
        role: "scenario",
      },
      {
        id: "facciata-rifacimento-ordinario",
        label: "Rifacimento esteso della facciata",
        category: "Scenari di ampiezza del lavoro",
        unit: "al mq",
        range: "da 70 € a 120 € al mq",
        plainExplanation:
          "È lo scenario principale di questa guida: la facciata ha un degrado più diffuso, non limitato a poche zone. Si controllano le parti distaccate, si rimuove una quantità significativa di intonaco ammalorato, si ripristina, si regolarizza con la rasatura, si prepara il fondo e si applica la nuova finitura.",
        note: "È la fascia principale di questa guida, non una semplice tinteggiatura: comprende il ciclo completo quando il degrado dell'intonaco è diffuso, non solo localizzato. Una rasatura armata molto estesa, su superfici molto ampie da regolarizzare, può portare il lavoro oltre questa fascia — non per questo diventa uno scenario a sé: resta lo stesso tipo di intervento, solo più esteso. Il ponteggio e il cappotto termico restano sempre esclusi, qualunque sia lo scenario scelto in questa guida.",
        includes:
          "controllo delle parti distaccate, rimozione significativa dell'intonaco ammalorato, ripristino dell'intonaco, rasatura, preparazione, nuova finitura",
        excludes: "ponteggio, cappotto termico",
        confidence: "media",
        costType: "complete",
        role: "primary",
      },
      {
        id: "facciata-battitura-controllo",
        label: "Battitura e controllo delle parti distaccate",
        category: "Controllo e pulizia della facciata",
        unit: "al mq",
        range: "da 2 € a 4 € al mq",
        plainExplanation:
          "È il controllo manuale della facciata per individuare le zone di intonaco vuote, distaccate o non più aderenti — chiamata anche battitura o picchettatura di verifica.",
        note: "Spesso è già compresa nel lavoro generale di ripristino, quando la stessa impresa esegue anche la rimozione e il rifacimento dell'intonaco: in quel caso può non comparire come voce a parte nel preventivo. Ponteggio escluso.",
        confidence: "media",
        costType: "work",
      },
      {
        id: "facciata-lavaggio-pulizia",
        label: "Lavaggio e pulizia della facciata",
        category: "Controllo e pulizia della facciata",
        unit: "al mq",
        range: "da 4 € a 8 € al mq",
        plainExplanation:
          "È la pulizia della superficie prima di intervenire: rimozione dello sporco e dei depositi superficiali, con idrolavaggio quando è compatibile con il supporto.",
        note: "L'idrolavaggio non è sempre lo strumento più adatto: su supporti fragili o già ammalorati l'impresa può preferire un metodo di pulizia meno aggressivo. Non comprende il trattamento di muffe o degrado che richiede cicli specifici, né il ponteggio.",
        includes: "pulizia/idrolavaggio quando compatibile con il supporto, rimozione ordinaria di sporco e depositi superficiali",
        excludes: "ripristini, trattamento di muffe o degrado specialistico quando richiede cicli specifici, ponteggio",
        confidence: "media",
        costType: "work",
      },
      {
        id: "facciata-rimozione-intonaco-ammalorato",
        label: "Rimozione dell'intonaco ammalorato",
        category: "Demolizione e ripristino dell'intonaco",
        unit: "al mq",
        range: "da 14 € a 20 € al mq",
        plainExplanation:
          "È la rimozione delle parti di intonaco deteriorate o distaccate — in termini tecnici, la spicconatura — insieme alla pulizia del supporto sottostante.",
        note: "Comprende la normale gestione, il trasporto e lo smaltimento del materiale rimosso. Il costo si applica alla quantità reale di intonaco da rimuovere, non all'intera superficie della facciata: riguarda solo le zone ammalorate individuate nel controllo iniziale.",
        includes:
          "spicconatura/rimozione delle parti deteriorate, pulizia del supporto, gestione, trasporto e smaltimento ordinari del materiale rimosso",
        excludes: "ponteggio",
        confidence: "media",
        costType: "work",
      },
      {
        id: "facciata-ripristino-intonaco",
        label: "Ripristino / nuovo intonaco esterno",
        category: "Demolizione e ripristino dell'intonaco",
        unit: "al mq",
        range: "da 25 € a 40 € al mq",
        plainExplanation: "È l'applicazione del nuovo intonaco nelle zone dove quello vecchio è stato rimosso: materiale e posa comprese.",
        note: "Presuppone che la rimozione dell'intonaco ammalorato sia già stata eseguita: non la comprende (vedi la riga qui sopra). Non comprende la rasatura finale dell'intera facciata né la pittura: sono lavorazioni successive, con un prezzo proprio più sotto in tabella.",
        includes:
          "materiale, applicazione del nuovo intonaco nelle zone demolite, normale preparazione/aggrappo compatibile con il ciclo quando necessario",
        excludes: "ponteggio, demolizione precedente, rasatura finale dell'intera facciata, pittura",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "facciata-rasatura-semplice",
        label: "Rasatura semplice in due mani",
        category: "Rasature",
        categoryNote:
          "Rasatura semplice e rasatura armata sono due configurazioni diverse dello stesso passaggio, non due fasi da sommare sulla stessa superficie: si sceglie l'una o l'altra in base allo stato del fondo.",
        unit: "al mq",
        range: "da 15 € a 25 € al mq",
        plainExplanation:
          "È la regolarizzazione della superficie con un rasante professionale applicato in due mani, su un fondo già idoneo — utile per uniformare l'intonaco prima della finitura.",
        note: "Presuppone un fondo già idoneo, non un intonaco appena rifatto su grandi superfici né molto irregolare: quando il fondo è più critico o la zona da regolarizzare è ampia, la scelta più adatta è di solito la rasatura armata qui sotto, non due rasature sommate sulla stessa parete.",
        includes: "rasante professionale, applicazione in due mani/passate, normale finitura del supporto",
        excludes:
          "grandi ripristini, demolizione intonaco, rete armata, pittura, ponteggio, primer specialistici quando contabilizzati separatamente",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "facciata-rasatura-armata",
        label: "Rasatura armata con rete",
        category: "Rasature",
        unit: "al mq",
        range: "da 25 € a 40 € al mq",
        plainExplanation:
          "È la stessa regolarizzazione della rasatura semplice qui sopra, con in più una rete in fibra di vetro annegata nel rasante: rende la superficie più resistente e uniforme, utile su fondi più critici o dopo un ripristino esteso dell'intonaco.",
        note: "Comprende l'annegamento della rete, le sovrapposizioni tra i teli e una seconda passata di rasatura di copertura. Non va sommata alla rasatura semplice qui sopra: sono due configurazioni diverse dello stesso passaggio, si sceglie quella più adatta al proprio caso, non entrambe sulla stessa superficie.",
        includes: "rasante, rete in fibra di vetro, annegamento e sovrapposizioni, seconda passata/rasatura di copertura",
        excludes: "finitura pittorica, demolizione, ponteggio",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "facciata-fissativo-primer",
        label: "Fissativo, consolidante o primer",
        category: "Preparazione del fondo",
        unit: "al mq",
        range: "da 3 € a 7 € al mq",
        plainExplanation:
          "Su un fondo assorbente o sfarinante può servire un fissativo o un consolidante prima della finitura; su alcuni supporti può servire invece un primer di adesione. Non è una lavorazione obbligatoria su ogni facciata.",
        note: "Da conteggiare separatamente solo quando non è già compreso nel ciclo successivo: alcuni cicli di pittura (in particolare alcune pitture silossaniche) comprendono già un fissativo compatibile nel proprio sistema. Non va sommato automaticamente alla tinteggiatura: verifica con l'impresa se il ciclo scelto lo comprende già.",
        confidence: "media",
        costType: "complete",
        role: "extra",
        relations: [
          { type: "addsTo", target: "facciata-tinteggiatura-acrilica" },
          { type: "addsTo", target: "facciata-pittura-silossanica" },
          { type: "addsTo", target: "facciata-rivestimento-a-spessore" },
        ],
      },
      {
        id: "facciata-tinteggiatura-acrilica",
        label: "Tinteggiatura esterna acrilica o al quarzo",
        category: "Finiture",
        unit: "al mq",
        range: "da 16 € a 25 € al mq",
        plainExplanation:
          "È la pittura esterna più diffusa, su una facciata già preparata: normalmente due mani, su un fondo pronto a riceverla.",
        note: "Il fissativo, quando serve, non è compreso in questo prezzo (vedi \"Fissativo, consolidante o primer\" qui sopra) — non va comunque duplicato se il ciclo di pittura scelto lo comprende già.",
        includes: "preparazione ordinaria, due mani di pittura",
        excludes: "ponteggio, fissativo quando non già compreso nel ciclo",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "facciata-pittura-silossanica",
        label: "Pittura silossanica",
        category: "Finiture",
        unit: "al mq",
        range: "da 22 € a 35 € al mq",
        plainExplanation:
          "È una finitura esterna traspirante e idrorepellente, più resistente agli agenti atmosferici della tinteggiatura standard qui sopra: normalmente un fondo idoneo, un fissativo compatibile quando previsto dal ciclo, e due mani.",
        note: "Va chiaramente distinta dal rivestimento a spessore qui sotto: è una pittura a film sottile, non una finitura granulata o frattazzata. Il prezzo più alto rispetto alla tinteggiatura standard riflette la tecnologia del prodotto (traspirabilità, idrorepellenza), non solo l'aspetto estetico.",
        includes: "fondo idoneo, fissativo compatibile quando previsto dal ciclo, due mani",
        excludes: "ponteggio",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "facciata-rivestimento-a-spessore",
        label: "Rivestimento a spessore / intonachino",
        category: "Finiture",
        unit: "al mq",
        range: "da 25 € a 40 € al mq",
        plainExplanation:
          "È una finitura granulata o frattazzata applicata a spessore, non una semplice pittura più costosa: cambia la texture e la protezione della superficie, non solo il colore.",
        note: "Può essere a base silossanica o un'altra tecnologia compatibile con il sistema scelto: questa riga non si restringe a una sola tecnologia di rivestimento a spessore.",
        excludes: "ponteggio",
        confidence: "media",
        costType: "complete",
      },
      {
        id: "facciata-ponteggio",
        label: "Ponteggio",
        category: "Ponteggio",
        unit: "al mq di facciata",
        range: "da 15 € a 30 € al mq di facciata",
        plainExplanation:
          "È il costo del ponteggio necessario per lavorare in sicurezza sulla facciata, calcolato sulla superficie da ponteggiare — non sui mq di uno scenario o di una singola lavorazione qui sopra.",
        note: "Comprende orientativamente montaggio, un periodo iniziale di utilizzo/noleggio e smontaggio. Periodi di noleggio più lunghi possono far salire il costo. Resta sempre una voce separata dai range principali di questa guida, qualunque sia lo scenario o le lavorazioni scelte.",
        includes: "montaggio, periodo iniziale di utilizzo/noleggio, smontaggio",
        excludes:
          "occupazione di suolo pubblico, configurazioni particolari, protezioni speciali, noleggio molto prolungato, autorizzazioni e oneri specifici",
        confidence: "media",
        costType: "work",
      },
    ],
    sizeExamples: [
      {
        label: "Facciata da 100 mq",
        sizeRange: "100 mq",
        range: "da 7.000 € a 12.000 €",
        note: "Calcolo per il rifacimento esteso: 100 mq × 70–120 €/mq. Ponteggio escluso.",
      },
      {
        label: "Facciata da 200 mq",
        sizeRange: "200 mq",
        range: "da 14.000 € a 24.000 €",
        note: "Calcolo per il rifacimento esteso: 200 mq × 70–120 €/mq. Ponteggio escluso.",
      },
      {
        label: "Facciata da 300 mq",
        sizeRange: "300 mq",
        range: "da 21.000 € a 36.000 €",
        note: "Calcolo per il rifacimento esteso: 300 mq × 70–120 €/mq. Ponteggio escluso.",
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
