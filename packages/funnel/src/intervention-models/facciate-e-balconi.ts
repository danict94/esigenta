/**
 * Esigenta — Facciate e balconi funnel models
 *
 * Bespoke models for the active interventions of the `facciate-e-balconi`
 * taxonomy group. Same domain-driven shape as Cartongesso/Climatizzazione:
 * the common spine (location → … → photos → note → timing → contact) plus a
 * few intervention-specific steps that make the funnel speak the language of
 * facade / balcony work, without forcing the customer to be technical.
 *
 * Surface convention (product decision): the facade domain uses an optional
 * numeric `surface-area` (m²) — more useful to the quote than a coarse bucket.
 * `surfaceAreaStep` reuses the stable `surface-area` id so the impresa view
 * renders "Superficie" and enrich-request still derives projectScale from the
 * number. `scaleStep` (qualitative buckets) is kept only for the balcony
 * waterproofing funnel, which is out of this convention's scope.
 *
 * `accessInQuotaStep` is the shared helper from common.ts (single option set);
 * here it is bound to this group's already-shipped namespaced id. Ponteggio is
 * never a separate intervention — it is an access detail driving quote, time,
 * safety and feasibility.
 */

import type { RuntimeCapability, RuntimeOption } from "../types/capability"

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import {
  accessInQuotaStep as sharedAccessInQuotaStep,
  noteStep,
} from "./common"
import type { InterventionFunnelModel } from "./types"

// This group keeps its already-shipped namespaced access id; the option set
// itself lives in the shared helper (common.ts), so it is never duplicated.
const ACCESS_IN_QUOTA_STEP_ID = "facciate-e-balconi:access-in-quota"

function accessInQuotaStep(optional: boolean): RuntimeCapability {
  return sharedAccessInQuotaStep(optional, ACCESS_IN_QUOTA_STEP_ID)
}

// Facade surface question: numeric m² on the unified `:superficie` id, which
// enrich-request/resolveRequestSignals reads (numeric or bucket) as scale.
function surfaceAreaStep(question: string): RuntimeCapability {
  return {
    id: "facciate-e-balconi:superficie",
    type: "number",
    question,
    description: "Una stima approssimativa è sufficiente.",
    optional: true,
  }
}

function scaleStep(
  question: string,
  smallLabel: string,
  mediumLabel: string,
  largeLabel: string,
): RuntimeCapability {
  const options: RuntimeOption[] = [
    { value: "small", label: smallLabel },
    { value: "medium", label: mediumLabel },
    { value: "large", label: largeLabel },
    { value: "unknown", label: "Non lo so" },
  ]

  return {
    id: "facciate-e-balconi:superficie",
    type: "single_select",
    question,
    options,
    optional: true,
  }
}

const rifareFacciata: InterventionFunnelModel = {
  interventionSlug: "rifare-facciata",
  steps: [
    locationCapability,
    {
      id: "facciate-e-balconi:rifare-facciata:tipo-lavoro",
      type: "multi_select",
      question: "Che lavoro serve sulla facciata?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "plaster_cracks", label: "Intonaco, crepe o distacchi" },
        { value: "skim_coat", label: "Rasatura" },
        { value: "painting", label: "Tinteggiatura esterna" },
        { value: "coating_finish", label: "Rivestimento o finitura" },
        { value: "damaged_parts", label: "Parti ammalorate da ripristinare" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "facciate-e-balconi:rifare-facciata:finitura",
      type: "single_select",
      question: "Sai già che finitura vuoi?",
      options: [
        { value: "siloxane", label: "Silossanica" },
        { value: "silicate", label: "Ai silicati" },
        { value: "quartz_acrylic", label: "Quarzo / acrilica" },
        { value: "not_sure", label: "Non lo so, vorrei consiglio" },
      ],
      optional: true,
    },
    surfaceAreaStep("Quanti metri quadri circa sono coinvolti?"),
    accessInQuotaStep(false),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const realizzareCappottoTermicoFacciata: InterventionFunnelModel = {
  interventionSlug: "realizzare-cappotto-termico-facciata",
  steps: [
    locationCapability,
    {
      id: "facciate-e-balconi:cappotto:tipo-edificio",
      type: "single_select",
      question: "Che tipo di edificio è?",
      options: [
        { value: "single_house", label: "Villetta o casa singola" },
        { value: "small_building", label: "Palazzina" },
        { value: "condominium", label: "Condominio" },
        { value: "commercial", label: "Locale o edificio commerciale" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    surfaceAreaStep("Quanti metri quadri circa di facciata sono coinvolti?"),
    {
      id: "facciate-e-balconi:cappotto:ambito",
      type: "single_select",
      question: "Cosa serve realizzare?",
      options: [
        { value: "coat_only", label: "Solo cappotto" },
        { value: "coat_and_finish", label: "Cappotto + finitura facciata" },
        { value: "repair_and_coat", label: "Ripristino facciata + cappotto" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    accessInQuotaStep(false),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const ripristinareBalconiEBallatoi: InterventionFunnelModel = {
  interventionSlug: "ripristinare-balconi-e-ballatoi",
  steps: [
    locationCapability,
    {
      id: "facciate-e-balconi:balconi-ballatoi:parte-da-sistemare",
      type: "multi_select",
      question: "Quale parte è da sistemare?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "front_edges", label: "Frontalini" },
        { value: "underside", label: "Sottobalconi" },
        { value: "exposed_rebar", label: "Ferri scoperti / cemento ammalorato" },
        { value: "parapet_wall", label: "Parapetto o muretto" },
        { value: "damaged_floor", label: "Pavimento rovinato" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "facciate-e-balconi:balconi-ballatoi:scala",
      type: "single_select",
      question: "Quanti balconi o ballatoi sono interessati?",
      options: [
        { value: "one", label: "Uno" },
        { value: "two_three", label: "Due o tre" },
        { value: "four_plus", label: "Quattro o più / condominio" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    accessInQuotaStep(false),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const ripristinoFrontalino: InterventionFunnelModel = {
  interventionSlug: "ripristino-frontalino",
  steps: [
    locationCapability,
    {
      id: "facciate-e-balconi:frontalino:quanti",
      type: "single_select",
      question: "Quanti frontalini sono da sistemare?",
      options: [
        { value: "one", label: "Uno" },
        { value: "multiple", label: "Più balconi" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "facciate-e-balconi:frontalino:problema",
      type: "multi_select",
      question: "Che problema si vede?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "detachment", label: "Distacchi" },
        { value: "cracks", label: "Crepe" },
        { value: "exposed_rebar", label: "Ferri scoperti" },
        { value: "falling_concrete", label: "Cemento che cade" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    accessInQuotaStep(false),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const rifarePavimentazioneBalconeBallatoio: InterventionFunnelModel = {
  interventionSlug: "rifare-pavimentazione-balcone-ballatoio",
  steps: [
    locationCapability,
    {
      id: "facciate-e-balconi:pavimentazione:tipo-spazio",
      type: "single_select",
      question: "Dove va rifatta la pavimentazione?",
      options: [
        { value: "balcony", label: "Balcone" },
        { value: "walkway", label: "Ballatoio" },
        { value: "both", label: "Balcone e ballatoio" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "facciate-e-balconi:pavimentazione:rimozione",
      type: "single_select",
      question: "Vanno rimosse vecchie piastrelle?",
      options: [
        { value: "yes", label: "Sì" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "facciate-e-balconi:pavimentazione:infiltrazioni",
      type: "single_select",
      question: "Ci sono infiltrazioni o problemi d’acqua?",
      options: [
        { value: "yes", label: "Sì" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    accessInQuotaStep(true),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const impermeabilizzareBalconeBallatoio: InterventionFunnelModel = {
  interventionSlug: "impermeabilizzare-balcone-ballatoio",
  steps: [
    locationCapability,
    {
      id: "facciate-e-balconi:impermeabilizzazione:tipo-spazio",
      type: "single_select",
      question: "Dove serve impermeabilizzare?",
      options: [
        { value: "balcony", label: "Balcone" },
        { value: "walkway", label: "Ballatoio" },
        { value: "both", label: "Balcone e ballatoio" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "facciate-e-balconi:impermeabilizzazione:problema",
      type: "single_select",
      question: "Qual è il problema principale?",
      options: [
        { value: "infiltration", label: "Infiltrazioni" },
        { value: "old_membrane", label: "Guaina vecchia o rovinata" },
        { value: "floor_to_redo", label: "Pavimento da rifare" },
        { value: "water_underneath", label: "Acqua sotto il balcone" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    scaleStep(
      "Quanto è grande circa la zona?",
      "Piccola",
      "Media",
      "Grande",
    ),
    accessInQuotaStep(true),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const facciateEBalconiModels: InterventionFunnelModel[] = [
  rifareFacciata,
  realizzareCappottoTermicoFacciata,
  ripristinareBalconiEBallatoi,
  ripristinoFrontalino,
  rifarePavimentazioneBalconeBallatoio,
  impermeabilizzareBalconeBallatoio,
]
