/**
 * Esigenta — Citofoni, sicurezza e smart home funnel models
 *
 * Bespoke models for the `citofoni-sicurezza-e-smart-home` group (low-voltage /
 * impianti speciali under Elettricista). Same light spine: location → tipo-lavoro
 * / obiettivo (single, required) → a qualitative select/multi block → photos →
 * note → timing → contact. No property, no free technical input, no automatic
 * quote, no normative/security-level promises — the pro assesses the solution.
 * Step ids namespaced `sicurezza:<intervention>:<step>`.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const citofonoVideocitofono: InterventionFunnelModel = {
  interventionSlug: "installare-o-sostituire-citofono-videocitofono",
  steps: [
    locationCapability,
    {
      id: "sicurezza:citofono-videocitofono:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve su citofono o videocitofono?",
      options: [
        { value: "new_installation", label: "Installare un nuovo impianto" },
        { value: "replace_existing", label: "Sostituire un citofono o videocitofono esistente" },
        { value: "repair_issue", label: "Riparare un guasto" },
        { value: "smart_doorbell", label: "Installare un campanello smart" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "sicurezza:citofono-videocitofono:tipo-impianto",
      type: "single_select",
      question: "Che tipo di impianto ti interessa?",
      options: [
        { value: "audio_intercom", label: "Citofono audio" },
        { value: "video_intercom", label: "Videocitofono" },
        { value: "condominium_system", label: "Impianto condominiale o più unità" },
        { value: "smart_doorbell", label: "Campanello smart" },
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

const impiantoAllarme: InterventionFunnelModel = {
  interventionSlug: "installare-impianto-allarme",
  steps: [
    locationCapability,
    {
      id: "sicurezza:installare-impianto-allarme:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve per l'allarme?",
      options: [
        { value: "new_alarm", label: "Installare un nuovo impianto allarme" },
        { value: "replace_alarm", label: "Sostituire o aggiornare un impianto esistente" },
        { value: "repair_alarm", label: "Riparare un allarme esistente" },
        { value: "add_sensors", label: "Aggiungere sensori o sirena" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "sicurezza:installare-impianto-allarme:protezione",
      type: "multi_select",
      question: "Che tipo di protezione ti interessa?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "doors_windows", label: "Porte e finestre" },
        { value: "indoor_motion", label: "Sensori interni" },
        { value: "outdoor_area", label: "Area esterna o perimetrale" },
        { value: "remote_control", label: "Controllo da app" },
        { value: "siren", label: "Sirena" },
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

const videosorveglianza: InterventionFunnelModel = {
  interventionSlug: "installare-videosorveglianza",
  steps: [
    locationCapability,
    {
      id: "sicurezza:installare-videosorveglianza:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve per la videosorveglianza?",
      options: [
        { value: "new_cameras", label: "Installare nuove telecamere" },
        { value: "replace_cameras", label: "Sostituire telecamere esistenti" },
        { value: "add_cameras", label: "Aggiungere telecamere a un impianto esistente" },
        { value: "repair_system", label: "Riparare un impianto esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "sicurezza:installare-videosorveglianza:area",
      type: "multi_select",
      question: "Dove vuoi installare le telecamere?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "indoor", label: "Interno" },
        { value: "outdoor", label: "Esterno" },
        { value: "entrance", label: "Ingresso o cancello" },
        { value: "garage", label: "Garage o box" },
        { value: "full_property", label: "Più zone" },
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

const automatizzareCancello: InterventionFunnelModel = {
  interventionSlug: "automatizzare-cancello",
  steps: [
    locationCapability,
    {
      id: "sicurezza:automatizzare-cancello:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sul cancello?",
      options: [
        { value: "new_automation", label: "Automatizzare un cancello esistente" },
        { value: "replace_motor", label: "Sostituire motore o automazione" },
        { value: "repair_automation", label: "Riparare un cancello automatico" },
        { value: "remote_or_accessories", label: "Telecomandi, fotocellule o accessori" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "sicurezza:automatizzare-cancello:tipo-cancello",
      type: "single_select",
      question: "Che tipo di cancello è?",
      options: [
        { value: "sliding", label: "Scorrevole" },
        { value: "swing", label: "A battente" },
        { value: "garage_door", label: "Basculante o garage" },
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

const domoticaSmartHome: InterventionFunnelModel = {
  interventionSlug: "installare-domotica-smart-home",
  steps: [
    locationCapability,
    {
      id: "sicurezza:installare-domotica-smart-home:obiettivo",
      type: "single_select",
      question: "Che lavoro di domotica o smart home ti interessa?",
      options: [
        { value: "new_smart_home", label: "Installare un nuovo sistema smart home" },
        { value: "upgrade_existing", label: "Integrare o migliorare impianti esistenti" },
        { value: "single_area", label: "Rendere smart solo una funzione" },
        { value: "repair_or_configure", label: "Configurare o sistemare dispositivi esistenti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "sicurezza:installare-domotica-smart-home:ambiti",
      type: "multi_select",
      question: "Cosa vorresti controllare?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "lights", label: "Luci" },
        { value: "blinds_shutters", label: "Tapparelle o tende" },
        { value: "climate", label: "Clima o termostato" },
        { value: "security", label: "Allarme o telecamere" },
        { value: "gates_access", label: "Cancello o accessi" },
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

export const citofoniSicurezzaESmartHomeModels: InterventionFunnelModel[] = [
  citofonoVideocitofono,
  impiantoAllarme,
  videosorveglianza,
  automatizzareCancello,
  domoticaSmartHome,
]
