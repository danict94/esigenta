// Copy condivisa del metodo Esigenta ("Come funziona"), estratta dalla home
// (Fase 4.1) perché riusata anche dalle landing gruppo: una sola fonte, mai
// riscrivere questi step altrove.
export type ProcessStep = {
  marker: string;
  verified?: boolean;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    marker: "1",
    title: "Descrivi",
    description: "Racconti cosa devi fare con parole semplici: bagno, tetto, impianto, energia o clima.",
  },
  {
    marker: "2",
    title: "Verifichiamo",
    description: "Mettiamo ordine nei dettagli essenziali prima di inviare la richiesta alle imprese adatte.",
  },
  {
    marker: "3",
    title: "Confrontiamo",
    description: "Ricevi risposte leggibili e comparabili, senza disperdere il lavoro tra mille contatti casuali.",
  },
  {
    marker: "ok",
    verified: true,
    title: "Lavoro fatto",
    description: "Scegli chi ti convince e porti il progetto a terra con un percorso chiaro dall'inizio alla fine.",
  },
];
