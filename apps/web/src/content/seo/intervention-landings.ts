export type SeoInterventionLanding = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  funnelSlug: string;
  domainSlug: string;
  relatedInterventionSlugs: readonly string[];
  professionalCategorySlugs: readonly string[];
  guideSlugs?: readonly string[];
  costSlug?: string;
  requestItems: readonly string[];
  costSection?: {
    title: string;
    summary: string;
    priceRange?: string;
    factors: readonly string[];
    examples?: readonly string[];
  };
  faq: readonly {
    question: string;
    answer: string;
  }[];
};

export const seoInterventionLandings = [
  {
    slug: "ristrutturare-bagno",
    title: "Ristrutturare bagno",
    h1: "Ristrutturare bagno: trova professionisti qualificati nella tua zona",
    description:
      "Ristrutturare un bagno significa coordinare demolizioni, impianti, sanitari, rivestimenti e finiture. Confronta professionisti adatti al lavoro e ricevi preventivi per il tuo intervento.",
    metaTitle: "Ristrutturare bagno: preventivi da professionisti",
    metaDescription:
      "Devi ristrutturare un bagno? Scopri cosa puoi richiedere, da cosa dipende il costo e confronta preventivi da professionisti qualificati.",
    funnelSlug: "rifare-bagno",
    domainSlug: "ristrutturazione",
    relatedInterventionSlugs: [
      "ristrutturare-casa",
      "rifare-cucina",
      "posare-piastrelle",
      "tinteggiare-interni",
    ],
    professionalCategorySlugs: ["impresa-edile", "idraulico"],
    costSlug: "ristrutturare-bagno",
    requestItems: [
      "rifacimento completo del bagno",
      "sostituzione sanitari e rubinetteria",
      "posa piastrelle e rivestimenti",
      "adeguamento impianto idraulico",
    ],
    costSection: {
      title: "Quanto costa ristrutturare un bagno?",
      summary:
        "Il costo dipende soprattutto da dimensioni, materiali, demolizioni, spostamento degli impianti e livello delle finiture. Per un preventivo attendibile serve descrivere lo stato attuale e il risultato desiderato.",
      priceRange: "indicativamente da 3.500 € a 12.000 €",
      factors: [
        "metratura del bagno",
        "qualità di sanitari, rubinetteria e rivestimenti",
        "modifiche a impianto idraulico o scarichi",
        "necessità di demolizioni e smaltimento",
      ],
      examples: [
        "rinnovo leggero con sostituzione sanitari",
        "rifacimento completo con nuove piastrelle",
        "trasformazione vasca in doccia",
      ],
    },
    faq: [
      {
        question: "Serve sempre rifare anche gli impianti?",
        answer:
          "Non sempre. Se gli impianti sono recenti e in buono stato possono bastare sostituzioni mirate, ma in una ristrutturazione completa conviene farli verificare prima di chiudere pareti e rivestimenti.",
      },
      {
        question: "Quanto tempo richiede ristrutturare un bagno?",
        answer:
          "I tempi cambiano in base alla complessità. Un intervento completo richiede in genere più fasi: demolizione, impianti, sottofondi, posa rivestimenti, sanitari e finiture.",
      },
    ],
  },
  {
    slug: "rifare-impianto-elettrico",
    title: "Rifare impianto elettrico",
    h1: "Rifare impianto elettrico: adegua casa con un elettricista qualificato",
    description:
      "Rifare l'impianto elettrico permette di aumentare sicurezza, affidabilità e conformità dell'abitazione. Descrivi il lavoro e confronta preventivi da elettricisti qualificati.",
    metaTitle: "Rifare impianto elettrico: preventivi elettricista",
    metaDescription:
      "Devi rifare o adeguare l'impianto elettrico? Scopri cosa incide sul costo e richiedi preventivi da elettricisti qualificati.",
    funnelSlug: "impianto-elettrico-nuovo",
    domainSlug: "impianti-elettrici",
    relatedInterventionSlugs: [
      "riparare-quadro-elettrico",
      "aggiungere-presa-elettrica",
      "montare-lampadario",
      "installare-fotovoltaico",
    ],
    professionalCategorySlugs: ["elettricista"],
    costSlug: "impianto-elettrico",
    requestItems: [
      "nuovo impianto elettrico domestico",
      "adeguamento impianto esistente",
      "sostituzione quadro elettrico",
      "aggiunta prese e punti luce",
    ],
    costSection: {
      title: "Quanto costa rifare un impianto elettrico?",
      summary:
        "Il costo varia in base a dimensioni dell'abitazione, numero di punti luce, quadro elettrico, tracce murarie e livello di finitura richiesto. La verifica sul posto aiuta a definire un preventivo realistico.",
      priceRange: "indicativamente da 2.000 € a 8.000 €",
      factors: [
        "numero di stanze e punti elettrici",
        "presenza di tracce da aprire o richiudere",
        "quadro elettrico e dispositivi di protezione",
        "necessità di certificazioni o adeguamenti",
      ],
      examples: [
        "adeguamento di un piccolo appartamento",
        "rifacimento completo in ristrutturazione",
        "aggiunta linee dedicate per nuovi carichi",
      ],
    },
    faq: [
      {
        question: "Quando conviene rifare l'impianto elettrico?",
        answer:
          "Conviene valutarlo se l'impianto è datato, non ha protezioni adeguate, presenta guasti ricorrenti o se stai ristrutturando casa e vuoi predisporre nuovi punti elettrici.",
      },
      {
        question: "Serve un elettricista abilitato?",
        answer:
          "Sì. Gli interventi sull'impianto elettrico devono essere eseguiti da professionisti qualificati, soprattutto quando servono conformità, adeguamenti o nuove linee.",
      },
    ],
  },
  {
    slug: "installare-fotovoltaico",
    title: "Installare fotovoltaico",
    h1: "Installare fotovoltaico: confronta professionisti per il tuo impianto solare",
    description:
      "Un impianto fotovoltaico può ridurre i consumi e valorizzare l'abitazione. Valuta sopralluogo, dimensionamento, posa dei pannelli e collegamento dell'impianto con professionisti qualificati.",
    metaTitle: "Installare fotovoltaico: preventivi impianto solare",
    metaDescription:
      "Vuoi installare un impianto fotovoltaico? Scopri cosa valutare e confronta preventivi da professionisti per pannelli solari domestici.",
    funnelSlug: "installare-fotovoltaico",
    domainSlug: "clima-energia",
    relatedInterventionSlugs: [
      "impianto-elettrico-nuovo",
      "installare-climatizzatore",
      "rifare-tetto",
      "riparare-quadro-elettrico",
    ],
    professionalCategorySlugs: ["impiantista", "elettricista"],
    costSlug: "fotovoltaico",
    requestItems: [
      "installazione pannelli fotovoltaici",
      "dimensionamento impianto solare",
      "sopralluogo tecnico su tetto o copertura",
      "collegamento e configurazione dell'impianto",
    ],
    costSection: {
      title: "Quanto costa installare il fotovoltaico?",
      summary:
        "Il costo dipende dalla potenza dell'impianto, dal tipo di pannelli, dalla complessità della copertura, dall'eventuale accumulo e dagli adeguamenti elettrici necessari.",
      priceRange: "indicativamente da 5.000 € a 18.000 €",
      factors: [
        "potenza richiesta e consumi dell'abitazione",
        "numero e qualità dei pannelli",
        "accessibilità e stato della copertura",
        "presenza di batterie di accumulo",
      ],
      examples: [
        "impianto domestico senza accumulo",
        "impianto con batteria",
        "installazione su tetto da verificare",
      ],
    },
    faq: [
      {
        question: "Serve un sopralluogo per il fotovoltaico?",
        answer:
          "Di solito sì, perché orientamento, ombre, spazio disponibile e stato della copertura incidono sul dimensionamento e sul preventivo.",
      },
      {
        question: "Il fotovoltaico richiede modifiche all'impianto elettrico?",
        answer:
          "Può richiederle. Un tecnico verifica quadro, linee e protezioni per capire se servono adeguamenti prima dell'installazione.",
      },
    ],
  },
  {
    slug: "rifare-tetto",
    title: "Rifare tetto",
    h1: "Rifare tetto: trova imprese qualificate per copertura e lattoneria",
    description:
      "Rifare un tetto può includere rimozione della vecchia copertura, isolamento, posa dei nuovi materiali, grondaie e lattoneria. Confronta imprese qualificate per il tuo intervento.",
    metaTitle: "Rifare tetto: preventivi per copertura casa",
    metaDescription:
      "Devi rifare il tetto? Scopri cosa incide sul costo, quali lavori puoi richiedere e confronta preventivi da imprese qualificate.",
    funnelSlug: "rifare-tetto",
    domainSlug: "tetti",
    relatedInterventionSlugs: [
      "riparare-tetto",
      "fare-copertura-edile",
      "sostituire-grondaie",
      "installare-scossaline",
    ],
    professionalCategorySlugs: ["impresa-edile"],
    costSlug: "rifare-tetto",
    requestItems: [
      "rifacimento completo della copertura",
      "riparazione o sostituzione manto del tetto",
      "isolamento e impermeabilizzazione",
      "grondaie, scossaline e lattoneria",
    ],
    costSection: {
      title: "Quanto costa rifare un tetto?",
      summary:
        "Il prezzo cambia in base a superficie, materiali, isolamento, accessibilità, ponteggi e stato della struttura. Per lavori importanti è essenziale una valutazione tecnica.",
      priceRange: "indicativamente da 120 € a 300 € al mq",
      factors: [
        "superficie della copertura",
        "materiale scelto per il manto",
        "isolamento e impermeabilizzazione",
        "ponteggi e accessibilità del cantiere",
      ],
      examples: [
        "ripristino localizzato del manto",
        "rifacimento completo con isolamento",
        "sostituzione grondaie e lattoneria",
      ],
    },
    faq: [
      {
        question: "Quando è meglio rifare il tetto invece di ripararlo?",
        answer:
          "Quando infiltrazioni, danni diffusi o materiali deteriorati rendono le riparazioni frequenti e poco efficaci. Una verifica tecnica aiuta a scegliere l'intervento corretto.",
      },
      {
        question: "Nel rifacimento del tetto si può migliorare l'isolamento?",
        answer:
          "Sì. Il rifacimento è spesso il momento giusto per valutare isolamento, impermeabilizzazione e ventilazione della copertura.",
      },
    ],
  },
  {
    slug: "installare-climatizzatore",
    title: "Installare climatizzatore",
    h1: "Installare climatizzatore: trova tecnici per casa e ufficio",
    description:
      "Installare un climatizzatore richiede scelta della macchina, posizionamento delle unità, collegamenti e verifica dell'impianto. Confronta tecnici qualificati per climatizzazione domestica o ufficio.",
    metaTitle: "Installare climatizzatore: preventivi tecnici qualificati",
    metaDescription:
      "Devi installare o sostituire un climatizzatore? Scopri cosa valutare e richiedi preventivi da tecnici qualificati nella tua zona.",
    funnelSlug: "installare-climatizzatore",
    domainSlug: "clima-energia",
    relatedInterventionSlugs: [
      "installare-fotovoltaico",
      "impianto-elettrico-nuovo",
      "aggiungere-presa-elettrica",
      "riparare-quadro-elettrico",
    ],
    professionalCategorySlugs: ["impiantista", "elettricista"],
    costSlug: "installare-climatizzatore",
    requestItems: [
      "installazione nuovo climatizzatore",
      "sostituzione unità esistente",
      "posa unità interna ed esterna",
      "verifica collegamenti elettrici e scarico condensa",
    ],
    costSection: {
      title: "Quanto costa installare un climatizzatore?",
      summary:
        "Il costo dipende da numero di split, potenza, predisposizione esistente, distanza tra unità interna ed esterna e complessità dei collegamenti.",
      priceRange: "indicativamente da 700 € a 2.500 €",
      factors: [
        "numero di unità interne",
        "potenza e modello del climatizzatore",
        "predisposizione già presente o da creare",
        "distanza tra unità interna ed esterna",
      ],
      examples: [
        "installazione monosplit",
        "sostituzione climatizzatore esistente",
        "impianto multisplit per più stanze",
      ],
    },
    faq: [
      {
        question: "Serve predisposizione per installare un climatizzatore?",
        answer:
          "Non è sempre necessaria, ma se manca vanno valutati passaggi tubazioni, scarico condensa, alimentazione e posizione dell'unità esterna.",
      },
      {
        question: "Posso sostituire solo il vecchio climatizzatore?",
        answer:
          "Sì, se tubazioni, staffe, scarichi e collegamenti sono compatibili e in buono stato. Il tecnico può verificare cosa riutilizzare.",
      },
    ],
  },
  {
    slug: "cartongesso-e-finiture",
    title: "Cartongesso e finiture",
    h1: "Cartongesso e finiture: pareti, controsoffitti e lavori su misura",
    description:
      "I lavori in cartongesso permettono di creare pareti, controsoffitti, velette, nicchie e finiture interne. Trova professionisti qualificati per progettare e realizzare l'intervento.",
    metaTitle: "Cartongesso e finiture: preventivi cartongessista",
    metaDescription:
      "Devi realizzare lavori in cartongesso o finiture interne? Scopri cosa puoi richiedere e confronta preventivi da professionisti qualificati.",
    funnelSlug: "fare-lavori-cartongesso",
    domainSlug: "ristrutturazione",
    relatedInterventionSlugs: [
      "fare-parete-cartongesso",
      "abbassare-soffitto",
      "fare-rasatura",
      "tinteggiare-interni",
    ],
    professionalCategorySlugs: ["cartongessista", "imbianchino", "impresa-edile"],
    requestItems: [
      "pareti e contropareti in cartongesso",
      "controsoffitti e velette",
      "nicchie, librerie e pareti attrezzate",
      "rasature, stuccature e finiture",
    ],
    costSection: {
      title: "Quanto costano cartongesso e finiture?",
      summary:
        "Il costo dipende da metri quadri, complessità della struttura, presenza di faretti o impianti, livello di finitura e tinteggiatura finale.",
      priceRange: "indicativamente da 35 € a 90 € al mq",
      factors: [
        "dimensione della struttura",
        "tipo di lavorazione richiesta",
        "integrazione con luci o impianti",
        "rasatura, stuccatura e tinteggiatura",
      ],
      examples: [
        "parete divisoria semplice",
        "controsoffitto con faretti",
        "parete attrezzata su misura",
      ],
    },
    faq: [
      {
        question: "Il cartongesso è adatto anche per dividere una stanza?",
        answer:
          "Sì. Una parete in cartongesso può dividere ambienti, creare nuovi spazi o integrare isolamento e passaggi impiantistici.",
      },
      {
        question: "Le finiture sono incluse nei lavori in cartongesso?",
        answer:
          "Dipende dal preventivo. È utile specificare se servono anche stuccatura, rasatura, tinteggiatura, faretti o altre finiture finali.",
      },
    ],
  },
] as const satisfies readonly SeoInterventionLanding[];

const seoInterventionLandingBySlug: ReadonlyMap<string, SeoInterventionLanding> =
  new Map(
    seoInterventionLandings.map((landing): [string, SeoInterventionLanding] => [
      landing.slug,
      landing,
    ]),
  );

export function listSeoInterventionLandings(): readonly SeoInterventionLanding[] {
  return seoInterventionLandings;
}

export function getSeoInterventionLandingBySlug(
  slug: string,
): SeoInterventionLanding | null {
  return seoInterventionLandingBySlug.get(slug) ?? null;
}
