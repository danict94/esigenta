/**
 * Esigenta V2 - Budget Capability
 *
 * FOUNDATION CAPABILITY
 *
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - pricing
 * - quotes
 * - affordability scoring
 * - provider filtering
 * - matching logic
 *
 * Budget context must remain:
 * - soft
 * - optional
 * - acquisition-oriented
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const budgetCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "budget",

  /**
   * Runtime rendering type.
   */
  type: "single_select",

  /**
   * User-facing acquisition question.
   */
  question: "Hai gia un'idea indicativa della spesa?",

  /**
   * Lightweight helper copy.
   */
  description:
    "Se non lo sai ancora, puoi saltare questo passaggio.",

  /**
   * Soft budget ranges.
   *
   * IMPORTANT:
   * Values are acquisition hints,
   * not pricing or matching rules.
   */
  options: [
    {
      value: "not_sure",
      label: "Non lo so ancora",
    },

    {
      value: "under_1000",
      label: "Meno di 1.000 euro",
    },

    {
      value: "1000_5000",
      label: "1.000 - 5.000 euro",
    },

    {
      value: "5000_15000",
      label: "5.000 - 15.000 euro",
    },

    {
      value: "over_15000",
      label: "Oltre 15.000 euro",
    },
  ],

  /**
   * Budget must never block request creation.
   */
  optional: true,
}
