/**
 * Esigenta — Fabbro, serrande e cancelli funnel models
 *
 * Bespoke models for the `fabbro-serrande-e-cancelli` group (category fabbro).
 * Lead with the value-bearing action; qualitative qualifiers only where scale
 * drives value. No micro CTAs (no key duplication), no property, no m²/number
 * input, no budget. Two prudent, NON-promissory areas: emergency door opening
 * (never promise 24h / guaranteed response — scam-prone trade) and security
 * grilles (never promise bonuses/deductions). This is the PHYSICAL metalwork
 * gate — no automation options here (automazione cancello lives in
 * citofoni-sicurezza-e-smart-home). Step ids `fabbro:<intervention>:<step>`.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const serratura: InterventionFunnelModel = {
  interventionSlug: "cambiare-o-riparare-serratura",
  steps: [
    locationCapability,
    {
      id: "fabbro:cambiare-o-riparare-serratura:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla serratura?",
      options: [
        { value: "replace_lock", label: "Sostituire la serratura" },
        { value: "replace_cylinder", label: "Sostituire il cilindro" },
        { value: "repair", label: "Riparare la serratura" },
        { value: "upgrade_security", label: "Aumentare la sicurezza (cilindro europeo/antieffrazione)" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fabbro:cambiare-o-riparare-serratura:contesto",
      type: "single_select",
      question: "Su che tipo di porta?",
      options: [
        { value: "standard_door", label: "Porta normale" },
        { value: "armored_door", label: "Porta blindata" },
        { value: "other_access", label: "Altro (cancello, serranda, box)" },
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

const aperturaPorta: InterventionFunnelModel = {
  interventionSlug: "aprire-porta-bloccata",
  steps: [
    locationCapability,
    {
      id: "fabbro:aprire-porta-bloccata:tipo-lavoro",
      type: "single_select",
      question: "Qual è la situazione?",
      description:
        "Inoltriamo la richiesta ai fabbri della zona: i tempi dipendono dalla loro disponibilità.",
      options: [
        { value: "locked_out", label: "Sono chiuso fuori casa" },
        { value: "broken_lock", label: "La serratura è rotta o bloccata" },
        { value: "lost_keys", label: "Ho perso le chiavi" },
        { value: "jammed_door", label: "La porta non si apre" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fabbro:aprire-porta-bloccata:tipo-porta",
      type: "single_select",
      question: "Che tipo di porta o accesso è?",
      options: [
        { value: "standard_door", label: "Porta normale" },
        { value: "armored_door", label: "Porta blindata" },
        { value: "other_access", label: "Altro accesso (cancello, garage)" },
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

const serranda: InterventionFunnelModel = {
  interventionSlug: "riparare-o-sostituire-serranda",
  steps: [
    locationCapability,
    {
      id: "fabbro:riparare-o-sostituire-serranda:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla serranda?",
      options: [
        { value: "repair", label: "Riparare la serranda" },
        { value: "replace", label: "Sostituire la serranda" },
        { value: "motorize", label: "Motorizzare la serranda" },
        { value: "motor_issue", label: "Problema al motore" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fabbro:riparare-o-sostituire-serranda:dove",
      type: "single_select",
      question: "Dove si trova la serranda?",
      options: [
        { value: "garage", label: "Garage o box" },
        { value: "shop", label: "Negozio o attività" },
        { value: "home", label: "Casa / abitazione" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "fabbro:riparare-o-sostituire-serranda:tipo",
      type: "single_select",
      question: "Che tipo di serranda è?",
      options: [
        { value: "manual", label: "Manuale" },
        { value: "motorized", label: "Motorizzata / elettrica" },
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

const inferriate: InterventionFunnelModel = {
  interventionSlug: "installare-inferriate-o-grate",
  steps: [
    locationCapability,
    {
      id: "fabbro:installare-inferriate-o-grate:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve per inferriate o grate?",
      description:
        "Eventuali bonus o detrazioni dipendono da requisiti e norme aggiornate: il professionista valuta cosa si applica al tuo caso.",
      options: [
        { value: "install_new", label: "Installare inferriate o grate nuove" },
        { value: "replace", label: "Sostituire inferriate esistenti" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fabbro:installare-inferriate-o-grate:quante",
      type: "single_select",
      question: "Quante finestre o aperture sono circa?",
      options: [
        { value: "one", label: "1 apertura" },
        { value: "two_four", label: "2-4 aperture" },
        { value: "five_plus", label: "5 o più" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "fabbro:installare-inferriate-o-grate:tipo",
      type: "single_select",
      question: "Che tipo di inferriate ti interessano?",
      options: [
        { value: "fixed", label: "Fisse" },
        { value: "openable", label: "Apribili" },
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

const ringhiere: InterventionFunnelModel = {
  interventionSlug: "installare-ringhiere",
  steps: [
    locationCapability,
    {
      id: "fabbro:installare-ringhiere:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulle ringhiere?",
      options: [
        { value: "install_new", label: "Installare ringhiere nuove" },
        { value: "replace", label: "Sostituire ringhiere esistenti" },
        { value: "repair", label: "Riparare ringhiere" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fabbro:installare-ringhiere:dove",
      type: "single_select",
      question: "Dove servono le ringhiere?",
      options: [
        { value: "balcony", label: "Balcone" },
        { value: "stairs", label: "Scala" },
        { value: "external", label: "Esterni o recinzione" },
        { value: "other", label: "Altro punto" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "fabbro:installare-ringhiere:materiale",
      type: "single_select",
      question: "Che materiale ti interessa?",
      options: [
        { value: "iron", label: "Ferro" },
        { value: "wrought_iron", label: "Ferro battuto" },
        { value: "steel", label: "Acciaio / inox" },
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

const cancello: InterventionFunnelModel = {
  interventionSlug: "installare-o-riparare-cancello",
  steps: [
    locationCapability,
    {
      id: "fabbro:installare-o-riparare-cancello:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sul cancello?",
      options: [
        { value: "install_new", label: "Installare un cancello nuovo" },
        { value: "replace", label: "Sostituire un cancello" },
        { value: "repair", label: "Riparare un cancello" },
        { value: "weld_fix", label: "Saldature o rinforzi" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "fabbro:installare-o-riparare-cancello:tipo-cancello",
      type: "single_select",
      question: "Che tipo di cancello è?",
      options: [
        { value: "sliding", label: "Scorrevole" },
        { value: "swing", label: "A battente" },
        { value: "pedestrian", label: "Pedonale" },
        { value: "driveway", label: "Carrabile" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "fabbro:installare-o-riparare-cancello:materiale",
      type: "single_select",
      question: "Che materiale ti interessa?",
      options: [
        { value: "iron", label: "Ferro" },
        { value: "wrought_iron", label: "Ferro battuto" },
        { value: "steel", label: "Acciaio" },
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

export const fabbroSerrandeECancelliModels: InterventionFunnelModel[] = [
  serratura,
  aperturaPorta,
  serranda,
  inferriate,
  ringhiere,
  cancello,
]
