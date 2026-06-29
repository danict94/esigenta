/**
 * Esigenta — Facciate e balconi funnel models
 *
 * Bespoke models for the active interventions of the `facciate-e-balconi`
 * taxonomy group. Same domain-driven shape as Cartongesso/Climatizzazione:
 * the common spine (location → … → photos → note → timing → contact) plus a
 * few intervention-specific steps that make the funnel speak the language of
 * facade / balcony work, without forcing the customer to be technical.
 *
 * Two cross-cutting helpers:
 * - `scaleStep`: superficie buckets with stable values (small/medium/large/
 *   unknown) under the well-known `scale` id, so enrich-request derives
 *   projectScale uniformly — same contract as Cartongesso/Climatizzazione.
 *   Non-scale "Non lo so" answers keep their own `not_sure` value, as they do
 *   not feed projectScale.
 * - `accessInQuotaStep`: the reusable "Serve un accesso in quota?" question —
 *   ponteggio is never a separate intervention, it is an access detail that
 *   drives quote, time, safety and feasibility. Required on facade/coat/balcony
 *   /frontalino work, optional (still recommended) on floor/waterproofing work.
 */

import type { RuntimeCapability, RuntimeOption } from "../types/capability"

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const ACCESS_IN_QUOTA_STEP_ID = "facciate-e-balconi:access-in-quota"

function accessInQuotaStep(optional: boolean): RuntimeCapability {
  return {
    id: ACCESS_IN_QUOTA_STEP_ID,
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
    id: "scale",
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
    scaleStep(
      "Quanto è grande circa la facciata?",
      "Piccola",
      "Media",
      "Grande",
    ),
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
