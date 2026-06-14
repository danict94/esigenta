/**
 * Esigenta V2 - Emergency Repair Runtime Preset
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

export const emergencyRepairPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "EMERGENCY_REPAIR",

  /**
   * Internal runtime label.
   */
  label: "Emergency Repair",

  /**
   * Reusable runtime acquisition primitives.
   *
   * IMPORTANT:
   * Runtime enrichment may derive emergency signals
   * from answers, but this preset does not route leads.
   */
  capabilities: [
    "location",
    "property",
    "photos",
    "timing",
    "contact",
  ],
}
