/**
 * FixPro V2 - Home Renovation Runtime Preset
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

export const homeRenovationPreset: RuntimePreset = {
  /**
   * Stable preset slug.
   */
  slug: "HOME_RENOVATION",

  /**
   * Internal runtime label.
   */
  label: "Home Renovation",

  /**
   * Full-home renovation acquisition needs broader project context,
   * but remains a simple capability composition.
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
