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

/**
 * GEO REFOUNDATION (docs/archive-legacy/refoundation/geo-refoundation/01_DESIGN.md): the funnel's
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
   * Keys correspond to funnel step ids (common capability ids or
   * intervention-model step ids).
   *
   * Example:
   * {
   *   "surface-area": 40,
   *   "scale": "large",
   *   "cartongesso:parete:needs": ["isolamento", "porta"]
   * }
   */
  rawAnswers: Record<string, unknown>

  /**
   * Human-readable rendering for select-based answers, keyed by step id.
   *
   * Built at draft time from the step definitions (the funnel owns the chip
   * labels), so consumers (e.g. the company-facing request detail) can show
   * readable labels/values without knowing every intervention's options.
   */
  answerDisplay?: Record<
    string,
    {
      label: string
      value: string
    }
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
