/**
 * Esigenta — Impianti e manutenzioni elettriche funnel models
 *
 * Bespoke models for the active interventions of the
 * `impianti-e-manutenzioni-elettriche` taxonomy group. Same domain-driven spine
 * (location → … → photos → note → timing → contact) plus a few intervention-
 * specific steps. Step ids use the short `elettrico:` namespace for readability.
 *
 * Electrical-specific design note: the generic default's `surface-area` ("m²")
 * and `property` are dropped — meaningless for a fault — and replaced by targeted
 * questions. The photo is a high-value signal. Urgency is NOT a dedicated
 * question: it is derived from `timing` ("il prima possibile" → emergency).
 *
 * `riparare-guasto-elettrico`: what's happening (multi) + where it shows (single).
 * All options are fault-framed ("non funziona"/"scatta"), keeping it distinct from
 * install work (`installare-prese-interruttori-punti-luce`,
 * `installare-illuminazione`) and from a planned panel job (`riparare-quadro-elettrico`).
 * `installare-prese-interruttori-punti-luce`: what (multi) + kind of work
 * (add/move/replace) + optional count. Wired points, not fixtures.
 * `installare-illuminazione`: fixture type (multi) + indoor/outdoor (single) +
 * optional count. "cosa" holds only fixture types (no outdoor as a type — that is
 * the "dove" axis).
 * `riparare-quadro-elettrico`: planned panel work (single) + optional motive —
 * "Sistemare un problema del quadro" (not a generic emergency: that is
 * `riparare-guasto-elettrico`).
 * `rifare-impianto-elettrico`: motive (multi) + scope (single) + optional room
 * count — an EXISTING system redo, not a from-scratch build. No compliance
 * promise. Select steps carry an `other_note` escape ("lo spiego nella nota") so
 * the funnel never feels rigid; the numeric "locali" keeps only "Non lo so".
 * `fare-impianto-elettrico-nuovo`: context (single) + scope (single) — a NEW
 * system from scratch (new build / raw property / new room / commercial), kept
 * deliberately short: no rooms/points/loads step (that goes in the note).
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const riparareGuastoElettrico: InterventionFunnelModel = {
  interventionSlug: "riparare-guasto-elettrico",
  steps: [
    locationCapability,
    {
      id: "elettrico:riparare-guasto-elettrico:problema",
      type: "multi_select",
      question: "Che problema elettrico hai?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "power_out", label: "È saltata la corrente" },
        { value: "breaker_trips", label: "Il salvavita scatta" },
        { value: "short_circuit", label: "Penso ci sia un corto circuito" },
        { value: "socket_not_working", label: "Una presa non funziona" },
        { value: "light_not_working", label: "Una luce non funziona" },
        { value: "switch_not_working", label: "Un interruttore non funziona" },
        { value: "partial_area_out", label: "Una zona della casa è senza corrente" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:riparare-guasto-elettrico:dove",
      type: "single_select",
      question: "Dove si presenta il problema?",
      options: [
        { value: "whole_home", label: "In tutta la casa" },
        { value: "one_room", label: "In una stanza" },
        { value: "kitchen_or_bathroom", label: "In cucina o bagno" },
        { value: "specific_socket_or_light", label: "Su una presa, una luce o un interruttore" },
        { value: "electrical_panel", label: "Vicino al quadro elettrico" },
        { value: "outside", label: "All'esterno" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const installarePreseInterruttoriPuntiLuce: InterventionFunnelModel = {
  interventionSlug: "installare-prese-interruttori-punti-luce",
  steps: [
    locationCapability,
    {
      id: "elettrico:installare-prese-interruttori-punti-luce:cosa",
      type: "multi_select",
      question: "Cosa devi installare o modificare?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "sockets", label: "Prese elettriche" },
        { value: "switches", label: "Interruttori" },
        { value: "light_points", label: "Punti luce" },
        { value: "tv_socket", label: "Presa TV" },
        { value: "data_socket", label: "Presa dati" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:installare-prese-interruttori-punti-luce:tipo-lavoro",
      type: "single_select",
      question: "Che tipo di lavoro ti serve?",
      options: [
        { value: "add_new", label: "Aggiungere nuovi punti" },
        { value: "move_existing", label: "Spostare punti esistenti" },
        { value: "replace_existing", label: "Sostituire elementi esistenti" },
        { value: "mixed", label: "Più lavori insieme" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:installare-prese-interruttori-punti-luce:quanti",
      type: "single_select",
      question: "Quanti elementi sono coinvolti circa?",
      options: [
        { value: "one", label: "1" },
        { value: "two_three", label: "2-3" },
        { value: "four_plus", label: "4 o più" },
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

const installareIlluminazione: InterventionFunnelModel = {
  interventionSlug: "installare-illuminazione",
  steps: [
    locationCapability,
    {
      id: "elettrico:installare-illuminazione:cosa",
      type: "multi_select",
      question: "Che tipo di illuminazione devi installare?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "chandelier", label: "Lampadario" },
        { value: "spotlights", label: "Faretti" },
        { value: "led_strips", label: "Strisce LED" },
        { value: "wall_lights", label: "Applique" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:installare-illuminazione:dove",
      type: "single_select",
      question: "Dove va installata l'illuminazione?",
      options: [
        { value: "indoor", label: "Interno" },
        { value: "outdoor", label: "Esterno" },
        { value: "both", label: "Interno ed esterno" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:installare-illuminazione:quanti",
      type: "single_select",
      question: "Quanti elementi devi installare circa?",
      options: [
        { value: "one", label: "1" },
        { value: "two_three", label: "2-3" },
        { value: "four_plus", label: "4 o più" },
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

const riparareQuadroElettrico: InterventionFunnelModel = {
  interventionSlug: "riparare-quadro-elettrico",
  steps: [
    locationCapability,
    {
      id: "elettrico:riparare-quadro-elettrico:cosa",
      type: "single_select",
      question: "Cosa devi fare sul quadro elettrico?",
      options: [
        { value: "repair", label: "Sistemare un problema del quadro" },
        { value: "replace", label: "Sostituire il quadro" },
        { value: "upgrade", label: "Adeguare o aggiornare il quadro" },
        { value: "add_protections", label: "Aggiungere protezioni o nuovi interruttori" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:riparare-quadro-elettrico:motivo",
      type: "single_select",
      question: "Perché vuoi intervenire sul quadro?",
      options: [
        { value: "old_panel", label: "È vecchio" },
        { value: "not_enough_space", label: "Non c'è spazio per nuovi collegamenti" },
        { value: "safety_or_order", label: "Voglio renderlo più sicuro o ordinato" },
        { value: "after_problem", label: "Dopo un problema elettrico" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
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

const rifareImpiantoElettrico: InterventionFunnelModel = {
  interventionSlug: "rifare-impianto-elettrico",
  steps: [
    locationCapability,
    {
      id: "elettrico:rifare-impianto-elettrico:motivo",
      type: "multi_select",
      question: "Perché vuoi rifare l'impianto elettrico?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "old_system", label: "Impianto vecchio" },
        { value: "not_compliant", label: "Adeguamento / portare a norma" },
        { value: "renovation", label: "Ristrutturazione" },
        { value: "frequent_problems", label: "Problemi frequenti" },
        { value: "new_needs", label: "Nuove esigenze o più apparecchi" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:rifare-impianto-elettrico:ambito",
      type: "single_select",
      question: "Quanto impianto vuoi rifare?",
      options: [
        { value: "whole_home", label: "Tutto l'impianto" },
        { value: "some_rooms", label: "Solo alcune stanze" },
        { value: "kitchen_or_bathroom", label: "Cucina o bagno" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:rifare-impianto-elettrico:locali",
      type: "single_select",
      question: "Quanti locali sono coinvolti circa?",
      options: [
        { value: "one_two", label: "1-2" },
        { value: "three_four", label: "3-4" },
        { value: "five_plus", label: "5 o più" },
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

const fareImpiantoElettricoNuovo: InterventionFunnelModel = {
  interventionSlug: "fare-impianto-elettrico-nuovo",
  steps: [
    locationCapability,
    {
      id: "elettrico:fare-impianto-elettrico-nuovo:contesto",
      type: "single_select",
      question: "In che contesto va fatto il nuovo impianto elettrico?",
      options: [
        { value: "new_build", label: "Nuova costruzione" },
        { value: "raw_property", label: "Immobile grezzo o da completare" },
        { value: "new_room_or_extension", label: "Nuova stanza o ampliamento" },
        { value: "commercial_space", label: "Locale o attività" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "elettrico:fare-impianto-elettrico-nuovo:ambito",
      type: "single_select",
      question: "Dove va realizzato l'impianto?",
      options: [
        { value: "whole_home", label: "Tutta la casa" },
        { value: "whole_space", label: "Tutto il locale" },
        { value: "some_rooms", label: "Solo alcune stanze o una zona" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const impiantiElettriciModels: InterventionFunnelModel[] = [
  riparareGuastoElettrico,
  installarePreseInterruttoriPuntiLuce,
  installareIlluminazione,
  riparareQuadroElettrico,
  rifareImpiantoElettrico,
  fareImpiantoElettricoNuovo,
]
