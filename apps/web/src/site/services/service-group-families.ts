// Raggruppamento in macro-famiglie per il catalogo /servizi. FrozenProjectGroup
// (packages/taxonomy) e' un indice piatto di 20 ambiti, senza concetto di
// famiglia — resta "frozen", nessuna struttura nuova aggiunta li'. Questo e'
// puro ordinamento di presentazione, vive solo qui. Slug verificati contro
// packages/taxonomy/src/frozen/source/project-groups/*.ts.
export type ServiceGroupFamily = {
  title: string;
  groupSlugs: string[];
};

export const serviceGroupFamilies: ServiceGroupFamily[] = [
  {
    title: "Ristrutturazione e muratura",
    groupSlugs: [
      "ristrutturazioni",
      "opere-murarie-e-demolizioni",
      "cartongesso",
      "costruzioni-e-ampliamenti",
    ],
  },
  {
    title: "Tetti e facciate",
    groupSlugs: ["tetti", "facciate-e-balconi"],
  },
  {
    title: "Impianti",
    groupSlugs: [
      "impianti-e-manutenzioni-elettriche",
      "idraulica",
      "riscaldamento",
      "climatizzazione",
      "citofoni-sicurezza-e-smart-home",
    ],
  },
  {
    title: "Finiture e serramenti",
    groupSlugs: ["pavimentazioni", "finiture", "serramenti-e-infissi"],
  },
  {
    title: "Esterni e specialità",
    groupSlugs: [
      "fotovoltaico",
      "fabbro-serrande-e-cancelli",
      "camini-stufe-e-canne-fumarie",
      "esterni-e-giardino",
      "piscine",
      "tecnici-e-pratiche-edilizie",
    ],
  },
];
