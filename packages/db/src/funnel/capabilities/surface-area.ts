/**
 * FixPro V2 - Surface Area Capability
 *
 * FOUNDATION CAPABILITY
 *
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - measurement logic
 * - pricing logic
 * - semantic intervention rules
 * - matching logic
 *
 * Surface area is useful for:
 * - quotation quality
 * - project scale estimation
 * - professional preparation
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const surfaceAreaCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "surface-area",

  /**
   * Runtime rendering type.
   */
  type: "number",

  /**
   * User-facing acquisition question.
   */
  question: "Quanti metri quadri circa sono coinvolti?",

  /**
   * Lightweight helper copy.
   */
  description:
    "Una stima approssimativa e sufficiente.",

  /**
   * Surface area improves quality,
   * but should not block lightweight acquisition.
   */
  optional: true,
}
