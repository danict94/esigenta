import type { SeoInterventionLanding } from "../types";

export const rifareFacciataLanding: SeoInterventionLanding = {
  slug: "rifare-facciata",
  title: "Rifare facciata",
  h1: "Rifare facciata: trova imprese qualificate per intonaco e tinteggiatura",
  description:
    "Rifare la facciata può includere rimozione dell'intonaco ammalorato, ripristino, rasatura, finitura e tinteggiatura. Confronta imprese qualificate per il tuo intervento.",
  metaTitle: "Rifare facciata: preventivi per intonaco e tinteggiatura",
  lastModified: "2026-08-09",
  metaDescription:
    "Devi rifare la facciata? Scopri cosa incide sul costo, quali lavori puoi richiedere e confronta preventivi da imprese qualificate.",
  funnelSlug: "rifare-facciata",
  groupSlug: "facciate-e-balconi",
  requestCtaLabel: "Richiedi preventivi per la facciata",
  geoSection: {
    title: "Trova imprese per rifare la facciata nella tua zona",
    summary:
      "Descrivi superficie, stato della facciata e tipo di intervento per confrontare preventivi da imprese disponibili nella tua area.",
  },
  relatedInterventionSlugs: [],
  professionalCategorySlugs: ["impresa-edile"],
  // Interventi taxonomy reali del gruppo "facciate-e-balconi", verificati
  // contro packages/taxonomy/src/frozen/source/project-groups/
  // facciate-e-balconi.ts — tenuti distinti dal rifacimento ordinario su
  // richiesta esplicita: cappotto termico, balconi/ballatoi e frontalini
  // sono interventi a sé, non varianti di questo.
  relatedFunnelWork: [
    "realizzare-cappotto-termico-facciata",
    "ripristinare-balconi-e-ballatoi",
    "ripristino-frontalino",
  ],
  costSlug: "rifare-facciata",
  requestItems: [
    "rifacimento completo della facciata",
    "ripristino di intonaco ammalorato o crepe",
    "rasatura e finitura della superficie",
    "tinteggiatura esterna",
  ],
  scopeIncluded: [
    "rimozione delle parti di intonaco ammalorato o distaccato",
    "preparazione del supporto",
    "ripristino dell'intonaco nelle zone rimosse",
    "rasatura e finitura della superficie",
    "tinteggiatura esterna",
    "pulizia e protezione delle superfici circostanti durante i lavori",
  ],
  scopeExcluded: [
    "cappotto termico e isolamento della facciata",
    "consolidamenti strutturali importanti",
    "restauro specialistico o facciata storica/vincolata",
    "ripristino di balconi, ballatoi e frontalini",
    "ponteggio, se non incluso esplicitamente nel preventivo",
    "decorazioni, cornicioni o elementi architettonici particolari",
  ],
  scopeNote:
    "Ogni impresa compone il preventivo in modo diverso: usa queste liste per chiedere esplicitamente cosa è compreso e cosa no, prima di confrontare i prezzi.",
  variants: [
    {
      title: "Sola tinteggiatura",
      summary:
        "L'intonaco esistente è in buone condizioni: si interviene solo con pulizia, eventuale rasatura leggera e nuova tinteggiatura.",
    },
    {
      title: "Ripristino parziale",
      summary:
        "Solo le zone con intonaco ammalorato o distaccato vengono rimosse e ripristinate, prima di rasatura e tinteggiatura su tutta la facciata.",
    },
    {
      title: "Rifacimento completo",
      summary:
        "Rimozione estesa dell'intonaco datato, nuovo intonaco, rasatura, finitura e tinteggiatura su tutta la facciata: il caso più frequente quando l'intonaco è diffusamente ammalorato.",
    },
  ],
  preparationItems: [
    "qualche foto della facciata attuale",
    "superficie indicativa della facciata",
    "stato dell'intonaco: crepe, distacchi, macchie o umidità",
    "altezza dell'edificio e se serve un ponteggio",
    "se è una villa o un edificio condominiale",
    "eventuali vincoli condominiali, storici o paesaggistici",
    "quando vorresti iniziare i lavori",
  ],
  detailSections: [
    {
      id: "tinteggiatura-o-intonaco",
      title: "Quando basta tinteggiare e quando serve rifare l'intonaco",
      paragraphs: [
        "Se l'intonaco esistente è compatto, senza crepe diffuse o distacchi, spesso è sufficiente una pulizia della superficie seguita da una nuova tinteggiatura, con un'eventuale rasatura leggera nei punti più segnati.",
        "Quando invece l'intonaco presenta crepe estese, distacchi, rigonfiamenti o zone che suonano \"vuote\" al tocco, la sola tinteggiatura non risolve il problema: va prima rimosso e ripristinato nelle parti ammalorate, prima di procedere con rasatura, finitura e tinteggiatura.",
      ],
      note: "Solo un sopralluogo permette di stabilire con certezza quali zone della facciata vanno effettivamente ripristinate.",
    },
    {
      id: "facciata-o-cappotto",
      title: "Differenza tra rifacimento facciata e cappotto termico",
      paragraphs: [
        "Il rifacimento ordinario della facciata interviene sull'aspetto e sulla protezione della superficie esterna: intonaco, rasatura, finitura e tinteggiatura, senza modificare le prestazioni termiche dell'edificio.",
        "Il cappotto termico è un intervento diverso: aggiunge uno strato isolante sulla facciata per migliorare l'efficienza energetica dell'edificio. Comporta lavorazioni, spessori e costi diversi dal semplice rifacimento, ed è trattato come un intervento a sé.",
      ],
      note: "Se l'obiettivo principale è isolare termicamente l'edificio, il percorso corretto è quello dedicato al cappotto termico, non il rifacimento ordinario della facciata.",
    },
    {
      id: "villa-o-condominio",
      title: "Casa o villa e condominio: cosa cambia",
      paragraphs: [
        "Su una villa o una casa indipendente, l'accesso alla facciata è generalmente più semplice e il ponteggio riguarda un solo proprietario, che decide autonomamente tempi e capitolato.",
        "In un condominio il rifacimento della facciata coinvolge in genere più proprietari: il ponteggio è condiviso, i lavori seguono le decisioni assembleari e i tempi possono allungarsi per il coordinamento tra le parti.",
      ],
      note: "In entrambi i casi la superficie della facciata, non quella abitativa, è il dato che incide di più sul preventivo.",
    },
  ],
  costSection: {
    title: "Quanto costa rifare la facciata?",
    summary:
      "Il prezzo cambia soprattutto in base a superficie, stato dell'intonaco esistente, tipo di finitura e necessità di ponteggio. Per lavori importanti è essenziale una valutazione tecnica.",
    factors: [
      "superficie della facciata",
      "stato dell'intonaco esistente",
      "tipo di rasatura e finitura",
      "necessità e complessità del ponteggio",
    ],
    examples: [
      "sola tinteggiatura su intonaco in buone condizioni",
      "ripristino parziale con rasatura e tinteggiatura",
      "rifacimento completo di intonaco, rasatura e tinteggiatura",
    ],
  },
  faq: [
    {
      question: "Quando conviene rifare la facciata invece di limitarsi alla tinteggiatura?",
      answer:
        "Quando l'intonaco presenta crepe diffuse, distacchi o zone ammalorate: in questi casi la sola tinteggiatura non risolve il problema e rischia di staccarsi in poco tempo. Una verifica tecnica aiuta a stabilire l'intervento corretto.",
    },
    {
      question: "Il rifacimento della facciata comprende anche il cappotto termico?",
      answer:
        "No. Sono due interventi distinti: il rifacimento ordinario ripristina intonaco e finitura, mentre il cappotto termico aggiunge isolamento. Se ti interessa anche l'isolamento, puoi richiederlo come lavoro specifico insieme alla facciata.",
    },
    {
      question: "Serve il ponteggio per rifare la facciata?",
      answer:
        "Dipende dall'altezza dell'edificio e dall'accessibilità: per edifici a più piani è quasi sempre necessario, mentre per superfici basse e raggiungibili potrebbe bastare un trabattello. È una voce spesso quotata a parte nel preventivo.",
    },
  ],
};
