/**
 * Esigenta — Riscaldamento funnel models
 *
 * Bespoke models for the `riscaldamento` group (category idraulico). Pay-per-lead
 * lens: lead with the value-bearing actions (install / replace / new system),
 * add a qualitative "quanti/quanto" qualifier only where scale drives value
 * (termosifoni, pavimento radiante). No micro CTAs (no bleeding/pressure-refill/
 * single valve), no property, no m²/number input, no budget. Prudent, NON-
 * promissory copy on incentives (2026 rules changed) — never promise bonuses,
 * savings or compliance. Boundary: heat pump (aria-acqua) lives here; split
 * air-air conditioners stay in climatizzazione. Step ids `riscaldamento:…`.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const caldaia: InterventionFunnelModel = {
  interventionSlug: "installare-o-sostituire-caldaia",
  steps: [
    locationCapability,
    {
      id: "riscaldamento:installare-o-sostituire-caldaia:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla caldaia?",
      options: [
        { value: "replace", label: "Sostituire la caldaia esistente" },
        { value: "new", label: "Installare una nuova caldaia" },
        { value: "switch_condensing", label: "Passare a una caldaia a condensazione" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "riscaldamento:installare-o-sostituire-caldaia:tipo-caldaia",
      type: "single_select",
      question: "Che tipo di caldaia ti interessa?",
      options: [
        { value: "gas", label: "A gas / metano" },
        { value: "condensing", label: "A condensazione" },
        { value: "lpg", label: "A GPL" },
        { value: "electric", label: "Elettrica" },
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

const pompaDiCalore: InterventionFunnelModel = {
  interventionSlug: "installare-pompa-di-calore",
  steps: [
    locationCapability,
    {
      id: "riscaldamento:installare-pompa-di-calore:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve con la pompa di calore?",
      description:
        "Gli incentivi e le detrazioni dipendono da requisiti, edificio e norme aggiornate: il professionista valuta cosa si applica al tuo caso.",
      options: [
        { value: "new_system", label: "Installare un nuovo impianto a pompa di calore" },
        { value: "replace_boiler", label: "Sostituire la caldaia con una pompa di calore" },
        { value: "hybrid", label: "Sistema ibrido (caldaia + pompa di calore)" },
        { value: "replace_heat_pump", label: "Sostituire una pompa di calore esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "riscaldamento:installare-pompa-di-calore:obiettivo",
      type: "single_select",
      question: "A cosa serve l'impianto?",
      options: [
        { value: "heating_only", label: "Solo riscaldamento" },
        { value: "heating_dhw", label: "Riscaldamento e acqua calda" },
        { value: "heating_cooling", label: "Riscaldamento e raffrescamento" },
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

const termosifoni: InterventionFunnelModel = {
  interventionSlug: "installare-o-sostituire-termosifoni",
  steps: [
    locationCapability,
    {
      id: "riscaldamento:installare-o-sostituire-termosifoni:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sui termosifoni?",
      options: [
        { value: "replace", label: "Sostituire i termosifoni" },
        { value: "install_new", label: "Installare nuovi termosifoni" },
        { value: "add", label: "Aggiungere termosifoni" },
        { value: "move", label: "Spostare termosifoni" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "riscaldamento:installare-o-sostituire-termosifoni:quanti",
      type: "single_select",
      question: "Quanti termosifoni sono circa?",
      options: [
        { value: "one", label: "1 termosifone" },
        { value: "some", label: "Alcuni" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "riscaldamento:installare-o-sostituire-termosifoni:tipo",
      type: "single_select",
      question: "Che tipo di termosifoni?",
      options: [
        { value: "standard", label: "Tradizionali (ad acqua)" },
        { value: "designer", label: "Termoarredo / di design" },
        { value: "with_valves", label: "Anche con valvole termostatiche" },
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

const pavimentoRadiante: InterventionFunnelModel = {
  interventionSlug: "installare-riscaldamento-a-pavimento",
  steps: [
    locationCapability,
    {
      id: "riscaldamento:installare-riscaldamento-a-pavimento:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve per il riscaldamento a pavimento?",
      options: [
        { value: "new_install", label: "Installare un nuovo impianto a pavimento" },
        { value: "in_renovation", label: "Nel contesto di una ristrutturazione" },
        { value: "new_build", label: "In nuova costruzione" },
        { value: "extend", label: "Estendere un impianto esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "riscaldamento:installare-riscaldamento-a-pavimento:quanto",
      type: "single_select",
      question: "Quanta superficie è coinvolta circa?",
      options: [
        { value: "one_room", label: "Una stanza" },
        { value: "part_house", label: "Parte della casa" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const scaldabagno: InterventionFunnelModel = {
  interventionSlug: "installare-o-sostituire-scaldabagno",
  steps: [
    locationCapability,
    {
      id: "riscaldamento:installare-o-sostituire-scaldabagno:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sullo scaldabagno?",
      options: [
        { value: "replace", label: "Sostituire lo scaldabagno" },
        { value: "new", label: "Installare un nuovo scaldabagno" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "riscaldamento:installare-o-sostituire-scaldabagno:tipo",
      type: "single_select",
      question: "Che tipo di scaldabagno ti interessa?",
      options: [
        { value: "electric", label: "Elettrico" },
        { value: "gas", label: "A gas" },
        { value: "heat_pump", label: "A pompa di calore" },
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

const manutenzioneCaldaia: InterventionFunnelModel = {
  interventionSlug: "fare-manutenzione-caldaia",
  steps: [
    locationCapability,
    {
      id: "riscaldamento:fare-manutenzione-caldaia:tipo-lavoro",
      type: "single_select",
      question: "Che tipo di intervento serve sulla caldaia?",
      options: [
        { value: "maintenance", label: "Manutenzione ordinaria o controllo" },
        { value: "flue_check", label: "Controllo fumi (bollino blu)" },
        { value: "not_working", label: "Caldaia in blocco o che non scalda bene" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "riscaldamento:fare-manutenzione-caldaia:tipo-caldaia",
      type: "single_select",
      question: "Che tipo di caldaia hai?",
      options: [
        { value: "gas", label: "A gas" },
        { value: "condensing", label: "A condensazione" },
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

export const riscaldamentoModels: InterventionFunnelModel[] = [
  caldaia,
  pompaDiCalore,
  termosifoni,
  pavimentoRadiante,
  scaldabagno,
  manutenzioneCaldaia,
]
