/**
 * Esigenta — Tecnici e pratiche edilizie funnel models
 *
 * Bespoke models for the `tecnici-e-pratiche-edilizie` group (categoria
 * geometra). These are technical/documental services, NOT jobsite work: the
 * funnel understands WHICH practice/certificate the customer needs and its
 * complexity, then routes to the technician.
 *
 * PRUDENT copy — the technician assesses, prepares and verifies, and NEVER
 * guarantees an administrative outcome: no "permesso garantito", no "sanatoria
 * garantita", no "APE garantito".
 *
 * Light spine: location → main scope → 1-2 qualifiers → optional documents →
 * note → timing → contact. No budget, no free m² (surface is irrelevant to a
 * practice/certificate), no property capability, no raw value. The optional
 * upload reuses the shared photo_upload contract (id "photos") so documents are
 * handled as usual, but with documents-oriented copy (planimetria/visura/…).
 * Step ids `pratiche-edilizie:…`.
 */

import type { RuntimeCapability } from "../types/capability"

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

/**
 * Optional documents step: reuses the shared photo_upload capability (same
 * id "photos", so uploads are processed as usual) with copy framed for
 * technical documents instead of jobsite photos.
 */
function documentiOpzionali(description: string): RuntimeCapability {
  return {
    ...photosCapability,
    question: "Puoi caricare planimetria, foto o documenti se li hai?",
    description,
  }
}

const fareCilaOScia: InterventionFunnelModel = {
  interventionSlug: "fare-cila-o-scia",
  steps: [
    locationCapability,
    {
      id: "pratiche-edilizie:fare-cila-o-scia:scopo",
      type: "single_select",
      question: "Per cosa ti serve la pratica?",
      options: [
        { value: "internal_works", label: "Lavori interni in casa" },
        {
          value: "walls_or_layout",
          label: "Modifiche a pareti o distribuzione interna",
        },
        { value: "works_already_started", label: "Lavori già iniziati" },
        { value: "not_sure", label: "Non so se serve CILA o SCIA" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "pratiche-edilizie:fare-cila-o-scia:stato",
      type: "single_select",
      question: "A che punto sei?",
      options: [
        { value: "to_start", label: "Devo iniziare i lavori" },
        { value: "have_pro", label: "Ho già un'impresa o un professionista" },
        { value: "already_started", label: "I lavori sono già iniziati" },
        {
          value: "only_understand",
          label: "Mi serve solo capire quale pratica serve",
        },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "pratiche-edilizie:fare-cila-o-scia:tipo-immobile",
      type: "single_select",
      question: "Che tipo di immobile riguarda?",
      options: [
        { value: "apartment", label: "Appartamento" },
        { value: "house", label: "Casa indipendente" },
        { value: "commercial", label: "Locale commerciale" },
        { value: "condo_common", label: "Condominio / parti comuni" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: se hai planimetria, visura o altri documenti aiutano il tecnico a valutare, ma puoi continuare anche senza.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const fareApe: InterventionFunnelModel = {
  interventionSlug: "fare-ape",
  steps: [
    locationCapability,
    {
      id: "pratiche-edilizie:fare-ape:scopo",
      type: "single_select",
      question: "Perché ti serve l'APE?",
      options: [
        { value: "sale", label: "Vendita casa" },
        { value: "rent", label: "Affitto" },
        { value: "renewal", label: "Rinnovo o aggiornamento" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "pratiche-edilizie:fare-ape:tipo-immobile",
      type: "single_select",
      question: "Che immobile riguarda?",
      options: [
        { value: "apartment", label: "Appartamento" },
        { value: "house", label: "Casa indipendente" },
        { value: "commercial", label: "Locale commerciale" },
        { value: "office", label: "Ufficio" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    {
      id: "pratiche-edilizie:fare-ape:documenti-disponibili",
      type: "single_select",
      question: "Hai già i dati o documenti dell'immobile?",
      options: [
        { value: "have_plan_or_visura", label: "Sì, ho planimetria o visura" },
        { value: "some_docs", label: "Ho solo alcuni documenti" },
        { value: "need_support", label: "No, mi serve supporto" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    documentiOpzionali(
      "Non è obbligatorio: planimetria, visura, un vecchio APE o il libretto d'impianto, se disponibili, aiutano il tecnico a valutare.",
    ),
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const tecniciEPraticheEdilizieModels: InterventionFunnelModel[] = [
  fareCilaOScia,
  fareApe,
]
