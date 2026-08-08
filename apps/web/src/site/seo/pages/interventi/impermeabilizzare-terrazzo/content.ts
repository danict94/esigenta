import type { SeoInterventionLanding } from "../types";

// Intervention sorgente: publicationStatus "draft" (packages/taxonomy/...
// project-groups/facciate-e-balconi.ts). Questa landing è registrata e
// completa ma NON deve diventare pubblica finché quello stato resta
// "draft" — il gate (static-params.ts + resolve-seo-page.ts, entrambi
// frozen-only) la esclude automaticamente da generateStaticParams,
// sitemap e da qualunque lookup pubblico. Non toccare publicationStatus da
// qui: è un campo della SSOT taxonomy, non di questo file.
//
// Nessuna image: non esiste un asset reale per un terrazzo e riusare una
// foto di tetto o balcone sarebbe incoerente con il soggetto (`image` è
// opzionale in SeoInterventionLanding proprio per questo caso). Va aggiunta
// una foto reale del terrazzo prima di qualunque pubblicazione.
export const impermeabilizzareTerrazzoLanding: SeoInterventionLanding = {
  slug: "impermeabilizzare-terrazzo",
  title: "Impermeabilizzare terrazzo",
  h1: "Impermeabilizzare il terrazzo: trova professionisti per infiltrazioni e guaina",
  description:
    "Impermeabilizzare un terrazzo non significa solo applicare un prodotto impermeabile: prima vanno valutati supporto, pendenze, scarichi e raccordi per capire se basta un intervento mirato o serve rifare il sistema impermeabilizzante. Confronta professionisti qualificati per il tuo intervento.",
  metaTitle: "Impermeabilizzare terrazzo: preventivi per infiltrazioni",
  metaDescription:
    "Hai infiltrazioni dal terrazzo o la guaina è deteriorata? Scopri cosa comprende l'impermeabilizzazione e confronta preventivi da professionisti qualificati.",
  funnelSlug: "impermeabilizzare-terrazzo",
  groupSlug: "facciate-e-balconi",
  // Collegamento con /costi/impermeabilizzare-terrazzo (stesso pattern di
  // rifare-tetto/impermeabilizzare-tetto): risolto automaticamente da
  // resolveCostGuideHrefForIntervention/resolveInterventionCostSectionPriceData,
  // nessun link ad hoc. La guida è draft quanto questa landing, quindi il
  // collegamento resta inerte finché entrambe non diventano published.
  costSlug: "impermeabilizzare-terrazzo",
  requestCtaLabel: "Richiedi preventivi per il terrazzo",
  geoSection: {
    title: "Trova professionisti per impermeabilizzare il terrazzo nella tua zona",
    summary:
      "Descrivi dove si manifesta l'infiltrazione e la zona del terrazzo interessata per confrontare preventivi da professionisti disponibili nella tua area.",
  },
  relatedInterventionSlugs: [],
  professionalCategorySlugs: ["impresa-edile"],
  // impermeabilizzare-balcone-ballatoio è il confine più vicino (stessa
  // lavorazione, superficie diversa): un utente incerto su cosa conta come
  // "terrazzo" trova qui il percorso giusto per un balcone/ballatoio. Non
  // aggiungo impermeabilizzare-tetto (dominio diverso, copertura non
  // calpestabile) né rifare-terrazzo (non esiste ancora in taxonomy).
  relatedFunnelWork: ["impermeabilizzare-balcone-ballatoio"],
  requestItems: [
    "impermeabilizzazione localizzata di raccordi, soglie, scarichi o bocchettoni",
    "impermeabilizzazione della superficie del terrazzo",
    "rifacimento della guaina o del sistema impermeabilizzante",
    "verifica di infiltrazioni, ristagni o pavimentazione danneggiata",
  ],
  scopeIncluded: [
    "sopralluogo e individuazione dell'origine probabile dell'infiltrazione",
    "verifica dello stato della pavimentazione, delle fughe e del supporto",
    "controllo di pendenze, scarichi e bocchettoni",
    "trattamento di raccordi perimetrali, soglie e punti critici",
    "applicazione o rifacimento del sistema impermeabilizzante più adatto",
    "verifica finale della tenuta all'acqua",
  ],
  scopeExcluded: [
    "demolizione completa o ricostruzione del massetto (lo strato sotto il pavimento che crea una base stabile e le corrette pendenze)",
    "nuova pavimentazione completa del terrazzo",
    "rifacimento generale del terrazzo, quando non limitato all'impermeabilizzazione",
    "opere strutturali",
    "materiali o accessori acquistati direttamente da te",
    "eventuali pratiche tecniche, quando necessarie",
    "imprevisti scoperti dopo la rimozione della pavimentazione o degli strati esistenti",
  ],
  scopeNote:
    "Ogni professionista compone il preventivo in modo diverso: usa queste liste per chiedere esplicitamente cosa è compreso e cosa no, prima di confrontare i prezzi.",
  variants: [
    {
      title: "Impermeabilizzazione localizzata",
      summary:
        "Per problemi circoscritti come raccordi, soglie, scarichi, bocchettoni, giunti o piccole zone deteriorate. Non sempre risolve un'impermeabilizzazione ormai compromessa su tutta la superficie.",
    },
    {
      title: "Impermeabilizzazione della superficie",
      summary:
        "Intervento esteso sul terrazzo: il sistema viene scelto dopo la verifica del supporto e, quando le condizioni lo consentono, può essere realizzato anche sopra la pavimentazione esistente.",
    },
    {
      title: "Rifacimento della guaina",
      summary:
        "Quando il sistema impermeabile esistente è deteriorato o non più affidabile: può richiedere la rimozione della pavimentazione o di altri strati per ricostruire correttamente l'impermeabilizzazione.",
    },
  ],
  preparationItems: [
    "superficie approssimativa del terrazzo",
    "se è pavimentato, con guaina a vista o a superficie grezza",
    "dove si manifesta l'infiltrazione",
    "se sono presenti ristagni d'acqua",
    "eventuali lavori di impermeabilizzazione già fatti in passato",
    "fotografie del terrazzo e dei danni visibili, anche dall'interno",
  ],
  detailSections: [
    {
      id: "senza-togliere-piastrelle",
      title: "Si può impermeabilizzare senza togliere le piastrelle?",
      intro:
        "In alcuni casi sì: esistono sistemi impermeabilizzanti compatibili con una pavimentazione esistente, senza doverla rimuovere.",
      paragraphs: [
        "Non è però una soluzione sempre praticabile: dipende dall'adesione e dallo stato delle piastrelle, dalle fughe e da eventuali fessure, dall'umidità presente, dalle pendenze e dagli scarichi, oltre che dalle condizioni del supporto sottostante e dal sistema impermeabilizzante previsto.",
        "Se ci sono distacchi diffusi della pavimentazione, pendenze sbagliate o problemi negli strati sottostanti, può essere necessario un intervento più profondo, con la rimozione di parte della pavimentazione.",
      ],
      note: "La soluzione più adatta resta una valutazione del professionista dopo il sopralluogo, non una scelta da fare in anticipo.",
    },
    {
      id: "riconoscere-il-problema",
      title: "Come riconoscere un'infiltrazione dal terrazzo",
      intro:
        "Gli stessi sintomi possono avere origini diverse: riconoscerli aiuta a descrivere meglio il problema al professionista, non a stabilire da soli la causa.",
      items: [
        "macchie o gocciolamenti sul soffitto del locale sottostante",
        "infiltrazioni che compaiono dopo piogge intense",
        "ristagni d'acqua sulla superficie del terrazzo",
        "pavimento o fughe visibilmente deteriorati",
        "problemi vicino agli scarichi o ai bocchettoni",
        "impermeabilizzazione datata o mai rifatta",
        "distacchi della pavimentazione",
      ],
      note: "Gli stessi sintomi possono dipendere da punti diversi: solo il sopralluogo permette di individuare l'origine reale.",
    },
    {
      id: "cosa-controlla-il-professionista",
      title: "Cosa verifica il professionista durante il sopralluogo",
      items: [
        "origine probabile dell'infiltrazione",
        "stato della superficie e della pavimentazione",
        "eventuali fessure o distacchi",
        "pendenze del terrazzo",
        "scarichi e bocchettoni",
        "raccordi perimetrali con pareti e bordi",
        "condizioni degli strati sottostanti, quando verificabili",
        "compatibilità del sistema impermeabilizzante con il supporto esistente",
      ],
    },
  ],
  costSection: {
    title: "Quanto costa impermeabilizzare un terrazzo?",
    summary:
      "Il costo dipende dall'estensione dell'intervento, dallo stato del supporto e dal sistema impermeabilizzante scelto. Una riparazione localizzata e un rifacimento esteso della guaina hanno perimetri molto diversi: la valutazione corretta arriva dal sopralluogo.",
    factors: [
      "estensione della superficie da trattare",
      "stato della pavimentazione e del supporto sottostante",
      "necessità di rimuovere la pavimentazione esistente",
      "numero di raccordi, soglie, scarichi o bocchettoni da trattare",
      "sistema impermeabilizzante scelto",
    ],
    examples: [
      "impermeabilizzazione localizzata di un raccordo o di uno scarico",
      "impermeabilizzazione della superficie sopra la pavimentazione esistente",
      "rifacimento della guaina con rimozione della pavimentazione",
    ],
  },
  faq: [
    {
      question: "Si può impermeabilizzare il terrazzo senza togliere le piastrelle?",
      answer:
        "In alcuni casi sì, con sistemi compatibili con la pavimentazione esistente. Non è però sempre possibile: dipende dallo stato delle piastrelle e delle fughe, dalle pendenze, dagli scarichi e dalle condizioni del supporto. Il professionista lo verifica durante il sopralluogo.",
    },
    {
      question: "Come capire da dove entra l'acqua dal terrazzo?",
      answer:
        "Non sempre è intuitivo: macchie sul soffitto sottostante, infiltrazioni dopo piogge intense o ristagni possono avere origini diverse, anche lontane dal punto in cui compare il danno. È il sopralluogo, non la sola osservazione, a individuare l'origine reale.",
    },
    {
      question: "Quando bisogna rifare la guaina?",
      answer:
        "Quando il sistema impermeabilizzante esistente è deteriorato o non più affidabile, e una riparazione localizzata non basta più a garantire la tenuta all'acqua su tutta la superficie.",
    },
    {
      question: "Gli scarichi possono causare infiltrazioni?",
      answer:
        "Sì: un bocchettone (il punto attraverso cui l'acqua del terrazzo entra nello scarico) ostruito, mal raccordato o deteriorato è una causa frequente di infiltrazioni, anche quando il resto della pavimentazione sembra integro.",
    },
    {
      question: "Cosa succede se il terrazzo ha una pendenza sbagliata?",
      answer:
        "Se l'acqua non defluisce correttamente verso gli scarichi, ristagna e aumenta il rischio di infiltrazioni nel tempo. Correggere la pendenza può richiedere un intervento più esteso di una semplice impermeabilizzazione locale.",
    },
    {
      question: "Quando bisogna rimuovere la pavimentazione?",
      answer:
        "Quando ci sono distacchi diffusi, il supporto sottostante è compromesso o il sistema impermeabilizzante da ricostruire non è raggiungibile in altro modo. In questi casi lavorare solo sopra la pavimentazione esistente non è sufficiente.",
    },
    {
      question: "Una riparazione localizzata può bastare?",
      answer:
        "Per problemi circoscritti come un raccordo, una soglia o un bocchettone, spesso sì. Un risvolto (la parte dell'impermeabilizzazione che sale sui bordi o sulle pareti nei punti di raccordo) rovinato, per esempio, può essere sistemato senza intervenire su tutta la superficie. Se però l'impermeabilizzazione è compromessa in modo diffuso, una riparazione locale non risolve il problema generale.",
    },
    {
      question: "Cosa devo indicare per chiedere un preventivo?",
      answer:
        "Superficie approssimativa del terrazzo, se è pavimentato o con guaina a vista, dove si manifesta l'infiltrazione, eventuali ristagni e lavori già fatti in passato. Le fotografie del terrazzo e dei danni visibili aiutano molto i professionisti a valutare il lavoro.",
    },
  ],
};
