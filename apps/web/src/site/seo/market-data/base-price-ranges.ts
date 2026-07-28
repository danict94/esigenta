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
  range: string;
  note: string;
  /** Cosa il range di solito comprende — solo se le fonti lo permettono. */
  includes?: string;
  /** Cosa di solito resta fuori — solo se le fonti lo permettono. */
  excludes?: string;
  /** Presente solo sulle righe con numeri; le righe qualitative non ce l'hanno. */
  confidence?: PriceRowConfidence;
  priceType?: PriceRowType;
};

export type SizeExample = {
  label: string;
  range: string;
  note: string;
  /** Solo dove abbiamo un riferimento reale (oggi solo ristrutturare-bagno). */
  sizeRange?: string;
};

export type BasePriceRange = {
  nationalRange: string;
  pricePerSquareMeter: string;
  priceRows: readonly PriceRow[];
  sizeExamples: readonly SizeExample[];
  /** Es. "Dati indicativi elaborati da più fonti di settore". */
  sourceLabel?: string;
  /** Es. "2024–2026". */
  sourceYear?: string;
};

const basePriceRangesByFamily: Record<string, BasePriceRange> = {
  // Ricerca Fase 5.D (2024–2026): Edilnet, Cronoshare, Bottegadomus,
  // Parmatek, IdeaCasaPlan, EdiliziaService, Idealista, Homedeal, kvstore,
  // Megarestauri. Ogni range numerico è coperto da almeno due fonti coerenti.
  // Fase 5.F: approfondimento su punto acqua e demolizione/smaltimento
  // (PreventivONE, PGCasa) — split delle due voci in sottocasi per evitare
  // range che fondevano unità o casi diversi (es. "solo demolizione" vs
  // "demolizione+smaltimento" espressi entrambi come €/mq).
  "costGuide:ristrutturare-bagno": {
    nationalRange: "Costo complessivo: indicativamente da 3.000 € a 12.000 €",
    pricePerSquareMeter:
      "Costo al mq: indicativamente da 800 € a 1.500 € al mq",
    sourceLabel: "Dati indicativi elaborati da più fonti di settore",
    sourceYear: "2024–2026",
    priceRows: [
      {
        label: "Rinnovo leggero bagno",
        category: "Panoramica generale",
        unit: "a corpo",
        range: "da 1.500 € a 4.000 €",
        note: "sostituzioni mirate senza rifacimento completo, con impianti in buono stato",
        includes: "smontaggio, montaggio e finiture delle parti sostituite",
        excludes: "sanitari, rubinetteria e materiali di fascia alta",
        confidence: "media",
      },
      {
        label: "Ristrutturazione completa",
        category: "Panoramica generale",
        unit: "a corpo",
        range: "da 3.500 € a 12.000 €",
        note: "il caso più frequente per bagni datati o con nuova disposizione",
        includes: "demolizione, impianti, posa, sanitari standard e manodopera",
        excludes: "arredo bagno e materiali oltre il capitolato concordato",
        confidence: "alta",
      },
      {
        label: "Costo indicativo al mq",
        category: "Panoramica generale",
        unit: "al mq",
        range: "da 800 € a 1.500 € al mq",
        note: "riferimento per confrontare preventivi completi tra loro",
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
        note: "un bagno standard produce circa 1-2 mc di macerie; incidono volume, accesso al cantiere e distanza dalla discarica autorizzata",
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
        note: "piatti filo pavimento, su misura o soluzioni di design possono superare la fascia. Se lo scarico va spostato in una posizione diversa da quella della vasca, aggiungi la riga \"spostamento scarichi\" qui sopra",
        includes: "rimozione vasca, piatto doccia standard e opere idrauliche localizzate",
        excludes: "box doccia di design e rivestimenti estesi",
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
        label: "Bagno piccolo",
        range: "da 3.000 € a 6.000 €",
        note: "intervento compatto con scelte standard e impianti in buono stato",
        sizeRange: "3-5 mq",
      },
      {
        label: "Bagno medio",
        range: "da 4.500 € a 9.000 €",
        note: "caso frequente con rifacimento completo e nuove finiture",
        sizeRange: "6-8 mq",
      },
      {
        label: "Bagno grande o premium",
        range: "da 7.000 € a 12.000 € e oltre",
        note: "materiali ricercati, arredo su misura o lavorazioni più complesse",
        sizeRange: "9 mq e oltre",
      },
    ],
  },
  "costGuide:rifare-tetto": {
    nationalRange: "Costo complessivo: indicativamente da 8.000 € a 25.000 €",
    pricePerSquareMeter:
      "Costo al mq: indicativamente da 120 € a 300 € al mq",
    priceRows: [
      {
        label: "Rifacimento parziale tetto",
        category: "Panoramica generale",
        unit: "a corpo",
        range: "da 2.500 € a 8.000 €",
        note: "ripristino localizzato di una porzione di copertura",
        includes: "intervento sulla porzione interessata: rimozione, guaina e posa del nuovo manto",
        excludes: "isolamento esteso e lattoneria, se non concordati",
      },
      {
        label: "Rifacimento completo tetto",
        category: "Panoramica generale",
        unit: "a corpo",
        range: "da 8.000 € a 25.000 €",
        note: "rimozione vecchia copertura, struttura, isolamento e nuovo manto",
        includes: "rimozione della vecchia copertura, verifica della struttura, guaina e nuovo manto",
        excludes: "isolamento di fascia alta, lucernari e lattoneria di design",
      },
      {
        label: "Costo indicativo al mq",
        category: "Panoramica generale",
        unit: "al mq",
        range: "da 120 € a 300 € al mq",
        note: "varia per materiale, isolamento, pendenza e accessibilità",
        includes: "rimozione, struttura, guaina e posa con materiali di fascia media",
      },
      // Nessuna di queste 4 voci ha un numero verificato da fonti di
      // settore (a differenza del bagno): restano tutte qualitative sotto
      // "Da valutare", stesso pattern delle righe non quotabili del bagno
      // (Rubinetteria, Adeguamento elettrico) — mai un numero inventato.
      {
        label: "Smaltimento vecchia copertura",
        category: "Da valutare con il professionista",
        range: "variabile in base al cantiere",
        note: "incide la quantità di materiale, l'accesso e l'eventuale bonifica di materiali datati",
      },
      {
        label: "Isolamento termico tetto",
        category: "Da valutare con il professionista",
        range: "da valutare con sopralluogo",
        note: "aumenta se si interviene su coibentazione e ventilazione della copertura",
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
        label: "Tetto piccolo (villetta)",
        range: "da 6.000 € a 12.000 €",
        note: "intervento compatto, accesso semplice, materiali standard",
      },
      {
        label: "Tetto medio",
        range: "da 10.000 € a 18.000 €",
        note: "caso frequente con rifacimento completo e isolamento",
      },
      {
        label: "Tetto grande o complesso",
        range: "da 18.000 € a 25.000 € e oltre",
        note: "superfici ampie, falde multiple o accesso difficoltoso",
      },
    ],
  },
  // Struttura "perimetro del preventivo" (luglio 2026): 4 fasce indicate
  // direttamente per questa revisione, non da una nuova ricerca multi-fonte
  // indipendente in questo passaggio (a differenza del resto del file:
  // nessun campo confidence su queste 4 righe, per non dichiarare una
  // verifica multi-fonte che non è stata rifatta qui). Sostituiscono la
  // precedente suddivisione per tipo di materiale (bituminosa/liquida): le
  // fasce sono alternative in base a cosa comprende il preventivo, non
  // cumulabili tra loro. "Cicli complessi" resta senza limite superiore e
  // volutamente qualitativo, non una fascia chiusa.
  "costGuide:impermeabilizzare-tetto": {
    nationalRange:
      "Costo complessivo: indicativamente da 3.800 € a 6.000 € (fornitura e posa su circa 100 mq)",
    pricePerSquareMeter:
      "Costo al mq: da 18 € a 60 € al mq e oltre, secondo il perimetro del preventivo",
    sourceLabel: "Dati indicativi elaborati da più fonti di settore",
    sourceYear: "2026",
    priceRows: [
      {
        label: "Sola posa indicativa",
        category: "Panoramica generale",
        unit: "al mq",
        range: "da 18 € a 24 € al mq",
        note: "stima operativa indicativa, variabile in base a superficie, accessibilità e complessità dei dettagli",
        includes: "manodopera per la posa su un supporto già idoneo e preparato",
        excludes: "guaina o membrana, primer e altri materiali, rimozione del vecchio strato, ripristino del supporto, ponteggi, smaltimento, raccordi complessi",
        priceType: "manodopera",
      },
      {
        label: "Fornitura e posa — ciclo semplice",
        category: "Panoramica generale",
        unit: "al mq",
        range: "da 38 € a 40 € al mq",
        note: "il prezzo può cambiare in base a tipo e qualità della guaina, numero di strati, primer, sovrapposizioni, risvolti e raccordi, condizioni della superficie",
        includes: "fornitura dei materiali e posa di un ciclo impermeabilizzante standard su supporto in condizioni adeguate, senza armatura continua in tessuto non tessuto",
        priceType: "corpo",
      },
      {
        label: "Fornitura e posa — ciclo rinforzato",
        category: "Panoramica generale",
        unit: "al mq",
        range: "da 40 € a 60 € al mq",
        note: "il tessuto non tessuto non è un semplice accessorio: indica un ciclo più completo, con maggior consumo di materiali e più lavorazioni",
        includes: "ciclo impermeabilizzante rinforzato con tessuto non tessuto o armatura equivalente, materiali e posa compresi",
        priceType: "corpo",
      },
      {
        label: "Cicli complessi",
        category: "Panoramica generale",
        unit: "al mq",
        range: "oltre 60 € al mq",
        note: "indicazione qualitativa, non una fascia chiusa: può riguardare più mani o più strati, primer specifici, supporto degradato, ripristini preliminari, numerosi raccordi, bocchettoni, comignoli, lucernari e risvolti, superfici difficili o poco accessibili",
      },
      {
        label: "Rimozione della vecchia guaina",
        category: "Costi aggiuntivi che possono incidere sul preventivo",
        range: "da valutare con sopralluogo",
        note: "le fonti consultate concordano che aumenta il costo rispetto alla sola posa; una fonte indica un ordine di grandezza di circa 5-7 € al mq per rimozione e smaltimento, non confermato da una seconda fonte indipendente",
      },
      {
        label: "Preparazione o ripristino del supporto",
        category: "Costi aggiuntivi che possono incidere sul preventivo",
        range: "variabile in base alle condizioni del supporto",
        note: "pulizia e trattamento delle parti ammalorate incidono sul costo ma non risultano quotati separatamente dalle fonti consultate",
      },
      {
        label: "Ponteggi",
        category: "Costi aggiuntivi che possono incidere sul preventivo",
        range: "variabile in base ad altezza e accessibilità",
        note: "necessari solo quando la copertura non è raggiungibile in sicurezza in altro modo; nessuna fonte consultata offre una fascia affidabile e generalizzabile",
      },
      {
        label: "Accessibilità",
        category: "Costi aggiuntivi che possono incidere sul preventivo",
        range: "variabile in base al cantiere",
        note: "un accesso complesso incide sui tempi e sul costo della manodopera, senza una fascia generalizzabile",
      },
      {
        label: "Raccordi, scarichi, comignoli e lucernari",
        category: "Costi aggiuntivi che possono incidere sul preventivo",
        range: "variabile per numero e complessità dei punti critici",
        note: "ogni punto singolare richiede una lavorazione dedicata: nessuna fonte consultata quota questi elementi separatamente",
      },
      {
        label: "Smaltimento e trasporto",
        category: "Costi aggiuntivi che possono incidere sul preventivo",
        range: "variabile in base al volume e alla distanza dalla discarica",
        note: "incidono la quantità di materiale rimosso e la distanza dal sito di conferimento autorizzato",
      },
    ],
    sizeExamples: [
      {
        label: "Ciclo semplice (100 mq)",
        range: "da 3.800 € a 4.000 €",
        note: "calcolo indicativo sulla fascia fornitura e posa — ciclo semplice (38-40 €/mq) per una superficie di riferimento di 100 mq; superfici diverse cambiano il totale in proporzione",
      },
      {
        label: "Ciclo rinforzato (100 mq)",
        range: "da 4.000 € a 6.000 €",
        note: "calcolo indicativo sulla fascia fornitura e posa — ciclo rinforzato (40-60 €/mq) per una superficie di riferimento di 100 mq; superfici diverse cambiano il totale in proporzione",
      },
    ],
  },
};

export function getBasePriceRange(familyKey: string): BasePriceRange | null {
  return basePriceRangesByFamily[familyKey] ?? null;
}
