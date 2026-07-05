/**
 * Esigenta — Camini, stufe e canne fumarie funnel models
 *
 * Bespoke models for the `camini-stufe-e-canne-fumarie` group (category fumista).
 * Value-first: lead with install/replace; the real value qualifier here is
 * "do you already have a flue?" — a stove/fireplace install WITHOUT an existing
 * canna fumaria is a much bigger job. No micro CTAs, no property, no m²/number
 * input, no budget. Sober, NON-promissory copy: never promise "a norma" /
 * guaranteed draught / compliance (the pro assesses). Boundaries: flue-leak
 * repair stays in tetti; boiler/radiators stay in riscaldamento. Step ids
 * `camini:<intervention>:<step>`.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const flueStep = (interventionSlug: string) => ({
  id: `camini:${interventionSlug}:canna-fumaria`,
  type: "single_select" as const,
  question: "Hai già la canna fumaria?",
  options: [
    { value: "existing", label: "Sì, è già presente" },
    { value: "needs_new", label: "No, va realizzata" },
    { value: "to_check", label: "Va verificata o adeguata" },
    { value: "not_sure", label: "Non lo so" },
  ],
  optional: true,
})

const stufa: InterventionFunnelModel = {
  interventionSlug: "installare-o-sostituire-stufa",
  steps: [
    locationCapability,
    {
      id: "camini:installare-o-sostituire-stufa:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla stufa?",
      options: [
        { value: "new", label: "Installare una nuova stufa" },
        { value: "replace", label: "Sostituire una stufa esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "camini:installare-o-sostituire-stufa:combustibile",
      type: "single_select",
      question: "Che tipo di stufa ti interessa?",
      options: [
        { value: "pellet", label: "A pellet" },
        { value: "wood", label: "A legna" },
        { value: "pellet_ducted", label: "A pellet canalizzata" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    flueStep("installare-o-sostituire-stufa"),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const caminetto: InterventionFunnelModel = {
  interventionSlug: "installare-caminetto-o-inserto",
  steps: [
    locationCapability,
    {
      id: "camini:installare-caminetto-o-inserto:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sul caminetto?",
      options: [
        { value: "new_fireplace", label: "Installare un caminetto nuovo" },
        { value: "insert_existing", label: "Inserto in un camino esistente" },
        { value: "thermo", label: "Termocamino (riscalda anche i termosifoni)" },
        { value: "replace", label: "Sostituire un caminetto o inserto" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "camini:installare-caminetto-o-inserto:combustibile",
      type: "single_select",
      question: "A cosa va il caminetto?",
      options: [
        { value: "wood", label: "A legna" },
        { value: "pellet", label: "A pellet" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    flueStep("installare-caminetto-o-inserto"),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const cannaFumaria: InterventionFunnelModel = {
  interventionSlug: "installare-o-adeguare-canna-fumaria",
  steps: [
    locationCapability,
    {
      id: "camini:installare-o-adeguare-canna-fumaria:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla canna fumaria?",
      options: [
        { value: "new_install", label: "Installare una nuova canna fumaria" },
        { value: "upgrade", label: "Adeguare una canna fumaria esistente" },
        { value: "replace", label: "Sostituire una canna fumaria" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "camini:installare-o-adeguare-canna-fumaria:per-cosa",
      type: "single_select",
      question: "A cosa serve la canna fumaria?",
      options: [
        { value: "stove", label: "Per una stufa" },
        { value: "fireplace", label: "Per un caminetto" },
        { value: "boiler", label: "Per una caldaia" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro apparecchio (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "camini:installare-o-adeguare-canna-fumaria:posizione",
      type: "single_select",
      question: "Come sarà installata?",
      options: [
        { value: "internal", label: "Interna" },
        { value: "external", label: "Esterna (a parete)" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const pulizia: InterventionFunnelModel = {
  interventionSlug: "pulire-canna-fumaria",
  steps: [
    locationCapability,
    {
      id: "camini:pulire-canna-fumaria:tipo-lavoro",
      type: "single_select",
      question: "Che intervento serve?",
      options: [
        { value: "cleaning", label: "Pulizia della canna fumaria" },
        { value: "inspection", label: "Controllo o videoispezione" },
        { value: "cleaning_and_check", label: "Pulizia e controllo" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "camini:pulire-canna-fumaria:impianto",
      type: "single_select",
      question: "Per che tipo di impianto?",
      options: [
        { value: "stove", label: "Stufa a pellet o legna" },
        { value: "fireplace", label: "Caminetto" },
        { value: "boiler", label: "Caldaia" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const caminiStufeECanneFumarieModels: InterventionFunnelModel[] = [
  stufa,
  caminetto,
  cannaFumaria,
  pulizia,
]
