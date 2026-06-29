/**
 * Esigenta — Cartongesso funnel models (pilot)
 *
 * Template base for the domain-driven funnel. Each intervention reuses the
 * common spine (location → … → note → timing → contact) and adds 1–2 mirate
 * intervention-specific steps (scale + multi-select block). Scale options use
 * stable bucket values (small/medium/large/unknown) with intervention-specific
 * labels, so enrich-request can derive projectScale uniformly.
 */

import type { RuntimeCapability, RuntimeOption } from "../types/capability"

import { locationCapability } from "../capabilities/location"
import { photosCapability } from "../capabilities/photos"
import { timingCapability } from "../capabilities/timing"
import { contactCapability } from "../capabilities/contact"

import { noteStep } from "./common"
import type { InterventionFunnelModel } from "./types"

function scaleStep(
  question: string,
  smallLabel: string,
  mediumLabel: string,
  largeLabel: string,
): RuntimeCapability {
  const options: RuntimeOption[] = [
    { value: "small", label: smallLabel },
    { value: "medium", label: mediumLabel },
    { value: "large", label: largeLabel },
    { value: "unknown", label: "Non lo so" },
  ]

  return {
    id: "scale",
    type: "single_select",
    question,
    options,
    optional: true,
  }
}

const parete: InterventionFunnelModel = {
  interventionSlug: "realizzare-parete-cartongesso",
  steps: [
    locationCapability,
    scaleStep(
      "Quanto è lunga la parete, più o meno?",
      "Fino a 3 metri",
      "3–6 metri",
      "Oltre 6 metri",
    ),
    {
      id: "cartongesso:parete:needs",
      type: "multi_select",
      question: "Cosa ti serve nella parete?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "isolamento", label: "Isolamento acustico o termico" },
        { value: "porta", label: "Una porta o un'apertura" },
        { value: "impianti", label: "Passaggio impianti (prese, luci, acqua)" },
        { value: "finitura", label: "Da stuccare/rasare pronto per pittura" },
        { value: "soffitti-alti", label: "Soffitti molto alti (oltre 3 m)" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const controsoffitto: InterventionFunnelModel = {
  interventionSlug: "realizzare-controsoffitto",
  steps: [
    locationCapability,
    scaleStep(
      "Quanto è grande il soffitto, più o meno?",
      "Fino a 10 m²",
      "10–25 m²",
      "Oltre 25 m²",
    ),
    {
      id: "cartongesso:controsoffitto:needs",
      type: "multi_select",
      question: "Com'è il controsoffitto che ti serve?",
      description:
        "Puoi selezionare più opzioni. Se non scegli una forma, lo immaginiamo liscio.",
      options: [
        { value: "ribassato", label: "Ribassamento semplice e lineare" },
        { value: "faretti", label: "Con faretti o luci" },
        { value: "velette", label: "Con velette o forme particolari" },
        { value: "acustico", label: "Isolamento acustico" },
        { value: "umido", label: "In bagno o cucina (umidità)" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const controparete: InterventionFunnelModel = {
  interventionSlug: "realizzare-controparete",
  steps: [
    locationCapability,
    {
      id: "cartongesso:controparete:scopo",
      type: "single_select",
      question: "Qual è il problema da risolvere?",
      options: [
        { value: "termico", label: "Parete fredda o con muffa" },
        { value: "acustico", label: "Rumore dai vicini" },
        { value: "estetico", label: "Raddrizzare o rivestire la parete" },
        { value: "unknown_other", label: "Altro / non sono sicuro" },
      ],
      optional: false,
    },
    scaleStep(
      "Quanto è grande la superficie, più o meno?",
      "Fino a 10 m²",
      "10–25 m²",
      "Oltre 25 m²",
    ),
    {
      id: "cartongesso:controparete:extra",
      type: "multi_select",
      question: "Serve altro?",
      description: "Facoltativo.",
      options: [
        { value: "impianti", label: "Passaggio impianti" },
        { value: "finitura", label: "Da stuccare/rasare pronto per pittura" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const strutturaSuMisura: InterventionFunnelModel = {
  interventionSlug: "realizzare-struttura-in-cartongesso-su-misura",
  steps: [
    locationCapability,
    scaleStep(
      "Quanto è grande la struttura?",
      "Piccola",
      "Media",
      "Grande",
    ),
    {
      id: "cartongesso:struttura-su-misura:type",
      type: "single_select",
      question: "Che tipo di struttura vuoi realizzare?",
      options: [
        { value: "parete_tv", label: "Parete TV attrezzata" },
        { value: "cabina_armadio", label: "Cabina armadio" },
        { value: "nicchie_mensole", label: "Nicchie o mensole" },
        { value: "libreria", label: "Libreria in cartongesso" },
        { value: "veletta_decorativa", label: "Veletta decorativa" },
        { value: "copertura_tubi_impianti", label: "Copertura tubi / impianti" },
        { value: "unknown_other", label: "Altro / non sono sicuro" },
      ],
      optional: false,
    },
    {
      id: "cartongesso:struttura-su-misura:features",
      type: "multi_select",
      question: "Cosa deve includere?",
      description: "Puoi selezionare più opzioni.",
      options: [
        { value: "luci_led", label: "Luci o LED integrati" },
        { value: "vani_contenitori", label: "Vani contenitori" },
        { value: "mensole", label: "Mensole" },
        { value: "aperture_nicchie", label: "Aperture o nicchie" },
        { value: "finitura", label: "Da stuccare/rasare pronto per pittura" },
        { value: "disegno_progetto", label: "Ho già un disegno/progetto" },
        { value: "to_define", label: "Da definire con il professionista" },
      ],
      optional: true,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

const riparazioneCartongesso: InterventionFunnelModel = {
  interventionSlug: "riparare-o-modificare-cartongesso",
  steps: [
    locationCapability,
    scaleStep(
      "Quanto è grande la zona da sistemare?",
      "Piccola",
      "Media",
      "Grande",
    ),
    {
      id: "cartongesso:riparazione:tipo",
      type: "single_select",
      question: "Che tipo di intervento serve?",
      description:
        "Se ci sono danni da umidità o infiltrazione, il professionista dovrà valutarne la causa.",
      options: [
        { value: "crepe_buchi", label: "Riparare crepe o buchi" },
        { value: "modifica_esistente", label: "Modificare una struttura esistente" },
        { value: "rimozione_parziale", label: "Rimuovere una parte in cartongesso" },
        {
          value: "umidita_infiltrazione",
          label: "Sistemare danni da umidità/infiltrazione",
        },
        { value: "unknown_other", label: "Altro / non sono sicuro" },
      ],
      optional: false,
    },
    photosCapability,
    noteStep(),
    timingCapability,
    contactCapability,
  ],
}

export const cartongessoModels: InterventionFunnelModel[] = [
  parete,
  controsoffitto,
  controparete,
  strutturaSuMisura,
  riparazioneCartongesso,
]
