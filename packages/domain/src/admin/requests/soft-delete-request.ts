import { prisma } from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

export type SoftDeleteRequestInput = {
  requestId: string
  adminUserId: string
  reason?: string | null
}

export type SoftDeleteRequestData = {
  requestId: string
  deletedAt: Date
}

export type SoftDeleteRequestErrorCode =
  | "REQUEST_ID_REQUIRED"
  | "ADMIN_ID_REQUIRED"
  | "REQUEST_NOT_FOUND"
  | "REQUEST_ALREADY_DELETED"

export type SoftDeleteRequestResult =
  | { ok: true; data: SoftDeleteRequestData }
  | { ok: false; code: SoftDeleteRequestErrorCode; message: string }

export type RestoreRequestInput = {
  requestId: string
}

export type RestoreRequestErrorCode =
  | "REQUEST_ID_REQUIRED"
  | "REQUEST_NOT_FOUND"
  | "REQUEST_NOT_DELETED"

export type RestoreRequestResult =
  | { ok: true; data: { requestId: string } }
  | { ok: false; code: RestoreRequestErrorCode; message: string }

/**
 * Soft-deletes a request: NEVER a physical delete. Excludes the request
 * from every default admin/marketplace list. Existing company
 * relationships (RequestUnlock, Conversation, CompanyCreditTransaction,
 * CreditRefundRequest, CompanySavedRequest, RequestDispatch) are never
 * touched — they keep pointing at the same row, which still exists with
 * all its data. Reversible via restoreRequest. Independent of `status` and
 * of archivedAt: a request can be archived, deleted, or both.
 */
export async function softDeleteRequest({
  requestId,
  adminUserId,
  reason,
}: SoftDeleteRequestInput): Promise<SoftDeleteRequestResult> {
  const normalizedRequestId = normalizeRequiredText(requestId)
  const normalizedAdminUserId = normalizeRequiredText(adminUserId)

  if (!normalizedRequestId) {
    return { ok: false, code: "REQUEST_ID_REQUIRED", message: "ID richiesta obbligatorio." }
  }

  if (!normalizedAdminUserId) {
    return { ok: false, code: "ADMIN_ID_REQUIRED", message: "Admin non valido." }
  }

  const existing = await prisma.request.findUnique({
    where: { id: normalizedRequestId },
    select: { id: true, deletedAt: true },
  })

  if (!existing) {
    return { ok: false, code: "REQUEST_NOT_FOUND", message: "Richiesta non trovata." }
  }

  if (existing.deletedAt) {
    return { ok: false, code: "REQUEST_ALREADY_DELETED", message: "Richiesta già eliminata." }
  }

  const deletedAt = new Date()

  await prisma.request.update({
    where: { id: normalizedRequestId },
    data: {
      deletedAt,
      deletedByAdminUserId: normalizedAdminUserId,
      deleteReason: normalizeRequiredText(reason ?? null),
    },
    select: { id: true },
  })

  return { ok: true, data: { requestId: normalizedRequestId, deletedAt } }
}

/**
 * Reverses softDeleteRequest. Does not touch archivedAt or status.
 */
export async function restoreRequest({
  requestId,
}: RestoreRequestInput): Promise<RestoreRequestResult> {
  const normalizedRequestId = normalizeRequiredText(requestId)

  if (!normalizedRequestId) {
    return { ok: false, code: "REQUEST_ID_REQUIRED", message: "ID richiesta obbligatorio." }
  }

  const existing = await prisma.request.findUnique({
    where: { id: normalizedRequestId },
    select: { id: true, deletedAt: true },
  })

  if (!existing) {
    return { ok: false, code: "REQUEST_NOT_FOUND", message: "Richiesta non trovata." }
  }

  if (!existing.deletedAt) {
    return { ok: false, code: "REQUEST_NOT_DELETED", message: "Richiesta non eliminata." }
  }

  await prisma.request.update({
    where: { id: normalizedRequestId },
    data: {
      deletedAt: null,
      deletedByAdminUserId: null,
      deleteReason: null,
    },
    select: { id: true },
  })

  return { ok: true, data: { requestId: normalizedRequestId } }
}
