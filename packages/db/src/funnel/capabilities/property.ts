/**
 * FixPro V2 — Property Capability
 *
 * FOUNDATION CAPABILITY
 *
 * IMPORTANT:
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT contain:
 * - taxonomy semantics
 * - intervention logic
 * - frontend rendering
 * - business routing
 *
 * Property context is useful for:
 * - quotation quality
 * - operational understanding
 * - professional preparation
 * - request clarity
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const propertyCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "property",

  /**
   * Runtime rendering type.
   */
  type: "single_select",

  /**
   * User-facing acquisition question.
   */
  question: "Che tipo di immobile è?",

  /**
   * Lightweight contextual help.
   */
  description:
    "Aiuta il professionista a capire meglio il contesto del lavoro.",

  /**
   * Runtime selectable options.
   *
   * IMPORTANT:
   * Values must remain stable.
   */
  options: [
    {
      value: "appartamento",
      label: "Appartamento",
    },

    {
      value: "villa",
      label: "Villa",
    },

    {
      value: "ufficio",
      label: "Ufficio",
    },

    {
      value: "negozio",
      label: "Negozio",
    },

    {
      value: "condominio",
      label: "Condominio",
    },

    {
      value: "garage",
      label: "Garage",
    },

    {
      value: "magazzino",
      label: "Magazzino",
    },

    {
      value: "altro",
      label: "Altro",
    },
  ],

  /**
   * Property context is operationally useful.
   */
  optional: false,
}