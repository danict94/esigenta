/**
 * Esigenta — Shared funnel-model building blocks
 *
 * Single funnel system: every intervention resolves through a model. Models
 * with no bespoke definition yet use the generic default below — there is no
 * separate preset path. Bespoke models replace the default one market at a time.
 */

import type { RuntimeCapability } from "../types/capability"
import type { RuntimeStepId } from "../types/runtime-profile"

import { locationCapability } from "../capabilities/location"
import { propertyCapability } from "../capabilities/property"
import { surfaceAreaCapability } from "../capabilities/surface-area"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { NOTE_STEP_ID, type InterventionFunnelModel } from "./types"

/**
 * Optional free-form note step. Its value is the customerDescription (kept out
 * of rawAnswers), placed before contact — never glued to the conversion step.
 */
export function noteStep(): RuntimeCapability {
  return {
    id: NOTE_STEP_ID,
    type: "textarea",
    question: "Vuoi aggiungere qualche dettaglio utile?",
    description:
      "Puoi spiegare cose che non si vedono dalle foto o che non abbiamo chiesto.",
    placeholder:
      "Es. la parete è in camera, vorrei isolare dal rumore, non so bene che intervento serve.",
    optional: true,
  }
}

/**
 * Default stable id of the reusable "accesso in quota" question. Shared so the
 * same answer groups consistently across interventions/groups; a caller may
 * override the id (e.g. an already-shipped group-namespaced id) while reusing
 * the single canonical option set defined here.
 */
export const ACCESS_IN_QUOTA_STEP_ID = "access-in-quota"

/**
 * Reusable "Serve un accesso in quota?" step. Ponteggio is never a separate
 * intervention — it is an access detail that drives quote, time, safety and
 * feasibility. Required on most facade/exterior work, optional (still
 * recommended) where access is usually trivial.
 */
export function accessInQuotaStep(
  optional: boolean,
  id: RuntimeStepId = ACCESS_IN_QUOTA_STEP_ID,
): RuntimeCapability {
  return {
    id,
    type: "single_select",
    question: "Serve un accesso in quota?",
    description:
      "Serve solo a stimare tempi, sicurezza e fattibilità. Se non lo sai, scegli pure “Non lo so / da verificare”.",
    options: [
      { value: "easy_access", label: "No, è facilmente accessibile" },
      { value: "ladder_or_tower", label: "Scala o trabattello" },
      { value: "scaffolding", label: "Ponteggio" },
      { value: "platform", label: "Piattaforma elevatrice" },
      { value: "not_sure", label: "Non lo so / da verificare" },
    ],
    optional,
  }
}

/**
 * Generic default model for interventions without a bespoke model yet — the
 * fallback within the single model mechanism.
 */
export function getDefaultFunnelModel(
  interventionSlug: string,
): InterventionFunnelModel {
  return {
    interventionSlug,
    steps: [
      locationCapability,
      propertyCapability,
      surfaceAreaCapability,
      photosCapability,
      noteStep(),
      timingCapability,
      contactCapability,
    ],
  }
}
