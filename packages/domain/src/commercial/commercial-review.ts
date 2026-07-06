/**
 * Esigenta — Commercial review signals (admin-first, advisory)
 *
 * Turns the persisted automatic snapshot + the effective values + the override
 * attribution into read-only signals that HELP the admin review a request. It
 * is purely advisory: `belowFloor` is a warning, never a gate. Nothing here
 * changes publish, dispatch or unlock — those stay human-driven.
 *
 * Pure, no IO. Consumed by the admin request-detail view (never by listings).
 */

import type { CommercialSnapshot } from "./commercial-snapshot"
import { parseCommercialSnapshot } from "./commercial-snapshot"

export type CommercialReviewInput = {
  /** Raw Request.commercialSnapshot (JSON; may be null for legacy requests). */
  commercialSnapshot: unknown
  /** Effective Request.creditCost (what a company actually pays). */
  effectiveCreditCost: number | null
  /** Effective Request.maxUnlocks. */
  effectiveMaxUnlocks: number | null
  /** Request.commercialOverriddenAt — presence means an admin override exists. */
  overriddenAt: Date | null
}

export type CommercialReviewSignals = {
  /** Parsed automatic snapshot (tier/score/belowFloor/reasons); null if absent. */
  auto: CommercialSnapshot | null
  /** Effective values actually in force. */
  effective: { creditCost: number | null; maxUnlocks: number | null }
  /** Advisory only — the system's opinion that this is a "€50 job". Never a block. */
  belowFloor: boolean
  /** An admin override has been recorded. */
  isOverridden: boolean
  /** The effective value no longer matches the automatic snapshot. */
  divergesFromAuto: boolean
}

export function getCommercialReviewSignals(
  input: CommercialReviewInput,
): CommercialReviewSignals {
  const auto = parseCommercialSnapshot(input.commercialSnapshot)

  const effective = {
    creditCost: input.effectiveCreditCost,
    maxUnlocks: input.effectiveMaxUnlocks,
  }

  const divergesFromAuto =
    auto !== null &&
    (auto.creditCost !== effective.creditCost ||
      auto.maxUnlocks !== effective.maxUnlocks)

  return {
    auto,
    effective,
    belowFloor: auto?.belowFloor ?? false,
    isOverridden: input.overriddenAt !== null,
    divergesFromAuto,
  }
}
