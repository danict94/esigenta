import type { CostGuideBaseContent } from "../types";

export const rifareImpiantoElettricoBase: CostGuideBaseContent = {
  slug: "rifare-impianto-elettrico",
  funnelSlug: "rifare-impianto-elettrico",
  interventionSeoSlug: "rifare-impianto-elettrico",
  title: "Costi impianto elettrico",
  h1: "Quanto costa rifare un impianto elettrico?",
  metaTitle: "Quanto costa rifare un impianto elettrico? Guida ai costi",
  metaDescription:
    "Prezzi ufficiali da prezzari regionali per punti luce, punti presa, distribuzione, componenti del quadro e opere murarie di un impianto elettrico.",
  heroImage: {
    src: "/assets/images/impianto-elettrico.webp",
    alt: "Intervento su impianto elettrico domestico",
  },
  hubCategory: { slug: "impianti-e-manutenzioni-elettriche", name: "Impianti e manutenzioni elettriche" },
  hubOrder: 10,
  hubDescription:
    "Costi di punti luce, prese, linee, componenti del quadro e opere murarie, spiegati in linguaggio semplice.",
  topicLabel: "rifare un impianto elettrico",
  summary:
    "Rifare un impianto elettrico comprende punti luce, punti presa, distribuzione interna, quadro elettrico e opere murarie: sono lavorazioni diverse, ciascuna con un proprio prezzo ufficiale, che non si sommano automaticamente in un costo unico. La tabella sotto riporta i prezzi puntuali dei prezzari regionali dei lavori pubblici: usali per confrontare le singole voci di un preventivo, non per stimare un totale.",
  factors: [
    "numero di punti luce, punti presa e punti comando richiesti",
    "tipo di posa: incassata, a vista, o sola posa su predisposizione esistente",
    "sezione dei cavi e configurazione della distribuzione interna",
    "componenti del quadro elettrico necessari (magnetotermici, differenziali, carpenteria)",
    "estensione delle opere murarie (tracce) e tipo di muratura",
    "stato dell'impianto esistente e necessità di adeguamenti",
    "necessità di adeguamenti o nuova documentazione tecnica",
  ],
  savingTips: [
    "Chiedi che il preventivo distingua punti elettrici, distribuzione interna, componenti del quadro e opere murarie: sono voci diverse con prezzi diversi.",
    "Verifica se ogni punto luce o presa è a incasso o a vista: la posa a vista ha un prezzo diverso da quella incassata.",
    "Chiedi se le tracce murarie comprendono anche la chiusura e il ripristino, o solo l'apertura.",
    "Fai indicare separatamente i componenti del quadro elettrico (magnetotermici, differenziali, carpenteria) dal loro cablaggio.",
    "Chiedi quali prove e quali documenti tecnici sono compresi nel preventivo: non sono sempre inclusi allo stesso modo.",
  ],
  nationalRangeLabel: "Come si compone il costo",
  priceTableIntro:
    "Le voci non sono sempre cumulative: alcune descrivono lavorazioni complete, altre singoli componenti o opere accessorie. Il costo finale non si ottiene sommando automaticamente tutte le righe.",
  priceTableNote:
    "I valori riportati derivano dai prezzari regionali dei lavori pubblici Emilia-Romagna 2025 e Friuli Venezia Giulia 2025: non sono un tariffario nazionale né un preventivo per lavori privati, e le voci di categorie diverse (punti elettrici, distribuzione, componenti del quadro, opere murarie) non vanno sommate tra loro. Nei prezzari consultati non è stata individuata una voce autonoma e omogenea per dichiarazione di conformità, verifiche finali, progetto o collaudo: il preventivo che ricevi deve indicare esplicitamente quali prove e quali documenti sono compresi.",
  relatedWork: [
    {
      slug: "riparare-guasto-elettrico",
      title: "Riparare un guasto elettrico",
      description: "Se il problema è un guasto puntuale, non un rifacimento dell'impianto.",
    },
    {
      slug: "riparare-quadro-elettrico",
      title: "Sistemare o sostituire il quadro elettrico",
      description: "Se serve intervenire solo sul quadro, non su tutto l'impianto.",
    },
  ],
};
