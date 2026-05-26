/**
 * FixPro V2 - Plumbing Emergency Runtime Preset
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
 * - emergency routing implementation
 */

import type {
  RuntimePreset,
} from "./interior-work"

export const plumbingEmergencyPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "PLUMBING_EMERGENCY",

  /**
   * Internal runtime label.
   */
  label: "Plumbing Emergency",

  /**
   * Emergency plumbing acquisition should remain:
   * - fast
   * - operational
   * - time-sensitive
   *
   * IMPORTANT:
   * Avoid heavy contextual acquisition like:
   * - property classification
   * - rooms
   * - surface area
   */
  capabilities: [
    "location",
    "timing",
    "photos",
    "contact",
  ],
}
