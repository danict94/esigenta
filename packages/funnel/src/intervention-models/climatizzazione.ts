/**
 * Esigenta - Climatizzazione funnel models
 *
 * Bespoke models for the active climatizzazione interventions. They reuse the
 * common spine and add only the few HVAC-specific answers that improve lead
 * quality without asking the customer to be technical.
 */

import type { RuntimeCapability, RuntimeOption } from "../types/capability"

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

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
    id: "climatizzazione:superficie",
    type: "single_select",
    question,
    options,
    optional: true,
  }
}

const installareClimatizzatore: InterventionFunnelModel = {
  interventionSlug: "installare-climatizzatore",
  steps: [
    locationCapability,
    scaleStep(
      "Quanti ambienti vuoi climatizzare?",
      "1 ambiente",
      "2 ambienti",
      "3 o più ambienti",
    ),
    {
      id: "climatizzazione:installazione:tipo",
      type: "single_select",
      question: "Che tipo di installazione ti serve?",
      options: [
        { value: "mono_split", label: "Un climatizzatore per una stanza" },
        { value: "dual_split", label: "Due split per due ambienti" },
        { value: "multi_split", label: "Più ambienti / multi split" },
        { value: "replace_existing", label: "Sostituire un climatizzatore esistente" },
        { value: "not_sure", label: "Non lo so ancora" },
      ],
      optional: false,
    },
    {
      id: "climatizzazione:installazione:predisposizione",
      type: "single_select",
      question: "Hai già la predisposizione?",
      options: [
        { value: "yes", label: "Sì, ci sono già tubi/attacchi" },
        { value: "no", label: "No, va fatta" },
        { value: "partial", label: "In parte / da verificare" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const fareManutenzioneClimatizzatore: InterventionFunnelModel = {
  interventionSlug: "fare-manutenzione-climatizzatore",
  steps: [
    locationCapability,
    scaleStep(
      "Quanti climatizzatori/split vanno controllati?",
      "1 split",
      "2 split",
      "3 o più split",
    ),
    {
      id: "climatizzazione:manutenzione:tipo",
      type: "single_select",
      question: "Che tipo di manutenzione ti serve?",
      description:
        "Se pensi serva una ricarica gas, il tecnico potrebbe dover verificare perdite o anomalie.",
      options: [
        { value: "cleaning", label: "Pulizia filtri o split" },
        { value: "sanitization", label: "Sanificazione" },
        { value: "checkup", label: "Controllo funzionamento" },
        { value: "gas_check", label: "Ricarica gas / problema gas" },
        { value: "water_leak", label: "Perde acqua" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const climatizzazioneModels: InterventionFunnelModel[] = [
  installareClimatizzatore,
  fareManutenzioneClimatizzatore,
]
