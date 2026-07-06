import { prisma } from "@esigenta/database"

import { parseCommercialSnapshot } from "../../commercial"

/**
 * Reverses an admin commercial override: restores the effective creditCost/
 * maxUnlocks to the automatic snapshot (deriveLeadValue's original opinion) and
 * clears the override attribution, so after the reset effective = auto and no
 * override is reported.
 *
 * Requires a valid persisted commercialSnapshot (legacy/missing snapshots can't
 * be reset — the admin must set values manually via the override form). Never
 * touches unlockCount, RequestUnlock, the credit ledger, review/publish state,
 * or deriveLeadValue.
 */
export type ResetRequestCommercialOverrideInput = {
  requestId: string
  adminUserId: string
}

export type ResetRequestCommercialOverrideResult =
  | { ok: true; requestId: string }
  | { ok: false; code: string; message: string }

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 1
}

export async function resetRequestCommercialOverrideToAuto({
  requestId,
  adminUserId,
}: ResetRequestCommercialOverrideInput): Promise<ResetRequestCommercialOverrideResult> {
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

  const request = await prisma.request.findUnique({
    where: { id: normalizedRequestId },
    select: { id: true, unlockCount: true, commercialSnapshot: true },
  })

  if (!request) {
    return { ok: false, code: "REQUEST_NOT_FOUND", message: "Richiesta non trovata." }
  }

  const snapshot = parseCommercialSnapshot(request.commercialSnapshot)
  if (!snapshot) {
    return {
      ok: false,
      code: "COMMERCIAL_SNAPSHOT_UNAVAILABLE",
      message: "Valutazione automatica non disponibile per questa richiesta.",
    }
  }

  if (
    !isPositiveInteger(snapshot.creditCost) ||
    !isPositiveInteger(snapshot.maxUnlocks)
  ) {
    return {
      ok: false,
      code: "COMMERCIAL_SNAPSHOT_INVALID",
      message: "La valutazione automatica salvata non è valida.",
    }
  }

  if (snapshot.maxUnlocks < request.unlockCount) {
    return {
      ok: false,
      code: "MAX_UNLOCKS_BELOW_UNLOCK_COUNT",
      message:
        "Il limite automatico è inferiore agli sblocchi gia effettuati: correggi manualmente.",
    }
  }

  await prisma.request.update({
    where: { id: normalizedRequestId },
    data: {
      creditCost: snapshot.creditCost,
      maxUnlocks: snapshot.maxUnlocks,
      commercialOverriddenAt: null,
      commercialOverriddenByAdminUserId: null,
      commercialOverrideReason: null,
    },
    select: { id: true },
  })

  return { ok: true, requestId: normalizedRequestId }
}
