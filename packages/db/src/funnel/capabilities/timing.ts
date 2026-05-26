/**
 * FixPro V2 - Timing Capability
 *
 * FOUNDATION CAPABILITY
 *
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - scheduling
 * - calendar integration
 * - provider availability
 * - routing
 * - matching logic
 *
 * Timing context is useful for:
 * - quotation preparation
 * - appointment planning
 * - lightweight lead qualification
 */

import type { RuntimeCapability } from "../types/capability";

export const timingCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "timing",

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
  description: "Aiuta i professionisti a capire le tempistiche del lavoro.",

  /**
   * Runtime timing options.
   *
   * IMPORTANT:
   * Values must remain stable for runtime logic.
   */
  options: [
    {
      value: "as_soon_as_possible",
      label: "Il prima possibile",
    },

    {
      value: "within_30_days",
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
   * Timing is operationally useful for request qualification.
   */
  optional: false,
};
