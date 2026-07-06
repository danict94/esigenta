import type { FrozenProjectGroup } from "../types/project-group"

// Tecnici e pratiche edilizie (categoria `geometra`, sector edilizia): servizi
// tecnico-documentali del professionista abilitato (geometra/architetto/
// ingegnere) — pratiche edilizie e certificazioni. Confine: QUI si compra un
// servizio tecnico/documentale, non un cantiere. Fuori scope (restano nei
// rispettivi gruppi esecutivi): lavori edili, installazione impianti,
// ristrutturazione/costruzione/ampliamento, cappotto/facciata, fotovoltaico.
// Batch 1 prudente: i 2 interventi core. Sanatoria, variazione catastale,
// progetto ristrutturazione e direzione lavori arrivano dopo, 1-2 alla volta.
export const tecniciEPraticheEdilizie: FrozenProjectGroup = {
  id: "tecnici-e-pratiche-edilizie",
  slug: "tecnici-e-pratiche-edilizie",
  name: "Tecnici e pratiche edilizie",
  interventions: [
    {
      id: "fare-cila-o-scia",
      slug: "fare-cila-o-scia",
      name: "Fare una CILA o SCIA",
      // Pratica edilizia per lavori: CILA (manutenzione straordinaria non
      // strutturale) o SCIA (opere strutturali). NIENTE alias generici
      // "ristrutturazione"/"ristrutturare casa" (→ gruppo ristrutturazioni).
      aliases: [
        "cila",
        "scia",
        "pratica cila",
        "pratica scia",
        "pratica edilizia",
        "permesso lavori casa",
        "comunicazione inizio lavori",
        "segnalazione certificata inizio attività",
        "geometra cila",
        "geometra scia",
      ],
    },
    {
      id: "fare-ape",
      slug: "fare-ape",
      name: "Fare un APE (certificato energetico)",
      // Certificazione/documento (Attestato di Prestazione Energetica) emesso
      // dal tecnico abilitato. NON è un intervento energetico: niente alias
      // "fotovoltaico"/"pompa di calore"/"cappotto"/"riqualificazione
      // energetica" (→ gruppi clima-energia).
      aliases: [
        "ape",
        "attestato prestazione energetica",
        "certificazione energetica",
        "certificato energetico casa",
        "ape casa",
        "ape appartamento",
        "geometra ape",
        "tecnico ape",
      ],
    },
  ],
}
