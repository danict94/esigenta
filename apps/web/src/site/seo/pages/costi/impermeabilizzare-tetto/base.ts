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
    "Il costo di impermeabilizzare un tetto dipende soprattutto da cosa comprende il preventivo: dalla sola posa su un supporto già pronto fino a un ciclo completo, con o senza armatura rinforzata. Le fasce di questa guida sono indicative e non cumulabili: ogni preventivo ha un perimetro diverso e va confrontato voce per voce. Se stai già valutando un rifacimento completo, controlla il preventivo: l'impermeabilizzazione può essere già compresa e non va sommata come costo separato.",
  factors: [
    "perimetro del preventivo: sola posa o fornitura e posa",
    "tipo e qualità della guaina o membrana",
    "numero di strati e presenza di armatura in tessuto non tessuto",
    "primer e preparazione del supporto richiesta",
    "sovrapposizioni, risvolti e raccordi",
    "estensione dell'area e accessibilità della copertura",
    "numero di punti critici: bocchettoni, comignoli, lucernari",
    "necessità di ponteggi",
  ],
  savingTips: [
    "Chiedi sempre cosa comprende il preventivo (sola posa o fornitura e posa, ciclo semplice o rinforzato): il perimetro cambia molto il prezzo finale, non solo il materiale.",
    "Descrivi con precisione il problema: infiltrazione localizzata, guaina diffusamente deteriorata o entrambe.",
    "Allega foto delle zone interessate, anche scattate dall'interno.",
    "Indica una superficie approssimativa dell'area da trattare.",
    "Segnala accessibilità del tetto e presenza di raccordi, comignoli o lucernari vicino alla zona.",
    "Chiedi sempre se il preventivo include la rimozione della guaina esistente.",
    "Se hai già chiesto un preventivo per il rifacimento completo, chiedi se include l'impermeabilizzazione, per evitare di pagarla due volte.",
  ],
  priceTableNote:
    "Le fasce sono indicative e servono a distinguere il perimetro del preventivo. Il costo effettivo dipende dai materiali utilizzati, dallo stato del supporto, dalla superficie, dall'accessibilità e dalla quantità di punti critici. Rimozione della vecchia impermeabilizzazione, smaltimento, ponteggi, ripristini importanti, isolamento termico e lavorazioni strutturali possono essere conteggiati separatamente.",
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
