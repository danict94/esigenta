export type PriceRow = { label: string; range: string; note: string };
export type SizeExample = { label: string; range: string; note: string };

export type BasePriceRange = {
  nationalRange: string;
  pricePerSquareMeter: string;
  priceRows: readonly PriceRow[];
  sizeExamples: readonly SizeExample[];
};

const basePriceRangesByFamily: Record<string, BasePriceRange> = {
  "costGuide:ristrutturare-bagno": {
    nationalRange: "Costo complessivo: indicativamente da 3.000 € a 12.000 €",
    pricePerSquareMeter:
      "Costo al mq: indicativamente da 600 € a 1.500 € al mq",
    priceRows: [
      {
        label: "Rinnovo leggero bagno",
        range: "da 1.500 € a 4.000 €",
        note: "sostituzione sanitari, rubinetteria o finiture senza rifacimento completo",
      },
      {
        label: "Ristrutturazione completa",
        range: "da 3.500 € a 12.000 €",
        note: "demolizione, impianti, posa rivestimenti, sanitari e finiture",
      },
      {
        label: "Costo indicativo al mq",
        range: "da 600 € a 1.500 € al mq",
        note: "dipende da materiali, impianti, formato delle piastrelle e lavorazioni",
      },
      {
        label: "Demolizione e smaltimento",
        range: "variabile in base al cantiere",
        note: "incidono quantità di macerie, accesso, piano e conferimento",
      },
      {
        label: "Impianto idraulico / punti acqua",
        range: "da valutare con sopralluogo",
        note: "aumenta se si spostano scarichi, doccia, lavabo o sanitari",
      },
      {
        label: "Posa piastrelle e rivestimenti",
        range: "variabile per materiale e formato",
        note: "formati grandi, mosaici o pose complesse richiedono più lavorazione",
      },
      {
        label: "Installazione sanitari",
        range: "variabile per modello",
        note: "sanitari sospesi, rubinetteria e mobili bagno cambiano il costo finale",
      },
      {
        label: "Trasformazione vasca in doccia",
        range: "da valutare sul bagno esistente",
        note: "dipende da scarichi, rivestimenti, box doccia e opere murarie",
      },
    ],
    sizeExamples: [
      {
        label: "Bagno piccolo",
        range: "da 3.000 € a 6.000 €",
        note: "intervento compatto con scelte standard e impianti in buono stato",
      },
      {
        label: "Bagno medio",
        range: "da 4.500 € a 9.000 €",
        note: "caso frequente con rifacimento completo e nuove finiture",
      },
      {
        label: "Bagno grande o premium",
        range: "da 7.000 € a 12.000 € e oltre",
        note: "materiali ricercati, arredo su misura o lavorazioni più complesse",
      },
    ],
  },
  "costGuide:rifare-tetto": {
    nationalRange: "Costo complessivo: indicativamente da 8.000 € a 25.000 €",
    pricePerSquareMeter:
      "Costo al mq: indicativamente da 120 € a 300 € al mq",
    priceRows: [
      {
        label: "Rifacimento parziale tetto",
        range: "da 2.500 € a 8.000 €",
        note: "ripristino localizzato di una porzione di copertura",
      },
      {
        label: "Rifacimento completo tetto",
        range: "da 8.000 € a 25.000 €",
        note: "rimozione vecchia copertura, struttura, isolamento e nuovo manto",
      },
      {
        label: "Costo indicativo al mq",
        range: "da 120 € a 300 € al mq",
        note: "varia per materiale, isolamento, pendenza e accessibilità",
      },
      {
        label: "Smaltimento vecchia copertura",
        range: "variabile in base al cantiere",
        note: "incide la quantità di materiale, l'accesso e l'eventuale bonifica di materiali datati",
      },
      {
        label: "Isolamento termico tetto",
        range: "da valutare con sopralluogo",
        note: "aumenta se si interviene su coibentazione e ventilazione della copertura",
      },
      {
        label: "Grondaie e lattoneria",
        range: "variabile per metro lineare",
        note: "dipende da materiale, sviluppo lineare e complessità dei raccordi",
      },
      {
        label: "Ponteggi e accessibilità cantiere",
        range: "variabile in base all'edificio",
        note: "incidono altezza, accesso e durata prevista dei lavori",
      },
    ],
    sizeExamples: [
      {
        label: "Tetto piccolo (villetta)",
        range: "da 6.000 € a 12.000 €",
        note: "intervento compatto, accesso semplice, materiali standard",
      },
      {
        label: "Tetto medio",
        range: "da 10.000 € a 18.000 €",
        note: "caso frequente con rifacimento completo e isolamento",
      },
      {
        label: "Tetto grande o complesso",
        range: "da 18.000 € a 25.000 € e oltre",
        note: "superfici ampie, falde multiple o accesso difficoltoso",
      },
    ],
  },
};

export function getBasePriceRange(familyKey: string): BasePriceRange | null {
  return basePriceRangesByFamily[familyKey] ?? null;
}
