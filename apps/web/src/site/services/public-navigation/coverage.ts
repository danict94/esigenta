import type { InterventionCoverageInput } from "./types";

/**
 * Decisione di coverage per OGNI TaxonomyIntervention reale (81 al momento della
 * scrittura, Phase 19.6H). validators.ts fa fallire il build se taxonomySource
 * contiene un intervento assente da questa lista, o se questa lista referenzia uno
 * slug che non esiste più in taxonomy.
 *
 * Questo NON duplica i dati taxonomy (name/services/aliases restano solo in
 * packages/taxonomy): ogni riga qui è solo la decisione editoriale minima
 * (stato, macro area o motivo di esclusione, priorità) — publicLabel/seoStatus/
 * costGuideStatus vengono derivati altrove (builders.ts) da taxonomy +
 * seo-page-map.ts + cost-guide-map.ts.
 *
 * priority è relativo alla singola macro area (più basso = più in evidenza), non
 * un ordine globale.
 */
export const interventionCoverage: readonly InterventionCoverageInput[] = [
  // --- Ristrutturazioni (domain: ristrutturazione, sottoinsieme core) ---
  { taxonomyInterventionSlug: "rifare-bagno", state: "SEO_PAGE_NOW", macroAreaSlug: "ristrutturazioni", priority: 1 },
  { taxonomyInterventionSlug: "rifare-cucina", state: "REQUEST_NOW", macroAreaSlug: "ristrutturazioni", priority: 2, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "ristrutturare-appartamento", state: "REQUEST_NOW", macroAreaSlug: "ristrutturazioni", priority: 3 },
  { taxonomyInterventionSlug: "ristrutturare-casa", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "ristrutturazioni", priority: 4 },

  // --- Cartongesso e pareti (domain: ristrutturazione, sottoinsieme cartongesso) ---
  { taxonomyInterventionSlug: "fare-lavori-cartongesso", state: "SEO_PAGE_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 1, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "fare-parete-cartongesso", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 2 },
  { taxonomyInterventionSlug: "riparare-cartongesso", state: "REQUEST_NOW", macroAreaSlug: "cartongesso-e-pareti", priority: 3 },
  { taxonomyInterventionSlug: "abbassare-soffitto", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 4 },
  { taxonomyInterventionSlug: "fare-veletta-cartongesso", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 5 },
  { taxonomyInterventionSlug: "fare-nicchia-cartongesso", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 6 },
  { taxonomyInterventionSlug: "fare-libreria-cartongesso", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 7 },
  { taxonomyInterventionSlug: "fare-parete-attrezzata-cartongesso", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 8 },
  { taxonomyInterventionSlug: "fare-controparete-cartongesso", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 9 },
  { taxonomyInterventionSlug: "fare-cassonetto-cartongesso", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 10 },
  { taxonomyInterventionSlug: "fare-botola-cartongesso", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "cartongesso-e-pareti", priority: 11 },

  // --- Imbianchini e finiture (cross-domain: ristrutturazione + facciate) ---
  { taxonomyInterventionSlug: "tinteggiare-interni", state: "REQUEST_NOW", macroAreaSlug: "imbianchini-e-finiture", priority: 1 },
  { taxonomyInterventionSlug: "tinteggiare-esterni", state: "REQUEST_NOW", macroAreaSlug: "imbianchini-e-finiture", priority: 2 },
  { taxonomyInterventionSlug: "tinteggiare-pareti", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "imbianchini-e-finiture", priority: 3 },

  // --- Opere murarie (domain: muratura) ---
  { taxonomyInterventionSlug: "fare-opere-murarie", state: "REQUEST_NOW", macroAreaSlug: "opere-murarie", priority: 1, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "fare-demolizioni", state: "REQUEST_NOW", macroAreaSlug: "opere-murarie", priority: 2 },
  { taxonomyInterventionSlug: "costruire-tramezzo", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 3 },
  { taxonomyInterventionSlug: "aprire-chiudere-vano", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 4 },
  { taxonomyInterventionSlug: "riparare-muratura", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 5 },
  { taxonomyInterventionSlug: "consolidare-muratura", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 6 },
  { taxonomyInterventionSlug: "fare-intonaco", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 7 },
  { taxonomyInterventionSlug: "fare-rasatura", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 8 },
  { taxonomyInterventionSlug: "stuccare-muro", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 9 },
  { taxonomyInterventionSlug: "ripristinare-muro", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "opere-murarie", priority: 10 },

  // --- Pavimenti e piastrelle (domain: pavimenti) ---
  { taxonomyInterventionSlug: "posare-piastrelle", state: "REQUEST_NOW", macroAreaSlug: "pavimenti-e-piastrelle", priority: 1, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "posare-pavimento", state: "REQUEST_NOW", macroAreaSlug: "pavimenti-e-piastrelle", priority: 2 },
  { taxonomyInterventionSlug: "fare-massetto", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "pavimenti-e-piastrelle", priority: 3 },
  { taxonomyInterventionSlug: "fare-sottofondo", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "pavimenti-e-piastrelle", priority: 4 },
  { taxonomyInterventionSlug: "livellare-pavimento", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "pavimenti-e-piastrelle", priority: 5 },
  { taxonomyInterventionSlug: "posare-rivestimento", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "pavimenti-e-piastrelle", priority: 6 },

  // --- Tetti e facciate (domain: tetti + facciate) ---
  { taxonomyInterventionSlug: "rifare-tetto", state: "SEO_PAGE_NOW", macroAreaSlug: "tetti-e-facciate", priority: 1, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "riparare-tetto", state: "REQUEST_NOW", macroAreaSlug: "tetti-e-facciate", priority: 2 },
  { taxonomyInterventionSlug: "rifare-facciata", state: "REQUEST_NOW", macroAreaSlug: "tetti-e-facciate", priority: 3, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "rifare-balcone", state: "REQUEST_NOW", macroAreaSlug: "tetti-e-facciate", priority: 4 },
  { taxonomyInterventionSlug: "fare-copertura-edile", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 5 },
  { taxonomyInterventionSlug: "fare-lattoneria", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 6 },
  { taxonomyInterventionSlug: "sostituire-grondaie", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 7 },
  { taxonomyInterventionSlug: "installare-scossaline", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 8 },
  { taxonomyInterventionSlug: "ripristinare-facciata", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 9 },
  { taxonomyInterventionSlug: "fare-intonaco-esterno", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 10 },
  { taxonomyInterventionSlug: "fare-cappotto-termico", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 11, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "rifare-terrazzo", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 12 },
  { taxonomyInterventionSlug: "rifare-ballatoio", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 13 },
  { taxonomyInterventionSlug: "ripristinare-frontalini", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 14 },
  { taxonomyInterventionSlug: "rifare-cornicione", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 15 },
  { taxonomyInterventionSlug: "ripristinare-sottobalcone", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 16 },
  { taxonomyInterventionSlug: "rifare-scale", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "tetti-e-facciate", priority: 17 },

  // --- Impianti elettrici (domain: impianti-elettrici) ---
  { taxonomyInterventionSlug: "impianto-elettrico-nuovo", state: "SEO_PAGE_NOW", macroAreaSlug: "impianti-elettrici", priority: 1, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "saltata-corrente", state: "REQUEST_NOW", macroAreaSlug: "impianti-elettrici", priority: 2, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "riparare-quadro-elettrico", state: "REQUEST_NOW", macroAreaSlug: "impianti-elettrici", priority: 3 },
  { taxonomyInterventionSlug: "aggiungere-presa-elettrica", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impianti-elettrici", priority: 4 },
  { taxonomyInterventionSlug: "sostituire-interruttore", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impianti-elettrici", priority: 5 },
  { taxonomyInterventionSlug: "montare-lampadario", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impianti-elettrici", priority: 6 },
  { taxonomyInterventionSlug: "riparare-citofono", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impianti-elettrici", priority: 7 },

  // --- Idraulica (domain: idraulica) ---
  { taxonomyInterventionSlug: "perdita-acqua", state: "REQUEST_NOW", macroAreaSlug: "idraulica", priority: 1, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "sostituire-sanitari", state: "REQUEST_NOW", macroAreaSlug: "idraulica", priority: 2 },
  { taxonomyInterventionSlug: "cambiare-rubinetto", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "idraulica", priority: 3 },
  { taxonomyInterventionSlug: "sostituire-tubi", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "idraulica", priority: 4 },
  { taxonomyInterventionSlug: "rifare-impianto-idraulico", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "idraulica", priority: 5 },

  // --- Clima ed energia (domain: clima-energia) ---
  { taxonomyInterventionSlug: "installare-fotovoltaico", state: "SEO_PAGE_NOW", macroAreaSlug: "clima-ed-energia", priority: 1, costGuideFutureCandidate: true },
  { taxonomyInterventionSlug: "installare-climatizzatore", state: "SEO_PAGE_NOW", macroAreaSlug: "clima-ed-energia", priority: 2, costGuideFutureCandidate: true },

  // --- Nuove costruzioni e ampliamenti (domain: costruzione, escluso costruire-piscina) ---
  { taxonomyInterventionSlug: "costruire-casa", state: "REQUEST_NOW", macroAreaSlug: "nuove-costruzioni-e-ampliamenti", priority: 1 },
  { taxonomyInterventionSlug: "ampliare-casa", state: "REQUEST_NOW", macroAreaSlug: "nuove-costruzioni-e-ampliamenti", priority: 2, seoFutureCandidate: true },
  { taxonomyInterventionSlug: "realizzare-nuova-costruzione", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "nuove-costruzioni-e-ampliamenti", priority: 3 },
  { taxonomyInterventionSlug: "costruire-villa", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "nuove-costruzioni-e-ampliamenti", priority: 4 },
  { taxonomyInterventionSlug: "sopraelevare-edificio", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "nuove-costruzioni-e-ampliamenti", priority: 5 },

  // --- Impermeabilizzazioni (domain: impermeabilizzazioni, escluso impermeabilizzare-piscina) ---
  { taxonomyInterventionSlug: "impermeabilizzare-terrazzo", state: "REQUEST_NOW", macroAreaSlug: "impermeabilizzazioni", priority: 1 },
  { taxonomyInterventionSlug: "impermeabilizzare-balcone", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impermeabilizzazioni", priority: 2 },
  { taxonomyInterventionSlug: "impermeabilizzare-bagno", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impermeabilizzazioni", priority: 3 },
  { taxonomyInterventionSlug: "posare-guaina-bituminosa", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "impermeabilizzazioni", priority: 4 },

  // --- Piscine (cross-domain: costruzione + ristrutturazione + impermeabilizzazioni) ---
  { taxonomyInterventionSlug: "costruire-piscina", state: "REQUEST_NOW", macroAreaSlug: "piscine", priority: 1 },
  { taxonomyInterventionSlug: "ristrutturare-piscina", state: "REQUEST_NOW", macroAreaSlug: "piscine", priority: 2 },
  { taxonomyInterventionSlug: "rivestire-piscina", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "piscine", priority: 3 },
  { taxonomyInterventionSlug: "impermeabilizzare-piscina", state: "SHOW_IN_COLLAPSED_LIST", macroAreaSlug: "piscine", priority: 4 },

  // --- Sicurezza (domain creato in Phase 19.6G, nessuna macro area pubblica ---
  // --- ancora decisa: 01_SCHEMA.md 20.6 non la includeva nell'elenco iniziale) ---
  {
    taxonomyInterventionSlug: "installare-antifurto",
    state: "HIDE_FOR_NOW",
    hiddenReason:
      "Domain 'sicurezza' creato in Phase 19.6G (era orphan). Nessuna macro area pubblica ancora decisa per questo gruppo — non era nell'elenco iniziale Phase 19.6E/19.6F. Richiede una decisione prodotto dedicata.",
    priority: 1,
  },
  {
    taxonomyInterventionSlug: "installare-telecamere",
    state: "HIDE_FOR_NOW",
    hiddenReason:
      "Vedi installare-antifurto: stesso gruppo, stessa motivazione.",
    priority: 2,
  },
  {
    taxonomyInterventionSlug: "installare-controllo-accessi",
    state: "HIDE_FOR_NOW",
    hiddenReason:
      "Vedi installare-antifurto: stesso gruppo, stessa motivazione.",
    priority: 3,
  },
];
