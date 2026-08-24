import type { SeoInterventionLanding } from "../types";

// Nuova landing 2026-08 — completa il cluster pavimenti già avviato:
// INTERVENTO /interventi/posare-o-rifare-pavimento-interno (questo file) →
// COST GUIDE /costi/rifare-pavimenti → FUNNEL /richiesta/posare-o-rifare-
// pavimento-interno. Lo slug della landing (e quindi funnelSlug, letto
// direttamente da getInterventionStaticParams via isInterventionPublished)
// DEVE coincidere con lo slug taxonomy reale — verificato: Intervention
// "posare-o-rifare-pavimento-interno" esiste, è publicationStatus
// "published" (packages/taxonomy/src/frozen/source/project-groups/
// pavimentazioni.ts), appartiene al ProjectGroup "pavimentazioni" (gruppo
// con una propria landing già registrata in pages/gruppi, quindi il
// breadcrumb risolve a /servizi/pavimentazioni) e alla categoria
// "impresa-edile" (professionalCategorySlugs). La Cost Guide resta invece
// deliberatamente su `/costi/rifare-pavimenti` (slug diverso dallo slug
// taxonomy, scelta intenzionale già approvata in quella revisione): qui
// basta `costSlug: "rifare-pavimenti"`, risolto da
// resolveCostGuideHrefForIntervention/resolveInterventionCostSectionPriceData
// — nessun numero duplicato in questo file, la fascia Hero (60–100 €/mq)
// viene letta automaticamente dalla guida collegata.
//
// Nessuna `image`: non esiste un asset reale per un pavimento generico
// (verificato in public/assets/images) e riusare una foto di un altro
// intervento sarebbe incoerente con il soggetto — stesso principio già
// applicato a impermeabilizzare-terrazzo. `image` è opzionale proprio per
// questo caso.
//
// Nessun `priceRowLabels` in costSection: stesso pattern minimale già usato
// da rifare-impianto-elettrico (pilota Fase 2) — la landing mostra solo la
// fascia complessiva e rimanda alla guida per il dettaglio voce per voce,
// mai un doppione della tabella prezzi.
//
// I 3 "livelli di intervento" (variants) sono coerenti con i 3 scenari
// della Cost Guide (posa sopra l'esistente / rimozione e nuova posa /
// rifacimento con nuovo massetto) ma senza numeri: qui si parla del
// LAVORO, i range restano solo in /costi/rifare-pavimenti.
export const posareORifarePavimentoInternoLanding: SeoInterventionLanding = {
  slug: "posare-o-rifare-pavimento-interno",
  title: "Posare o rifare pavimento interno",
  h1: "Posare o rifare un pavimento interno: confronta professionisti qualificati",
  description:
    "Devi cambiare il pavimento, posarne uno nuovo o capire se puoi lavorare sopra quello esistente? Descrivi gli ambienti, il pavimento attuale e il risultato che vuoi ottenere per confrontare professionisti adatti al lavoro.",
  metaTitle: "Posare o rifare il pavimento: preventivi professionisti",
  lastModified: "2026-08-25",
  metaDescription:
    "Devi posare un nuovo pavimento o capire se puoi lavorare sopra quello esistente? Scopri come funziona e confronta preventivi da professionisti qualificati.",
  funnelSlug: "posare-o-rifare-pavimento-interno",
  groupSlug: "pavimentazioni",
  requestCtaLabel: "Richiedi preventivi per il pavimento",
  geoSection: {
    title: "Trova professionisti per il tuo pavimento nella tua zona",
    summary:
      "Indica dove si trova l'abitazione e descrivi il lavoro per confrontare professionisti attivi nella tua area, dalla semplice posa al rifacimento completo.",
  },
  relatedInterventionSlugs: [],
  professionalCategorySlugs: ["impresa-edile"],
  // Interventi taxonomy reali del gruppo "pavimentazioni" (verificati contro
  // packages/taxonomy/src/frozen/source/project-groups/pavimentazioni.ts,
  // tutti publicationStatus "published"), distinti da questa landing: il
  // massetto e il parquet come lavori specialistici a sé, la riparazione
  // come intervento localizzato — non duplicano l'intervento principale.
  relatedFunnelWork: [
    "fare-massetto",
    "posare-levigare-o-ripristinare-parquet",
    "riparare-pavimento",
  ],
  costSlug: "rifare-pavimenti",
  requestItems: [
    "posa di un nuovo pavimento su un fondo già pronto",
    "posa sopra il pavimento esistente, quando tecnicamente possibile",
    "rimozione e sostituzione del vecchio pavimento",
    "preparazione o livellamento del fondo",
    "rifacimento del massetto, quando necessario",
    "posa di gres o piastrelle",
    "posa di pavimento SPC",
    "posa di pavimento laminato",
    "posa o sostituzione del parquet",
    "battiscopa e finiture collegate",
  ],
  scopeIncluded: [
    "sopralluogo e verifica del pavimento o del supporto esistente",
    "rimozione del vecchio pavimento, quando prevista",
    "movimentazione e gestione dei materiali rimossi",
    "verifica del sottofondo",
    "preparazione del fondo",
    "livellamento localizzato, quando necessario",
    "rifacimento del massetto, quando necessario",
    "posa della nuova pavimentazione",
    "collanti, sistemi di posa o materassini previsti dal materiale scelto",
    "fugatura, nel caso di piastrelle",
    "posa del battiscopa",
    "pulizia finale dell'area di lavoro",
  ],
  scopeExcluded: [
    "fornitura del nuovo pavimento, se acquistato direttamente da te",
    "nuovo massetto, quando non previsto",
    "problemi importanti scoperti dopo la demolizione",
    "adattamento di porte, portoncini e soglie",
    "importanti ripristini del fondo",
    "spostamento o modifica di impianti",
    "tinteggiature e altre finiture decorative",
    "lavori strutturali",
    "movimentazione importante di arredi, se non concordata",
  ],
  scopeNote:
    "Ogni professionista compone il preventivo in modo diverso: usa queste liste per chiedere esplicitamente cosa è compreso e cosa no, prima di confrontare i prezzi.",
  variants: [
    {
      title: "Posa sopra il pavimento esistente",
      summary:
        "Quando il pavimento attuale è stabile, ben aderente e sufficientemente regolare può essere possibile posare il nuovo rivestimento sopra quello esistente, evitando la demolizione. Prima vanno però controllati supporto, planarità, quote finali, porte e soglie.",
    },
    {
      title: "Rimozione e nuova pavimentazione",
      summary:
        "Il vecchio pavimento viene rimosso, il sottofondo viene controllato e preparato e viene posata la nuova pavimentazione. Se il massetto esistente è ancora idoneo, non è necessario rifarlo automaticamente.",
    },
    {
      title: "Rifacimento con nuovo massetto",
      summary:
        "Quando il sottofondo è deteriorato, fortemente irregolare o non più adatto alla nuova pavimentazione, il lavoro può richiedere un intervento più profondo, fino alla realizzazione di un nuovo massetto.",
    },
  ],
  preparationItems: [
    "superficie approssimativa interessata, in mq",
    "foto del pavimento esistente",
    "materiale attuale, se noto",
    "nuovo materiale desiderato",
    "eventuale preferenza per la posa sopra il pavimento esistente",
    "presenza di piastrelle rotte o staccate",
    "dislivelli visibili",
    "stato del massetto, se noto",
    "formato indicativo delle nuove piastrelle",
    "presenza di porte, portoncino o soglie da adattare",
    "appartamento abitato o vuoto",
    "piano dell'immobile",
    "accessibilità per il carico e lo scarico dei materiali",
  ],
  detailSections: [
    {
      id: "si-puo-posare-sopra",
      title: "Si può posare sopra il vecchio pavimento?",
      intro:
        "Sì, in alcuni casi. Prima però vanno verificati diversi aspetti del pavimento esistente.",
      items: [
        "stabilità",
        "adesione",
        "eventuali piastrelle distaccate",
        "crepe",
        "planarità",
        "stato del supporto",
        "quote finali",
        "porte e soglie",
        "compatibilità con il nuovo sistema scelto",
      ],
      note: "Se il pavimento esistente è instabile o presenta problemi diffusi, può essere necessaria la rimozione: solo la verifica del professionista permette di stabilirlo con certezza.",
    },
    {
      id: "quando-rifare-massetto",
      title: "Quando bisogna rifare il massetto?",
      paragraphs: [
        "Il massetto è lo strato che crea il piano stabile e regolare su cui viene posato il pavimento. Non deve essere demolito automaticamente insieme al vecchio pavimento: molto spesso resta idoneo, e si può lavorare direttamente su di esso.",
      ],
      items: [
        "è deteriorato",
        "è incoerente o poco compatto",
        "è fortemente irregolare",
        "è danneggiato",
        "non è idoneo al nuovo sistema di posa scelto",
        "va modificato per esigenze tecniche (es. nuove quote o spessori)",
      ],
      note: "Livellamento del fondo e nuovo massetto non sono la stessa cosa: una rasatura o un autolivellante sottile regolarizzano piccole imperfezioni, non sostituiscono un massetto da rifare quando il sottofondo non è più idoneo.",
    },
    {
      id: "gres-spc-laminato-parquet",
      title: "Gres, SPC, laminato o parquet?",
      intro: "Non esiste un materiale oggettivamente migliore: la scelta cambia in base a più fattori.",
      items: [
        "supporto esistente",
        "spessore disponibile",
        "metodo di posa",
        "utilizzo dell'ambiente",
        "manutenzione richiesta",
        "estetica desiderata",
        "possibilità di posa sopra il pavimento esistente",
        "budget",
      ],
      paragraphs: [
        "Lo SPC può essere una soluzione adatta alla posa sopra una superficie esistente, quando questa è sufficientemente stabile e regolare — ma non elimina sempre ogni preparazione del fondo: resta comunque necessaria una verifica preventiva.",
      ],
      note: "Solo un confronto con il professionista, sul tuo caso specifico, permette di scegliere il materiale più adatto.",
    },
    {
      id: "formato-piastrelle",
      title: "Perché il formato delle piastrelle cambia la posa?",
      intro:
        "Formati come 60×60, 60×120, 80×80, 120×120 e lastre ancora più grandi non implicano necessariamente lo stesso lavoro.",
      items: [
        "movimentazione",
        "peso",
        "planarità richiesta",
        "precisione",
        "numero e complessità dei tagli",
        "allineamento",
        "attrezzature necessarie",
        "tecnica di posa",
      ],
      note: "Le fasce di prezzo legate al formato sono nella guida ai costi del pavimento, non qui: questa pagina resta sul lavoro, non sui numeri.",
    },
    {
      id: "come-si-svolge",
      title: "Come si svolge il lavoro",
      intro:
        "La sequenza può variare da cantiere a cantiere: questo è un ordine indicativo, non un elenco rigido. Non tutti gli interventi richiedono tutte queste fasi — nella posa sopra il pavimento esistente, per esempio, demolizione e nuovo massetto possono non essere necessari.",
      items: [
        "sopralluogo",
        "verifica del supporto e del pavimento esistente",
        "protezione e preparazione degli ambienti",
        "eventuale demolizione",
        "controllo del massetto",
        "eventuale ripristino, livellamento o nuovo massetto",
        "posa della pavimentazione",
        "fugatura e finiture, quando previste",
        "posa del battiscopa",
        "adattamenti finali (porte, soglie)",
        "pulizia dell'area di lavoro",
      ],
    },
  ],
  costSection: {
    title: "Quanto costa rifare un pavimento?",
    summary:
      "Il costo dipende soprattutto dal tipo di intervento, dalla possibilità di conservare il massetto o posare sopra il pavimento esistente, dal materiale scelto, dal formato e dalle condizioni del fondo.",
    factors: [
      "tipo di intervento: posa sopra il pavimento esistente, rimozione e nuova posa, o rifacimento con nuovo massetto",
      "materiale scelto: gres, SPC, laminato o parquet",
      "formato delle piastrelle e complessità della posa",
      "condizioni del fondo e del massetto esistente",
    ],
    examples: [
      "posa di un nuovo pavimento su un fondo già pronto",
      "sostituzione del pavimento con rimozione del vecchio, massetto esistente conservato",
      "rifacimento esteso con nuovo massetto",
    ],
  },
  faq: [
    {
      question: "Si può mettere il nuovo pavimento sopra quello vecchio?",
      answer:
        "In alcuni casi sì, quando il pavimento esistente è stabile, ben aderente e sufficientemente regolare: si evita così la demolizione. Va però sempre verificato lo stato del supporto, la planarità e la compatibilità con porte e soglie esistenti. Se il pavimento presenta problemi diffusi, la sovrapposizione non è la soluzione adatta.",
    },
    {
      question: "Quando bisogna demolire il vecchio pavimento?",
      answer:
        "Quando il pavimento esistente non è stabile, ha piastrelle diffusamente distaccate o non è compatibile con il nuovo materiale scelto. In questi casi lavorare sopra la superficie esistente non è una soluzione affidabile: serve prima la rimozione.",
    },
    {
      question: "Bisogna rifare sempre anche il massetto?",
      answer:
        "No. Se il massetto esistente è ancora idoneo — stabile, regolare e compatibile con il nuovo sistema di posa — non serve rifarlo automaticamente insieme al pavimento. Un nuovo massetto serve solo quando il sottofondo è deteriorato, irregolare o non più adatto.",
    },
    {
      question: "Che differenza c'è tra livellare il fondo e rifare il massetto?",
      answer:
        "Il livellamento (o autolivellante) regolarizza piccole imperfezioni di un fondo già sostanzialmente piano. Il massetto è invece lo strato che crea il piano stabile su cui viene posato il pavimento: quando il sottofondo non è più idoneo, non basta un livellamento, serve rifare il massetto.",
    },
    {
      question: "Si può posare SPC sopra le vecchie piastrelle?",
      answer:
        "Può essere una soluzione adatta, quando la superficie esistente è sufficientemente stabile e regolare. Non significa però che ogni preparazione del fondo sia eliminata: resta comunque necessaria una verifica preventiva del supporto.",
    },
    {
      question: "Il formato delle piastrelle cambia la difficoltà della posa?",
      answer:
        "Sì. Formati più grandi (es. 80×80, 120×120 e oltre) richiedono maggiore precisione, movimentazione più impegnativa, più attenzione alla planarità e talvolta attrezzature specifiche: non è solo una questione di superficie da coprire.",
    },
    {
      question: "Cosa succede a porte e soglie se si posa sopra il pavimento esistente?",
      answer:
        "Il nuovo pavimento aggiunge spessore: porte, portoncini e soglie possono aver bisogno di essere adattati per continuare a funzionare correttamente. È uno degli aspetti da verificare prima di scegliere la sovrapposizione.",
    },
    {
      question: "Cosa devo indicare per ricevere un preventivo confrontabile?",
      answer:
        "Superficie approssimativa interessata, foto del pavimento esistente, materiale attuale e desiderato, eventuale preferenza per la sovrapposizione, e lo stato del massetto se lo conosci. Più dettagli fornisci, più i preventivi che ricevi saranno confrontabili tra loro.",
    },
  ],
};
