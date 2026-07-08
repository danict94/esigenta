/**
 * Esigenta — Piscine funnel models
 *
 * Bespoke models for the `piscine` group (categoria piscinista). Specialized
 * pool services: the funnel understands the pool type / what to renew and the
 * scale, then routes to the piscinista.
 *
 * PRUDENT copy — the piscinista assesses area, solution and works; it NEVER
 * promises feasibility, permits, timelines, prices or tax deductions (an
 * interrata is a permanent structure that generally needs a building permit).
 *
 * Confine: a specialized pool service, NOT a generic garden (-> esterni-e-
 * giardino), NOT domestic plumbing (-> idraulica), NOT a generic build/house/
 * garage (-> costruzioni / ristrutturazioni), NOT a spa/idromassaggio/jacuzzi.
 *
 * Light spine: location -> main -> stage -> qualitative size -> technical
 * qualifier -> optional documents -> note -> timing -> contact. No budget, no
 * free m² (size is a QUALITATIVE bucket on a `:superficie` step so it still
 * drives projectScale without a raw number), 0 raw value. Optional upload
 * reuses the shared photo_upload contract with documents copy. Step ids
 * `piscine:…`.
 */

import type { RuntimeCapability } from "../types/capability"

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

/**
 * Optional documents step: reuses the shared photo_upload capability (same
 * id "photos") with copy framed for pool photos/documents.
 */
function documentiOpzionali(description: string): RuntimeCapability {
  return {
    ...photosCapability,
    question: "Puoi caricare foto o documenti se li hai?",
    description,
  }
}

const costruirePiscina: InterventionFunnelModel = {
  interventionSlug: "costruire-piscina",
  steps: [
    locationCapability,
    {
      id: "piscine:costruire-piscina:tipo-piscina",
      type: "single_select",
      question: "Che piscina vuoi realizzare?",
      options: [
        { value: "interrata", label: "Piscina interrata" },
        { value: "seminterrata", label: "Piscina seminterrata" },
        { value: "fuori_terra_strutturata", label: "Piscina fuori terra strutturata" },
        { value: "prefabbricata", label: "Piscina prefabbricata stabile" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "piscine:costruire-piscina:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "only_idea", label: "Ho solo l'idea" },
        { value: "chosen_area", label: "Ho già scelto l'area" },
        { value: "have_project_or_pro", label: "Ho già un progetto o tecnico" },
        { value: "permits_started", label: "Ho già pratiche avviate" },
        { value: "where_to_start", label: "Devo capire da dove partire" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:costruire-piscina:superficie",
      type: "single_select",
      question: "Quanto sarà grande indicativamente?",
      options: [
        { value: "small", label: "Piscina piccola" },
        { value: "medium", label: "Piscina media" },
        { value: "large", label: "Piscina grande" },
        { value: "over_twohundred", label: "Piscina con area esterna importante" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:costruire-piscina:materiale",
      type: "single_select",
      question: "Che soluzione immagini?",
      options: [
        { value: "concrete_masonry", label: "Cemento / muratura" },
        { value: "fiberglass", label: "Vetroresina" },
        { value: "panels_prefab", label: "Pannelli / prefabbricata" },
        { value: "to_define", label: "Da definire con il professionista" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto dell'area, planimetria, progetto, misure indicative o documenti disponibili aiutano il piscinista a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const ristrutturarePiscina: InterventionFunnelModel = {
  interventionSlug: "ristrutturare-piscina",
  steps: [
    locationCapability,
    {
      id: "piscine:ristrutturare-piscina:cosa-rinnovare",
      type: "single_select",
      question: "Cosa vuoi rinnovare o sistemare?",
      options: [
        { value: "rivestimento", label: "Rivestimento piscina" },
        { value: "bordo", label: "Bordo / zona perimetrale" },
        { value: "struttura_perdite", label: "Struttura o perdite" },
        { value: "impianto_filtrazione", label: "Impianto / filtrazione" },
        { value: "completa", label: "Ristrutturazione completa" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "piscine:ristrutturare-piscina:stato",
      type: "single_select",
      question: "Com'è la situazione attuale?",
      options: [
        { value: "working_to_renew", label: "Piscina funzionante ma da rinnovare" },
        { value: "damaged_or_issues", label: "Piscina danneggiata o con problemi" },
        { value: "long_stopped", label: "Piscina ferma da tempo" },
        { value: "multiple_parts", label: "Devo rifare più parti" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:ristrutturare-piscina:superficie",
      type: "single_select",
      question: "Quanto è grande la piscina?",
      options: [
        { value: "small", label: "Piscina piccola" },
        { value: "medium", label: "Piscina media" },
        { value: "large", label: "Piscina grande" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:ristrutturare-piscina:tipo-piscina",
      type: "single_select",
      question: "Che tipo di piscina è?",
      options: [
        { value: "interrata", label: "Interrata" },
        { value: "seminterrata", label: "Seminterrata" },
        { value: "fuori_terra_strutturata", label: "Fuori terra strutturata" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto della piscina, dei danni o dell'impianto, planimetria, vecchi documenti o misure indicative aiutano il piscinista a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const fareManutenzionePiscina: InterventionFunnelModel = {
  interventionSlug: "fare-manutenzione-piscina",
  steps: [
    locationCapability,
    {
      id: "piscine:fare-manutenzione-piscina:tipo-manutenzione",
      type: "single_select",
      question: "Che manutenzione ti serve?",
      options: [
        { value: "seasonal_opening", label: "Apertura stagionale piscina" },
        { value: "seasonal_closing", label: "Chiusura stagionale piscina" },
        { value: "periodic", label: "Manutenzione periodica" },
        { value: "extraordinary", label: "Manutenzione straordinaria" },
        { value: "impianto_check", label: "Controllo impianto / filtrazione" },
        { value: "water_treatment", label: "Trattamento acqua" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "piscine:fare-manutenzione-piscina:stato",
      type: "single_select",
      question: "Com'è la situazione attuale?",
      options: [
        { value: "working", label: "Piscina funzionante" },
        { value: "water_to_treat", label: "Acqua da trattare" },
        { value: "impianto_to_check", label: "Impianto da controllare" },
        { value: "long_stopped", label: "Piscina ferma da tempo" },
        { value: "problem_to_understand", label: "Problema da capire" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:fare-manutenzione-piscina:tipo-piscina",
      type: "single_select",
      question: "Che tipo di piscina è?",
      options: [
        { value: "interrata", label: "Interrata" },
        { value: "seminterrata", label: "Seminterrata" },
        { value: "fuori_terra_strutturata", label: "Fuori terra strutturata" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:fare-manutenzione-piscina:frequenza",
      type: "single_select",
      question: "Ti serve un intervento singolo o continuativo?",
      options: [
        { value: "seasonal", label: "Intervento stagionale" },
        { value: "periodic", label: "Manutenzione periodica" },
        { value: "extraordinary", label: "Intervento straordinario" },
        { value: "to_define", label: "Da definire con il professionista" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto della piscina, dell'acqua o dell'impianto, dati o vecchi documenti aiutano il piscinista a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const installareCoperturaPiscina: InterventionFunnelModel = {
  interventionSlug: "installare-copertura-piscina",
  steps: [
    locationCapability,
    {
      id: "piscine:installare-copertura-piscina:tipo-copertura",
      type: "single_select",
      question: "Che copertura vuoi installare?",
      options: [
        { value: "telescopica", label: "Copertura telescopica" },
        { value: "bassa", label: "Copertura bassa" },
        { value: "alta", label: "Copertura alta" },
        { value: "tapparella_automatica", label: "Tapparella / copertura automatica" },
        { value: "isotermica", label: "Copertura isotermica professionale" },
        { value: "sicurezza", label: "Copertura di sicurezza" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "piscine:installare-copertura-piscina:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "evaluating", label: "Sto valutando la soluzione" },
        { value: "have_pool", label: "Ho già una piscina esistente" },
        { value: "have_measures_or_project", label: "Ho già misure o progetto" },
        { value: "replace_existing", label: "Devo sostituire una copertura esistente" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:installare-copertura-piscina:tipo-piscina",
      type: "single_select",
      question: "Su che piscina va installata?",
      options: [
        { value: "interrata", label: "Piscina interrata" },
        { value: "seminterrata", label: "Piscina seminterrata" },
        { value: "fuori_terra_strutturata", label: "Piscina fuori terra strutturata" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "piscine:installare-copertura-piscina:superficie",
      type: "single_select",
      question: "Quanto è grande la piscina?",
      options: [
        { value: "small", label: "Piscina piccola" },
        { value: "medium", label: "Piscina media" },
        { value: "large", label: "Piscina grande" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto della piscina e del bordo, misure indicative, foto della vecchia copertura o documenti disponibili aiutano il piscinista a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const piscineModels: InterventionFunnelModel[] = [
  costruirePiscina,
  ristrutturarePiscina,
  fareManutenzionePiscina,
  installareCoperturaPiscina,
]
