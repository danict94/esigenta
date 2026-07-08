/**
 * Esigenta — Costruzioni e ampliamenti funnel models
 *
 * Bespoke models for the `costruzioni-e-ampliamenti` group (categoria
 * impresa-edile). Big-ticket structured works: the funnel understands WHAT is
 * being built and its stage/size, then routes to the building company.
 *
 * PRUDENT copy — the impresa assesses the request and the possible site; it
 * NEVER promises permits, feasibility, timelines, prices or "chiavi in mano".
 *
 * Confine: an opera/cantiere, NOT a technical practice (CILA/SCIA/project ->
 * tecnici-e-pratiche-edilizie), NOT redoing the existing (-> ristrutturazioni),
 * NOT small internal masonry (-> opere-murarie), NOT garden walls (-> esterni),
 * NOT roofs (-> tetti).
 *
 * Light spine: location -> main -> stage -> qualitative size -> [where] ->
 * optional documents -> note -> timing -> contact. No budget, no free m² (size
 * is a QUALITATIVE bucket on a `:superficie` step so it still drives projectScale
 * without a raw number), no property capability, 0 raw value. Optional upload
 * reuses the shared photo_upload contract with documents copy. Step ids
 * `costruzioni-e-ampliamenti:…`.
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
 * id "photos") with copy framed for construction documents/site photos.
 */
function documentiOpzionali(description: string): RuntimeCapability {
  return {
    ...photosCapability,
    question: "Puoi caricare foto o documenti se li hai?",
    description,
  }
}

const costruireCasa: InterventionFunnelModel = {
  interventionSlug: "costruire-casa",
  steps: [
    locationCapability,
    {
      id: "costruzioni-e-ampliamenti:costruire-casa:tipo-costruzione",
      type: "single_select",
      question: "Che tipo di costruzione vuoi realizzare?",
      options: [
        { value: "detached_house", label: "Casa indipendente" },
        { value: "villa_or_duplex", label: "Villetta / bifamiliare" },
        { value: "small_building", label: "Piccolo edificio" },
        { value: "shell_structure", label: "Grezzo / struttura principale" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:costruire-casa:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "only_idea", label: "Ho solo l'idea" },
        { value: "have_land", label: "Ho già un terreno" },
        { value: "have_project_or_pro", label: "Ho già un progetto o tecnico" },
        { value: "permits_started", label: "Ho già pratiche o permessi avviati" },
        { value: "where_to_start", label: "Devo capire da dove partire" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      // Qualitative scale on a `:superficie` step: bucket tokens drive
      // projectScale (small/medium/large) with no raw m² input.
      id: "costruzioni-e-ampliamenti:costruire-casa:superficie",
      type: "single_select",
      question: "Che dimensione indicativa ha il progetto?",
      options: [
        { value: "small", label: "Piccola abitazione" },
        { value: "medium", label: "Casa media" },
        { value: "large", label: "Casa grande" },
        { value: "five_plus", label: "Più unità / edificio" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto del terreno, planimetrie, progetto, render o documenti disponibili aiutano l'impresa a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const ampliareCasa: InterventionFunnelModel = {
  interventionSlug: "ampliare-casa",
  steps: [
    locationCapability,
    {
      id: "costruzioni-e-ampliamenti:ampliare-casa:tipo-ampliamento",
      type: "single_select",
      question: "Che tipo di ampliamento vuoi fare?",
      options: [
        { value: "add_room", label: "Aggiungere una stanza" },
        { value: "extend_living", label: "Ampliare zona giorno / cucina" },
        { value: "new_volume", label: "Creare un nuovo volume" },
        { value: "veranda_enclosure", label: "Veranda / chiusura spazio" },
        {
          value: "connect_or_extend",
          label: "Collegare o ampliare una parte esistente",
        },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:ampliare-casa:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "evaluating_feasibility", label: "Sto valutando la fattibilità" },
        { value: "have_project_or_pro", label: "Ho già un tecnico o progetto" },
        { value: "permits_started", label: "Ho già pratiche avviate" },
        { value: "have_company", label: "Ho già un'impresa" },
        { value: "works_started", label: "I lavori sono già iniziati" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:ampliare-casa:superficie",
      type: "single_select",
      question: "Quanto è grande l'ampliamento?",
      options: [
        { value: "small", label: "Piccolo ampliamento" },
        { value: "medium", label: "Ampliamento medio" },
        { value: "large", label: "Ampliamento importante" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:ampliare-casa:dove",
      type: "single_select",
      question: "Dove si interviene?",
      options: [
        { value: "ground_floor", label: "Piano terra" },
        { value: "upper_floor", label: "Piano superiore" },
        { value: "outside", label: "Esterno dell'abitazione" },
        { value: "existing_part", label: "Parte già esistente da collegare" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto dell'area, planimetria, progetto, vecchie pratiche o misure indicative aiutano l'impresa a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const costruzioniEAmpliamentiModels: InterventionFunnelModel[] = [
  costruireCasa,
  ampliareCasa,
]
