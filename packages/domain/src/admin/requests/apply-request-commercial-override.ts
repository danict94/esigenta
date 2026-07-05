import { prisma } from "@esigenta/database"

/**
 * Admin commercial override — the admin CORRECTS the automatic value, never
 * REPLACES the system: it updates the EFFECTIVE creditCost/maxUnlocks and
 * records who/when/why on the flat attribution columns, while leaving the
 * automatic `commercialSnapshot` untouched.
 *
 * Deliberately NOT part of an override (all outside this batch's scope):
 * - commercialSnapshot (the auto value stays intact)
 * - structuredData, unlockCount, RequestUnlock rows, credit ledger
 * - no deriveLeadValue recompute, no floor gating
 *
 * Both creditCost and maxUnlocks are full overrides here, so effective equals
 * the provided values directly — no need to go through
 * resolveEffectiveLeadCommercials (that resolver is for partial/read-time
 * reconciliation, not a full-override write).
 */
export type ApplyRequestCommercialOverrideInput = {
  requestId: string
  creditCost: number
  maxUnlocks: number
  adminUserId: string
  reason: string
}

export type ApplyRequestCommercialOverrideResult =
  | { ok: true; requestId: string }
  | { ok: false; code: string; message: string }

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 1
}

export async function applyRequestCommercialOverride({
  requestId,
  creditCost,
  maxUnlocks,
  adminUserId,
  reason,
}: ApplyRequestCommercialOverrideInput): Promise<ApplyRequestCommercialOverrideResult> {
  const normalizedRequestId = requestId.trim()
  if (!normalizedRequestId) {
    return { ok: false, code: "REQUEST_ID_REQUIRED", message: "ID richiesta obbligatorio." }
  }

  const normalizedAdminUserId = adminUserId.trim()
  if (!normalizedAdminUserId) {
    return {
      ok: false,
      code: "ADMIN_USER_REQUIRED",
      message: "Amministratore non identificato.",
    }
  }

  const normalizedReason = reason.trim()
  if (!normalizedReason) {
    return {
      ok: false,
      code: "OVERRIDE_REASON_REQUIRED",
      message: "Il motivo dell'override è obbligatorio.",
    }
  }

  if (!isPositiveInteger(creditCost)) {
    return {
      ok: false,
      code: "CREDIT_COST_INVALID",
      message: "Il costo in crediti deve essere un intero positivo.",
    }
  }

  if (!isPositiveInteger(maxUnlocks)) {
    return {
      ok: false,
      code: "MAX_UNLOCKS_INVALID",
      message: "Il limite massimo di sblocchi deve essere un intero positivo.",
    }
  }

  const request = await prisma.request.findUnique({
    where: { id: normalizedRequestId },
    select: { id: true, unlockCount: true },
  })

  if (!request) {
    return { ok: false, code: "REQUEST_NOT_FOUND", message: "Richiesta non trovata." }
  }

  if (maxUnlocks < request.unlockCount) {
    return {
      ok: false,
      code: "MAX_UNLOCKS_BELOW_UNLOCK_COUNT",
      message:
        "Il limite massimo di sblocchi non puo essere inferiore agli sblocchi gia effettuati.",
    }
  }

  await prisma.request.update({
    where: { id: normalizedRequestId },
    data: {
      creditCost,
      maxUnlocks,
      commercialOverriddenAt: new Date(),
      commercialOverriddenByAdminUserId: normalizedAdminUserId,
      commercialOverrideReason: normalizedReason,
    },
    select: { id: true },
  })

  return { ok: true, requestId: normalizedRequestId }
}
