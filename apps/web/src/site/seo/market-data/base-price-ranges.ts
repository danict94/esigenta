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

export type PriceRow = {
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
  priceType?: PriceRowType;
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

const basePriceRangesByFamily: Record<string, BasePriceRange> = {
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
      },
      {
        label: "Ristrutturazione completa",
        category: "Ristrutturazione completa standard (circa 5–6 mq)",
        unit: "a corpo",
        range: "da 4.500 € a 8.000 €",
        note: "Perimetro tipico di una ristrutturazione completa su un bagno di circa 5–6 mq: le voci scelte nel preventivo possono spostare il totale verso l'alto o verso il basso.",
        includes: "rimozione dei sanitari esistenti, demolizione ordinaria di pavimento e rivestimenti, rimozione o ripristino del sottofondo (lo strato sotto le piastrelle che crea una base piana e stabile), adeguamento ordinario delle tubazioni dell'acqua e degli scarichi, impermeabilizzazione nelle zone necessarie, nuovo pavimento e rivestimenti di fascia standard, posa, sanitari standard, collegamenti elettrici essenziali, finiture finali e, quando previsti dal preventivo, trasporto e smaltimento ordinari",
        excludes: "spostamento importante degli scarichi, modifica della colonna condominiale, tubazioni fuori dal bagno, mobile bagno, specchio, illuminazione decorativa, box doccia, rubinetteria di fascia alta, piastrelle pregiate o di grande formato, nicchie, mobili su misura, doccia a filo pavimento complessa, sanitari sospesi con telai e opere murarie, modifiche strutturali, pratiche tecniche e problemi emersi dopo la demolizione",
        confidence: "media",
        priceType: "corpo",
      },
      {
        label: "Bagno più grande o più complesso",
        category: "Ristrutturazione complessa o di fascia alta",
        unit: "a corpo",
        range: "da 8.000 € a 12.000 €",
        note: "Bagni oltre i 5–6 mq standard, con più sanitari, più punti acqua o una disposizione più articolata.",
        confidence: "media",
        priceType: "corpo",
      },
      {
        label: "Forniture pregiate, modifiche importanti o imprevisti",
        category: "Ristrutturazione complessa o di fascia alta",
        range: "oltre 12.000 €, senza un massimo definito",
        note: "Può comprendere spostamento importante degli scarichi, doccia a filo pavimento complessa, sanitari sospesi con telai incassati, nicchie, piastrelle di grande formato, arredi su misura, materiali di pregio, modifiche distributive, impianti deteriorati da rifare o imprevisti scoperti dopo la demolizione.",
      },
      {
        label: "Costo indicativo al mq",
        category: "Prezzo al mq (riferimento secondario)",
        unit: "al mq",
        range: "da 800 € a 1.200 € al mq",
        note: "Riferimento secondario, utile solo per confrontare preventivi già ricevuti: in un bagno piccolo il costo al mq può essere più alto, perché sanitari, scarichi e collegamenti pesano quasi allo stesso modo indipendentemente dalla metratura. Il totale non è una semplice moltiplicazione tra superficie e questo valore.",
        includes: "demolizioni, impianti, posa e manodopera con materiali di fascia media",
        confidence: "media",
      },
      {
        label: "Demolizione pavimenti e rivestimenti",
        category: "Demolizione e smaltimento",
        unit: "al mq",
        range: "da 35 € a 40 € al mq",
        note: "sola rimozione, prima del conferimento in discarica (vedi la voce smaltimento qui sotto)",
        includes: "rimozione di pavimento, rivestimenti e vecchi sanitari",
        excludes: "smaltimento delle macerie",
        confidence: "media",
        priceType: "manodopera",
      },
      {
        label: "Smaltimento macerie",
        category: "Demolizione e smaltimento",
        unit: "a corpo",
        range: "da 300 € a 800 €",
        plainExplanation: "È il trasporto e lo smaltimento autorizzato dei materiali demoliti in un impianto apposito (il conferimento in discarica).",
        note: "un bagno standard produce circa 1-2 metri cubi di macerie; incidono volume, accesso al cantiere e distanza dalla discarica autorizzata",
        confidence: "media",
        priceType: "manodopera",
      },
      {
        label: "Impianto idraulico bagno",
        category: "Impianti",
        unit: "a corpo",
        range: "da 1.000 € a 2.500 €",
        note: "vale come pacchetto per rifare tutti i punti del bagno insieme: dal bagno piccolo con impianto semplice al bagno grande con più punti. Non sommarla alle righe \"punto acqua\" qui sotto: sono due modi di leggere lo stesso lavoro, a corpo o punto per punto",
        includes: "distribuzione acqua e scarichi interni al bagno",
        excludes: "opere murarie estese e colonne condominiali",
        confidence: "media",
        priceType: "corpo",
      },
      {
        label: "Punto acqua semplice",
        category: "Impianti",
        unit: "a punto",
        range: "da 75 € a 150 €",
        plainExplanation: "È l'allaccio di un singolo elemento, per esempio la lavatrice, alla tubazione che porta l'acqua (l'adduzione) e allo scarico, quando il punto è già pronto e serve poca opera muraria.",
        note: "singola adduzione (es. lavatrice) o punto già predisposto, con poca muratura da aprire",
        includes: "attacco di carico o scarico del singolo elemento",
        confidence: "media",
        priceType: "corpo",
      },
      {
        label: "Punto acqua completo",
        category: "Impianti",
        unit: "a punto",
        range: "da 150 € a 280 €",
        plainExplanation: "È l'allaccio completo di un sanitario — lavabo, WC, bidet o doccia — all'acqua calda e fredda e allo scarico, comprese le aperture nel muro o nel pavimento necessarie per far passare i tubi.",
        note: "carico acqua calda e fredda più scarico per lo stesso elemento (lavabo, wc, bidet, doccia), con tracce e posa",
        includes: "carico caldo/freddo, scarico e opere murarie localizzate per il punto",
        confidence: "alta",
        priceType: "corpo",
      },
      {
        label: "Spostamento scarichi",
        category: "Impianti",
        unit: "a corpo",
        range: "da 200 € a 800 €",
        note: "il range è ampio perché dipende dalla distanza dalla posizione originale: uno spostamento minimo resta nella parte bassa, un nuovo tracciato esteso su pavimento o muratura sale verso la parte alta",
        confidence: "media",
        priceType: "corpo",
      },
      {
        label: "Posa piastrelle e rivestimenti",
        category: "Posa e finiture",
        unit: "al mq",
        range: "da 25 € a 80 € al mq",
        note: "formati grandi, mosaici o pose complesse stanno nella parte alta",
        includes: "sola posa in opera",
        excludes: "fornitura delle piastrelle",
        confidence: "alta",
        priceType: "manodopera",
      },
      {
        label: "Montaggio sanitari",
        category: "Posa e finiture",
        unit: "a elemento",
        range: "da 40 € a 150 €",
        note: "per wc, bidet o lavabo; i modelli sospesi richiedono più lavorazione (staffe e cassetta incassata) dei modelli a terra",
        includes: "solo montaggio e allaccio del singolo elemento agli attacchi già predisposti",
        excludes: "fornitura del sanitario, opere di predisposizione del punto acqua",
        confidence: "media",
        priceType: "manodopera",
      },
      {
        label: "Trasformazione vasca in doccia",
        category: "Posa e finiture",
        unit: "a corpo",
        range: "da 1.000 € a 3.500 €",
        plainExplanation: "La fascia riguarda la sostituzione ordinaria della vasca con un piatto doccia e gli adattamenti locali necessari. Una doccia a filo pavimento può richiedere demolizioni, nuove pendenze, impermeabilizzazione e modifica dello scarico, quindi può superare questa fascia.",
        note: "Se lo scarico va spostato in modo importante rispetto alla posizione della vasca, aggiungi anche la voce \"Spostamento scarichi\" qui sopra.",
        includes: "rimozione della vasca, piatto doccia standard, adattamento localizzato degli scarichi e dei collegamenti, ripristino limitato dei rivestimenti e posa",
        excludes: "box doccia di fascia alta, rifacimento esteso dei rivestimenti, spostamento importante dello scarico, demolizione estesa del pavimento e doccia a filo pavimento complessa",
        confidence: "media",
        priceType: "corpo",
      },
      {
        label: "Box doccia (fornitura)",
        category: "Posa e finiture",
        unit: "a elemento",
        range: "da 250 € a 1.500 €",
        note: "scorrevoli base in fascia bassa, cristallo temperato in fascia media, walk-in in fascia alta",
        excludes: "montaggio",
        confidence: "media",
        priceType: "fornitura",
      },
      {
        label: "Rubinetteria",
        category: "Da valutare con il professionista",
        range: "variabile per marca e finitura",
        note: "la differenza tra fascia economica e design è troppo ampia per un range affidabile: chiedi la fornitura come voce separata del preventivo",
      },
      {
        label: "Adeguamento elettrico del bagno",
        category: "Da valutare con il professionista",
        range: "da valutare con sopralluogo",
        note: "incidono numero di punti luce e prese, stato dell'impianto esistente ed eventuale nuova linea dedicata",
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
  "costGuide:rifare-tetto": {
    nationalRange: "120–300 € al mq",
    pricePerSquareMeter: "da 120 € a 300 € al mq",
    sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
    sourceYear: "2025–2026",
    sourceType: "mixed",
    priceRows: [
      {
        label: "Rifacimento della copertura, senza interventi sulla struttura",
        category: "Rifacimento della copertura",
        unit: "al mq",
        range: "da 120 € a 300 € al mq",
        note: "Stima elaborata confrontando singole lavorazioni quotate nei prezzari regionali ufficiali 2025–2026 con fasce di mercato nazionale: nessun prezzario pubblico quota un pacchetto unico per il rifacimento completo del tetto.",
        includes: "rimozione del vecchio manto, preparazione del supporto, impermeabilizzazione, eventuale isolamento e posa del nuovo manto, secondo il capitolato scelto",
        excludes: "interventi sulla struttura portante, ponteggi complessi, accessibilità difficile, lattonerie particolari, lucernari, materiali di pregio, pratiche edilizie e progettazione, smaltimenti eccezionali e lavorazioni impreviste emerse dopo la rimozione",
        confidence: "media",
        priceType: "corpo",
      },
      // Scenario A e C non hanno un numero verificato da fonti di settore
      // (a differenza della riga sopra): restano qualitative sotto "Da
      // valutare", stesso pattern delle righe non quotabili del bagno — mai
      // un numero o un tetto massimo inventato (vedi anche categoryNote).
      {
        label: "Sostituzione del solo manto",
        category: "Da valutare con il professionista",
        categoryNote: "Queste voci non hanno una fascia in euro affidabile senza un sopralluogo: comprendono sia interventi più semplici della fascia principale qui sopra (solo manto) sia interventi più complessi (struttura), oltre a fattori che dipendono dal singolo cantiere.",
        range: "da valutare con il professionista",
        note: "Può comprendere rimozione di tegole o coppi, un controllo limitato del supporto esistente, posa del nuovo manto e piccole integrazioni: il perimetro esatto va definito con un sopralluogo, senza una fascia in euro affidabile qui.",
      },
      {
        label: "Rifacimento con intervento sulla struttura o alta complessità",
        category: "Da valutare con il professionista",
        range: "oltre 300 € al mq, senza un massimo definito",
        note: "Può comprendere consolidamento o sostituzione di travi e orditura, nuova stratigrafia, isolamento o ventilazione, impermeabilizzazione, nuovo manto e opere accessorie: la struttura sposta il lavoro fuori dalla fascia 120–300 €/mq.",
      },
      {
        label: "Smaltimento vecchia copertura",
        category: "Da valutare con il professionista",
        range: "variabile in base al cantiere",
        note: "incide la quantità di materiale, l'accesso e l'eventuale bonifica di materiali datati",
      },
      {
        label: "Isolamento o coibentazione del tetto",
        category: "Da valutare con il professionista",
        range: "da valutare con sopralluogo",
        note: "Il prezzo dipende da materiale, spessore, prestazione termica richiesta, stratigrafia, posa dall'interno o dall'esterno e dalla necessità di intervenire anche sul manto: un isolamento standard può già rientrare nella fascia 120–300 €/mq, una coibentazione con prestazioni specifiche va valutata a parte.",
      },
      {
        label: "Grondaie e lattoneria",
        category: "Da valutare con il professionista",
        unit: "al metro lineare",
        range: "variabile per metro lineare",
        note: "dipende da materiale, sviluppo lineare e complessità dei raccordi",
      },
      {
        label: "Ponteggi e accessibilità cantiere",
        category: "Da valutare con il professionista",
        range: "variabile in base all'edificio",
        note: "incidono altezza, accesso e durata prevista dei lavori",
      },
    ],
    sizeExamples: [
      {
        label: "Tetto da 70 mq",
        sizeRange: "70 mq",
        range: "da 8.400 € a 21.000 €",
        note: "Calcolo: 70 mq × 120–300 €/mq.",
      },
      {
        label: "Tetto da 100 mq",
        sizeRange: "100 mq",
        range: "da 12.000 € a 30.000 €",
        note: "Calcolo: 100 mq × 120–300 €/mq.",
      },
      {
        label: "Tetto da 150 mq",
        sizeRange: "150 mq",
        range: "da 18.000 € a 45.000 €",
        note: "Calcolo: 150 mq × 120–300 €/mq.",
      },
      {
        label: "Tetto da 200 mq",
        sizeRange: "200 mq",
        range: "da 24.000 € a 60.000 €",
        note: "Calcolo: 200 mq × 120–300 €/mq.",
      },
    ],
  },
  // Prezzi ufficiali da prezzari regionali dei lavori pubblici (luglio 2026),
  // forniti direttamente per questa revisione: Prezzario Regione Friuli
  // Venezia Giulia 2025 (voci "Nuova impermeabilizzazione") e Prezzario
  // Regione Lombardia 1/2026 (voci "Riparazioni e preparazione" +
  // "Smaltimento"). Nessun codice di capitolato disponibile per queste voci,
  // non ne è stato riportato nessuno inventato. Sostituisce la precedente
  // struttura a fasce per perimetro del preventivo (18-24/38-40/40-60/oltre
  // 60 €/mq): qui ogni riga è un prezzo puntuale ufficiale di una specifica
  // voce di capitolato tecnico, non una fascia di mercato — mai fuse in una
  // fascia né sommate tra loro. Nessun campo confidence: non è verifica
  // multi-fonte di mercato, è il prezzo pubblicato dal prezzario stesso.
  // Nessun sizeExample: qualunque "100 mq = X €" rischierebbe di leggersi
  // come un preventivo per un cliente privato, esattamente ciò che queste
  // voci non sono.
  "costGuide:impermeabilizzare-tetto": {
    nationalRange:
      "Nessun totale complessivo: le voci sono prezzi ufficiali puntuali, non cumulabili automaticamente",
    pricePerSquareMeter:
      "Varia per lavorazione: consulta la tabella ufficiale sotto per ogni voce",
    sourceLabel: "Prezzari ufficiali delle Regioni Friuli Venezia Giulia e Lombardia",
    sourceYear: "2025–2026",
    sourceType: "official",
    priceRows: [
      {
        label: "Guaina bituminosa liscia",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "27,43 € al mq",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Manto bituminoso liscio, senza finitura superficiale specifica.",
        includes: "fornitura e posa in opera secondo la voce di capitolato",
        excludes: "rimozione del manto esistente, ponteggi, smaltimento",
        priceType: "corpo",
      },
      {
        label: "Guaina bituminosa ardesiata",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "29,10 € al mq",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Finitura superficiale in scaglie di ardesia, voce distinta dalla guaina liscia.",
        includes: "fornitura e posa in opera secondo la voce di capitolato",
        excludes: "rimozione del manto esistente, ponteggi, smaltimento",
        priceType: "corpo",
      },
      {
        label: "Membrana bituminosa standard",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "35,32 € al mq",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Voce di impermeabilizzazione con membrana bituminosa, distinta dalla guaina liscia o ardesiata.",
        includes: "fornitura e posa in opera secondo la voce di capitolato",
        excludes: "rimozione del manto esistente, ponteggi, smaltimento",
        priceType: "corpo",
      },
      {
        label: "Doppia membrana con finitura in alluminio",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "44,40 € al mq",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Sistema a doppio strato autoprotetto, finitura riflettente in alluminio.",
        includes: "fornitura e posa in opera secondo la voce di capitolato",
        excludes: "rimozione del manto esistente, ponteggi, smaltimento",
        priceType: "corpo",
      },
      {
        label: "Doppia membrana con protezione in rame (4 kg/m²)",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "79,24 € al mq",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Sistema a doppio strato con lamina di rame da 4 kg/m², voce distinta dalla variante da 4,5 kg/m².",
        includes: "fornitura e posa in opera secondo la voce di capitolato",
        excludes: "rimozione del manto esistente, ponteggi, smaltimento",
        priceType: "corpo",
      },
      {
        label: "Doppia membrana con protezione in rame (4,5 kg/m²)",
        category: "Nuova impermeabilizzazione",
        unit: "al mq",
        range: "81,36 € al mq",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Stessa tipologia della voce precedente, con maggiore grammatura del rame.",
        includes: "fornitura e posa in opera secondo la voce di capitolato",
        excludes: "rimozione del manto esistente, ponteggi, smaltimento",
        priceType: "corpo",
      },
      {
        label: "Riparazione di manto bituminoso fessurato",
        category: "Riparazioni e preparazione",
        unit: "al mq",
        range: "56,56 € al mq",
        note: "Prezzario Regione Lombardia 1/2026. Intervento localizzato su un manto esistente danneggiato, non una nuova posa su tutta la superficie.",
        includes: "intervento di riparazione secondo la voce di capitolato",
        excludes: "ponteggi, smaltimento del materiale rimosso",
        priceType: "corpo",
      },
      {
        label: "Ricerca e riparazione di infiltrazione isolata",
        category: "Riparazioni e preparazione",
        unit: "cadauna",
        range: "82,63 € cadauna",
        note: "Prezzario Regione Lombardia 1/2026. Prezzo per intervento puntuale, non al mq.",
        includes: "ricerca del punto di infiltrazione ed eliminazione, secondo la voce di capitolato",
        excludes: "ponteggi, interventi estesi oltre il punto individuato",
        priceType: "corpo",
      },
      {
        label: "Lisciatura del piano di posa",
        category: "Riparazioni e preparazione",
        unit: "al mq",
        range: "13,22 € al mq",
        note: "Prezzario Regione Lombardia 1/2026. Preparazione del supporto dopo demolizione del manto esistente: presuppone che la demolizione sia già avvenuta.",
        includes: "lisciatura del piano di posa secondo la voce di capitolato",
        excludes: "la demolizione del manto, ponteggi",
        priceType: "corpo",
      },
      {
        label: "Conferimento in impianto della guaina bituminosa",
        category: "Smaltimento",
        unit: "ogni 100 kg",
        range: "19,53 € ogni 100 kg",
        note: "Prezzario Regione Lombardia 1/2026. Prezzo a peso, non a superficie: il totale dipende dal peso del materiale rimosso, non dai mq trattati.",
        includes: "conferimento del materiale a impianto autorizzato secondo la voce di capitolato",
        excludes: "la rimozione del materiale dal cantiere",
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
        label: "Riparazione o impermeabilizzazione localizzata",
        category: "Da valutare con il professionista",
        categoryNote: "Queste voci non hanno una fascia in euro affidabile senza un sopralluogo: comprendono sia interventi più mirati della fascia principale qui sopra (riparazioni localizzate) sia interventi più complessi (sistemi ad alte prestazioni), oltre a fattori che dipendono dal singolo cantiere.",
        range: "da valutare con il professionista",
        note: "Può riguardare uno scarico, un bocchettone, una soglia, un raccordo, un giunto o una piccola zona deteriorata. Per lavori di questo tipo il prezzo al mq è poco significativo: esistono costi minimi di intervento, preparazione e manodopera che non scendono sotto una certa soglia anche per superfici piccole.",
      },
      {
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
        label: "Ponteggio",
        category: "Da valutare con il professionista",
        categoryNote: "Queste voci non hanno una fascia in euro affidabile senza un sopralluogo: sono lavorazioni diverse dal rifacimento ordinario qui sopra, o fattori che dipendono dal singolo cantiere.",
        range: "variabile in base ad altezza, accesso e durata del cantiere",
        note: "Non è compreso nella fascia 60–120 €/mq: viene spesso quotato come voce separata nel preventivo.",
      },
      {
        label: "Cappotto termico della facciata",
        category: "Da valutare con il professionista",
        range: "da valutare con il professionista",
        note: "Intervento di isolamento termico, distinto dal rifacimento ordinario: comporta lavorazioni, spessori e costi propri.",
      },
      {
        label: "Consolidamento strutturale della facciata",
        category: "Da valutare con il professionista",
        range: "da valutare con il professionista",
        note: "Necessario quando ci sono problemi strutturali importanti, non un semplice ripristino di intonaco e finitura.",
      },
      {
        label: "Restauro specialistico o facciata storica/vincolata",
        category: "Da valutare con il professionista",
        range: "da valutare con il professionista",
        note: "Richiede tecniche e materiali specifici, spesso con vincoli della soprintendenza: non rientra nella fascia ordinaria.",
      },
      {
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
