/**
 * Esigenta — Opere murarie e demolizioni funnel models
 *
 * Bespoke models for the `opere-murarie-e-demolizioni` group (mason work under
 * Impresa edile). Light spine: location → tipo-lavoro → a qualitative step →
 * photos → note → timing → contact. No property, no free m² input, no budget,
 * no automatic quote.
 *
 * Delicate cases: `aprire-o-chiudere-vano` and `demolire-parete-o-tramezzo` ask
 * whether the wall is load-bearing with PRUDENT, non-promissory copy — the
 * funnel only collects and routes to the pro/technician; it never promises SCIA,
 * cerchiatura, permits or structural suitability. Masonry only: no cartongesso
 * here (drywall stays in the `cartongesso` group). Step ids `opere-murarie:…`.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const aprireOChiudereVano: InterventionFunnelModel = {
  interventionSlug: "aprire-o-chiudere-vano",
  steps: [
    locationCapability,
    {
      id: "opere-murarie:aprire-o-chiudere-vano:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro devi fare sul vano?",
      options: [
        { value: "open_door", label: "Aprire un vano porta" },
        { value: "open_window", label: "Aprire un vano finestra" },
        { value: "open_passage", label: "Aprire un varco nel muro" },
        { value: "close_opening", label: "Chiudere un vano esistente" },
        { value: "move_opening", label: "Spostare una porta o un'apertura" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "opere-murarie:aprire-o-chiudere-vano:tipo-muro",
      type: "single_select",
      question: "Sai se il muro è portante?",
      description:
        "Se il muro è portante o non lo sai, potrebbero servire verifica tecnica e pratiche edilizie. Il professionista valuta cosa è necessario.",
      options: [
        { value: "non_load_bearing", label: "Penso sia non portante" },
        { value: "load_bearing", label: "Potrebbe essere portante" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const demolirePareteOTramezzo: InterventionFunnelModel = {
  interventionSlug: "demolire-parete-o-tramezzo",
  steps: [
    locationCapability,
    {
      id: "opere-murarie:demolire-parete-o-tramezzo:tipo-lavoro",
      type: "single_select",
      question: "Che demolizione devi fare?",
      options: [
        { value: "demolish_partition", label: "Demolire un tramezzo" },
        { value: "demolish_wall", label: "Demolire una parete interna" },
        { value: "remove_multiple_walls", label: "Demolire più pareti o tramezzi" },
        { value: "partial_demolition", label: "Demolire solo una parte" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "opere-murarie:demolire-parete-o-tramezzo:tipo-muro",
      type: "single_select",
      question: "Sai se la parete è portante?",
      description:
        "Se la parete è portante o non lo sai, potrebbero servire verifica tecnica e pratiche edilizie. Il professionista valuta cosa è necessario.",
      options: [
        { value: "non_load_bearing", label: "Penso sia non portante" },
        { value: "load_bearing", label: "Potrebbe essere portante" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro / lo spiego nella nota" },
      ],
      optional: false,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const costruirePareteOTramezzo: InterventionFunnelModel = {
  interventionSlug: "costruire-parete-o-tramezzo",
  steps: [
    locationCapability,
    {
      id: "opere-murarie:costruire-parete-o-tramezzo:tipo-lavoro",
      type: "single_select",
      question: "Che parete devi realizzare?",
      options: [
        { value: "new_partition", label: "Costruire un tramezzo interno" },
        { value: "new_wall", label: "Costruire una parete in muratura" },
        { value: "close_space", label: "Chiudere o dividere un ambiente" },
        { value: "small_wall", label: "Realizzare un piccolo muro interno" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "opere-murarie:costruire-parete-o-tramezzo:materiale",
      type: "single_select",
      question: "Hai già in mente il tipo di muratura?",
      options: [
        { value: "bricks_or_blocks", label: "Mattoni, forati o blocchi" },
        { value: "light_masonry", label: "Muratura leggera" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro materiale (lo spiego nella nota)" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const demolizioniInterne: InterventionFunnelModel = {
  interventionSlug: "demolizioni-interne",
  steps: [
    locationCapability,
    {
      id: "opere-murarie:demolizioni-interne:tipo-lavoro",
      type: "single_select",
      question: "Che tipo di demolizione interna serve?",
      options: [
        { value: "strip_out_room", label: "Svuotare o demolire un ambiente" },
        { value: "pre_renovation_demolition", label: "Demolizioni prima di una ristrutturazione" },
        { value: "remove_internal_elements", label: "Rimuovere elementi interni" },
        { value: "partial_demolition", label: "Demolizione parziale" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "opere-murarie:demolizioni-interne:cosa-rimuovere",
      type: "multi_select",
      question: "Cosa bisogna rimuovere?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "walls_partitions", label: "Pareti o tramezzi" },
        { value: "floors_coverings", label: "Pavimenti o rivestimenti" },
        { value: "bathroom_kitchen_elements", label: "Elementi di bagno o cucina" },
        { value: "false_ceiling_or_finishes", label: "Controsoffitti o finiture" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
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

const piccoleOpereMurarie: InterventionFunnelModel = {
  interventionSlug: "piccole-opere-murarie",
  steps: [
    locationCapability,
    {
      id: "opere-murarie:piccole-opere-murarie:tipo-lavoro",
      type: "multi_select",
      question: "Che tipo di opera muraria serve?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "chases_for_systems", label: "Tracce per impianti" },
        { value: "close_chases", label: "Chiusura tracce o ripristini" },
        { value: "small_repairs", label: "Rappezzi o piccole riparazioni murarie" },
        { value: "niche_or_opening", label: "Nicchie, fori o piccoli adattamenti" },
        { value: "threshold_or_detail", label: "Soglie, spallette o dettagli murari" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "opere-murarie:piccole-opere-murarie:ambito",
      type: "single_select",
      question: "A cosa sono collegate queste opere?",
      options: [
        { value: "electrical_system", label: "Impianto elettrico" },
        { value: "plumbing_system", label: "Impianto idraulico" },
        { value: "doors_windows", label: "Porte o finestre" },
        { value: "renovation_work", label: "Ristrutturazione o altri lavori" },
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

export const opereMurarieEDemolizioniModels: InterventionFunnelModel[] = [
  aprireOChiudereVano,
  demolirePareteOTramezzo,
  costruirePareteOTramezzo,
  demolizioniInterne,
  piccoleOpereMurarie,
]
