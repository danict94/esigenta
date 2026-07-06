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

const COMMERCIAL_TIERS = [
  "micro",
  "small",
  "medium",
  "large",
  "xlarge",
] as const

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

/**
 * Safe reader for the persisted Request.commercialSnapshot (untyped JSON).
 * Returns a typed snapshot only when the shape is fully valid; returns null for
 * missing/legacy/malformed values (e.g. requests created before the snapshot
 * existed). Pure, no IO — never throws.
 */
export function parseCommercialSnapshot(value: unknown): CommercialSnapshot | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null
  }

  const raw = value as Record<string, unknown>

  if (
    typeof raw.policyVersion !== "number" ||
    raw.source !== "auto" ||
    typeof raw.tier !== "string" ||
    !(COMMERCIAL_TIERS as readonly string[]).includes(raw.tier) ||
    typeof raw.score !== "number" ||
    typeof raw.creditCost !== "number" ||
    typeof raw.maxUnlocks !== "number" ||
    typeof raw.belowFloor !== "boolean" ||
    !isStringArray(raw.reasons)
  ) {
    return null
  }

  return {
    policyVersion: raw.policyVersion,
    source: "auto",
    tier: raw.tier as LeadValueTier,
    score: raw.score,
    creditCost: raw.creditCost,
    maxUnlocks: raw.maxUnlocks,
    belowFloor: raw.belowFloor,
    reasons: raw.reasons,
  }
}
