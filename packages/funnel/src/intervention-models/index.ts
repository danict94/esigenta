/**
 * Esigenta — Intervention Funnel Model registry
 *
 * Single funnel system. Every intervention resolves through a model:
 * `resolveFunnelModel` returns the bespoke model if one exists, otherwise the
 * generic default. There is no preset path.
 */

import { cartongessoModels } from "./cartongesso"
import { citofoniSicurezzaESmartHomeModels } from "./citofoni-sicurezza-e-smart-home"
import { climatizzazioneModels } from "./climatizzazione"
import { fabbroSerrandeECancelliModels } from "./fabbro-serrande-e-cancelli"
import { facciateEBalconiModels } from "./facciate-e-balconi"
import { finitureModels } from "./finiture"
import { fotovoltaicoModels } from "./fotovoltaico"
import { idraulicaModels } from "./idraulica"
import { impiantiElettriciModels } from "./impianti-e-manutenzioni-elettriche"
import { opereMurarieEDemolizioniModels } from "./opere-murarie-e-demolizioni"
import { pavimentazioniModels } from "./pavimentazioni"
import { riscaldamentoModels } from "./riscaldamento"
import { ristrutturazioniModels } from "./ristrutturazioni"
import { serramentiEInfissiModels } from "./serramenti-e-infissi"
import { tettiModels } from "./tetti"
import { getDefaultFunnelModel } from "./common"
import type { InterventionFunnelModel } from "./types"

const MODELS_BY_SLUG: ReadonlyMap<string, InterventionFunnelModel> = new Map(
  [
    ...cartongessoModels,
    ...citofoniSicurezzaESmartHomeModels,
    ...climatizzazioneModels,
    ...fabbroSerrandeECancelliModels,
    ...facciateEBalconiModels,
    ...finitureModels,
    ...fotovoltaicoModels,
    ...idraulicaModels,
    ...impiantiElettriciModels,
    ...opereMurarieEDemolizioniModels,
    ...pavimentazioniModels,
    ...riscaldamentoModels,
    ...ristrutturazioniModels,
    ...serramentiEInfissiModels,
    ...tettiModels,
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
