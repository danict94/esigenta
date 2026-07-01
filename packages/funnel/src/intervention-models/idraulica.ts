/**
 * Esigenta — Idraulica funnel models
 *
 * Bespoke models for the active interventions of the `idraulica` taxonomy group.
 * Same domain-driven spine (location → … → photos → note → timing → contact) plus
 * a few intervention-specific steps.
 *
 * Plumbing-specific design note: the generic default's `surface-area` ("m²") and
 * `property` are dropped here — m² is meaningless for a leak — and replaced by a
 * couple of targeted questions. The photo is the single highest-value signal, so
 * the funnels stay short and lean on it. Urgency is NOT a dedicated question: it
 * is derived from `timing` ("il prima possibile" → emergency in routing).
 *
 * `riparare-perdita-acqua`: where the water leaks (multi) + how severe (single).
 * Severity is captured for the impresa (answerDisplay); it does not auto-route
 * emergencies today (that derives from `timing`).
 * `disostruire-scarichi`: which drain (multi) + how blocked (single).
 * `sostituire-box-doccia`: box type (single) + current situation (single) — kept a
 * box swap on an existing tray/connections, NOT a bathroom remodel (no
 * tub-to-shower conversion option, which would overlap `ristrutturare-bagno`).
 * `installare-sanitari`: which fixtures (multi) + new-vs-replacement (single) +
 * optional count. Mounting fixtures on existing connections — not a plumbing-
 * system redo (`rifare-impianto-idraulico-bagno`) nor a full bathroom remodel; the
 * shower BOX stays `sostituire-box-doccia` (here only the tray as a fixture).
 * `rifare-impianto-idraulico-bagno`: what the job covers (multi) + a
 * renovation-context question (single, anti-overlap with `ristrutturare-bagno`) +
 * optional count of water points/drains. Plumbing only — no floors/tiles/fixtures
 * finishing.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const ripararePerditaAcqua: InterventionFunnelModel = {
  interventionSlug: "riparare-perdita-acqua",
  steps: [
    locationCapability,
    {
      id: "idraulica:riparare-perdita-acqua:dove",
      type: "multi_select",
      question: "Dove perde l'acqua?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "rubinetto_miscelatore", label: "Rubinetto o miscelatore" },
        { value: "tubo", label: "Un tubo" },
        { value: "scarico", label: "Uno scarico" },
        { value: "wc_cassetta", label: "WC o cassetta" },
        { value: "sanitario", label: "Un sanitario (lavabo, bidet, vasca)" },
        { value: "attacco_elettrodomestico", label: "Attacco lavatrice o lavastoviglie" },
        { value: "soffitto_parete", label: "Dal soffitto o da una parete (infiltrazione)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "idraulica:riparare-perdita-acqua:gravita",
      type: "single_select",
      question: "Quanto è grave la perdita?",
      description: "Aiuta il professionista a capire l'urgenza.",
      options: [
        { value: "dripping", label: "Gocciola lentamente" },
        { value: "flowing", label: "Scorre con continuità" },
        { value: "flooding", label: "Allaga o non si ferma" },
        { value: "stain_or_humidity", label: "Si vede solo una macchia o umidità" },
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

const disostruireScarichi: InterventionFunnelModel = {
  interventionSlug: "disostruire-scarichi",
  steps: [
    locationCapability,
    {
      id: "idraulica:disostruire-scarichi:dove",
      type: "multi_select",
      question: "Quale scarico è otturato o scarica male?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "sink_bathroom", label: "Lavandino bagno" },
        { value: "sink_kitchen", label: "Lavello cucina" },
        { value: "shower_or_tub", label: "Doccia o vasca" },
        { value: "wc", label: "WC" },
        { value: "multiple_drains", label: "Più scarichi" },
        { value: "external_drain", label: "Scarico esterno o pozzetto" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "idraulica:disostruire-scarichi:stato",
      type: "single_select",
      question: "Com'è il problema dello scarico?",
      options: [
        { value: "slow", label: "Scarica lentamente" },
        { value: "blocked", label: "È completamente bloccato" },
        { value: "water_comes_back", label: "L'acqua risale" },
        { value: "bad_smell", label: "Ci sono cattivi odori" },
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

const sostituireBoxDoccia: InterventionFunnelModel = {
  interventionSlug: "sostituire-box-doccia",
  steps: [
    locationCapability,
    {
      id: "idraulica:sostituire-box-doccia:tipo",
      type: "single_select",
      question: "Che tipo di box doccia ti serve?",
      options: [
        { value: "same_type", label: "Sostituire con un box simile" },
        { value: "new_box", label: "Installare un nuovo box doccia" },
        { value: "custom_size", label: "Box doccia su misura" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "idraulica:sostituire-box-doccia:situazione",
      type: "single_select",
      question: "Com'è la situazione attuale?",
      options: [
        { value: "existing_box", label: "C'è già un box da sostituire" },
        { value: "shower_tray_present", label: "C'è già il piatto doccia" },
        { value: "old_box_removed", label: "Il vecchio box è già stato rimosso" },
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

const installareSanitari: InterventionFunnelModel = {
  interventionSlug: "installare-sanitari",
  steps: [
    locationCapability,
    {
      id: "idraulica:installare-sanitari:quali",
      type: "multi_select",
      question: "Quali sanitari devi installare o sostituire?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "wc", label: "WC" },
        { value: "bidet", label: "Bidet" },
        { value: "washbasin", label: "Lavabo o lavandino" },
        { value: "bathtub", label: "Vasca" },
        { value: "shower_tray", label: "Piatto doccia" },
        { value: "washtub", label: "Lavatoio" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "idraulica:installare-sanitari:tipo-installazione",
      type: "single_select",
      question: "Si tratta di nuova installazione o sostituzione?",
      options: [
        { value: "new", label: "Nuova installazione" },
        { value: "replacement", label: "Sostituzione di sanitari esistenti" },
        { value: "mixed", label: "Un po' di entrambi" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "idraulica:installare-sanitari:quanti",
      type: "single_select",
      question: "Quanti elementi in tutto?",
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

const rifareImpiantoIdraulicoBagno: InterventionFunnelModel = {
  interventionSlug: "rifare-impianto-idraulico-bagno",
  steps: [
    locationCapability,
    {
      id: "idraulica:rifare-impianto-idraulico-bagno:cosa-comprende",
      type: "multi_select",
      question: "Cosa devi rifare o modificare nell'impianto idraulico del bagno?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "water_pipes", label: "Tubazioni acqua" },
        { value: "drains", label: "Scarichi" },
        { value: "move_or_add_points", label: "Spostare o aggiungere punti acqua" },
        { value: "shower_or_tub_connections", label: "Collegamenti doccia o vasca" },
        { value: "sanitary_connections", label: "Collegamenti sanitari" },
        { value: "whole_bathroom_system", label: "Tutto l'impianto del bagno" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "idraulica:rifare-impianto-idraulico-bagno:contesto",
      type: "single_select",
      question: "Il lavoro fa parte di una ristrutturazione del bagno?",
      options: [
        { value: "yes_full_renovation", label: "Sì, sto ristrutturando il bagno" },
        { value: "only_plumbing", label: "No, solo l'impianto idraulico" },
        { value: "work_already_started", label: "I lavori sono già iniziati" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "idraulica:rifare-impianto-idraulico-bagno:punti",
      type: "single_select",
      question: "Quante prese d'acqua o scarichi sono coinvolti circa?",
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

export const idraulicaModels: InterventionFunnelModel[] = [
  ripararePerditaAcqua,
  disostruireScarichi,
  sostituireBoxDoccia,
  installareSanitari,
  rifareImpiantoIdraulicoBagno,
]
