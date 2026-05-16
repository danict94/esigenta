/**
 * FixPro V2 - Generic Runtime Preset
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

export const genericPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "GENERIC",

  /**
   * Internal runtime label.
   */
  label: "Generic",

  /**
   * Conservative universal fallback acquisition.
   *
   * IMPORTANT:
   * Generic fallback must remain:
   * - lightweight
   * - broadly compatible
   * - low-friction
   */
  capabilities: [
    "location",
    "photos",
    "timing",
    "contact",
  ],
}