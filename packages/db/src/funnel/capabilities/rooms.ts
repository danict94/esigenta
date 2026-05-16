/**
 * FixPro V2 - Rooms Capability
 *
 * FOUNDATION CAPABILITY
 *
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - room taxonomy
 * - intervention-specific logic
 * - pricing
 * - matching logic
 *
 * Room count is useful for:
 * - project scale estimation
 * - renovation context
 * - quotation preparation
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const roomsCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "rooms",

  /**
   * Runtime rendering type.
   */
  type: "number",

  /**
   * User-facing acquisition question.
   */
  question: "Quanti ambienti sono coinvolti?",

  /**
   * Lightweight helper copy.
   */
  description:
    "Indica il numero approssimativo di stanze o ambienti.",

  /**
   * Useful for larger work,
   * but optional for quick acquisition.
   */
  optional: true,
}
