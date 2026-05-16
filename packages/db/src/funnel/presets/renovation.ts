/**
 * FixPro V2 - Renovation Runtime Preset
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

export const renovationPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "RENOVATION",

  /**
   * Internal runtime label.
   */
  label: "Renovation",

  /**
   * Reusable runtime acquisition primitives.
   *
   * Renovation-style acquisition needs more context,
   * but remains linear-first and lightweight.
   */
  capabilities: [
    "location",
    "property",
    "rooms",
    "surface-area",
    "photos",
    "timing",
    "budget",
    "contact",
  ],
}
