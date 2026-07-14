import { prisma } from "@esigenta/database"

export type RejectCompanyDocumentErrorCode = "document_not_found" | "invalid_reason"

export type RejectCompanyDocumentResult =
  | { ok: true }
  | { ok: false; code: RejectCompanyDocumentErrorCode }

/**
 * Only ever touches the CompanyDocument row — never Company.status, never
 * marketplace/credit/unlock gates, never triggers a suspension. Reason is
 * mandatory (same 3-character minimum convention as
 * suspendCompanyForMarketplace/blockCompanyForMarketplace). Admin
 * authorization is the caller's responsibility.
 */
export async function rejectCompanyDocument(
  documentId: string,
  adminUserId: string,
  reason: string,
  now: Date = new Date(),
): Promise<RejectCompanyDocumentResult> {
  const normalizedReason = reason.trim()

  if (normalizedReason.length < 3) {
    return { ok: false, code: "invalid_reason" }
  }

  const updated = await prisma.companyDocument.updateMany({
    where: { id: documentId },
    data: {
      status: "REJECTED",
      reviewedAt: now,
      reviewedByAdminUserId: adminUserId,
      rejectionReason: normalizedReason,
    },
  })

  if (updated.count === 0) {
    return { ok: false, code: "document_not_found" }
  }

  return { ok: true }
}
