import type { CostGuideBaseContent } from "../types";

export const impermeabilizzareTettoBase: CostGuideBaseContent = {
  slug: "impermeabilizzare-tetto",
  funnelSlug: "impermeabilizzare-tetto",
  interventionSeoSlug: "impermeabilizzare-tetto",
  title: "Costi impermeabilizzazione tetto",
  h1: "Quanto costa impermeabilizzare un tetto?",
  metaTitle: "Quanto costa impermeabilizzare un tetto? Prezzi indicativi",
  metaDescription:
    "Scopri quanto costa impermeabilizzare un tetto: prezzo al mq, cosa comprende l'intervento e quando è già incluso in un rifacimento completo.",
  heroImage: {
    src: "/assets/images/rifare-tetto.webp",
    alt: "Impermeabilizzazione e guaina di una copertura",
  },
  hubCategory: { slug: "tetti-e-facciate", name: "Tetti e facciate" },
  topicLabel: "impermeabilizzare un tetto",
  summary:
    "I prezzi di questa guida provengono da prezzari regionali ufficiali dei lavori pubblici e descrivono voci di capitolato tecnico specifiche, non un preventivo per lavori privati: ogni voce ha un prezzo puntuale, che non va sommato alle altre né trasformato in una fascia. Se stai già valutando un rifacimento completo, controlla il preventivo: l'impermeabilizzazione può essere già compresa e non va conteggiata come costo separato.",
  factors: [
    "tipo di lavorazione richiesta: nuova impermeabilizzazione, riparazione o sola preparazione",
    "tipo di manto o membrana scelta",
    "stato del supporto esistente",
    "estensione dell'area interessata",
    "accessibilità della copertura e necessità di ponteggi",
    "numero di punti critici: bocchettoni, comignoli, lucernari",
    "eventuale smaltimento del materiale rimosso",
  ],
  savingTips: [
    "Chiedi sempre quale lavorazione tecnica è prevista nel preventivo (nuova posa, riparazione, sola preparazione): voci diverse hanno prezzi molto diversi e non sono intercambiabili.",
    "Descrivi con precisione il problema: infiltrazione localizzata, guaina diffusamente deteriorata o entrambe.",
    "Allega foto delle zone interessate, anche scattate dall'interno.",
    "Indica una superficie approssimativa dell'area da trattare.",
    "Segnala accessibilità del tetto e presenza di raccordi, comignoli o lucernari vicino alla zona.",
    "Chiedi sempre se il preventivo include la rimozione della guaina esistente.",
    "Se hai già chiesto un preventivo per il rifacimento completo, chiedi se include l'impermeabilizzazione, per evitare di pagarla due volte.",
  ],
  priceTableNote:
    "I valori riportati derivano da prezzari regionali dei lavori pubblici 2025–2026 e si riferiscono a lavorazioni tecniche specifiche. Non costituiscono un tariffario nazionale né un preventivo per lavori privati. Il costo reale può variare in base alla regione, allo stato del supporto, alla superficie, all'accessibilità, ai dettagli costruttivi e alle opere escluse dal capitolato.",
  // Collegamento obbligatorio con rifare-tetto (confine editoriale: le due
  // guide si richiamano a vicenda) + il confine più diretto (riparare-tetto).
  // Risolti da resolveBestHrefForIntervention: "rifare-tetto" va alla sua
  // guida costi (esiste), "riparare-tetto" al funnel (non ha guida propria).
  relatedWork: [
    {
      slug: "rifare-tetto",
      title: "Rifare il tetto",
      description: "Se il problema riguarda l'intera copertura, non solo la tenuta all'acqua.",
    },
    {
      slug: "riparare-tetto",
      title: "Riparare il tetto",
      description: "Se il danno è puntuale sul manto, tegole o coppi, non sulla guaina.",
    },
  ],
};
