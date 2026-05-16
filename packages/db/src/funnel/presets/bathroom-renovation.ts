/**
 * FixPro V2 - Bathroom Renovation Runtime Preset
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

export const bathroomRenovationPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "BATHROOM_RENOVATION",

  /**
   * Internal runtime label.
   */
  label: "Bathroom Renovation",

  /**
   * Bathroom renovation still benefits from scale, media, timing,
   * and budget context without introducing service-specific steps.
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
