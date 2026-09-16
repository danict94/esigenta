import type { CostGuideBaseContent } from "../types";

// Revisione 2026-08 (richiesta editoriale esplicita): la guida precedente
// riduceva l'intero rifacimento a un'unica fascia 60–120 €/mq "a corpo" più
// 5 righe "Da valutare con il professionista" senza numero — vedi il
// commento di revisione su "costGuide:rifare-facciata" in
// market-data/base-price-ranges.ts per il dettaglio completo delle 14
// PriceRow (3 macro-scenari di ampiezza + 10 lavorazioni del ciclo reale +
// ponteggio) che sostituiscono quel modello povero. Qui sotto solo editoriale
// nazionale: nessun numero è definito in questo file, tutti i prezzi vivono
// nella SSOT di market-data (vedi CostGuideBaseContent).
export const rifareFacciataBase: CostGuideBaseContent = {
  slug: "rifare-facciata",
  funnelSlug: "rifare-facciata",
  interventionSeoSlug: "rifare-facciata",
  title: "Costi rifacimento facciata",
  h1: "Quanto costa rifare la facciata?",
  metaTitle: "Quanto costa rifare la facciata? Prezzi al mq",
  // Data reale dell'ultima revisione editoriale sostanziale, non del deploy
  // (vedi engine/editorial-date.ts): la guida passa da 6 righe (1 prezzata +
  // 5 qualitative) a un modello a 3 scenari di ampiezza + 10 lavorazioni del
  // ciclo reale + ponteggio, Hero da 60–120 a 70–120 €/mq.
  lastModified: "2026-08-18",
  metaDescription:
    "Scopri quanto costa rifare la facciata: fascia orientativa al mq per il rifacimento esteso, scenari più leggeri, prezzi delle singole lavorazioni e quanto incide il ponteggio.",
  hubCategory: { slug: "tetti-e-facciate", name: "Tetti e facciate" },
  hubOrder: 30,
  hubDescription:
    "Fasce orientative per rifare la facciata, dal semplice rinnovo della finitura al rifacimento esteso con ripristino dell'intonaco e rasatura.",
  topicLabel: "rifare la facciata",
  summary:
    "Il costo dipende dallo stato della facciata, dall’estensione del degrado, dalle lavorazioni necessarie e dall’accessibilità del cantiere. Indicativamente, un rifacimento esteso con rimozione dell’intonaco ammalorato, ripristino, rasatura e nuova finitura può costare 70–120 €/mq. Un rinnovo della finitura o un ripristino localizzato può costare meno. Ponteggio e cappotto termico sono esclusi da questa fascia; consolidamenti strutturali importanti e restauri specialistici richiedono una valutazione separata.",
  hideHeroPricing: true,
  factors: [
    "altezza dell’edificio e modalità di accesso alla facciata",
    "presenza di balconi, aggetti, cornici, marcapiani o altri elementi che rendono le lavorazioni più articolate",
    "estensione e continuità delle superfici da trattare",
    "necessità di proteggere infissi, pavimentazioni, parti comuni o altre superfici durante i lavori",
    "spazio disponibile per ponteggio, carico, scarico e deposito dei materiali",
    "eventuali vincoli condominiali o limitazioni agli orari di cantiere",
    "trasporto, movimentazione e smaltimento dei materiali",
    "disponibilità e costo dei professionisti nella zona",
  ],
  compactFactors: {
    title: "Altri fattori che possono incidere sul preventivo",
    intro: "Oltre al tipo di intervento e alle lavorazioni necessarie, il preventivo può variare in base alle caratteristiche dell’edificio e alla logistica del cantiere.",
  },
  savingTips: [
    "Fai verificare lo stato reale dell’intonaco prima di scegliere tra rinnovo della finitura, ripristino parziale e rifacimento esteso.",
    "Chiedi preventivi con voci separate per ponteggio, rimozione e ripristino dell’intonaco, rasatura e finitura.",
    "Se l’edificio è condominiale, valuta la possibilità di coordinare i lavori con gli altri proprietari per distribuire i costi fissi del cantiere.",
    "Chiarisci nel preventivo quale rasatura e quale finitura sono previste: materiali e cicli diversi possono incidere sul costo.",
    "Verifica prima dell’avvio se sono necessarie autorizzazioni, occupazione di suolo pubblico o altre comunicazioni per il cantiere.",
  ],
  faqEmphasizePhrase: "70–120 €/mq",
  nationalRangeLabel: "Fascia orientativa",
  interventionRangeLabel: "FASCIA ORIENTATIVA AL MQ",
  nationalRangeNote:
    "Indicativamente 70–120 € al mq per un rifacimento esteso della facciata, con degrado significativo: controllo delle parti distaccate, rimozione dell'intonaco ammalorato, ripristino, rasatura, preparazione e nuova finitura — non una semplice tinteggiatura. Il ponteggio e il cappotto termico sono sempre esclusi da questa fascia. Interventi più leggeri costano meno: un rinnovo della finitura su facciata sana parte da 25–40 €/mq, un ripristino solo delle zone ammalorate da 45–80 €/mq (vedi gli scenari più sotto). Consolidamenti strutturali importanti e restauro specialistico o storico non rientrano in nessuna di queste fasce.",
  priceTableIntro:
    "La tabella distingue tre scenari di ampiezza del lavoro — dal semplice rinnovo della finitura al rifacimento esteso — dalle singole lavorazioni del ciclo (controllo, pulizia, rimozione e ripristino dell'intonaco, rasatura, preparazione del fondo, finiture) e dal ponteggio, sempre una voce a parte.",
  breakdownIntro:
    "Alcune lavorazioni possono essere già comprese nello scenario di rifacimento scelto: in questi casi non vanno sommate una seconda volta.",
  priceTableNote:
    "Le fasce sono elaborazioni editoriali Esigenta, ancorate a prezzari regionali ufficiali, confronto tra lavorazioni comparabili e mercato privato come controllo secondario — non la voce di un singolo prezzario regionale: utili per farsi un'idea prima del preventivo, non per sostituirlo. Il cappotto termico non è compreso nei prezzi di questa guida: aggiunge isolamento esterno, pannelli e un ciclo di posa specifico (vedi \"Ti serve solo una parte del lavoro?\" più sotto).",
  sizeExamplesTable: {
    title: "Esempi di costo per metratura",
    intro: "Le stime sono calcolate sulla fascia 70–120 €/mq del rifacimento esteso. Si riferiscono ai mq della superficie esterna della facciata, non alla superficie abitativa interna, e non comprendono il ponteggio.",
    notes: [
      "Le stime derivano da superficie × fascia del rifacimento esteso e non rappresentano preventivi indipendenti per ciascuna metratura. Un rinnovo della finitura o un ripristino parziale può avere un costo inferiore; stato della facciata, accessibilità e lavorazioni escluse possono modificare il totale.",
    ],
    surfaceLabel: "Superficie facciata",
  },
  // Interventi specifici spesso confusi con un rifacimento della facciata:
  // slug reali del gruppo taxonomy "facciate-e-balconi" (verificati contro
  // project-groups/facciate-e-balconi.ts), tenuti distinti su richiesta
  // esplicita — nessuno ha oggi una landing o guida propria, risolvono al
  // funnel via resolveBestHrefForIntervention finché non ne nascerà una.
  // Preservati invariati in questa revisione (nessuna modifica a slug/title,
  // solo la description del cappotto allineata alla frase richiesta
  // esplicitamente per questa guida — vedi anche priceTableNote sopra).
  relatedWork: [
    {
      slug: "realizzare-cappotto-termico-facciata",
      title: "Realizzare il cappotto termico della facciata",
      description:
        "Intervento distinto dal rifacimento della facciata, con isolamento esterno, pannelli e ciclo di posa specifico.",
    },
    {
      slug: "ripristinare-balconi-e-ballatoi",
      title: "Ripristinare balconi e ballatoi",
      description: "Per distacchi di intonaco o calcestruzzo ammalorato su balconi e ballatoi.",
    },
    {
      slug: "ripristino-frontalino",
      title: "Ripristinare il frontalino del balcone",
      description: "Per il ripristino del frontalino del balcone, distinto dalle lavorazioni sulla facciata.",
    },
  ],
};
