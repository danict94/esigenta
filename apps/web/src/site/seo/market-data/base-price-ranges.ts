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
};

export function getBasePriceRange(familyKey: string): BasePriceRange | null {
  return basePriceRangesByFamily[familyKey] ?? null;
}
