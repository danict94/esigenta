/**
 * Esigenta — Effective lead commercials resolver
 *
 * THE single place that decides the EFFECTIVE commercial values of a lead as
 * `override ?? auto`. It is pure (no IO, no recompute): it takes the automatic
 * snapshot produced by `deriveLeadValue` and an optional admin override, and
 * returns the values that must be MATERIALIZED onto Request.creditCost /
 * Request.maxUnlocks.
 *
 * Design contract (see architectural evaluation):
 * - The admin CORRECTS the system, it does not REPLACE it: an override changes
 *   the effective price/cap but NEVER the automatic snapshot (tier/score/
 *   belowFloor stay the system's opinion of the lead).
 * - The effective value is a materialized snapshot read by unlock/listing —
 *   this resolver runs at WRITE time (create / override), never per row in a
 *   listing.
 *
 * Not yet wired: introduced in the domain-centralization batch so create-request
 * and the admin override path can both go through it once the auto snapshot is
 * persisted (later micro-batches).
 */

import type { LeadValue, LeadValueTier } from "../lead-value"

/**
 * Admin correction. A `null`/absent field means "no override on that dimension"
 * (the automatic value stands). A number is the corrected effective value.
 */
export type CommercialOverride = {
  creditCost?: number | null
  maxUnlocks?: number | null
}

export type EffectiveLeadCommercials = {
  creditCost: number
  maxUnlocks: number
  /** From the automatic snapshot — an override never re-tiers the lead. */
  tier: LeadValueTier
  score: number
  belowFloor: boolean
  /** "override" if any dimension was manually corrected, else "auto". */
  source: "auto" | "override"
}

export function resolveEffectiveLeadCommercials(
  auto: LeadValue,
  override?: CommercialOverride | null,
): EffectiveLeadCommercials {
  const overriddenCreditCost =
    override?.creditCost != null ? override.creditCost : null
  const overriddenMaxUnlocks =
    override?.maxUnlocks != null ? override.maxUnlocks : null
  const hasOverride =
    overriddenCreditCost !== null || overriddenMaxUnlocks !== null

  return {
    creditCost: overriddenCreditCost ?? auto.creditCost,
    maxUnlocks: overriddenMaxUnlocks ?? auto.maxUnlocks,
    tier: auto.tier,
    score: auto.score,
    belowFloor: auto.belowFloor,
    source: hasOverride ? "override" : "auto",
  }
}
