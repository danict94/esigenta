/**
 * FixPro V2 - Exterior Work Runtime Preset
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

export const exteriorWorkPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "EXTERIOR_WORK",

  /**
   * Internal runtime label.
   */
  label: "Exterior Work",

  /**
   * Reusable runtime acquisition primitives.
   *
   * IMPORTANT:
   * Exterior-specific operational details
   * can be added later as new capabilities.
   */
  capabilities: [
    "location",
    "property",
    "surface-area",
    "photos",
    "timing",
    "contact",
  ],
}
