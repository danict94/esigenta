/**
 * Esigenta — Serramenti e infissi funnel models
 *
 * Bespoke models for the `serramenti-e-infissi` group (category serramentista).
 * Pay-per-lead lens: the funnel qualifies VALUE, it does not invite €50 jobs.
 * So every model leads with the value-bearing actions (install / replace /
 * motorize) and carries a qualitative "quante" (how many) step as the value
 * signal — one vs whole-house is the difference between a €200 and a €5.000 job.
 * Pure micro-repair CTAs (single cinghia, one screen) are intentionally NOT
 * offered here; "riparare tapparella/persiana" stays only as a taxonomy search
 * alias. No property, no free m²/number input, no budget, no promises on
 * anti-intrusion classes. Step ids `serramenti:<intervention>:<step>`.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const finestreInfissi: InterventionFunnelModel = {
  interventionSlug: "installare-o-sostituire-finestre-infissi",
  steps: [
    locationCapability,
    {
      id: "serramenti:installare-o-sostituire-finestre-infissi:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sugli infissi?",
      options: [
        { value: "replace_all", label: "Sostituire tutti gli infissi esistenti" },
        { value: "replace_some", label: "Sostituire solo alcune finestre" },
        { value: "new_build", label: "Installare in nuova costruzione o ampliamento" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "serramenti:installare-o-sostituire-finestre-infissi:quante",
      type: "single_select",
      question: "Quante finestre o infissi sono circa?",
      options: [
        { value: "one", label: "1 finestra" },
        { value: "two_four", label: "2-4 finestre" },
        { value: "five_eight", label: "5-8 finestre" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "serramenti:installare-o-sostituire-finestre-infissi:materiale",
      type: "single_select",
      question: "Che materiale ti interessa?",
      options: [
        { value: "pvc", label: "PVC" },
        { value: "aluminum", label: "Alluminio" },
        { value: "wood", label: "Legno" },
        { value: "wood_aluminum", label: "Legno-alluminio" },
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

const porteInterne: InterventionFunnelModel = {
  interventionSlug: "installare-porte-interne",
  steps: [
    locationCapability,
    {
      id: "serramenti:installare-porte-interne:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulle porte interne?",
      options: [
        { value: "new_doors", label: "Installare porte nuove" },
        { value: "replace_doors", label: "Sostituire porte esistenti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "serramenti:installare-porte-interne:quante",
      type: "single_select",
      question: "Quante porte sono circa?",
      options: [
        { value: "one", label: "1 porta" },
        { value: "two_three", label: "2-3 porte" },
        { value: "four_six", label: "4-6 porte" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "serramenti:installare-porte-interne:tipo",
      type: "single_select",
      question: "Che tipo di porte ti interessano?",
      options: [
        { value: "hinged", label: "Battente" },
        { value: "sliding_external", label: "Scorrevole esterno muro" },
        { value: "sliding_pocket", label: "Scorrevole a scomparsa (interno muro)" },
        { value: "flush", label: "Filomuro" },
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

const portaBlindata: InterventionFunnelModel = {
  interventionSlug: "installare-porta-blindata",
  steps: [
    locationCapability,
    {
      id: "serramenti:installare-porta-blindata:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla porta blindata?",
      options: [
        { value: "new_armored", label: "Installare una nuova porta blindata" },
        { value: "replace_armored", label: "Sostituire una porta blindata esistente" },
        { value: "upgrade_to_armored", label: "Sostituire una porta normale con una blindata" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "serramenti:installare-porta-blindata:misura",
      type: "single_select",
      question: "Sai se serve su misura?",
      options: [
        { value: "standard", label: "Misura standard" },
        { value: "custom", label: "Su misura" },
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

const tapparelle: InterventionFunnelModel = {
  interventionSlug: "riparare-o-sostituire-tapparelle",
  steps: [
    locationCapability,
    {
      id: "serramenti:riparare-o-sostituire-tapparelle:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulle tapparelle?",
      options: [
        { value: "replace", label: "Sostituire le tapparelle" },
        { value: "motorize", label: "Motorizzare le tapparelle" },
        { value: "replace_and_motorize", label: "Sostituire e motorizzare" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "serramenti:riparare-o-sostituire-tapparelle:quante",
      type: "single_select",
      question: "Quante tapparelle sono circa?",
      options: [
        { value: "one", label: "1 tapparella" },
        { value: "some", label: "Alcune" },
        { value: "whole_house", label: "Tutte le tapparelle di casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "serramenti:riparare-o-sostituire-tapparelle:tipo",
      type: "single_select",
      question: "Che tipo di tapparelle sono?",
      options: [
        { value: "manual", label: "Manuali (a cinghia o argano)" },
        { value: "motorized", label: "Elettriche o motorizzate" },
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

const zanzariere: InterventionFunnelModel = {
  interventionSlug: "installare-zanzariere",
  steps: [
    locationCapability,
    {
      id: "serramenti:installare-zanzariere:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulle zanzariere?",
      options: [
        { value: "new_screens", label: "Installare zanzariere nuove" },
        { value: "replace_screens", label: "Sostituire zanzariere esistenti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "serramenti:installare-zanzariere:quante",
      type: "single_select",
      question: "Quante zanzariere sono circa?",
      options: [
        { value: "one", label: "1 zanzariera" },
        { value: "two_four", label: "2-4 zanzariere" },
        { value: "five_plus", label: "5 o più" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "serramenti:installare-zanzariere:tipo",
      type: "single_select",
      question: "Che tipo di zanzariere ti interessano?",
      options: [
        { value: "fixed", label: "Fissa" },
        { value: "roller", label: "Avvolgibile" },
        { value: "plisse", label: "Plissettata" },
        { value: "sliding", label: "Scorrevole" },
        { value: "motorized", label: "Motorizzata" },
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

const persianeScuri: InterventionFunnelModel = {
  interventionSlug: "installare-persiane-o-scuri",
  steps: [
    locationCapability,
    {
      id: "serramenti:installare-persiane-o-scuri:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve su persiane o scuri?",
      options: [
        { value: "new_shutters", label: "Installare persiane o scuri nuovi" },
        { value: "replace_shutters", label: "Sostituire persiane o scuri esistenti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "serramenti:installare-persiane-o-scuri:quante",
      type: "single_select",
      question: "Quante finestre sono coinvolte circa?",
      options: [
        { value: "one", label: "1 finestra" },
        { value: "some", label: "Alcune" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "serramenti:installare-persiane-o-scuri:materiale",
      type: "single_select",
      question: "Che materiale ti interessa?",
      options: [
        { value: "aluminum", label: "Alluminio" },
        { value: "wood", label: "Legno" },
        { value: "pvc", label: "PVC" },
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

export const serramentiEInfissiModels: InterventionFunnelModel[] = [
  finestreInfissi,
  porteInterne,
  portaBlindata,
  tapparelle,
  zanzariere,
  persianeScuri,
]
