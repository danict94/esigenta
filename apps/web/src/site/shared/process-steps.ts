// Copy condivisa del metodo Esigenta ("Come funziona"), estratta dalla home
// (Fase 4.1) perché riusata anche dalle landing gruppo: una sola fonte, mai
// riscrivere questi step altrove.
export type ProcessStep = {
  marker: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    marker: "PASSO 1",
    title: "Descrivi il lavoro",
    description:
      "Racconta cosa devi fare con parole semplici: bagno, tetto, impianto, energia o clima.",
  },
  {
    marker: "PASSO 2",
    title: "Ricevi risposte adatte",
    description:
      "Mettiamo ordine nei dettagli e inviamo la richiesta alle imprese adatte, così ricevi risposte chiare e comparabili.",
  },
  {
    marker: "PASSO 3",
    title: "Scegli con calma",
    description: "Valuta le risposte e scegli chi ti convince, senza obblighi.",
  },
];
