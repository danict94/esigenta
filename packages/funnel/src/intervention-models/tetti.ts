/**
 * Esigenta — Tetti funnel models
 *
 * Bespoke models for the active interventions of the `tetti` taxonomy group.
 * Same domain-driven spine (location → … → photos → note → timing → contact) plus
 * a few intervention-specific steps. Kept non-technical: no property, no free m²
 * input (only qualitative surface buckets where relevant), no compliance promise.
 * Select steps carry an `other_note` escape so the funnel never feels rigid.
 *
 * `rifare-tetto`: what work (single) + roof type (single) + optional surface.
 * `riparare-tetto`: problem (multi, incl. "ripasso" tiles) + where (single). No
 * surface — a repair is a spot job.
 * `sistemare-grondaie`: work type (multi: repair/replace/clean/downspouts/flashings)
 * + problem (single).
 * `impermeabilizzare-tetto`: waterproofing/membrane work (single) + roof type +
 * optional surface. Distinct from a structural redo or a spot repair.
 * `isolare-o-coibentare-tetto`: insulation goal (single) + where + optional surface.
 * `bonificare-amianto-eternit-tetto`: intervention type (single) + material state +
 * optional surface. Prudent copy: a request-and-route funnel, no compliance promise.
 * `installare-o-sostituire-lucernario`: work type (single) + how many (light).
 * `installare-linea-vita`: work type (single) + roof type. Non-promissory on norms.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const rifareTetto: InterventionFunnelModel = {
  interventionSlug: "rifare-tetto",
  steps: [
    locationCapability,
    {
      id: "tetti:rifare-tetto:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sul tetto?",
      options: [
        { value: "whole_roof", label: "Rifare tutto il tetto" },
        { value: "partial_roof", label: "Rifare solo una parte" },
        { value: "replace_covering", label: "Sostituire la copertura" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:rifare-tetto:tipo-tetto",
      type: "single_select",
      question: "Che tipo di tetto è?",
      options: [
        { value: "tiles_or_coppi", label: "Tetto con tegole o coppi" },
        { value: "flat_roof", label: "Tetto piano o terrazza" },
        { value: "sheet_metal_or_panels", label: "Lamiera o pannelli" },
        { value: "wood_roof", label: "Tetto in legno" },
        { value: "other_note", label: "Altro tipo (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "tetti:rifare-tetto:superficie",
      type: "single_select",
      question: "Quanto è grande il tetto circa?",
      options: [
        { value: "up_to_50", label: "Fino a 50 m²" },
        { value: "fifty_to_onehundred", label: "50-100 m²" },
        { value: "onehundred_to_twohundred", label: "100-200 m²" },
        { value: "over_twohundred", label: "Oltre 200 m²" },
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

const riparareTetto: InterventionFunnelModel = {
  interventionSlug: "riparare-tetto",
  steps: [
    locationCapability,
    {
      id: "tetti:riparare-tetto:problema",
      type: "multi_select",
      question: "Che problema ha il tetto?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "water_leak", label: "Infiltrazione o perdita d'acqua" },
        { value: "broken_tiles", label: "Tegole o coppi rotti" },
        { value: "moved_tiles", label: "Tegole o coppi spostati" },
        { value: "tile_checkup", label: "Ripasso / sistemazione tegole o coppi" },
        { value: "weather_damage", label: "Danno dopo vento o maltempo" },
        { value: "area_to_check", label: "Una zona da controllare" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:riparare-tetto:zona",
      type: "single_select",
      question: "Dove si presenta il problema?",
      options: [
        { value: "specific_area", label: "In una zona precisa" },
        { value: "multiple_areas", label: "In più punti" },
        { value: "chimney_or_skylight", label: "Vicino a camino o lucernario" },
        { value: "roof_edge", label: "Vicino al bordo del tetto" },
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

const sistemareGrondaie: InterventionFunnelModel = {
  interventionSlug: "sistemare-grondaie",
  steps: [
    locationCapability,
    {
      id: "tetti:sistemare-grondaie:tipo-lavoro",
      type: "multi_select",
      question: "Che lavoro serve su grondaie o pluviali?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "repair_gutters", label: "Riparare grondaie" },
        { value: "replace_gutters", label: "Sostituire grondaie" },
        { value: "clean_gutters", label: "Pulire grondaie" },
        { value: "fix_downspouts", label: "Sistemare pluviali" },
        { value: "fix_flashings", label: "Sistemare scossaline o lattoneria" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:sistemare-grondaie:problema",
      type: "single_select",
      question: "Che problema hai notato?",
      options: [
        { value: "leaking", label: "Perde acqua" },
        { value: "broken_or_detached", label: "È rotta o staccata" },
        { value: "clogged", label: "È intasata" },
        { value: "bad_drainage", label: "L'acqua non scarica bene" },
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

const impermeabilizzareTetto: InterventionFunnelModel = {
  interventionSlug: "impermeabilizzare-tetto",
  steps: [
    locationCapability,
    {
      id: "tetti:impermeabilizzare-tetto:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro di impermeabilizzazione serve?",
      options: [
        { value: "new_waterproofing", label: "Impermeabilizzare il tetto" },
        { value: "redo_membrane", label: "Rifare o sostituire la guaina" },
        { value: "repair_membrane", label: "Riparare una guaina esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:impermeabilizzare-tetto:tipo-copertura",
      type: "single_select",
      question: "Che tipo di copertura è?",
      options: [
        { value: "flat_roof", label: "Tetto piano" },
        { value: "pitched_roof", label: "Tetto inclinato" },
        { value: "terrace_roof", label: "Lastrico solare o copertura praticabile" },
        { value: "sheet_metal_or_panels", label: "Lamiera o pannelli" },
        { value: "other_note", label: "Altro tipo (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "tetti:impermeabilizzare-tetto:superficie",
      type: "single_select",
      question: "Quanto è grande la zona da impermeabilizzare circa?",
      options: [
        { value: "up_to_50", label: "Fino a 50 m²" },
        { value: "fifty_to_onehundred", label: "50-100 m²" },
        { value: "onehundred_to_twohundred", label: "100-200 m²" },
        { value: "over_twohundred", label: "Oltre 200 m²" },
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

const isolareOCoibentareTetto: InterventionFunnelModel = {
  interventionSlug: "isolare-o-coibentare-tetto",
  steps: [
    locationCapability,
    {
      id: "tetti:isolare-o-coibentare-tetto:obiettivo",
      type: "single_select",
      question: "Che lavoro di isolamento serve?",
      options: [
        { value: "insulate_roof", label: "Isolare o coibentare il tetto" },
        { value: "insulate_attic", label: "Isolare sottotetto o solaio" },
        { value: "ventilated_roof", label: "Realizzare o migliorare tetto ventilato" },
        { value: "improve_existing", label: "Migliorare un isolamento esistente" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:isolare-o-coibentare-tetto:zona",
      type: "single_select",
      question: "Dove vuoi intervenire?",
      options: [
        { value: "pitched_roof", label: "Tetto inclinato" },
        { value: "flat_roof", label: "Tetto piano" },
        { value: "attic_or_slab", label: "Sottotetto o solaio" },
        { value: "sheet_metal_or_panels", label: "Lamiera o pannelli" },
        { value: "other_note", label: "Altro punto (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "tetti:isolare-o-coibentare-tetto:superficie",
      type: "single_select",
      question: "Quanto è grande la zona da isolare circa?",
      options: [
        { value: "up_to_50", label: "Fino a 50 m²" },
        { value: "fifty_to_onehundred", label: "50-100 m²" },
        { value: "onehundred_to_twohundred", label: "100-200 m²" },
        { value: "over_twohundred", label: "Oltre 200 m²" },
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

const bonificareAmiantoEternitTetto: InterventionFunnelModel = {
  interventionSlug: "bonificare-amianto-eternit-tetto",
  steps: [
    locationCapability,
    {
      id: "tetti:bonificare-amianto-eternit-tetto:tipo-intervento",
      type: "single_select",
      question: "Che intervento pensi ti serva?",
      description:
        "La bonifica dell'amianto deve essere valutata ed eseguita da imprese abilitate. Qui raccogliamo la richiesta per metterti in contatto con specialisti.",
      options: [
        { value: "removal", label: "Rimozione e smaltimento" },
        { value: "overcovering", label: "Sovracopertura (nuova copertura sopra)" },
        { value: "encapsulation", label: "Incapsulamento" },
        { value: "redo_after_removal", label: "Rifare il tetto dopo rimozione o bonifica" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:bonificare-amianto-eternit-tetto:stato-materiale",
      type: "single_select",
      question: "Com'è il materiale oggi?",
      options: [
        { value: "intact", label: "Integro / in buono stato" },
        { value: "damaged", label: "Danneggiato o che si sfalda" },
        { value: "not_sure", label: "Non lo so" },
        { value: "other_note", label: "Altro (lo spiego nella nota)" },
      ],
      optional: true,
    },
    {
      id: "tetti:bonificare-amianto-eternit-tetto:superficie",
      type: "single_select",
      question: "Quanto è grande la zona da bonificare circa?",
      options: [
        { value: "up_to_50", label: "Fino a 50 m²" },
        { value: "fifty_to_onehundred", label: "50-100 m²" },
        { value: "onehundred_to_twohundred", label: "100-200 m²" },
        { value: "over_twohundred", label: "Oltre 200 m²" },
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

const installareOSostituireLucernario: InterventionFunnelModel = {
  interventionSlug: "installare-o-sostituire-lucernario",
  steps: [
    locationCapability,
    {
      id: "tetti:installare-o-sostituire-lucernario:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sul lucernario?",
      options: [
        { value: "new_skylight", label: "Installare un nuovo lucernario" },
        { value: "replace_skylight", label: "Sostituire un lucernario esistente" },
        { value: "repair_leak", label: "Riparare un lucernario che perde" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:installare-o-sostituire-lucernario:quanti",
      type: "single_select",
      question: "Quanti lucernari sono?",
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

const installareLineaVita: InterventionFunnelModel = {
  interventionSlug: "installare-linea-vita",
  steps: [
    locationCapability,
    {
      id: "tetti:installare-linea-vita:tipo-lavoro",
      type: "single_select",
      question: "Che lavoro serve sulla linea vita?",
      description:
        "Gli obblighi possono variare in base al tipo di edificio, intervento e territorio: il professionista valuta cosa serve.",
      options: [
        { value: "new_lifeline", label: "Installare una nuova linea vita" },
        { value: "certify_or_upgrade", label: "Adeguare o certificare una linea vita esistente" },
        { value: "maintenance_check", label: "Revisione o manutenzione" },
        { value: "other_note", label: "Altro / situazione diversa (lo spiego nella nota)" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "tetti:installare-linea-vita:tipo-tetto",
      type: "single_select",
      question: "Che tipo di tetto è?",
      options: [
        { value: "pitched_roof", label: "Tetto inclinato" },
        { value: "flat_roof", label: "Tetto piano" },
        { value: "sheet_metal_or_panels", label: "Lamiera o pannelli" },
        { value: "other_note", label: "Altro tipo (lo spiego nella nota)" },
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

export const tettiModels: InterventionFunnelModel[] = [
  rifareTetto,
  riparareTetto,
  sistemareGrondaie,
  impermeabilizzareTetto,
  isolareOCoibentareTetto,
  bonificareAmiantoEternitTetto,
  installareOSostituireLucernario,
  installareLineaVita,
]
