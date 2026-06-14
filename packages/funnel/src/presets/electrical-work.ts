/**
 * Esigenta V2 - Electrical Work Runtime Preset
 *
 * FOUNDATION PRESET
 *
 * IMPORTANT:
 * Presets are runtime acquisition strategy groups.
 *
 * They are NOT:
 * - semantic meaning
 * - taxonomy definitions
 * - intervention ownership
 */

import type {
  RuntimePreset,
} from "./interior-work"

export const electricalWorkPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "ELECTRICAL_WORK",

  /**
   * Internal runtime label.
   */
  label: "Electrical Work",

  /**
   * Electrical operational acquisition should remain:
   * - lightweight
   * - fast
   * - time-sensitive
   *
   * IMPORTANT:
   * Avoid unnecessary heavy acquisition context
   * during first contact.
   */
  capabilities: [
    "location",
    "timing",
    "photos",
    "contact",
  ],
}
