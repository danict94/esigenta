/**
 * Esigenta V2 — Interior Work Runtime Preset
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
 *
 * Presets exist to:
 * - reduce duplication
 * - compose runtime acquisition
 * - standardize lightweight flows
 *
 * This preset is reusable across:
 * - painting
 * - cartongesso
 * - flooring
 * - plastering
 * - interior renovation
 * - similar interior work categories
 */

import type {
  RuntimeCapabilityId,
  RuntimePresetSlug,
} from "../types/runtime-profile"

export type RuntimePreset = {
  /**
   * Stable runtime preset identifier.
   */
  slug: RuntimePresetSlug

  /**
   * Human-readable runtime label.
   *
   * Internal use only.
   */
  label: string

  /**
   * Runtime acquisition capabilities
   * included by this preset.
   */
  capabilities: RuntimeCapabilityId[]
}

export const interiorWorkPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "INTERIOR_WORK",

  /**
   * Internal runtime label.
   */
  label: "Interior Work",

  /**
   * Reusable runtime acquisition primitives.
   *
   * IMPORTANT:
   * These are NOT semantic concepts.
   *
   * They represent:
   * - operational context
   * - quotation context
   * - lightweight acquisition needs
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
