/**
 * Esigenta V2 - Painting Runtime Preset
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

export const paintingPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "PAINTING",

  /**
   * Internal runtime label.
   */
  label: "Painting",

  /**
   * Painting acquisition needs room and area context,
   * while staying lightweight for simple quotation.
   */
  capabilities: [
    "location",
    "property",
    "rooms",
    "surface-area",
    "photos",
    "timing",
    "contact",
  ],
}
