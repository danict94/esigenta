/**
 * Esigenta — Ristrutturazioni funnel models
 *
 * Bespoke models for the `ristrutturazioni` group. These are BIG projects, so
 * the funnel stays deliberately light: what work + what it may include + how far
 * along the project is — no property, no surface/m², no budget, no automatic
 * quote, no technical material questions. Just enough to qualify and route.
 *
 * Same spine: location → tipo-lavoro (single, required) → cosa-include/ambienti
 * (multi, optional) → stato-progetto (single, optional) → photos → note →
 * timing → contact. Select steps carry `other_note` + `not_sure` escapes.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const ristrutturareBagno: InterventionFunnelModel = {
  interventionSlug: "ristrutturare-bagno",
  steps: [
    locationCapability,
    {
      id: "ristrutturazioni:ristrutturare-bagno:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro vuoi fare in bagno?",
      options: [
        { value: "complete_renovation", label: "Rifare completamente il bagno" },
        { value: "partial_renovation", label: "Ristrutturare solo una parte" },
        { value: "replace_fixtures_or_shower", label: "Sostituire sanitari, doccia o vasca" },
        { value: "improve_layout", label: "Cambiare disposizione o impianti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "ristrutturazioni:ristrutturare-bagno:cosa-include",
      type: "multi_select",
      question: "Cosa potrebbe includere il lavoro?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "tiles_flooring", label: "Pavimenti o rivestimenti" },
        { value: "sanitary_fixtures", label: "Sanitari" },
        { value: "shower_or_tub", label: "Doccia o vasca" },
        { value: "plumbing", label: "Impianto idraulico" },
        { value: "electrical", label: "Impianto elettrico" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "ristrutturazioni:ristrutturare-bagno:stato-progetto",
      type: "single_select",
      question: "Hai già un progetto o un'idea precisa?",
      options: [
        { value: "clear_idea", label: "Ho già un'idea abbastanza chiara" },
        { value: "need_advice", label: "Mi serve un consiglio" },
        { value: "project_ready", label: "Ho già progetto o misure" },
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

const ristrutturareCucina: InterventionFunnelModel = {
  interventionSlug: "ristrutturare-cucina",
  steps: [
    locationCapability,
    {
      id: "ristrutturazioni:ristrutturare-cucina:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro vuoi fare in cucina?",
      options: [
        { value: "complete_renovation", label: "Rifare completamente la cucina" },
        { value: "partial_renovation", label: "Ristrutturare solo una parte" },
        { value: "replace_floor_or_walls", label: "Rifare pavimenti o rivestimenti" },
        { value: "move_connections", label: "Spostare attacchi o impianti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "ristrutturazioni:ristrutturare-cucina:cosa-include",
      type: "multi_select",
      question: "Cosa potrebbe includere il lavoro?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "flooring", label: "Pavimento" },
        { value: "wall_tiles", label: "Rivestimenti" },
        { value: "plumbing", label: "Attacchi acqua o scarichi" },
        { value: "electrical", label: "Prese o impianto elettrico" },
        { value: "masonry", label: "Piccole opere murarie" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "ristrutturazioni:ristrutturare-cucina:stato-progetto",
      type: "single_select",
      question: "Hai già un progetto o una cucina scelta?",
      options: [
        { value: "clear_idea", label: "Ho già un'idea chiara" },
        { value: "kitchen_chosen", label: "Ho già scelto la cucina" },
        { value: "need_advice", label: "Mi serve un consiglio" },
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

const ristrutturareCasa: InterventionFunnelModel = {
  interventionSlug: "ristrutturare-casa",
  steps: [
    locationCapability,
    {
      id: "ristrutturazioni:ristrutturare-casa:tipo-lavoro",
      type: "single_select",
      question: "Che tipo di ristrutturazione vuoi fare?",
      options: [
        { value: "whole_house", label: "Ristrutturare tutta la casa" },
        { value: "several_rooms", label: "Ristrutturare più ambienti" },
        { value: "structural_or_layout", label: "Cambiare distribuzione o muri interni" },
        { value: "systems_and_finishes", label: "Rifare impianti e finiture" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "ristrutturazioni:ristrutturare-casa:ambienti",
      type: "multi_select",
      question: "Quali ambienti sono coinvolti?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "bathroom", label: "Bagno" },
        { value: "kitchen", label: "Cucina" },
        { value: "living_area", label: "Zona giorno" },
        { value: "bedrooms", label: "Camere" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "external_areas", label: "Spazi esterni o facciata" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "ristrutturazioni:ristrutturare-casa:stato-progetto",
      type: "single_select",
      question: "A che punto sei con il progetto?",
      options: [
        { value: "idea_only", label: "Ho solo un'idea iniziale" },
        { value: "need_technical_advice", label: "Mi serve anche supporto tecnico" },
        { value: "project_ready", label: "Ho già progetto o computo" },
        { value: "permits_needed", label: "Potrebbero servire pratiche edilizie" },
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

const ristrutturareAppartamento: InterventionFunnelModel = {
  interventionSlug: "ristrutturare-appartamento",
  steps: [
    locationCapability,
    {
      id: "ristrutturazioni:ristrutturare-appartamento:tipo-lavoro",
      type: "single_select",
      question: "Che tipo di ristrutturazione vuoi fare?",
      options: [
        { value: "whole_apartment", label: "Ristrutturare tutto l'appartamento" },
        { value: "several_rooms", label: "Ristrutturare più stanze" },
        { value: "bathroom_or_kitchen", label: "Bagno, cucina o entrambi" },
        { value: "systems_and_finishes", label: "Rifare impianti e finiture" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "ristrutturazioni:ristrutturare-appartamento:ambienti",
      type: "multi_select",
      question: "Quali ambienti sono coinvolti?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "bathroom", label: "Bagno" },
        { value: "kitchen", label: "Cucina" },
        { value: "living_area", label: "Soggiorno o zona giorno" },
        { value: "bedrooms", label: "Camere" },
        { value: "whole_apartment", label: "Tutto l'appartamento" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "ristrutturazioni:ristrutturare-appartamento:stato-progetto",
      type: "single_select",
      question: "A che punto sei con il progetto?",
      options: [
        { value: "idea_only", label: "Ho solo un'idea iniziale" },
        { value: "need_technical_advice", label: "Mi serve anche supporto tecnico" },
        { value: "project_ready", label: "Ho già progetto o computo" },
        { value: "permits_needed", label: "Potrebbero servire pratiche edilizie" },
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

export const ristrutturazioniModels: InterventionFunnelModel[] = [
  ristrutturareBagno,
  ristrutturareCucina,
  ristrutturareCasa,
  ristrutturareAppartamento,
]
