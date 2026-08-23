/**
 * Esigenta V2 — Location Capability
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
  question: "Dove devi eseguire il lavoro?",

  /**
   * Optional UX helper copy.
   *
   * FASE 8D.1 — updated to tell the user, BEFORE they start typing, that a
   * CAP or Comune is also accepted (not just a full address) — the
   * manual fallback ("Usa '95022'", see LocationCapabilityInput) only
   * ever surfaces after they've typed without picking a suggestion, so
   * this is the one place that sets that expectation upfront.
   */
  description:
    "Seleziona l'indirizzo dai suggerimenti, oppure scrivi CAP o Comune.",

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
