/**
 * UNICA fonte numerica dei prezzi (nessun numero nei content). Le righe con
 * un range in euro devono avere confidence "alta" (più fonti coerenti) o
 * "media" (fonti coerenti ma range ampio): mai inserire un numero da una
 * fonte sola o divergente — quelle voci restano qualitative, con una nota
 * che spieghi perché serve il sopralluogo. sourceLabel/sourceYear
 * documentano la base dati mostrata in pagina.
 */
export type PriceRowConfidence = "alta" | "media";

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
};

export type SizeExample = { label: string; range: string; note: string };

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
      },
      {
        label: "Smaltimento macerie",
        category: "Demolizione e smaltimento",
        unit: "a corpo",
        range: "da 300 € a 800 €",
        note: "un bagno standard produce circa 1-2 mc di macerie; incidono volume, accesso al cantiere e distanza dalla discarica autorizzata",
        confidence: "media",
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
      },
      {
        label: "Punto acqua semplice",
        category: "Impianti",
        unit: "a punto",
        range: "da 75 € a 150 €",
        note: "singola adduzione (es. lavatrice) o punto già predisposto, con poca muratura da aprire",
        includes: "attacco di carico o scarico del singolo elemento",
        confidence: "media",
      },
      {
        label: "Punto acqua completo",
        category: "Impianti",
        unit: "a punto",
        range: "da 150 € a 280 €",
        note: "carico acqua calda e fredda più scarico per lo stesso elemento (lavabo, wc, bidet, doccia), con tracce e posa",
        includes: "carico caldo/freddo, scarico e opere murarie localizzate per il punto",
        confidence: "alta",
      },
      {
        label: "Spostamento scarichi",
        category: "Impianti",
        unit: "a corpo",
        range: "da 200 € a 800 €",
        note: "il range è ampio perché dipende dalla distanza dalla posizione originale: uno spostamento minimo resta nella parte bassa, un nuovo tracciato esteso su pavimento o muratura sale verso la parte alta",
        confidence: "media",
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
      },
      {
        label: "Box doccia (fornitura)",
        category: "Posa e finiture",
        unit: "a elemento",
        range: "da 250 € a 1.500 €",
        note: "scorrevoli base in fascia bassa, cristallo temperato in fascia media, walk-in in fascia alta",
        excludes: "montaggio",
        confidence: "media",
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
      },
      {
        label: "Bagno medio",
        range: "da 4.500 € a 9.000 €",
        note: "caso frequente con rifacimento completo e nuove finiture",
      },
      {
        label: "Bagno grande o premium",
        range: "da 7.000 € a 12.000 € e oltre",
        note: "materiali ricercati, arredo su misura o lavorazioni più complesse",
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
        range: "da 2.500 € a 8.000 €",
        note: "ripristino localizzato di una porzione di copertura",
      },
      {
        label: "Rifacimento completo tetto",
        category: "Panoramica generale",
        range: "da 8.000 € a 25.000 €",
        note: "rimozione vecchia copertura, struttura, isolamento e nuovo manto",
      },
      {
        label: "Costo indicativo al mq",
        category: "Panoramica generale",
        range: "da 120 € a 300 € al mq",
        note: "varia per materiale, isolamento, pendenza e accessibilità",
      },
      {
        label: "Smaltimento vecchia copertura",
        category: "Demolizione e smaltimento",
        range: "variabile in base al cantiere",
        note: "incide la quantità di materiale, l'accesso e l'eventuale bonifica di materiali datati",
      },
      {
        label: "Isolamento termico tetto",
        category: "Lavorazioni",
        range: "da valutare con sopralluogo",
        note: "aumenta se si interviene su coibentazione e ventilazione della copertura",
      },
      {
        label: "Grondaie e lattoneria",
        category: "Lavorazioni",
        range: "variabile per metro lineare",
        note: "dipende da materiale, sviluppo lineare e complessità dei raccordi",
      },
      {
        label: "Ponteggi e accessibilità cantiere",
        category: "Cantiere",
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
};

export function getBasePriceRange(familyKey: string): BasePriceRange | null {
  return basePriceRangesByFamily[familyKey] ?? null;
}
