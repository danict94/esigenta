/**
 * FixPro V2 — Urgency Capability
 *
 * FOUNDATION CAPABILITY
 *
 * IMPORTANT:
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - routing
 * - notifications
 * - lead scoring
 * - prioritization
 * - matching logic
 *
 * Urgency context is useful for:
 * - operational preparation
 * - professional prioritization
 * - lead quality
 * - future marketplace routing
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const urgencyCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "urgency",

  /**
   * Runtime rendering type.
   */
  type: "single_select",

  /**
   * User-facing acquisition question.
   */
  question: "Quando vorresti eseguire il lavoro?",

  /**
   * Lightweight contextual helper.
   */
  description:
    "Aiuta i professionisti a capire le tempistiche del lavoro.",

  /**
   * Runtime urgency options.
   *
   * IMPORTANT:
   * Values must remain stable for runtime logic.
   */
  options: [
    {
      value: "urgent",
      label: "Il prima possibile",
    },

    {
      value: "7_days",
      label: "Entro 7 giorni",
    },

    {
      value: "30_days",
      label: "Entro 30 giorni",
    },

    {
      value: "flexible",
      label: "Sono flessibile",
    },

    {
      value: "evaluating",
      label: "Sto valutando",
    },
  ],

  /**
   * Urgency is operationally useful
   * but should remain lightweight UX.
   */
  optional: false,
}