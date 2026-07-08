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

const fareSopraelevazione: InterventionFunnelModel = {
  interventionSlug: "fare-sopraelevazione",
  steps: [
    locationCapability,
    {
      id: "costruzioni-e-ampliamenti:fare-sopraelevazione:tipo-sopraelevazione",
      type: "single_select",
      question: "Che sopraelevazione vuoi realizzare?",
      options: [
        { value: "full_floor", label: "Un piano intero in più" },
        { value: "partial_floor", label: "Un piano parziale" },
        { value: "attic_or_mansard", label: "Mansarda / sottotetto abitabile" },
        { value: "over_annex_or_garage", label: "Sopraelevare un annesso o garage" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      // Feasibility-first: a sopraelevazione may not be structurally possible.
      // Leading with "capire se è fattibile" keeps the copy non-promissory.
      id: "costruzioni-e-ampliamenti:fare-sopraelevazione:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "check_feasibility", label: "Voglio prima capire se è fattibile" },
        { value: "have_project_or_pro", label: "Ho già un tecnico o progetto" },
        { value: "permits_started", label: "Ho già pratiche avviate" },
        { value: "have_company", label: "Ho già un'impresa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:fare-sopraelevazione:superficie",
      type: "single_select",
      question: "Quanto è grande la sopraelevazione?",
      options: [
        { value: "small", label: "Piccola" },
        { value: "medium", label: "Media" },
        { value: "large", label: "Grande / piano intero" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      // Structure type genuinely drives feasibility for a sopraelevazione, but
      // the customer often doesn't know it → optional, with a not_sure escape.
      id: "costruzioni-e-ampliamenti:fare-sopraelevazione:struttura",
      type: "single_select",
      question: "Sai com'è la struttura esistente?",
      options: [
        { value: "masonry", label: "Muratura" },
        { value: "reinforced_concrete", label: "Cemento armato" },
        { value: "mixed_or_other", label: "Mista / altro" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto dell'edificio esistente, planimetria, progetto o documenti disponibili aiutano l'impresa a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const costruireGarageODeposito: InterventionFunnelModel = {
  interventionSlug: "costruire-garage-o-deposito",
  steps: [
    locationCapability,
    {
      id: "costruzioni-e-ampliamenti:costruire-garage-o-deposito:cosa-costruire",
      type: "single_select",
      question: "Cosa vuoi costruire?",
      options: [
        { value: "single_garage", label: "Garage singolo" },
        { value: "double_garage", label: "Garage doppio" },
        { value: "deposit_or_warehouse", label: "Deposito / magazzino" },
        { value: "parking_structure", label: "Autorimessa" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:costruire-garage-o-deposito:struttura",
      type: "single_select",
      question: "Che tipo di struttura immagini?",
      options: [
        { value: "masonry_concrete", label: "In muratura / cemento" },
        { value: "prefab_stable", label: "Prefabbricata stabile" },
        { value: "to_define", label: "Struttura da definire" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:costruire-garage-o-deposito:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "only_idea", label: "Ho solo l'idea" },
        { value: "have_space_or_land", label: "Ho già uno spazio o terreno" },
        { value: "have_project_or_pro", label: "Ho già un progetto o tecnico" },
        { value: "permits_started", label: "Ho già pratiche avviate" },
        { value: "where_to_start", label: "Devo capire da dove partire" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:costruire-garage-o-deposito:superficie",
      type: "single_select",
      question: "Quanto grande sarà?",
      options: [
        { value: "small", label: "Piccolo deposito" },
        { value: "medium", label: "Garage singolo" },
        { value: "large", label: "Garage doppio / struttura media" },
        { value: "over_twohundred", label: "Struttura grande" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto dell'area, planimetria, progetto, misure indicative o documenti disponibili aiutano l'impresa a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const costruireDependanceOAnnesso: InterventionFunnelModel = {
  interventionSlug: "costruire-dependance-o-annesso",
  steps: [
    locationCapability,
    {
      id: "costruzioni-e-ampliamenti:costruire-dependance-o-annesso:cosa-costruire",
      type: "single_select",
      question: "Cosa vuoi costruire?",
      options: [
        { value: "habitable_dependance", label: "Dependance abitabile" },
        { value: "studio_or_monolocale", label: "Monolocale / studio esterno" },
        { value: "accessory_annex", label: "Annesso accessorio" },
        { value: "guest_structure", label: "Struttura per ospiti" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:costruire-dependance-o-annesso:struttura",
      type: "single_select",
      question: "Che tipo di struttura immagini?",
      options: [
        { value: "masonry_concrete", label: "In muratura / cemento" },
        { value: "prefab_stable", label: "Prefabbricata stabile" },
        { value: "wood", label: "In legno" },
        { value: "to_define", label: "Struttura da definire" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      // Feasibility depends on volumetric availability/permits (a technician's
      // call) — the funnel routes to the impresa and never promises the outcome.
      id: "costruzioni-e-ampliamenti:costruire-dependance-o-annesso:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "only_idea", label: "Ho solo l'idea" },
        { value: "have_space_or_land", label: "Ho già uno spazio o terreno" },
        { value: "have_project_or_pro", label: "Ho già un progetto o tecnico" },
        { value: "permits_started", label: "Ho già pratiche avviate" },
        { value: "where_to_start", label: "Devo capire da dove partire" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "costruzioni-e-ampliamenti:costruire-dependance-o-annesso:superficie",
      type: "single_select",
      question: "Quanto grande sarà?",
      options: [
        { value: "small", label: "Piccola" },
        { value: "medium", label: "Media" },
        { value: "large", label: "Grande" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: foto dell'area, planimetria, progetto, misure indicative o documenti disponibili aiutano l'impresa a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const costruzioniEAmpliamentiModels: InterventionFunnelModel[] = [
  costruireCasa,
  ampliareCasa,
  fareSopraelevazione,
  costruireGarageODeposito,
  costruireDependanceOAnnesso,
]
