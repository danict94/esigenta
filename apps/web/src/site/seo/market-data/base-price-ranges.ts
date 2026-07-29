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
  // Prezzi ufficiali da prezzari regionali dei lavori pubblici, forniti
  // direttamente per questa revisione: Prezzario Regione Emilia-Romagna 2025
  // (fonte principale) e Prezzario Regione Friuli Venezia Giulia 2025 (solo
  // per il blocco "Esempi da un altro prezzario regionale", mai fuso con le
  // voci Emilia-Romagna). Prezzi Lombardia esclusi: la struttura OPERA + LV
  // del prezzario 2026 non è stata ricostruita con sufficienza certezza.
  // "Colonna montante" esclusa: prezzo e descrizione leggibili, ma nessun
  // codice di capitolato attribuibile con certezza in due estrazioni
  // indipendenti del PDF ufficiale — mai un codice inventato. Nessun campo
  // confidence: prezzo puntuale da un singolo prezzario ufficiale, non
  // convergenza multi-fonte di mercato. Nessun sizeExample e nessun totale
  // complessivo: le voci di categorie diverse (punti, distribuzione,
  // componenti quadro, opere murarie) non vanno mai sommate tra loro.
  "costGuide:rifare-impianto-elettrico": {
    nationalRange:
      "Nessun totale complessivo: le voci sono prezzi ufficiali puntuali, non cumulabili automaticamente",
    pricePerSquareMeter:
      "Varia per lavorazione: consulta la tabella ufficiale sotto per ogni voce",
    sourceLabel: "Prezzari ufficiali delle Regioni Emilia-Romagna e Friuli Venezia Giulia",
    sourceYear: "2025",
    priceRows: [
      {
        label: "Punto luce incassato singolo",
        category: "Lavorazioni complete",
        unit: "cadauno",
        range: "26,85 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo. Misurato a partire dalla scatola di derivazione in dorsale, questa esclusa.",
        includes: "tubazione, cavi, scatola da incasso, supporto, apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        label: "Punto luce incassato doppio",
        category: "Lavorazioni complete",
        unit: "cadauno",
        range: "28,96 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo.",
        includes: "tubazione, cavi, scatola da incasso, supporto, doppio apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        label: "Punto luce a vista, grado di protezione IP40",
        category: "Lavorazioni complete",
        unit: "cadauno",
        range: "31,88 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico. Codice di capitolato non attribuibile con certezza dal documento ufficiale: prezzo e descrizione riportati, codice volutamente omesso.",
        includes: "tubazione rigida a vista, cavi, supporti e apparecchio IP40",
        excludes: "scatola di derivazione (esclusa dalla voce stessa) e opere murarie",
        priceType: "corpo",
      },
      {
        label: "Punto presa incassato 2P+T 10A",
        category: "Lavorazioni complete",
        unit: "cadauno",
        range: "49,72 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo.",
        includes: "tubazione, cavi, scatola da incasso, supporto, apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        label: "Punto presa incassato 2P+T 16A",
        category: "Lavorazioni complete",
        unit: "cadauno",
        range: "56,07 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), unità abitativa tipo.",
        includes: "tubazione, cavi, scatola da incasso, supporto, apparecchio e placca",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        label: "Punto comando deviato",
        category: "Lavorazioni complete",
        unit: "cadauno",
        range: "53,63 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo analitico serie civile (E.04.12.01.024): capitolato diverso e più dettagliato delle altre voci di questo blocco, con collaudo compreso nella voce stessa.",
        includes: "tubo corrugato, conduttori con protezione, morsetti, scatola portafrutto, apparecchio, placca e collaudo",
        excludes: "opere murarie (traccia, apertura e chiusura)",
        priceType: "corpo",
      },
      {
        label: "Collegamento equipotenziale per vano",
        category: "Lavorazioni complete",
        unit: "cadauno",
        range: "188,81 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025, metodo sintetico (D01.001), per vano con masse metalliche da collegare (es. bagno).",
        includes: "conduttore di protezione, collegamenti e morsettiera equipotenziale del vano",
        excludes: "opere murarie e collegamento a dispersore di terra esterno al vano",
        priceType: "corpo",
      },
      {
        label: "Dorsale interna 2 x 1,5 mmq + T",
        category: "Distribuzione e linee",
        unit: "cadauna",
        range: "200,14 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025 (D01.001.030), unità abitativa tipo. Misurata dal centralino di appartamento: non è il montante contatore-centralino.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        label: "Dorsale interna 2 x 2,5 mmq + T",
        category: "Distribuzione e linee",
        unit: "cadauna",
        range: "205,09 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025 (D01.001.030), unità abitativa tipo.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        label: "Dorsale interna 2 x 4 mmq + T",
        category: "Distribuzione e linee",
        unit: "cadauna",
        range: "218,75 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025 (D01.001.030), unità abitativa tipo.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        label: "Dorsale interna 2 x 6 mmq + T",
        category: "Distribuzione e linee",
        unit: "cadauna",
        range: "253,05 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025 (D01.001.030), unità abitativa tipo.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        label: "Dorsale interna 2 x 10 mmq + T",
        category: "Distribuzione e linee",
        unit: "cadauna",
        range: "361,86 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025 (D01.001.030), unità abitativa tipo. Sezione maggiore, tipicamente per linee dedicate a carichi specifici.",
        includes: "scatole di derivazione da incasso, conduttori e tubazioni flessibili in PVC",
        excludes: "opere murarie e montante a monte del centralino",
        priceType: "corpo",
      },
      {
        label: "Punto luce a vista, grado di protezione IP54",
        category: "Esempi da un altro prezzario regionale (Friuli Venezia Giulia)",
        unit: "cadauno",
        range: "40,55 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Non è una media nazionale: il capitolato di questa regione può differire da quello Emilia-Romagna, e il grado di protezione IP54 non è confrontabile con la voce IP40 del blocco principale.",
        includes: "tubazione a vista, cavi, supporti e apparecchio IP54",
        excludes: "scatola di derivazione e opere murarie",
        priceType: "corpo",
      },
      {
        label: "Punto presa 2P+T 10A",
        category: "Esempi da un altro prezzario regionale (Friuli Venezia Giulia)",
        unit: "cadauno",
        range: "79,12 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Voce con una modalità di posa specifica di questo prezzario: non confrontare direttamente con il punto presa Emilia-Romagna senza verificare il capitolato.",
        includes: "tubazione, cavi, scatola, supporto, apparecchio e placca secondo il capitolato FVG",
        excludes: "opere murarie",
        priceType: "corpo",
      },
      {
        label: "Sola posa di presa in scatola predisposta",
        category: "Esempi da un altro prezzario regionale (Friuli Venezia Giulia)",
        unit: "cadauno",
        range: "15,18 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Voce di sola posa: non include materiali, tubo o scatola, già presenti. Non va fusa con la voce di punto presa completo qui sopra.",
        includes: "montaggio dell'apparecchio in una scatola già predisposta",
        excludes: "materiali, tubazione, scatola, cavi e assistenza muraria",
        priceType: "manodopera",
      },
      {
        label: "Magnetotermico differenziale",
        category: "Componenti del quadro elettrico",
        unit: "cadauno",
        range: "173,32 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025. Componente da installare nel quadro, non un quadro completo: il costo del quadro dipende dal numero di componenti, dalla carpenteria e dal cablaggio.",
        includes: "fornitura e posa in opera del dispositivo nel quadro",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        label: "Centralino da incasso vuoto, 6 moduli",
        category: "Componenti del quadro elettrico",
        unit: "cadauno",
        range: "66,61 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025. Involucro vuoto, non un quadro cablato: il prezzo del centralino comprende le verifiche dell'involucro stesso, non del quadro completato.",
        includes: "fornitura e posa dell'involucro da incasso",
        excludes: "magnetotermici, differenziali, cablaggio e frontalino",
        priceType: "corpo",
      },
      {
        label: "Centralino da incasso vuoto, 12 moduli",
        category: "Componenti del quadro elettrico",
        unit: "cadauno",
        range: "85,57 € cad",
        note: "Prezzario Regione Emilia-Romagna 2025. Involucro vuoto, non un quadro cablato.",
        includes: "fornitura e posa dell'involucro da incasso",
        excludes: "magnetotermici, differenziali, cablaggio e frontalino",
        priceType: "corpo",
      },
      {
        label: "Blocco differenziale, configurazione base",
        category: "Componenti del quadro elettrico",
        unit: "cadauno",
        range: "151,66 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Componente, non un quadro completo.",
        includes: "fornitura e posa in opera del blocco differenziale",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        label: "Blocco differenziale, configurazione intermedia",
        category: "Componenti del quadro elettrico",
        unit: "cadauno",
        range: "184,87 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Componente, non un quadro completo.",
        includes: "fornitura e posa in opera del blocco differenziale",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        label: "Blocco differenziale, configurazione maggiorata",
        category: "Componenti del quadro elettrico",
        unit: "cadauno",
        range: "281,37 € cad",
        note: "Prezzario Regione Friuli Venezia Giulia 2025. Componente, non un quadro completo.",
        includes: "fornitura e posa in opera del blocco differenziale",
        excludes: "carpenteria del centralino, cablaggio complessivo, progettazione e collaudo del quadro",
        priceType: "corpo",
      },
      {
        label: "Traccia su muratura in mattoni forati",
        category: "Opere murarie",
        unit: "al metro",
        range: "15,92 € al metro",
        note: "Prezzario Regione Emilia-Romagna 2025, capitolato generale edilizia (non specifico dell'impiantistica elettrica), fino a 100 cmq di sezione.",
        includes: "apertura, chiusura e avvicinamento delle macerie, quando previsto",
        excludes: "intonaco, rasatura, tinteggiatura, trasporto e smaltimento delle macerie",
        priceType: "manodopera",
      },
      {
        label: "Traccia su muratura in mattoni pieni",
        category: "Opere murarie",
        unit: "al metro",
        range: "20,61 € al metro",
        note: "Prezzario Regione Emilia-Romagna 2025, capitolato generale edilizia (non specifico dell'impiantistica elettrica), fino a 100 cmq di sezione.",
        includes: "apertura, chiusura e avvicinamento delle macerie, quando previsto",
        excludes: "intonaco, rasatura, tinteggiatura, trasporto e smaltimento delle macerie",
        priceType: "manodopera",
      },
    ],
    sizeExamples: [],
  },
};

export function getBasePriceRange(familyKey: string): BasePriceRange | null {
  return basePriceRangesByFamily[familyKey] ?? null;
}
