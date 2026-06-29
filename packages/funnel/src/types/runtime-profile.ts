/**
 * Esigenta V2 — Funnel Runtime Profile
 *
 * FOUNDATION CONTRACT
 *
 * This file defines the runtime acquisition profile
 * generated AFTER taxonomy semantic resolution.
 *
 * IMPORTANT:
 * - The funnel NEVER defines semantic meaning
 * - The funnel NEVER duplicates taxonomy logic
 * - interventionSlug MUST come from taxonomy resolution
 * - runtime profiles are acquisition-oriented only
 */

export type RuntimeComplexity =
  | "low"
  | "medium"
  | "high"

export type RuntimeLeadType =
  | "quick"
  | "standard"
  | "complex"

/**
 * Runtime acquisition primitives.
 *
 * IMPORTANT:
 * These are NOT semantic concepts.
 * They represent reusable acquisition capabilities.
 */
export type RuntimeCapabilityId =
  | "location"
  | "property"
  | "photos"
  | "timing"
  | "budget"
  | "surface-area"
  | "rooms"
  | "contact"

/**
 * Generalized funnel step identifier.
 *
 * Common reusable steps use the well-known RuntimeCapabilityId values; the
 * intervention-specific steps (declared in intervention models) carry their own
 * namespaced string id (e.g. "cartongesso:parete:needs"). The `& {}` keeps
 * editor autocomplete for the known ids while still accepting any string.
 */
export type RuntimeStepId = RuntimeCapabilityId | (string & {})

/**
 * Minimal taxonomy resolution contract consumed by the funnel runtime.
 * The funnel never re-defines semantic meaning; the slug comes from taxonomy.
 */
export type ResolvedIntervention = {
  interventionSlug: string
}

/**
 * Main runtime acquisition contract.
 *
 * Generated AFTER:
 *
 * query
 * -> taxonomy normalization
 * -> intervention resolution
 * -> clarification (if needed)
 *
 * This profile is consumed by:
 *
 * - runtime capability composition
 * - adaptive wizard rendering
 * - runtime orchestration
 * - request draft generation
 */
export type RuntimeProfile = {
  /**
   * Canonical intervention resolved by taxonomy.
   *
   * IMPORTANT:
   * This MUST originate from taxonomy resolution.
   *
   * Example:
   * "fare-parete-cartongesso"
   */
  interventionSlug: string

  /**
   * Final resolved, ordered funnel step ids used by the adaptive wizard.
   *
   * Common steps use RuntimeCapabilityId values; intervention-model steps use
   * their own namespaced ids (see RuntimeStepId).
   */
  capabilities: RuntimeStepId[]

  /**
   * Lightweight UX estimation.
   *
   * Used ONLY for runtime orchestration
   * and frontend UX optimization.
   */
  estimatedStepCount: number

  /**
   * Runtime operational complexity estimation.
   *
   * IMPORTANT:
   * This is NOT semantic meaning.
   */
  complexity: RuntimeComplexity

  /**
   * Runtime lead acquisition type.
   *
   * Used for:
   * - runtime orchestration
   * - UX adaptation
   * - lightweight lead segmentation
   */
  leadType: RuntimeLeadType
}
