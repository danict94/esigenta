/**
 * Esigenta — Fotovoltaico funnel models
 *
 * Bespoke model for the active interventions of the `fotovoltaico` taxonomy
 * group. Same domain-driven shape as the other groups: the common spine
 * (location → … → photos → note → timing → contact) plus a few intervention-
 * specific steps.
 *
 * Three interventions along the lifecycle, kept customer-friendly (no kW/brand/
 * technical detail, no GSE/net-metering/EV charger/solar-thermal, no work-at-
 * height, no guaranteed saving/incentive promise):
 * - `installare-fotovoltaico`: a NEW system, with or without storage — the former
 *   separate `installare-fotovoltaico-con-accumulo` is absorbed as the "accumulo"
 *   question (a variant, not a distinct job).
 * - `modificare-o-potenziare-impianto-fotovoltaico`: customer ALREADY has a system
 *   and wants to add/upgrade something (battery, panels, inverter…). Components
 *   are multi-select options, never separate interventions.
 * - `riparare-o-fare-manutenzione-fotovoltaico`: customer ALREADY has a system with
 *   a problem / wants a check or maintenance. Panel cleaning stays an option here.
 *
 * The numeric `surface-area` is optional everywhere (most customers don't know it).
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const installareFotovoltaico: InterventionFunnelModel = {
  interventionSlug: "installare-fotovoltaico",
  steps: [
    locationCapability,
    {
      id: "fotovoltaico:installare-fotovoltaico:tipo-immobile",
      type: "single_select",
      question: "Per che tipo di immobile vuoi installare il fotovoltaico?",
      options: [
        { value: "house", label: "Casa indipendente" },
        { value: "apartment_or_condo", label: "Appartamento o condominio" },
        { value: "business", label: "Attività o azienda" },
        { value: "agricultural_or_land", label: "Terreno o struttura agricola" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fotovoltaico:installare-fotovoltaico:superficie-posa",
      type: "single_select",
      question: "Dove vorresti installare i pannelli?",
      options: [
        { value: "pitched_roof", label: "Tetto inclinato" },
        { value: "flat_roof", label: "Tetto piano" },
        { value: "ground_or_canopy", label: "A terra o su pensilina" },
        { value: "balcony_or_small_surface", label: "Balcone o piccola superficie" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fotovoltaico:installare-fotovoltaico:accumulo",
      type: "single_select",
      question: "Ti interessa anche una batteria di accumulo?",
      options: [
        { value: "yes", label: "Sì, vorrei anche l’accumulo" },
        { value: "no", label: "No, solo fotovoltaico" },
        { value: "already_have", label: "Ho già un sistema di accumulo" },
        { value: "not_sure", label: "Non lo so, vorrei consiglio" },
      ],
      optional: false,
    },
    {
      id: "fotovoltaico:installare-fotovoltaico:finalita",
      type: "single_select",
      question: "Qual è l’obiettivo principale dell’impianto?",
      options: [
        { value: "bill_saving", label: "Ridurre la bolletta" },
        { value: "self_consumption", label: "Aumentare l’autoconsumo" },
        { value: "energy_independence", label: "Avere più indipendenza energetica" },
        { value: "new_build_or_renovation", label: "Nuova costruzione o ristrutturazione" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "fotovoltaico:installare-fotovoltaico:consumi",
      type: "single_select",
      question: "Hai un’idea dei tuoi consumi o della bolletta?",
      options: [
        { value: "low", label: "Consumi bassi" },
        { value: "medium", label: "Consumi medi" },
        { value: "high", label: "Consumi alti" },
        { value: "have_bill", label: "Ho una bolletta da mostrare" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "fotovoltaico:superficie",
      type: "number",
      question: "Quanti metri quadri circa sono disponibili per i pannelli?",
      description: "Una stima approssimativa è sufficiente.",
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const modificareOPotenziare: InterventionFunnelModel = {
  interventionSlug: "modificare-o-potenziare-impianto-fotovoltaico",
  steps: [
    locationCapability,
    {
      id: "fotovoltaico:modificare-o-potenziare:tipo-intervento",
      type: "multi_select",
      question: "Cosa vuoi modificare o aggiungere all'impianto fotovoltaico?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "add_battery", label: "Aggiungere batteria di accumulo" },
        { value: "add_panels", label: "Aggiungere pannelli" },
        { value: "upgrade_inverter", label: "Sostituire o aggiornare inverter" },
        { value: "board_or_control_unit", label: "Quadro o centralina" },
        { value: "monitoring_app", label: "Monitoraggio o app" },
        { value: "other_or_not_sure", label: "Altro / non lo so" },
      ],
      optional: false,
    },
    {
      id: "fotovoltaico:modificare-o-potenziare:stato-impianto",
      type: "single_select",
      question: "Com'è l'impianto attuale?",
      options: [
        { value: "working", label: "Funziona correttamente" },
        { value: "working_but_old", label: "Funziona, ma è vecchio o da aggiornare" },
        { value: "partial_or_limited", label: "Funziona solo in parte" },
        { value: "not_active_yet", label: "Installato ma non ancora attivo" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "fotovoltaico:modificare-o-potenziare:info-impianto",
      type: "single_select",
      question: "Hai informazioni sull'impianto attuale?",
      options: [
        { value: "know_power", label: "Sì, conosco la potenza" },
        { value: "have_documents", label: "Ho documenti, schede o foto" },
        { value: "only_basic_info", label: "So solo alcune informazioni" },
        { value: "no_info", label: "No, non ho informazioni" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "fotovoltaico:superficie",
      type: "number",
      question: "Quanti metri quadri circa sono disponibili se vuoi aggiungere pannelli?",
      description: "Una stima approssimativa è sufficiente.",
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const riparareOManutenzione: InterventionFunnelModel = {
  interventionSlug: "riparare-o-fare-manutenzione-fotovoltaico",
  steps: [
    locationCapability,
    {
      id: "fotovoltaico:riparare-manutenzione:bisogno",
      type: "multi_select",
      question: "Di cosa hai bisogno per il tuo impianto fotovoltaico?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "low_production", label: "L'impianto produce poco" },
        { value: "stopped", label: "L'impianto è fermo o non produce" },
        { value: "inverter_error", label: "Errore inverter" },
        { value: "battery_issue", label: "Problema batteria o accumulo" },
        { value: "board_or_control_unit", label: "Quadro o centralina" },
        { value: "panel_cleaning", label: "Pulizia pannelli" },
        { value: "general_check", label: "Controllo generale / manutenzione" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fotovoltaico:riparare-manutenzione:da-quando",
      type: "single_select",
      question: "Da quanto tempo hai notato il problema o vuoi fare il controllo?",
      options: [
        { value: "now", label: "Da poco" },
        { value: "days", label: "Da alcuni giorni" },
        { value: "weeks_or_months", label: "Da settimane o mesi" },
        { value: "periodic_check", label: "È un controllo periodico" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "fotovoltaico:riparare-manutenzione:accumulo",
      type: "single_select",
      question: "L'impianto ha una batteria di accumulo?",
      options: [
        { value: "yes", label: "Sì" },
        { value: "no", label: "No" },
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

export const fotovoltaicoModels: InterventionFunnelModel[] = [
  installareFotovoltaico,
  modificareOPotenziare,
  riparareOManutenzione,
]
