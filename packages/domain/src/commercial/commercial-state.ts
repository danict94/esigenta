/**
 * Esigenta — Commercial state (pay-per-lead)
 *
 * Pure, DB-free commercial SEMANTICS derived from the persisted effective
 * values on a Request. This is the single definition of "commercially
 * configured", "available unlock slots" and "sold out"; apps only FORMAT it.
 *
 * IMPORTANT:
 * - No Prisma / no IO here (safe to import from server or client components).
 * - This reads the EFFECTIVE values already persisted on Request
 *   (creditCost / maxUnlocks). It never recomputes them and never calls
 *   deriveLeadValue.
 */

export type RequestCommercialFields = {
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
}

export type RequestCommercialState = RequestCommercialFields & {
  availableUnlockSlots: number | null
  isCommerciallyConfigured: boolean
  isSoldOut: boolean
}

export function getRequestCommercialState({
  creditCost,
  maxUnlocks,
  unlockCount,
}: RequestCommercialFields): RequestCommercialState {
  const availableUnlockSlots =
    maxUnlocks === null ? null : Math.max(maxUnlocks - unlockCount, 0)

  return {
    creditCost,
    maxUnlocks,
    unlockCount,
    availableUnlockSlots,
    isCommerciallyConfigured: creditCost !== null && maxUnlocks !== null,
    isSoldOut: maxUnlocks !== null && maxUnlocks - unlockCount <= 0,
  }
}
