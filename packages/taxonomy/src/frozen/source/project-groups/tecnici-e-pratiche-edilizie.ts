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
    {
      id: "fare-variazione-catastale",
      slug: "fare-variazione-catastale",
      name: "Fare una variazione catastale",
      // Pratica catastale (DOCFA): aggiornamento dei dati dell'immobile,
      // accatastamento, variazione. Servizio tecnico/documentale, non un lavoro
      // edile. Niente alias generici "casa"/"lavori casa"/"ristrutturazione".
      aliases: [
        "variazione catastale",
        "pratica catastale",
        "aggiornamento catastale",
        "modifica catastale",
        "docfa",
        "pratica docfa",
        "accatastamento",
        "accatastare casa",
        "geometra catasto",
        "tecnico catastale",
      ],
    },
    {
      id: "fare-sanatoria-edilizia",
      slug: "fare-sanatoria-edilizia",
      name: "Fare una sanatoria edilizia",
      // Pratica/valutazione tecnica per regolarizzare difformità (accertamento
      // di conformità). Copy PRUDENTE, mai promessa di esito: il tecnico
      // valuta/verifica/prepara la pratica e regolarizza SE possibile — niente
      // "sanatoria garantita"/"condono garantito". Servizio tecnico, non un
      // lavoro edile.
      aliases: [
        "sanatoria edilizia",
        "sanare abuso edilizio",
        "pratica sanatoria",
        "regolarizzare abuso edilizio",
        "conformità urbanistica",
        "verifica conformità urbanistica",
        "accertamento di conformità",
        "geometra sanatoria",
        "tecnico sanatoria",
        "pratica abuso edilizio",
      ],
    },
    {
      id: "fare-progetto-ristrutturazione",
      slug: "fare-progetto-ristrutturazione",
      name: "Fare progetto di ristrutturazione",
      // Servizio tecnico per PROGETTARE/organizzare una ristrutturazione prima
      // dell'esecuzione: progetto, distribuzione spazi, supporto tecnico,
      // direzione lavori (opzione) e computo metrico (eventuale supporto). NON
      // include l'esecuzione delle opere: quella è il gruppo ristrutturazioni
      // (impresa). Alias ANCORATI a "progetto/progettazione/tecnico" — vietati
      // "ristrutturazione"/"ristrutturare casa"/"preventivo ristrutturazione"/
      // "lavori casa"/"costruire casa"/"ampliamento casa" (→ ristrutturazioni /
      // costruzioni / impresa edile).
      aliases: [
        "progetto ristrutturazione",
        "progettazione ristrutturazione",
        "progetto ristrutturazione casa",
        "geometra progetto ristrutturazione",
        "architetto progetto ristrutturazione",
        "tecnico progetto casa",
        "progettare ristrutturazione",
        "progetto lavori interni",
      ],
    },
  ],
}
