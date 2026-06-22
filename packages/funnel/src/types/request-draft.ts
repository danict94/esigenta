/**
 * Esigenta V2 — Structured Request Draft
 *
 * FOUNDATION CONTRACT
 *
 * This file defines the normalized runtime request draft
 * progressively built by the adaptive funnel runtime.
 *
 * IMPORTANT:
 * This is NOT a Prisma model.
 *
 * This contract exists BEFORE persistence.
 *
 * Goals:
 * - runtime normalization
 * - acquisition consistency
 * - routing preparation
 * - matching preparation
 * - lead quality enrichment
 *
 * The taxonomy remains the semantic authority.
 */

import type {
  GeoPlace,
} from "@esigenta/shared"

import type {
  RuntimeCapabilityId,
} from "./runtime-profile"

/**
 * GEO REFOUNDATION (docs/geo-refoundation/01_DESIGN.md): the funnel's
 * "location" answer is a complete GeoPlace or nothing — there is no
 * partial geo draft anymore. See @esigenta/shared's resolvePlaceFromGooglePlace,
 * the only constructor.
 */
export type RequestGeoDraft = GeoPlace | null

export type RequestContactDraft = {
  /**
   * Customer first name.
   */
  firstName?: string

  /**
   * Customer last name.
   */
  lastName?: string

  /**
   * Customer display name.
   */
  name?: string

  /**
   * Customer phone number.
   */
  phone?: string

  /**
   * Customer email.
   */
  email?: string
}

export type RequestDerivedSignals = {
  /**
   * Runtime-estimated urgency derived from timing.
   *
   * IMPORTANT:
   * This is acquisition/routing context,
   * not a separate visible funnel question.
   */
  urgency?:
    | "low"
    | "medium"
    | "high"

  /**
   * Runtime-estimated project scale.
   *
   * IMPORTANT:
   * Derived from runtime acquisition.
   *
   * NOT semantic meaning.
   */
  projectScale?:
    | "small"
    | "medium"
    | "large"

  /**
   * Runtime-estimated complexity.
   */
  estimatedComplexity?:
    | "low"
    | "medium"
    | "high"

  /**
   * Lightweight lead quality estimation.
   */
  leadQuality?:
    | "low"
    | "medium"
    | "high"
}

export type RequestRoutingSignals = {
  /**
   * Whether inspection/sopralluogo
   * may be required.
   */
  inspectionSuggested?: boolean

  /**
   * Emergency runtime detection.
   */
  emergency?: boolean

  /**
   * Geo-routing readiness.
   */
  geoResolved?: boolean
}

export type RequestDraft = {
  /**
   * Canonical intervention resolved
   * by taxonomy runtime.
   *
   * Example:
   * "fare-parete-cartongesso"
   */
  interventionSlug: string

  /**
   * Original user search query.
   *
   * Useful for:
   * - analytics
   * - enrichment
   * - future AI improvements
   */
  originalQuery?: string

  /**
   * Runtime-collected acquisition answers.
   *
   * IMPORTANT:
   * Keys MUST correspond to runtime capability ids.
   *
   * Example:
   * {
   *   "surface-area": 40,
   *   "property": "appartamento"
   * }
   */
  rawAnswers: Partial<
    Record<
      RuntimeCapabilityId,
      unknown
    >
  >

  /**
   * Normalized geographic data.
   */
  geo: RequestGeoDraft

  /**
   * Contact information.
   */
  contact: RequestContactDraft

  /**
   * Runtime-derived operational signals.
   */
  derivedSignals: RequestDerivedSignals

  /**
   * Runtime routing preparation signals.
   */
  routingSignals: RequestRoutingSignals

  /**
   * Free-form customer description.
   *
   * IMPORTANT:
   * Collected near the END
   * of the runtime flow.
   */
  customerDescription?: string

  /**
   * Runtime-generated timestamp.
   */
  createdAt: Date
}
