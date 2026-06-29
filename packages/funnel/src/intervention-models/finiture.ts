/**
 * Esigenta — Finiture funnel models
 *
 * Bespoke models for the active interventions of the `finiture` taxonomy group.
 * Same domain-driven shape as the other groups: the common spine (location → …
 * → photos → note → timing → contact) plus a few intervention-specific steps.
 *
 * `tinteggiare-esterni` is exterior painting only (no plaster/repair): it stays
 * a distinct, recognisable intent from `rifare-facciata` (the mother facade
 * job). It reuses the shared `accessInQuotaStep` — exterior painting is
 * typically work at height — and the numeric `surface-area` (m²) facade
 * convention.
 */

import type { RuntimeCapability } from "../types/capability"

import { locationCapability } from "../capabilities/location"
import { surfaceAreaCapability } from "../capabilities/surface-area"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { accessInQuotaStep, noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const tinteggiareEsterni: InterventionFunnelModel = {
  interventionSlug: "tinteggiare-esterni",
  steps: [
    locationCapability,
    {
      id: "finiture:tinteggiare-esterni:tipo-superficie",
      type: "multi_select",
      question: "Cosa devi tinteggiare all’esterno?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "facade", label: "Facciata" },
        { value: "external_walls", label: "Muri esterni" },
        { value: "balconies", label: "Balconi o ringhiere/muretti" },
        { value: "courtyard_walls", label: "Muri di cortile o recinzione" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    surfaceAreaCapability,
    {
      id: "finiture:tinteggiare-esterni:stato-supporto",
      type: "single_select",
      question: "Com’è lo stato della superficie?",
      options: [
        { value: "good", label: "Buono, serve solo tinteggiare" },
        { value: "small_repairs", label: "Ci sono piccole crepe o parti da sistemare" },
        { value: "damaged", label: "È rovinata o scrostata" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "finiture:tinteggiare-esterni:finitura",
      type: "single_select",
      question: "Sai già che tipo di pittura o finitura vuoi?",
      options: [
        { value: "siloxane", label: "Silossanica" },
        { value: "silicate", label: "Ai silicati" },
        { value: "quartz_acrylic", label: "Quarzo / acrilica" },
        { value: "standard_external", label: "Pittura esterna standard" },
        { value: "not_sure", label: "Non lo so, vorrei consiglio" },
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

export const finitureModels: InterventionFunnelModel[] = [tinteggiareEsterni]
