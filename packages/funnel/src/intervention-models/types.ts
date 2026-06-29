/**
 * Esigenta — Intervention Funnel Model
 *
 * DOMAIN-DRIVEN FUNNEL
 *
 * An intervention model declares the FULL ordered list of funnel steps for one
 * taxonomy intervention: a small common spine (location/photos/note/timing/
 * contact) reused across interventions, plus the few intervention-specific
 * steps (scale, scopo, multi-select block) that make the funnel "speak the
 * language" of that specific job.
 *
 * This is data, not an engine. Every intervention resolves through a model:
 * bespoke when available, otherwise the generic default.
 */

import type { RuntimeCapability } from "../types/capability"

/**
 * Stable id of the optional free-form note step. Its value is the
 * customerDescription (kept out of rawAnswers), rendered before the contact
 * step — never a generic textarea glued to the conversion moment.
 */
export const NOTE_STEP_ID = "note"

export type InterventionFunnelModel = {
  /** Taxonomy intervention slug this model drives. */
  interventionSlug: string

  /** Ordered funnel steps: common capability defs + intervention-specific steps. */
  steps: RuntimeCapability[]
}
