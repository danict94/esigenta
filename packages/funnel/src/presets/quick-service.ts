/**
 * Esigenta V2 - Quick Service Runtime Preset
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

export const quickServicePreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "QUICK_SERVICE",

  /**
   * Internal runtime label.
   */
  label: "Quick Service",

  /**
   * Minimal reusable runtime acquisition primitives.
   */
  capabilities: [
    "location",
    "property",
    "photos",
    "timing",
    "contact",
  ],
}
