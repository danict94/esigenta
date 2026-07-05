/**
 * Esigenta — Finiture funnel models
 *
 * Bespoke models for the active interventions of the `finiture` taxonomy group.
 * Same domain-driven shape as the other groups: the common spine (location → …
 * → photos → note → timing → contact) plus a few intervention-specific steps.
 *
 * `tinteggiare-esterni` is exterior painting only (no plaster/repair): it stays
 * a distinct, recognisable intent from `rifare-facciata` (the mother facade
 * job). It reuses the shared `accessInQuotaStep` — exterior painting is
 * typically work at height — and the numeric `surface-area` (m²) facade
 * convention.
 *
 * `tinteggiare-interni` is interior painting: no access-at-height question, and
 * "quante stanze" is the primary scale signal (the customer knows rooms more
 * easily than m²), with an optional numeric `surface-area` on top. The wall-state
 * step is informational only — it must not promise to fix damp/mould causes, and
 * it deliberately omits any decorative-effect option to avoid overlapping with
 * `applicare-stucco-decorativo`.
 *
 * `rasare-pareti` is skim-coating (making walls smooth/ready), kept sharply
 * distinct from its Finiture siblings: the wall-state "intonaco rovinato" option
 * is informational and carries a non-promissory note (heavy plaster damage may
 * need `ripristinare-intonaco` first), the "also-painting" step is a plain flag
 * (no colour/finish detail, so it never becomes `tinteggiare-interni`), and there
 * is no decorative/plaster/access-at-height option.
 *
 * `ripristinare-intonaco` vs `intonacare-pareti` are designed as a pair to keep a
 * clean boundary: the first REPAIRS existing damaged plaster (localised — its
 * scale is "zones", its core step is the damage type, with a non-promissory note
 * on damp/mould), the second APPLIES/REDOES plaster on a surface (raw/new wall,
 * removed plaster, large damaged surface — its scale is "rooms/surfaces", its core
 * step is the substrate state). Both keep "finitura-dopo" as a plain context flag
 * (no colour/skim detail), and neither asks access-at-height — a whole building
 * facade at height belongs to `rifare-facciata`.
 *
 * `applicare-stucco-decorativo` is the decorative/aesthetic finish (venetian
 * stucco, smooth/lucid, materic, concrete effect). It is kept result-oriented:
 * the substrate-state / preparation steps are informational only (non-promissory
 * note: heavy damage may need prep/skimming first) and never turn the funnel into
 * `rasare-pareti`/`intonacare-pareti`/`tinteggiare-interni`; no paint colour,
 * product brand, coat count or technical material detail.
 */

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { accessInQuotaStep, noteStep, surfaceAreaStep } from "./common"
import type { InterventionFunnelModel } from "./types"

const tinteggiareEsterni: InterventionFunnelModel = {
  interventionSlug: "tinteggiare-esterni",
  steps: [
    locationCapability,
    {
      id: "finiture:tinteggiare-esterni:tipo-superficie",
      type: "multi_select",
      question: "Cosa devi tinteggiare all’esterno?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "facade", label: "Facciata" },
        { value: "external_walls", label: "Muri esterni" },
        { value: "balconies", label: "Balconi o ringhiere/muretti" },
        { value: "courtyard_walls", label: "Muri di cortile o recinzione" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    surfaceAreaStep("finiture:superficie"),
    {
      id: "finiture:tinteggiare-esterni:stato-supporto",
      type: "single_select",
      question: "Com’è lo stato della superficie?",
      options: [
        { value: "good", label: "Buono, serve solo tinteggiare" },
        { value: "small_repairs", label: "Ci sono piccole crepe o parti da sistemare" },
        { value: "damaged", label: "È rovinata o scrostata" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "finiture:tinteggiare-esterni:finitura",
      type: "single_select",
      question: "Sai già che tipo di pittura o finitura vuoi?",
      options: [
        { value: "siloxane", label: "Silossanica" },
        { value: "silicate", label: "Ai silicati" },
        { value: "quartz_acrylic", label: "Quarzo / acrilica" },
        { value: "standard_external", label: "Pittura esterna standard" },
        { value: "not_sure", label: "Non lo so, vorrei consiglio" },
      ],
      optional: true,
    },
    accessInQuotaStep(false),
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const tinteggiareInterni: InterventionFunnelModel = {
  interventionSlug: "tinteggiare-interni",
  steps: [
    locationCapability,
    {
      id: "finiture:tinteggiare-interni:cosa",
      type: "single_select",
      question: "Cosa devi tinteggiare?",
      options: [
        { value: "walls", label: "Pareti interne" },
        { value: "ceilings", label: "Soffitti" },
        { value: "walls_and_ceilings", label: "Pareti e soffitti" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "finiture:tinteggiare-interni:ambienti",
      type: "single_select",
      question: "Quante stanze sono coinvolte?",
      options: [
        { value: "one_room", label: "Una stanza" },
        { value: "few_rooms", label: "Due o tre stanze" },
        { value: "many_rooms", label: "Quattro o più stanze" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    surfaceAreaStep("finiture:superficie"),
    {
      id: "finiture:tinteggiare-interni:stato-pareti",
      type: "single_select",
      question: "Com’è lo stato delle pareti?",
      description:
        "Se ci sono macchie, muffa o umidità, il professionista dovrà valutarne la causa: la sola tinteggiatura potrebbe non risolverle.",
      options: [
        { value: "good", label: "Buono, serve solo tinteggiare" },
        { value: "small_repairs", label: "Ci sono piccoli buchi o crepe" },
        { value: "stains_or_mold", label: "Ci sono macchie, muffa o umidità" },
        { value: "peeling_old_paint", label: "La pittura è vecchia o scrostata" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "finiture:tinteggiare-interni:colore-finitura",
      type: "single_select",
      question: "Hai già scelto il colore?",
      options: [
        { value: "white", label: "Bianco" },
        { value: "light_colors", label: "Colori chiari" },
        { value: "dark_or_custom", label: "Colori scuri o particolari" },
        { value: "not_sure", label: "Non lo so, vorrei consiglio" },
      ],
      optional: true,
    },
    {
      id: "finiture:tinteggiare-interni:protezioni",
      type: "single_select",
      question: "Ci sono mobili o ambienti da proteggere?",
      options: [
        { value: "empty_rooms", label: "No, gli ambienti sono liberi" },
        { value: "few_furniture", label: "Sì, pochi mobili" },
        { value: "many_furniture", label: "Sì, molti mobili" },
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

const rasarePareti: InterventionFunnelModel = {
  interventionSlug: "rasare-pareti",
  steps: [
    locationCapability,
    {
      id: "finiture:rasare-pareti:dove",
      type: "single_select",
      question: "Dove bisogna rasare?",
      options: [
        { value: "walls", label: "Pareti" },
        { value: "ceilings", label: "Soffitti" },
        { value: "walls_and_ceilings", label: "Pareti e soffitti" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "finiture:rasare-pareti:ambienti",
      type: "single_select",
      question: "Quante stanze o superfici sono coinvolte?",
      options: [
        { value: "one_room_or_wall", label: "Una stanza o una parete" },
        { value: "few_rooms", label: "Due o tre stanze" },
        { value: "many_rooms", label: "Quattro o più stanze" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    surfaceAreaStep("finiture:superficie"),
    {
      id: "finiture:rasare-pareti:stato-pareti",
      type: "single_select",
      question: "Com'è lo stato delle pareti?",
      description:
        "Se l'intonaco è molto rovinato, il professionista valuterà se serve prima un ripristino dell'intonaco: la sola rasatura potrebbe non bastare.",
      options: [
        { value: "fair", label: "Abbastanza regolari" },
        { value: "small_cracks", label: "Con piccole crepe o buchi" },
        { value: "uneven", label: "Irregolari o ondulate" },
        { value: "damaged_plaster", label: "Intonaco rovinato" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "finiture:rasare-pareti:motivo",
      type: "multi_select",
      question: "Perché serve rasare?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "before_painting", label: "Preparare per la tinteggiatura" },
        { value: "after_repairs", label: "Dopo riparazioni o tracce" },
        { value: "cover_irregularities", label: "Coprire irregolarità" },
        { value: "after_plasterboard", label: "Dopo lavori in cartongesso" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "finiture:rasare-pareti:also-painting",
      type: "single_select",
      question: "Dopo la rasatura vuoi anche tinteggiare?",
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

const ripristinareIntonaco: InterventionFunnelModel = {
  interventionSlug: "ripristinare-intonaco",
  steps: [
    locationCapability,
    {
      id: "finiture:ripristinare-intonaco:dove",
      type: "single_select",
      question: "Dove va ripristinato l'intonaco?",
      options: [
        { value: "internal_walls", label: "Pareti interne" },
        { value: "external_walls", label: "Pareti esterne" },
        { value: "ceilings", label: "Soffitti" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "finiture:ripristinare-intonaco:problema",
      type: "multi_select",
      question: "Che problema ha l'intonaco?",
      description:
        "Se ci sono macchie o umidità, il professionista dovrà valutarne la causa: il solo ripristino dell'intonaco potrebbe non risolverla.",
      options: [
        { value: "cracks", label: "Crepe" },
        { value: "holes", label: "Buchi o parti mancanti" },
        { value: "detachment", label: "Intonaco che si stacca" },
        { value: "swelling", label: "Parti gonfie o rovinate" },
        { value: "after_repairs", label: "Tracce o riparazioni da coprire" },
        { value: "stains_or_humidity", label: "Macchie o umidità" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "finiture:ripristinare-intonaco:quantita",
      type: "single_select",
      question: "Quante zone sono da sistemare?",
      options: [
        { value: "one_area", label: "Una zona" },
        { value: "few_areas", label: "Due o tre zone" },
        { value: "many_areas", label: "Più zone" },
        { value: "large_surface", label: "Una superficie ampia" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    surfaceAreaStep("finiture:superficie"),
    {
      id: "finiture:ripristinare-intonaco:finitura-dopo",
      type: "single_select",
      question: "Dopo il ripristino serve anche una finitura?",
      options: [
        { value: "painting", label: "Sì, tinteggiatura" },
        { value: "skim_coat", label: "Sì, rasatura" },
        { value: "both", label: "Sì, rasatura e tinteggiatura" },
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

const intonacarePareti: InterventionFunnelModel = {
  interventionSlug: "intonacare-pareti",
  steps: [
    locationCapability,
    {
      id: "finiture:intonacare-pareti:dove",
      type: "single_select",
      question: "Dove bisogna intonacare?",
      description:
        "Per l'intera facciata di un edificio, usa invece il percorso Rifare facciata.",
      options: [
        { value: "internal_walls", label: "Pareti interne" },
        { value: "external_walls", label: "Pareti esterne" },
        { value: "ceilings", label: "Soffitti" },
        { value: "walls_and_ceilings", label: "Pareti e soffitti" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "finiture:intonacare-pareti:tipo-superficie",
      type: "single_select",
      question: "Com'è la superficie oggi?",
      options: [
        { value: "raw_wall", label: "Parete grezza o nuova" },
        { value: "old_plaster_removed", label: "Vecchio intonaco rimosso" },
        { value: "damaged_large_surface", label: "Intonaco rovinato su superficie ampia" },
        { value: "after_masonry_work", label: "Dopo lavori murari o tracce" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "finiture:intonacare-pareti:ambienti",
      type: "single_select",
      question: "Quante stanze o superfici sono coinvolte?",
      options: [
        { value: "one_room_or_wall", label: "Una stanza o una parete" },
        { value: "few_rooms", label: "Due o tre stanze" },
        { value: "many_rooms", label: "Quattro o più stanze" },
        { value: "whole_house", label: "Tutta la casa" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    surfaceAreaStep("finiture:superficie"),
    {
      id: "finiture:intonacare-pareti:finitura-dopo",
      type: "single_select",
      question: "Dopo l'intonaco serve anche una finitura?",
      options: [
        { value: "skim_coat", label: "Sì, rasatura" },
        { value: "painting", label: "Sì, tinteggiatura" },
        { value: "both", label: "Sì, rasatura e tinteggiatura" },
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

const applicareStuccoDecorativo: InterventionFunnelModel = {
  interventionSlug: "applicare-stucco-decorativo",
  steps: [
    locationCapability,
    {
      id: "finiture:stucco-decorativo:dove",
      type: "single_select",
      question: "Dove vuoi applicare lo stucco decorativo?",
      options: [
        { value: "one_wall", label: "Una parete" },
        { value: "multiple_walls", label: "Più pareti" },
        { value: "room", label: "Una stanza" },
        { value: "whole_area", label: "Più ambienti" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    {
      id: "finiture:stucco-decorativo:ambienti",
      type: "single_select",
      question: "Quante superfici o ambienti sono coinvolti?",
      options: [
        { value: "small_feature", label: "Una superficie piccola o parete principale" },
        { value: "one_room", label: "Una stanza" },
        { value: "few_rooms", label: "Due o tre ambienti" },
        { value: "many_rooms", label: "Più ambienti" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: false,
    },
    surfaceAreaStep("finiture:superficie"),
    {
      id: "finiture:stucco-decorativo:effetto",
      type: "single_select",
      question: "Che effetto decorativo vorresti ottenere?",
      options: [
        { value: "venetian_stucco", label: "Stucco veneziano" },
        { value: "smooth_luxury", label: "Effetto liscio / lucido" },
        { value: "materic_textured", label: "Effetto materico o spatolato" },
        { value: "concrete_effect", label: "Effetto cemento" },
        { value: "not_sure", label: "Non lo so, vorrei consiglio" },
      ],
      optional: true,
    },
    {
      id: "finiture:stucco-decorativo:stato-supporto",
      type: "single_select",
      question: "Com'è lo stato della superficie?",
      description:
        "Se la superficie è molto rovinata, il professionista valuterà se serve prima una preparazione o una rasatura.",
      options: [
        { value: "ready", label: "Liscia e pronta" },
        { value: "small_repairs", label: "Con piccole imperfezioni" },
        { value: "needs_smoothing", label: "Da lisciare o preparare" },
        { value: "damaged", label: "Rovinata o irregolare" },
        { value: "not_sure", label: "Non lo so" },
      ],
      optional: true,
    },
    {
      id: "finiture:stucco-decorativo:preparazione",
      type: "single_select",
      question: "Sai se serve preparare la superficie prima della finitura?",
      options: [
        { value: "no_ready", label: "No, sembra già pronta" },
        { value: "yes_smoothing", label: "Sì, serve lisciare/preparare" },
        { value: "yes_repairs", label: "Sì, ci sono piccole riparazioni" },
        { value: "not_sure", label: "Non lo so, da verificare" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const finitureModels: InterventionFunnelModel[] = [
  tinteggiareEsterni,
  tinteggiareInterni,
  rasarePareti,
  ripristinareIntonaco,
  intonacarePareti,
  applicareStuccoDecorativo,
]
