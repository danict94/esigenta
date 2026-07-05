/**
 * Esigenta — Esterni e giardino funnel models
 *
 * Bespoke models for the `esterni-e-giardino` group (category giardiniere).
 * Value-first: lead with the value-bearing work; scale qualifiers are
 * qualitative buckets (small/medium/large, short/long) — never free m²/number
 * input. No property, no budget. The green-maintenance model leads with skilled
 * work (tree pruning, recurring upkeep), NOT a one-off lawn mow. Boundaries:
 * interior paving → pavimentazioni; metal gate → fabbro; interior/structural
 * masonry → opere-murarie. Step ids `esterni:<intervention>:<step>`.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const giardino: InterventionFunnelModel = {
  interventionSlug: "realizzare-o-sistemare-giardino",
  steps: [
    locationCapability,
    {
      id: "esterni:realizzare-o-sistemare-giardino:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve in giardino?",
      options: [
        { value: "new_garden", label: "Realizzare un giardino nuovo" },
        { value: "redo", label: "Rifare o risistemare il giardino" },
        { value: "lawn", label: "Realizzare o rifare il prato" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "esterni:realizzare-o-sistemare-giardino:cosa",
      type: "multi_select",
      question: "Cosa comprende il lavoro?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "lawn", label: "Prato" },
        { value: "plants_hedges", label: "Piante o siepi" },
        { value: "irrigation", label: "Impianto di irrigazione" },
        { value: "paving", label: "Pavimentazione o vialetti" },
        { value: "design", label: "Progettazione del giardino" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "esterni:realizzare-o-sistemare-giardino:superficie",
      type: "single_select",
      question: "Quanto è grande il giardino circa?",
      options: [
        { value: "small", label: "Piccolo (fino a 100 m²)" },
        { value: "medium", label: "Medio (100-300 m²)" },
        { value: "large", label: "Grande (oltre 300 m²)" },
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

const irrigazione: InterventionFunnelModel = {
  interventionSlug: "installare-impianto-irrigazione",
  steps: [
    locationCapability,
    {
      id: "esterni:installare-impianto-irrigazione:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve per l'irrigazione?",
      options: [
        { value: "new", label: "Installare un nuovo impianto" },
        { value: "extend", label: "Ampliare o modificare un impianto esistente" },
        { value: "repair", label: "Riparare un impianto esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "esterni:installare-impianto-irrigazione:tipo",
      type: "single_select",
      question: "Che tipo di irrigazione ti interessa?",
      options: [
        { value: "underground", label: "Interrata" },
        { value: "drip", label: "A goccia" },
        { value: "above_ground", label: "Fuori terra" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "esterni:installare-impianto-irrigazione:superficie",
      type: "single_select",
      question: "Quanto è grande l'area da irrigare circa?",
      options: [
        { value: "small", label: "Piccola (fino a 100 m²)" },
        { value: "medium", label: "Media (100-300 m²)" },
        { value: "large", label: "Grande (oltre 300 m²)" },
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

const pavimentazioneEsterna: InterventionFunnelModel = {
  interventionSlug: "posare-pavimentazione-esterna",
  steps: [
    locationCapability,
    {
      id: "esterni:posare-pavimentazione-esterna:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla pavimentazione esterna?",
      options: [
        { value: "new", label: "Posare una nuova pavimentazione" },
        { value: "redo", label: "Rifare una pavimentazione esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "esterni:posare-pavimentazione-esterna:materiale",
      type: "single_select",
      question: "Che materiale ti interessa?",
      options: [
        { value: "self_locking", label: "Autobloccanti o masselli" },
        { value: "porphyry", label: "Porfido" },
        { value: "stone", label: "Pietra naturale" },
        { value: "concrete", label: "Cemento o cemento stampato" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "esterni:posare-pavimentazione-esterna:dove",
      type: "single_select",
      question: "Dove va posata?",
      options: [
        { value: "driveway_path", label: "Vialetto o passaggio" },
        { value: "courtyard", label: "Cortile" },
        { value: "garden", label: "Giardino" },
        { value: "terrace", label: "Terrazzo o bordo piscina" },
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

const murettoRecinzione: InterventionFunnelModel = {
  interventionSlug: "costruire-muretto-o-recinzione",
  steps: [
    locationCapability,
    {
      id: "esterni:costruire-muretto-o-recinzione:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve?",
      options: [
        { value: "wall", label: "Costruire un muretto" },
        { value: "fence", label: "Installare una recinzione" },
        { value: "wall_and_fence", label: "Muretto con recinzione sopra" },
        { value: "repair", label: "Riparare un muretto o una recinzione" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "esterni:costruire-muretto-o-recinzione:materiale",
      type: "single_select",
      question: "Di che materiale?",
      options: [
        { value: "masonry", label: "Muratura (blocchi, mattoni o pietra)" },
        { value: "metal_mesh", label: "Rete metallica" },
        { value: "wood", label: "Legno o staccionata" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "esterni:costruire-muretto-o-recinzione:lunghezza",
      type: "single_select",
      question: "Quanto è lungo circa?",
      options: [
        { value: "short", label: "Fino a 10 metri" },
        { value: "medium", label: "10-30 metri" },
        { value: "long", label: "Oltre 30 metri" },
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

const verde: InterventionFunnelModel = {
  interventionSlug: "potare-e-curare-il-verde",
  steps: [
    locationCapability,
    {
      id: "esterni:potare-e-curare-il-verde:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro sul verde serve?",
      options: [
        { value: "prune_trees", label: "Potatura di alberi" },
        { value: "prune_hedges", label: "Potatura di siepi" },
        { value: "tree_removal", label: "Abbattimento di un albero" },
        { value: "garden_maintenance", label: "Manutenzione ricorrente del giardino" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "esterni:potare-e-curare-il-verde:contesto",
      type: "single_select",
      question: "Qualche dettaglio in più?",
      options: [
        { value: "tall_trees", label: "Alberi alti o lavori in quota" },
        { value: "few_plants", label: "Poche piante" },
        { value: "whole_garden", label: "Tutto il giardino" },
        { value: "recurring", label: "Mi serve un servizio ricorrente" },
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

export const esterniEGiardinoModels: InterventionFunnelModel[] = [
  giardino,
  irrigazione,
  pavimentazioneEsterna,
  murettoRecinzione,
  verde,
]
