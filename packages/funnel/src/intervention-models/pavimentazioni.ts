/**
 * Esigenta — Pavimentazioni funnel models
 *
 * Bespoke models for the active interventions of the `pavimentazioni` taxonomy
 * group. Same domain-driven spine (location → … → photos → note → timing →
 * contact) plus a few intervention-specific steps.
 *
 * `fare-massetto`: what work (single, with `other_note` escape) + optional
 * surface bucket. Kept short and non-technical — no property, no screed
 * thickness/material/heating detail (that goes in the note). The surface is a
 * qualitative bucket (own namespaced id, not the numeric `surface-area`), only
 * a scale hint for the impresa.
 * `posare-o-rifare-pavimento-interno`: mother intervention for interior floors —
 * type of work (single) + optional material (piastrelle/gres/laminato/PVC-vinyl-
 * SPC-LVT/parquet/resin — options, not separate interventions) + optional surface
 * bucket (same bands as `fare-massetto`). No property, no technical detail.
 * `posare-levigare-o-ripristinare-parquet`: wood-only intervention (new install /
 * sanding-polishing / restore / replace parts) + optional current state + optional
 * surface bucket (same bands). Laminate/PVC/SPC/LVT stay on the generic interior
 * floor. No property, no wood-species/thickness/finish detail (that goes in note).
 * `riparare-pavimento`: spot repair (multi problem) + optional material + optional
 * surface bucket. NOT a re-lay/parquet job (those have their own interventions);
 * material options deliberately exclude parquet.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const fareMassetto: InterventionFunnelModel = {
  interventionSlug: "fare-massetto",
  steps: [
    locationCapability,
    {
      id: "pavimentazioni:fare-massetto:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve per il massetto?",
      options: [
        { value: "new_screed", label: "Realizzare un nuovo massetto" },
        { value: "redo_screed", label: "Rifare un massetto esistente" },
        { value: "prepare_subfloor", label: "Preparare o sistemare il sottofondo" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "pavimentazioni:fare-massetto:superficie",
      type: "single_select",
      question: "Quanta superficie è coinvolta circa?",
      options: [
        { value: "up_to_10", label: "Fino a 10 m²" },
        { value: "ten_to_thirty", label: "10-30 m²" },
        { value: "thirty_to_sixty", label: "30-60 m²" },
        { value: "over_sixty", label: "Oltre 60 m²" },
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

const posareORifarePavimentoInterno: InterventionFunnelModel = {
  interventionSlug: "posare-o-rifare-pavimento-interno",
  steps: [
    locationCapability,
    {
      id: "pavimentazioni:posare-o-rifare-pavimento-interno:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro devi fare sul pavimento?",
      options: [
        { value: "new_floor", label: "Posare un nuovo pavimento" },
        { value: "replace_floor", label: "Rifare o sostituire il pavimento esistente" },
        { value: "cover_existing", label: "Posare sopra il pavimento esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "pavimentazioni:posare-o-rifare-pavimento-interno:materiale",
      type: "single_select",
      question: "Che tipo di pavimento vorresti?",
      options: [
        { value: "tiles_or_gres", label: "Piastrelle o gres" },
        { value: "laminate", label: "Laminato" },
        { value: "pvc_vinyl_spc_lvt", label: "PVC, vinilico, SPC o LVT" },
        { value: "parquet", label: "Parquet" },
        { value: "resin_or_microcement", label: "Resina o microcemento" },
        { value: "other_note", label: "Altro materiale (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "pavimentazioni:posare-o-rifare-pavimento-interno:superficie",
      type: "single_select",
      question: "Quanta superficie è coinvolta circa?",
      options: [
        { value: "up_to_10", label: "Fino a 10 m²" },
        { value: "ten_to_thirty", label: "10-30 m²" },
        { value: "thirty_to_sixty", label: "30-60 m²" },
        { value: "over_sixty", label: "Oltre 60 m²" },
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

const posareLevigareORipristinareParquet: InterventionFunnelModel = {
  interventionSlug: "posare-levigare-o-ripristinare-parquet",
  steps: [
    locationCapability,
    {
      id: "pavimentazioni:posare-levigare-o-ripristinare-parquet:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro devi fare sul parquet?",
      options: [
        { value: "new_installation", label: "Posare nuovo parquet" },
        { value: "sand_or_polish", label: "Levigare o lucidare parquet esistente" },
        { value: "restore_damaged", label: "Ripristinare parquet rovinato" },
        { value: "replace_parts", label: "Sostituire alcune parti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "pavimentazioni:posare-levigare-o-ripristinare-parquet:stato",
      type: "single_select",
      question: "Com'è il parquet oggi?",
      options: [
        { value: "not_installed", label: "Non è ancora installato" },
        { value: "worn_or_dull", label: "Rovinato o opaco" },
        { value: "scratched", label: "Graffiato" },
        { value: "lifted_or_moving", label: "Sollevato o instabile" },
        { value: "stained", label: "Macchiato" },
        { value: "other_note", label: "Altro stato (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "pavimentazioni:posare-levigare-o-ripristinare-parquet:superficie",
      type: "single_select",
      question: "Quanta superficie è coinvolta circa?",
      options: [
        { value: "up_to_10", label: "Fino a 10 m²" },
        { value: "ten_to_thirty", label: "10-30 m²" },
        { value: "thirty_to_sixty", label: "30-60 m²" },
        { value: "over_sixty", label: "Oltre 60 m²" },
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

const riparaPavimento: InterventionFunnelModel = {
  interventionSlug: "riparare-pavimento",
  steps: [
    locationCapability,
    {
      id: "pavimentazioni:riparare-pavimento:problema",
      type: "multi_select",
      question: "Che problema ha il pavimento?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "broken_tiles", label: "Piastrelle rotte o crepate" },
        { value: "lifted_tiles", label: "Piastrelle sollevate o staccate" },
        { value: "moving_floor", label: "Una parte del pavimento si muove" },
        { value: "damaged_grout", label: "Fughe rovinate" },
        { value: "small_area_replace", label: "Una piccola zona da sostituire" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "pavimentazioni:riparare-pavimento:materiale",
      type: "single_select",
      question: "Che tipo di pavimento è?",
      options: [
        { value: "tiles_or_gres", label: "Piastrelle o gres" },
        { value: "laminate", label: "Laminato" },
        { value: "pvc_vinyl_spc_lvt", label: "PVC, vinilico, SPC o LVT" },
        { value: "stone_marble_cotto", label: "Pietra, marmo o cotto" },
        { value: "other_note", label: "Altro materiale (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "pavimentazioni:riparare-pavimento:superficie",
      type: "single_select",
      question: "Quanto è grande la zona da riparare circa?",
      options: [
        { value: "up_to_10", label: "Fino a 10 m²" },
        { value: "ten_to_thirty", label: "10-30 m²" },
        { value: "thirty_to_sixty", label: "30-60 m²" },
        { value: "over_sixty", label: "Oltre 60 m²" },
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

export const pavimentazioniModels: InterventionFunnelModel[] = [
  fareMassetto,
  posareORifarePavimentoInterno,
  posareLevigareORipristinareParquet,
  riparaPavimento,
]
