/**
 * Esigenta — Commercial snapshot (pay-per-lead)
 *
 * The AUTOMATIC lead-value snapshot persisted on Request.commercialSnapshot at
 * creation. It freezes what deriveLeadValue decided at that moment, so an admin
 * override (tracked on the flat Request.commercialOverridden* columns) can
 * CORRECT the effective value without ever losing the system's opinion.
 *
 * Rules:
 * - Always `source: "auto"` — this object records the automatic computation
 *   only; overrides are never stored here.
 * - Pure derivation from an existing LeadValue: no recompute, no IO.
 * - Stamped with COMMERCIAL_POLICY_VERSION so historical snapshots stay
 *   comparable when deriveLeadValue's config changes (bump the constant then).
 */

import type { LeadValue, LeadValueTier } from "../lead-value"

/** Bump whenever deriveLeadValue's config changes in a way that alters scores. */
export const COMMERCIAL_POLICY_VERSION = 1

export type CommercialSnapshot = {
  policyVersion: number
  source: "auto"
  tier: LeadValueTier
  score: number
  creditCost: number
  maxUnlocks: number
  belowFloor: boolean
  reasons: string[]
}

export function createCommercialSnapshotFromLeadValue(
  leadValue: LeadValue,
): CommercialSnapshot {
  return {
    policyVersion: COMMERCIAL_POLICY_VERSION,
    source: "auto",
    tier: leadValue.tier,
    score: leadValue.score,
    creditCost: leadValue.creditCost,
    maxUnlocks: leadValue.maxUnlocks,
    belowFloor: leadValue.belowFloor,
    reasons: leadValue.reasons,
  }
}
