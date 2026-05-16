/**
 * FixPro V2 — Structured Request Draft
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
  RuntimeCapabilityId,
} from "./runtime-profile"

export type RequestGeoDraft = {
  /**
   * Normalized human-readable address.
   */
  address?: string

  /**
   * Normalized city/locality.
   */
  city?: string

  /**
   * Normalized postal code.
   */
  postalCode?: string

  /**
   * Geographic latitude.
   */
  latitude?: number

  /**
   * Geographic longitude.
   */
  longitude?: number
}

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

export type RequestMatchingSignals = {
  /**
   * Canonical services resolved
   * through taxonomy semantics.
   *
   * IMPORTANT:
   * Runtime matching remains:
   *
   * request.requiredServices
   * vs
   * company.selectedServices
   */
  requiredServiceSlugs: string[]

  /**
   * Resolved categories for marketplace exposure.
   */
  categorySlugs: string[]
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
   * Runtime matching preparation signals.
   */
  matchingSignals: RequestMatchingSignals

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
