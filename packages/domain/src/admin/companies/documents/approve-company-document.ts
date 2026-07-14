import { prisma } from "@esigenta/database"

export type ApproveCompanyDocumentErrorCode = "document_not_found"

export type ApproveCompanyDocumentResult =
  | { ok: true }
  | { ok: false; code: ApproveCompanyDocumentErrorCode }

/**
 * Only ever touches the CompanyDocument row — never Company.status, never
 * marketplace/credit/unlock gates, never triggers a suspension. Admin
 * authorization is the caller's responsibility.
 */
export async function approveCompanyDocument(
  documentId: string,
  adminUserId: string,
  now: Date = new Date(),
): Promise<ApproveCompanyDocumentResult> {
  const updated = await prisma.companyDocument.updateMany({
    where: { id: documentId },
    data: {
      status: "APPROVED",
      reviewedAt: now,
      reviewedByAdminUserId: adminUserId,
      rejectionReason: null,
    },
  })

  if (updated.count === 0) {
    return { ok: false, code: "document_not_found" }
  }

  return { ok: true }
}
