import type { SeoInterventionLanding } from "../types";

export const impermeabilizzareTettoLanding: SeoInterventionLanding = {
  slug: "impermeabilizzare-tetto",
  title: "Impermeabilizzare tetto",
  h1: "Impermeabilizzare tetto: trova imprese qualificate per guaina e infiltrazioni",
  description:
    "Impermeabilizzare un tetto significa intervenire su guaina, membrane e punti critici della copertura per fermare infiltrazioni e ripristinare la tenuta all'acqua, senza necessariamente rifare tutto il manto. Confronta imprese qualificate per il tuo intervento.",
  metaTitle: "Impermeabilizzare tetto: preventivi guaina e infiltrazioni",
  metaDescription:
    "Devi impermeabilizzare il tetto per infiltrazioni o guaina deteriorata? Scopri cosa comprende l'intervento e confronta preventivi da imprese qualificate.",
  funnelSlug: "impermeabilizzare-tetto",
  groupSlug: "tetti",
  requestCtaLabel: "Richiedi preventivi per l'impermeabilizzazione",
  image: {
    src: "/assets/images/rifare-tetto.webp",
    alt: "Impermeabilizzazione e guaina di una copertura",
  },
  geoSection: {
    title: "Trova imprese per impermeabilizzare il tetto nella tua zona",
    summary:
      "Descrivi il problema e la zona della copertura interessata per confrontare preventivi da imprese disponibili nella tua area.",
  },
  relatedInterventionSlugs: ["rifare-tetto"],
  professionalCategorySlugs: ["impresa-edile"],
  // Interventi taxonomy reali del gruppo "tetti", verificati contro
  // packages/taxonomy/src/frozen/source/project-groups/tetti.ts — confini e
  // lavori spesso abbinati a un'impermeabilizzazione, senza landing propria.
  relatedFunnelWork: [
    "riparare-tetto",
    "isolare-o-coibentare-tetto",
    "sistemare-grondaie",
    "installare-o-sostituire-lucernario",
    "bonificare-amianto-eternit-tetto",
  ],
  costSlug: "impermeabilizzare-tetto",
  requestItems: [
    "impermeabilizzazione di punti critici o infiltrazioni localizzate",
    "rifacimento della guaina o membrana impermeabilizzante",
    "trattamento di raccordi, bordi, comignoli o lucernari",
    "verifica e ripristino della tenuta all'acqua della copertura",
  ],
  scopeIncluded: [
    "sopralluogo e individuazione dei punti critici",
    "preparazione del supporto",
    "rimozione o ripristino delle parti deteriorate",
    "applicazione di guaina o membrana adatta",
    "trattamento di raccordi, bordi, comignoli, lucernari e scarichi, solo se pertinenti",
    "verifica finale della continuità dell'impermeabilizzazione",
  ],
  scopeExcluded: [
    "rifacimento completo della copertura",
    "sostituzione strutturale del tetto",
    "isolamento termico, se non previsto",
    "bonifica amianto o eternit",
    "lucernari, grondaie o linea vita, salvo lavorazioni esplicitamente comprese",
  ],
  scopeNote:
    "Ogni impresa compone il preventivo in modo diverso: usa queste liste per chiedere esplicitamente cosa è compreso e cosa no, prima di confrontare i prezzi.",
  variants: [
    {
      title: "Impermeabilizzazione mirata",
      summary:
        "Intervento sulla guaina o sulla membrana in un punto critico specifico, ad esempio un raccordo, un bordo o un comignolo, senza rifare l'impermeabilizzazione di tutta la copertura.",
    },
    {
      title: "Impermeabilizzazione completa",
      summary:
        "Sostituzione dell'intero strato impermeabilizzante della copertura, mantenendo struttura e manto esistenti: il caso più frequente quando la guaina è diffusamente deteriorata.",
    },
  ],
  preparationItems: [
    "foto delle infiltrazioni o dei punti critici",
    "zona del tetto interessata",
    "tipo di copertura, se noto",
    "accessibilità del tetto",
    "presenza di lucernari, comignoli, terrazze o raccordi",
    "eventuali lavori precedenti sul tetto",
  ],
  costSection: {
    title: "Quanto costa impermeabilizzare un tetto?",
    summary:
      "Il costo dipende soprattutto dall'estensione dell'area da trattare, dal tipo di intervento e dall'accessibilità della copertura. Se il problema riguarda l'intera copertura, la valutazione rientra piuttosto in un rifacimento del tetto.",
    factors: [
      "estensione della superficie da impermeabilizzare",
      "tipo e stato della copertura esistente",
      "accessibilità del tetto e necessità di ponteggi",
      "eventuali lavorazioni aggiuntive su raccordi, bordi o scarichi",
    ],
  },
  faq: [
    {
      question: "Quando basta impermeabilizzare e quando serve rifare il tetto?",
      answer:
        "Se il problema riguarda punti localizzati o la sola guaina, spesso è sufficiente un intervento di impermeabilizzazione. Quando i danni sono diffusi e riguardano anche la struttura o il manto, la valutazione corretta è un rifacimento completo del tetto.",
    },
    {
      question: "Che differenza c'è tra una riparazione localizzata e una nuova impermeabilizzazione?",
      answer:
        "Una riparazione localizzata interviene solo sul punto danneggiato, ad esempio una tegola o un raccordo. Una nuova impermeabilizzazione sostituisce l'intero strato di guaina o membrana della copertura, anche quando il manto visibile è ancora in buone condizioni.",
    },
    {
      question: "Il tetto può avere infiltrazioni anche se il manto sembra integro?",
      answer:
        "Sì. L'infiltrazione nasce spesso dalla guaina sottostante, da un raccordo o da un punto singolare come un comignolo o un lucernario, non necessariamente da tegole o lamiera visibilmente danneggiate.",
    },
    {
      question: "Cosa conviene mostrare al professionista prima del sopralluogo?",
      answer:
        "Foto della zona interessata, l'indicazione di dove si nota l'infiltrazione (anche dall'interno) e, se li hai, dettagli su eventuali lavori di impermeabilizzazione o riparazione già fatti in passato.",
    },
  ],
};
