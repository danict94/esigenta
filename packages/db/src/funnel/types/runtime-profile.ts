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
 * Runtime capability preset identifiers.
 *
 * Presets are reusable acquisition strategy groups.
 *
 * IMPORTANT:
 * Presets MUST remain runtime-oriented.
 * They MUST NOT redefine taxonomy semantics.
 */
export type RuntimePresetSlug =
  | "INTERIOR_WORK"
  | "EXTERIOR_WORK"
  | "EMERGENCY_REPAIR"
  | "RENOVATION"
  | "QUICK_SERVICE"
  | "PAINTING"
  | "PLUMBING_EMERGENCY"
  | "HOME_RENOVATION"
  | "BATHROOM_RENOVATION"
  | "ELECTRICAL_WORK"
  | "GENERIC"

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
   * Runtime acquisition presets inferred
   * from taxonomy semantics.
   *
   * Example:
   * ["PAINTING"]
   */
  presetSlugs: RuntimePresetSlug[]

  /**
   * Final resolved runtime capabilities
   * used by the adaptive wizard.
   *
   * IMPORTANT:
   * These are acquisition primitives only.
   */
  capabilities: RuntimeCapabilityId[]

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
