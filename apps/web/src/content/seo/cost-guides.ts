export type CityPageQualityStatus = "draft" | "ready";
export type CityPageUniquenessLevel = "thin" | "acceptable" | "strong";

export type CostGuideCityPage = {
  city: string;
  citySlug: string;
  seoEnabled: boolean;
  contentStatus: CityPageQualityStatus;
  uniquenessLevel: CityPageUniquenessLevel;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  summary: string;
  localReading: string;
  priceInterpretation: string;
  typicalCases: string[];
  localFactors: string[];
  whenPriceGoesUp: string[];
  whatToAskInQuote: string[];
  faq: {
    question: string;
    answer: string;
  }[];
};

export type CostGuide = {
  slug: string;
  funnelSlug: string;
  interventionSeoSlug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  summary: string;
  nationalRange: string;
  pricePerSquareMeter: string;
  priceRows: { label: string; range: string; note: string }[];
  sizeExamples: { label: string; range: string; note: string }[];
  citySections: {
    city: string;
    title: string;
    summary: string;
    localReading: string;
    typicalCases: string[];
    factors: string[];
  }[];
  cityPages: CostGuideCityPage[];
  factors: string[];
  savingTips: string[];
  faq: { question: string; answer: string }[];
};

const costGuidePriceNote =
  "I prezzi sono indicativi e variano in base a metratura, stato degli impianti, materiali, città, accessibilità del cantiere e sopralluogo.";

const bathroomCityPages: CostGuideCityPage[] = [
  {
    city: "Milano",
    citySlug: "milano",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "strong",
    title: "Costi ristrutturazione bagno a Milano",
    h1: "Quanto costa ristrutturare un bagno a Milano?",
    metaTitle: "Quanto costa ristrutturare un bagno a Milano?",
    metaDescription:
      "Guida ai costi per ristrutturare un bagno a Milano: range indicativi nazionali, fattori locali, casi frequenti e cosa chiedere nel preventivo.",
    canonicalPath: "/costi/ristrutturare-bagno/milano",
    summary:
      "A Milano il riferimento prudente resta da 3.000 € a 12.000 €, con costo al mq indicativo da 600 € a 1.500 €. La stima può salire quando il bagno è in condominio, ai piani alti o in immobili con accesso complesso.",
    localReading:
      "Nei lavori in appartamento incidono spesso trasporto materiali, smaltimento macerie, orari condominiali e coordinamento tra impresa, idraulico e piastrellista. Il preventivo va letto separando demolizione, impianti, posa, sanitari e finiture.",
    priceInterpretation:
      "La fascia nazionale non è un prezzo reale locale: serve per orientarsi prima del sopralluogo. A Milano conviene verificare subito accesso, parcheggio, ascensore utilizzabile e regole condominiali.",
    typicalCases: [
      "bagno in appartamento condominiale",
      "lavori con orari condominiali da rispettare",
      "cantiere con accesso o parcheggio complesso",
    ],
    localFactors: [
      "accesso al cantiere",
      "piano dell'appartamento",
      "gestione condominiale",
      "livello delle finiture richieste",
    ],
    whenPriceGoesUp: [
      "se serve proteggere spazi comuni o ascensore",
      "se demolizione e macerie richiedono più passaggi",
      "se si scelgono rivestimenti o arredi di fascia alta",
    ],
    whatToAskInQuote: [
      "se smaltimento e trasporto sono inclusi",
      "come vengono gestiti orari e regole condominiali",
      "quali lavorazioni sono comprese tra impianti e finiture",
    ],
    faq: [
      {
        question: "A Milano costa sempre di più ristrutturare un bagno?",
        answer:
          "Non sempre. La fascia resta indicativa, ma accesso, condominio, piano e finiture possono spostare il preventivo verso la parte medio-alta.",
      },
      {
        question: "Serve un sopralluogo per stimare il bagno a Milano?",
        answer:
          "Sì, soprattutto in appartamento: il sopralluogo chiarisce accesso, scarichi, lavori inclusi e gestione del cantiere.",
      },
    ],
  },
  {
    city: "Roma",
    citySlug: "roma",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "strong",
    title: "Costi ristrutturazione bagno a Roma",
    h1: "Quanto costa ristrutturare un bagno a Roma?",
    metaTitle: "Quanto costa ristrutturare un bagno a Roma?",
    metaDescription:
      "Stima prudente per ristrutturare un bagno a Roma: range nazionale, lettura locale, casi frequenti, fattori e domande per il preventivo.",
    canonicalPath: "/costi/ristrutturare-bagno/roma",
    summary:
      "A Roma la fascia indicativa resta da 3.000 € a 12.000 €, con riferimento al mq da 600 € a 1.500 €. Il costo può cambiare molto tra centro storico, palazzi datati, zone condominiali e abitazioni più recenti.",
    localReading:
      "Accesso al cantiere, stato degli scarichi, smaltimento macerie e vincoli dell'edificio possono incidere sul preventivo. Nei bagni datati conviene verificare prima l'impianto idraulico, soprattutto se si spostano doccia, lavabo o sanitari.",
    priceInterpretation:
      "Il range non indica prezzi reali per quartiere: aiuta a capire l'ordine di grandezza. La conferma arriva solo dopo verifica di edificio, scarichi, materiali e lavorazioni richieste.",
    typicalCases: [
      "bagno in edificio datato",
      "accesso difficoltoso o spazi ridotti",
      "rifacimento completo con verifica scarichi",
    ],
    localFactors: [
      "vincoli dell'edificio",
      "smaltimento macerie",
      "stato dell'impianto esistente",
      "spostamento dei punti acqua",
    ],
    whenPriceGoesUp: [
      "se si interviene su scarichi molto datati",
      "se il cantiere richiede più protezioni e movimentazione",
      "se la disposizione del bagno cambia completamente",
    ],
    whatToAskInQuote: [
      "se la verifica degli scarichi è inclusa",
      "come vengono gestite macerie e accesso",
      "quali opere murarie sono comprese",
    ],
    faq: [
      {
        question: "A Roma il costo cambia tra centro e zone residenziali?",
        answer:
          "Può cambiare per accesso, tipologia di edificio e gestione del cantiere, ma senza sopralluogo non è corretto indicare prezzi locali precisi.",
      },
      {
        question: "Cosa controllare in un bagno datato a Roma?",
        answer:
          "Scarichi, tubazioni, sottofondi e possibilità di mantenere o spostare i punti acqua.",
      },
    ],
  },
  {
    city: "Torino",
    citySlug: "torino",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "acceptable",
    title: "Costi ristrutturazione bagno a Torino",
    h1: "Quanto costa ristrutturare un bagno a Torino?",
    metaTitle: "Quanto costa ristrutturare un bagno a Torino?",
    metaDescription:
      "Range indicativi per ristrutturare un bagno a Torino, con fattori locali, casi tipici e domande utili per leggere il preventivo.",
    canonicalPath: "/costi/ristrutturare-bagno/torino",
    summary:
      "A Torino si può usare il range nazionale da 3.000 € a 12.000 € e il costo al mq indicativo da 600 € a 1.500 €. La stima dipende da dimensione del bagno, età degli impianti e tipo di intervento.",
    localReading:
      "Nei condomini e negli appartamenti più datati può pesare la verifica degli scarichi prima di chiudere pareti e pavimenti. Se il bagno è piccolo, il costo non scende sempre in modo proporzionale perché restano fissi tempi di demolizione, posa e coordinamento.",
    priceInterpretation:
      "La fascia nazionale va interpretata distinguendo rinnovo leggero e rifacimento completo: spostare sanitari o scarichi incide molto più della sola sostituzione delle finiture.",
    typicalCases: [
      "bagno piccolo in appartamento",
      "impianti da verificare prima della posa",
      "rinnovo leggero con sanitari e rivestimenti",
    ],
    localFactors: [
      "stato degli scarichi",
      "dimensione effettiva del bagno",
      "necessità di spostare punti acqua",
      "scelta tra rinnovo e rifacimento completo",
    ],
    whenPriceGoesUp: [
      "se il bagno è compatto ma richiede molte lavorazioni",
      "se l'impianto idraulico deve essere rifatto",
      "se si scelgono pose complesse o materiali speciali",
    ],
    whatToAskInQuote: [
      "se il prezzo include verifica e adeguamento scarichi",
      "se le finiture finali sono comprese",
      "quanti giorni di cantiere sono previsti",
    ],
    faq: [
      {
        question: "Un bagno piccolo a Torino costa sempre poco?",
        answer:
          "Non necessariamente: alcune lavorazioni hanno costi fissi anche in spazi ridotti, soprattutto se servono demolizioni e impianti.",
      },
      {
        question: "Quando conviene un rinnovo leggero?",
        answer:
          "Quando impianti e scarichi sono in buono stato e si vogliono aggiornare sanitari, rubinetteria o rivestimenti.",
      },
    ],
  },
  {
    city: "Napoli",
    citySlug: "napoli",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "acceptable",
    title: "Costi ristrutturazione bagno a Napoli",
    h1: "Quanto costa ristrutturare un bagno a Napoli?",
    metaTitle: "Quanto costa ristrutturare un bagno a Napoli?",
    metaDescription:
      "Guida ai costi bagno a Napoli: range indicativi, fattori locali, casi frequenti e cosa verificare prima del preventivo.",
    canonicalPath: "/costi/ristrutturare-bagno/napoli",
    summary:
      "A Napoli il riferimento resta da 3.000 € a 12.000 €, con costo al mq indicativo da 600 € a 1.500 €. Accessibilità, piano dell'immobile e gestione dei materiali possono incidere sulla stima finale.",
    localReading:
      "Quando il cantiere è in una zona con accesso stretto o in un edificio senza spazi comodi per carico e scarico, demolizioni e smaltimento richiedono più organizzazione. Nei bagni datati è utile verificare anche ventilazione, scarichi e compatibilità dei nuovi sanitari.",
    priceInterpretation:
      "Il range nazionale resta una base prudente. Per capire dove si colloca il preventivo bisogna distinguere lavori di finitura, rifacimento impianti e complessità logistica del cantiere.",
    typicalCases: [
      "bagno in edificio con accesso stretto",
      "rifacimento completo con smaltimento macerie",
      "sostituzione sanitari con verifica degli scarichi",
    ],
    localFactors: [
      "accesso per materiali",
      "piano e movimentazione macerie",
      "stato di scarichi e ventilazione",
      "coordinamento tra più artigiani",
    ],
    whenPriceGoesUp: [
      "se l'accesso rende lenta la movimentazione",
      "se scarichi o ventilazione vanno adeguati",
      "se il bagno richiede demolizioni estese",
    ],
    whatToAskInQuote: [
      "come viene gestito il trasporto dei materiali",
      "se lo smaltimento macerie è incluso",
      "chi coordina muratore, idraulico e piastrellista",
    ],
    faq: [
      {
        question: "A Napoli quanto incide l'accesso al cantiere?",
        answer:
          "Può incidere quando carico, scarico e smaltimento richiedono più tempo o organizzazione, ma va valutato caso per caso.",
      },
      {
        question: "Serve controllare la ventilazione del bagno?",
        answer:
          "È utile nei bagni datati o ciechi, soprattutto quando si rifanno rivestimenti e impianti.",
      },
    ],
  },
  {
    city: "Bologna",
    citySlug: "bologna",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "acceptable",
    title: "Costi ristrutturazione bagno a Bologna",
    h1: "Quanto costa ristrutturare un bagno a Bologna?",
    metaTitle: "Quanto costa ristrutturare un bagno a Bologna?",
    metaDescription:
      "Ristrutturazione bagno a Bologna: range indicativi nazionali, fattori locali, casi frequenti e lettura del preventivo.",
    canonicalPath: "/costi/ristrutturare-bagno/bologna",
    summary:
      "A Bologna la fascia da 3.000 € a 12.000 € resta un riferimento prudente, insieme al costo al mq da 600 € a 1.500 €. Il preventivo cambia in base a edificio, metratura e livello di finitura.",
    localReading:
      "In appartamenti e contesti storici conviene separare bene le lavorazioni necessarie da quelle estetiche. Un capitolato chiaro aiuta a capire se nel prezzo sono inclusi demolizione, impianti, sottofondi, posa, sanitari e tinteggiature finali.",
    priceInterpretation:
      "La fascia nazionale aiuta a confrontare rinnovo, rifacimento completo e bagno di fascia alta. Senza sopralluogo non va trasformata in un prezzo locale preciso.",
    typicalCases: [
      "bagno medio in appartamento",
      "intervento con rivestimenti nuovi",
      "ristrutturazione con finiture personalizzate",
    ],
    localFactors: [
      "tipo di edificio",
      "superficie da rivestire",
      "materiali scelti",
      "voci incluse nel preventivo",
    ],
    whenPriceGoesUp: [
      "se il capitolato include molte finiture",
      "se si rifanno impianti e sottofondi",
      "se si scelgono rivestimenti o pose più complesse",
    ],
    whatToAskInQuote: [
      "se sottofondi e tinteggiature sono inclusi",
      "quali materiali sono esclusi dal prezzo",
      "come vengono gestite eventuali varianti",
    ],
    faq: [
      {
        question: "A Bologna è meglio chiedere un preventivo a corpo o a voci?",
        answer:
          "Per un bagno è preferibile avere voci chiare, così puoi distinguere impianti, demolizioni, posa, sanitari e finiture.",
      },
      {
        question: "Il costo al mq basta per decidere?",
        answer:
          "No, è solo un riferimento: materiali, impianti e complessità del bagno cambiano molto il preventivo.",
      },
    ],
  },
  {
    city: "Firenze",
    citySlug: "firenze",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "acceptable",
    title: "Costi ristrutturazione bagno a Firenze",
    h1: "Quanto costa ristrutturare un bagno a Firenze?",
    metaTitle: "Quanto costa ristrutturare un bagno a Firenze?",
    metaDescription:
      "Guida alla ristrutturazione bagno a Firenze: range indicativi, fattori locali, quando il prezzo sale e domande per il preventivo.",
    canonicalPath: "/costi/ristrutturare-bagno/firenze",
    summary:
      "A Firenze il range nazionale da 3.000 € a 12.000 € e il costo al mq da 600 € a 1.500 € vanno letti considerando accessi, contesto dell'immobile e possibili complessità di cantiere.",
    localReading:
      "Prima di confrontare i preventivi è utile capire se si mantengono gli scarichi nella stessa posizione o se il progetto richiede spostamenti. Nei contesti più delicati possono incidere protezioni del cantiere, trasporto materiali e tempi di lavorazione.",
    priceInterpretation:
      "La fascia orientativa non distingue automaticamente tra immobili semplici e contesti più delicati: per questo serve un preventivo che descriva lavori inclusi e modalità di accesso.",
    typicalCases: [
      "bagno in immobile datato",
      "cantiere con accesso o scale strette",
      "rifacimento con nuove piastrelle e sanitari",
    ],
    localFactors: [
      "accessibilità dell'immobile",
      "spostamento di doccia o sanitari",
      "protezione degli spazi comuni",
      "formato e posa dei rivestimenti",
    ],
    whenPriceGoesUp: [
      "se il bagno richiede spostamenti impiantistici",
      "se accesso e protezioni richiedono più tempo",
      "se la posa dei rivestimenti è particolarmente curata",
    ],
    whatToAskInQuote: [
      "se sono previste protezioni per scale e spazi comuni",
      "se gli scarichi restano nella stessa posizione",
      "quali finiture sono comprese nel prezzo",
    ],
    faq: [
      {
        question: "A Firenze cosa può complicare il cantiere bagno?",
        answer:
          "Accessi stretti, immobili datati, protezione degli spazi comuni e spostamenti impiantistici possono incidere sui tempi e sul prezzo.",
      },
      {
        question: "Conviene mantenere gli scarichi nella stessa posizione?",
        answer:
          "Spesso sì, perché riduce opere murarie e interventi sull'impianto, ma va verificato con un tecnico.",
      },
    ],
  },
  {
    city: "Palermo",
    citySlug: "palermo",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "acceptable",
    title: "Costi ristrutturazione bagno a Palermo",
    h1: "Quanto costa ristrutturare un bagno a Palermo?",
    metaTitle: "Quanto costa ristrutturare un bagno a Palermo?",
    metaDescription:
      "Stima prudente per ristrutturare un bagno a Palermo: range nazionale, lettura locale, fattori e domande da fare nel preventivo.",
    canonicalPath: "/costi/ristrutturare-bagno/palermo",
    summary:
      "A Palermo si può usare la fascia nazionale da 3.000 € a 12.000 € e il costo al mq da 600 € a 1.500 € come base, adattandoli allo stato dell'impianto e alle opere richieste.",
    localReading:
      "Nei rifacimenti completi è importante chiarire se il preventivo include demolizione, smaltimento, impianto idraulico, posa rivestimenti e montaggio sanitari. Se gli impianti sono recenti, un rinnovo mirato può essere più adatto di una demolizione totale.",
    priceInterpretation:
      "Il range nazionale è più utile se viene collegato alla quantità di opere murarie e allo stato degli impianti: due bagni della stessa metratura possono richiedere lavori molto diversi.",
    typicalCases: [
      "bagno da rinnovare senza cambiare disposizione",
      "impianto idraulico da controllare",
      "rifacimento con sostituzione completa dei rivestimenti",
    ],
    localFactors: [
      "stato delle tubazioni",
      "quantità di opere murarie",
      "reperibilità dei materiali scelti",
      "inclusione di demolizione e finiture",
    ],
    whenPriceGoesUp: [
      "se le tubazioni sono da rifare",
      "se si demoliscono rivestimenti e sottofondi",
      "se sanitari e arredi sono di fascia alta",
    ],
    whatToAskInQuote: [
      "se l'impianto idraulico è incluso o quotato a parte",
      "quali materiali sono compresi",
      "se posa e finiture finali sono incluse",
    ],
    faq: [
      {
        question: "A Palermo quando basta un rinnovo leggero?",
        answer:
          "Quando impianti e scarichi sono in buono stato e si vogliono aggiornare solo finiture, sanitari o rubinetteria.",
      },
      {
        question: "Come leggere preventivi molto diversi?",
        answer:
          "Controlla se includono demolizione, smaltimento, impianto, posa, sanitari e finiture: spesso le differenze dipendono dalle voci incluse.",
      },
    ],
  },
  {
    city: "Catania",
    citySlug: "catania",
    seoEnabled: true,
    contentStatus: "ready",
    uniquenessLevel: "acceptable",
    title: "Costi ristrutturazione bagno a Catania",
    h1: "Quanto costa ristrutturare un bagno a Catania?",
    metaTitle: "Quanto costa ristrutturare un bagno a Catania?",
    metaDescription:
      "Ristrutturare un bagno a Catania: range indicativi nazionali, fattori locali, casi frequenti e cosa chiedere prima del sopralluogo.",
    canonicalPath: "/costi/ristrutturare-bagno/catania",
    summary:
      "A Catania la fascia nazionale da 3.000 € a 12.000 € e il riferimento al mq da 600 € a 1.500 € restano la base, da confermare in base a immobile, impianti e materiali.",
    localReading:
      "La valutazione cambia se l'intervento riguarda solo finiture e sanitari oppure se serve intervenire su scarichi, punti acqua e sottofondi. Anche accesso al cantiere, trasporto dei materiali e scelta del box doccia possono spostare il costo.",
    priceInterpretation:
      "Non è corretto indicare un prezzo locale unico: il range va letto insieme a sopralluogo, stato del bagno e livello di finitura richiesto.",
    typicalCases: [
      "bagno in casa indipendente",
      "rifacimento con verifica impianto idraulico",
      "sostituzione vasca con doccia e nuovi rivestimenti",
    ],
    localFactors: [
      "tipologia dell'immobile",
      "condizioni dell'impianto idraulico",
      "accesso e movimentazione materiali",
      "scelta di sanitari e box doccia",
    ],
    whenPriceGoesUp: [
      "se si interviene su scarichi e sottofondi",
      "se cambia la posizione degli elementi principali",
      "se il box doccia o i rivestimenti richiedono posa complessa",
    ],
    whatToAskInQuote: [
      "se i punti acqua vengono spostati",
      "se sono inclusi box doccia e sanitari",
      "come viene gestito lo smaltimento dei vecchi rivestimenti",
    ],
    faq: [
      {
        question: "A Catania il prezzo cambia tra appartamento e casa indipendente?",
        answer:
          "Può cambiare per accesso, impianti e gestione del cantiere, ma il costo va confermato con preventivo e sopralluogo.",
      },
      {
        question: "La trasformazione vasca in doccia incide molto?",
        answer:
          "Dipende da scarichi, rivestimenti, box doccia e opere murarie necessarie per adattare lo spazio.",
      },
    ],
  },
];

export const costGuides: CostGuide[] = [
  {
    slug: "ristrutturare-bagno",
    funnelSlug: "rifare-bagno",
    interventionSeoSlug: "ristrutturare-bagno",
    title: "Costi ristrutturazione bagno",
    h1: "Quanto costa ristrutturare un bagno?",
    metaTitle: "Quanto costa ristrutturare un bagno? Prezzi indicativi",
    metaDescription:
      "Scopri quanto costa ristrutturare un bagno, con range indicativi, costo al mq, esempi per dimensione, fattori di prezzo e preventivi.",
    canonicalPath: "/costi/ristrutturare-bagno",
    summary:
      "Ristrutturare un bagno significa coordinare demolizioni, impianto idraulico, rivestimenti, sanitari, rubinetteria e finiture. Il preventivo cambia soprattutto in base a metratura, stato di partenza, materiali scelti e complessità del cantiere.",
    nationalRange: "Costo complessivo: indicativamente da 3.000 € a 12.000 €",
    pricePerSquareMeter:
      "Costo al mq: indicativamente da 600 € a 1.500 € al mq",
    priceRows: [
      {
        label: "Rinnovo leggero bagno",
        range: "da 1.500 € a 4.000 €",
        note: "sostituzione sanitari, rubinetteria o finiture senza rifacimento completo",
      },
      {
        label: "Ristrutturazione completa",
        range: "da 3.500 € a 12.000 €",
        note: "demolizione, impianti, posa rivestimenti, sanitari e finiture",
      },
      {
        label: "Costo indicativo al mq",
        range: "da 600 € a 1.500 € al mq",
        note: "dipende da materiali, impianti, formato delle piastrelle e lavorazioni",
      },
      {
        label: "Demolizione e smaltimento",
        range: "variabile in base al cantiere",
        note: "incidono quantità di macerie, accesso, piano e conferimento",
      },
      {
        label: "Impianto idraulico / punti acqua",
        range: "da valutare con sopralluogo",
        note: "aumenta se si spostano scarichi, doccia, lavabo o sanitari",
      },
      {
        label: "Posa piastrelle e rivestimenti",
        range: "variabile per materiale e formato",
        note: "formati grandi, mosaici o pose complesse richiedono più lavorazione",
      },
      {
        label: "Installazione sanitari",
        range: "variabile per modello",
        note: "sanitari sospesi, rubinetteria e mobili bagno cambiano il costo finale",
      },
      {
        label: "Trasformazione vasca in doccia",
        range: "da valutare sul bagno esistente",
        note: "dipende da scarichi, rivestimenti, box doccia e opere murarie",
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
    citySections: bathroomCityPages.map((cityPage) => ({
      city: cityPage.city,
      title: cityPage.h1,
      summary: cityPage.summary,
      localReading: cityPage.localReading,
      typicalCases: cityPage.typicalCases,
      factors: cityPage.localFactors,
    })),
    cityPages: bathroomCityPages,
    factors: [
      "metratura del bagno e superficie da rivestire",
      "stato di impianto idraulico, scarichi e sottofondi",
      "demolizioni, smaltimento e accessibilità del cantiere",
      "qualità di piastrelle, sanitari, rubinetteria e arredo",
      "spostamento di doccia, lavabo, wc o bidet",
      "tempi richiesti e coordinamento tra più professionisti",
    ],
    savingTips: [
      "Mantieni, se possibile, la stessa posizione di scarichi e punti acqua.",
      "Definisci prima materiali, sanitari e rubinetteria per evitare varianti in corso d'opera.",
      "Chiedi preventivi con voci separate per demolizione, impianti, posa e finiture.",
      "Valuta un rinnovo leggero se gli impianti sono recenti e in buono stato.",
      "Confronta professionisti disponibili nella tua zona prima di fissare il sopralluogo.",
    ],
    faq: [
      {
        question: "Quanto costa in media rifare un bagno?",
        answer:
          "Un bagno completo può costare indicativamente da 3.500 € a 12.000 €, ma il prezzo cambia in base a metratura, materiali, impianti e complessità del cantiere.",
      },
      {
        question: "Quanto costa ristrutturare un bagno al mq?",
        answer:
          "Il costo indicativo può andare da 600 € a 1.500 € al mq. Il dato al mq è utile come orientamento, ma il preventivo reale dipende dalle lavorazioni richieste.",
      },
      {
        question: "Serve sempre rifare l'impianto idraulico?",
        answer:
          "Non sempre. Se tubazioni e scarichi sono recenti possono bastare lavori mirati, ma in un rifacimento completo conviene far verificare l'impianto prima della posa dei rivestimenti.",
      },
      {
        question: "Come posso avere un preventivo più preciso?",
        answer:
          "Descrivi dimensioni, stato del bagno, lavori desiderati e comune dell'intervento. Il sopralluogo resta il modo migliore per confermare costi e tempi.",
      },
    ],
  },
];

const costGuideBySlug: ReadonlyMap<string, CostGuide> = new Map(
  costGuides.map((guide): [string, CostGuide] => [guide.slug, guide]),
);

export function listCostGuides(): readonly CostGuide[] {
  return costGuides;
}

export function getCostGuideBySlug(slug: string): CostGuide | null {
  return costGuideBySlug.get(slug) ?? null;
}

export function getCostGuidePriceNote() {
  return costGuidePriceNote;
}

export function isIndexableCityPage(
  cityPage: CostGuide["cityPages"][number],
): boolean {
  return (
    cityPage.seoEnabled === true &&
    cityPage.contentStatus === "ready" &&
    cityPage.uniquenessLevel !== "thin"
  );
}

export function listIndexableCostGuideCityPages(
  slug: string,
): readonly CostGuide["cityPages"][number][] {
  const guide = getCostGuideBySlug(slug);

  if (!guide) {
    return [];
  }

  return guide.cityPages.filter(isIndexableCityPage);
}

export function getCostGuideCityPageBySlug(
  slug: string,
  citySlug: string,
): CostGuide["cityPages"][number] | null {
  const guide = getCostGuideBySlug(slug);

  if (!guide) {
    return null;
  }

  const cityPage = guide.cityPages.find((page) => page.citySlug === citySlug);

  if (!cityPage || !isIndexableCityPage(cityPage)) {
    return null;
  }

  return cityPage;
}
