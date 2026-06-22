import type { InterventionCoverageInput } from "./types";

/**
 * Decisione di coverage per OGNI Intervention reale del catalogo taxonomy
 * frozen (Category -> ProjectGroup -> Intervention -> Alias). validators.ts fa
 * fallire il build se frozenTaxonomySource contiene un intervento assente da
 * questa lista, o se questa lista referenzia uno slug che non esiste più in
 * taxonomy (Phase 17 — la legacy taxonomy source tree non esiste più).
 *
 * Questo NON duplica i dati taxonomy (name/aliases restano solo in
 * packages/taxonomy): ogni riga qui è solo la decisione editoriale minima
 * (stato, macro area, priorità).
 *
 * priority è relativo alla singola macro area (più basso = più in evidenza), non
 * un ordine globale.
 */
export const interventionCoverage: readonly InterventionCoverageInput[] = [
  // --- Ristrutturazioni ---
  { taxonomyInterventionSlug: "ristrutturare-bagno", state: "SEO_PAGE_NOW", macroAreaSlug: "ristrutturazioni", priority: 1 },
  { taxonomyInterventionSlug: "ristrutturare-cucina", state: "REQUEST_NOW", macroAreaSlug: "ristrutturazioni", priority: 2 },
  { taxonomyInterventionSlug: "ristrutturare-appartamento", state: "REQUEST_NOW", macroAreaSlug: "ristrutturazioni", priority: 3 },
  { taxonomyInterventionSlug: "ristrutturare-casa", state: "REQUEST_NOW", macroAreaSlug: "ristrutturazioni", priority: 4 },

  // --- Tetti e facciate ---
  { taxonomyInterventionSlug: "rifare-tetto", state: "SEO_PAGE_NOW", macroAreaSlug: "tetti-e-facciate", priority: 1, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "riparare-tetto", state: "REQUEST_NOW", macroAreaSlug: "tetti-e-facciate", priority: 2 },
  { taxonomyInterventionSlug: "sistemare-grondaie", state: "REQUEST_NOW", macroAreaSlug: "tetti-e-facciate", priority: 3 },

  // --- Opere murarie ---
  { taxonomyInterventionSlug: "fare-opere-murarie", state: "REQUEST_NOW", macroAreaSlug: "opere-murarie", priority: 1 },
  { taxonomyInterventionSlug: "fare-massetto", state: "REQUEST_NOW", macroAreaSlug: "opere-murarie", priority: 2 },
  { taxonomyInterventionSlug: "ripristino-frontalino", state: "REQUEST_NOW", macroAreaSlug: "opere-murarie", priority: 3 },

  // --- Impianti elettrici ---
  { taxonomyInterventionSlug: "rifare-impianto-elettrico", state: "SEO_PAGE_NOW", macroAreaSlug: "impianti-elettrici", priority: 1, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "fare-impianto-elettrico-nuovo", state: "REQUEST_NOW", macroAreaSlug: "impianti-elettrici", priority: 2 },
  { taxonomyInterventionSlug: "riparare-guasto-elettrico", state: "REQUEST_NOW", macroAreaSlug: "impianti-elettrici", priority: 3, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "riparare-quadro-elettrico", state: "REQUEST_NOW", macroAreaSlug: "impianti-elettrici", priority: 4 },
  { taxonomyInterventionSlug: "installare-illuminazione", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impianti-elettrici", priority: 5 },

  // --- Idraulica ---
  { taxonomyInterventionSlug: "riparare-perdita-acqua", state: "REQUEST_NOW", macroAreaSlug: "idraulica", priority: 1, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "installare-sanitari", state: "REQUEST_NOW", macroAreaSlug: "idraulica", priority: 2 },
  { taxonomyInterventionSlug: "sostituire-box-doccia", state: "REQUEST_NOW", macroAreaSlug: "idraulica", priority: 3 },
  { taxonomyInterventionSlug: "rifare-impianto-idraulico-bagno", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "idraulica", priority: 4 },
  { taxonomyInterventionSlug: "disostruire-scarichi", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "idraulica", priority: 5 },

  // --- Clima ed energia ---
  { taxonomyInterventionSlug: "installare-fotovoltaico", state: "SEO_PAGE_NOW", macroAreaSlug: "clima-ed-energia", priority: 1, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "installare-climatizzatore", state: "SEO_PAGE_NOW", macroAreaSlug: "clima-ed-energia", priority: 2, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "installare-fotovoltaico-con-accumulo", state: "REQUEST_NOW", macroAreaSlug: "clima-ed-energia", priority: 3 },
  { taxonomyInterventionSlug: "fare-manutenzione-climatizzatore", state: "REQUEST_NOW", macroAreaSlug: "clima-ed-energia", priority: 4 },

  // --- Imbianchini e finiture ---
  { taxonomyInterventionSlug: "tinteggiare-interni", state: "REQUEST_NOW", macroAreaSlug: "imbianchini-e-finiture", priority: 1 },
  { taxonomyInterventionSlug: "tinteggiare-esterni", state: "REQUEST_NOW", macroAreaSlug: "imbianchini-e-finiture", priority: 2 },

  // --- Cartongesso e pareti ---
  { taxonomyInterventionSlug: "realizzare-parete-cartongesso", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 1 },
  { taxonomyInterventionSlug: "realizzare-controsoffitto", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 2 },
  { taxonomyInterventionSlug: "realizzare-controparete", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 3 },
  { taxonomyInterventionSlug: "intonacare-pareti", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 4 },
  { taxonomyInterventionSlug: "ripristinare-intonaco", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 5 },
  { taxonomyInterventionSlug: "applicare-stucco-decorativo", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 6 },
];
