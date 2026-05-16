/**
 * FixPro V2 — Location Capability
 *
 * FOUNDATION CAPABILITY
 *
 * IMPORTANT:
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - routing
 * - geo matching
 * - radius filtering
 *
 * Those responsibilities belong to:
 * - apps/web rendering/autocomplete
 * - future API/runtime layers
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const locationCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "location",

  /**
   * Runtime rendering type.
   *
   * The frontend runtime renderer
   * decides HOW this is rendered.
   */
  type: "location",

  /**
   * User-facing acquisition question.
   */
  question: "📍 Dove devi eseguire il lavoro?",

  /**
   * Optional UX helper copy.
   */
  description:
    "Seleziona l'indirizzo dai suggerimenti per preparare correttamente la richiesta.",

  /**
   * Location is operationally critical.
   *
   * Required for:
   * - geo routing
   * - operational radius
   * - matching preparation
   */
  optional: false,
}
