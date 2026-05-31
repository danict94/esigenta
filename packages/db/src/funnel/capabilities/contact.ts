/**
 * FixPro V2 — Contact Capability
 *
 * FOUNDATION CAPABILITY
 *
 * IMPORTANT:
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - auth
 * - OTP
 * - verification
 * - messaging
 * - CRM
 * - notifications
 * - persistence
 *
 * Contact data is collected:
 * - near the end of the funnel
 * - after contextual acquisition
 *
 * This improves:
 * - conversion
 * - lead quality
 * - completion rate
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const contactCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "contact",

  /**
   * Runtime rendering type.
   *
   * IMPORTANT:
   * The frontend runtime renderer
   * decides HOW this is rendered.
   */
  type: "contact",

  /**
   * User-facing acquisition question.
   */
  question: "Come possono contattarti?",

  /**
   * Lightweight helper copy.
   */
  description:
    "Ti scriviamo solo per questa richiesta.",

  /**
   * Contact collection is operationally critical.
   */
  optional: false,
}
