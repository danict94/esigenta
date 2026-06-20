import { prisma } from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

export type ArchiveRequestInput = {
  requestId: string
  adminUserId: string
  reason?: string | null
}

export type ArchiveRequestData = {
  requestId: string
  archivedAt: Date
}

export type ArchiveRequestErrorCode =
  | "REQUEST_ID_REQUIRED"
  | "ADMIN_ID_REQUIRED"
  | "REQUEST_NOT_FOUND"
  | "REQUEST_DELETED"
  | "REQUEST_ALREADY_ARCHIVED"

export type ArchiveRequestResult =
  | { ok: true; data: ArchiveRequestData }
  | { ok: false; code: ArchiveRequestErrorCode; message: string }

export type UnarchiveRequestInput = {
  requestId: string
}

export type UnarchiveRequestErrorCode =
  | "REQUEST_ID_REQUIRED"
  | "REQUEST_NOT_FOUND"
  | "REQUEST_NOT_ARCHIVED"

export type UnarchiveRequestResult =
  | { ok: true; data: { requestId: string } }
  | { ok: false; code: UnarchiveRequestErrorCode; message: string }

/**
 * Archives a request: hides it from default admin/marketplace lists while
 * keeping all data, history and editorial status untouched. Never deletes
 * anything. Reversible via unarchiveRequest.
 */
export async function archiveRequest({
  requestId,
  adminUserId,
  reason,
}: ArchiveRequestInput): Promise<ArchiveRequestResult> {
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
    select: { id: true, archivedAt: true, deletedAt: true },
  })

  if (!existing) {
    return { ok: false, code: "REQUEST_NOT_FOUND", message: "Richiesta non trovata." }
  }

  if (existing.deletedAt) {
    return {
      ok: false,
      code: "REQUEST_DELETED",
      message: "Richiesta eliminata: ripristinala prima di archiviarla.",
    }
  }

  if (existing.archivedAt) {
    return { ok: false, code: "REQUEST_ALREADY_ARCHIVED", message: "Richiesta già archiviata." }
  }

  const archivedAt = new Date()

  await prisma.request.update({
    where: { id: normalizedRequestId },
    data: {
      archivedAt,
      archivedByAdminUserId: normalizedAdminUserId,
      archiveReason: normalizeRequiredText(reason ?? null),
    },
    select: { id: true },
  })

  return { ok: true, data: { requestId: normalizedRequestId, archivedAt } }
}

/**
 * Reverses archiveRequest. Does not touch status, which was never modified
 * by archiving in the first place.
 */
export async function unarchiveRequest({
  requestId,
}: UnarchiveRequestInput): Promise<UnarchiveRequestResult> {
  const normalizedRequestId = normalizeRequiredText(requestId)

  if (!normalizedRequestId) {
    return { ok: false, code: "REQUEST_ID_REQUIRED", message: "ID richiesta obbligatorio." }
  }

  const existing = await prisma.request.findUnique({
    where: { id: normalizedRequestId },
    select: { id: true, archivedAt: true },
  })

  if (!existing) {
    return { ok: false, code: "REQUEST_NOT_FOUND", message: "Richiesta non trovata." }
  }

  if (!existing.archivedAt) {
    return { ok: false, code: "REQUEST_NOT_ARCHIVED", message: "Richiesta non archiviata." }
  }

  await prisma.request.update({
    where: { id: normalizedRequestId },
    data: {
      archivedAt: null,
      archivedByAdminUserId: null,
      archiveReason: null,
    },
    select: { id: true },
  })

  return { ok: true, data: { requestId: normalizedRequestId } }
}
