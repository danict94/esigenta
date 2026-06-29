/**
 * Esigenta — Intervention Funnel Model registry
 *
 * Single funnel system. Every intervention resolves through a model:
 * `resolveFunnelModel` returns the bespoke model if one exists, otherwise the
 * generic default. There is no preset path.
 */

import { cartongessoModels } from "./cartongesso"
import { climatizzazioneModels } from "./climatizzazione"
import { facciateEBalconiModels } from "./facciate-e-balconi"
import { finitureModels } from "./finiture"
import { getDefaultFunnelModel } from "./common"
import type { InterventionFunnelModel } from "./types"

const MODELS_BY_SLUG: ReadonlyMap<string, InterventionFunnelModel> = new Map(
  [
    ...cartongessoModels,
    ...climatizzazioneModels,
    ...facciateEBalconiModels,
    ...finitureModels,
  ].map((model) => [model.interventionSlug, model]),
)

/** Bespoke model for this intervention, or null if none exists yet. */
export function getInterventionFunnelModel(
  interventionSlug: string,
): InterventionFunnelModel | null {
  return MODELS_BY_SLUG.get(interventionSlug) ?? null
}

/** Always returns a model: the bespoke one if present, otherwise the generic default. */
export function resolveFunnelModel(
  interventionSlug: string,
): InterventionFunnelModel {
  return (
    getInterventionFunnelModel(interventionSlug) ??
    getDefaultFunnelModel(interventionSlug)
  )
}

export { NOTE_STEP_ID } from "./types"
export type { InterventionFunnelModel } from "./types"
