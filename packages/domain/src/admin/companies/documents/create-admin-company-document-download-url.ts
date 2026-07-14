import { prisma } from "@esigenta/database"
import { createR2SignedDownloadUrl } from "@esigenta/uploads/r2"

export type CreateAdminCompanyDocumentDownloadUrlErrorCode = "document_not_found"

export type CreateAdminCompanyDocumentDownloadUrlResult =
  | { ok: true; downloadUrl: string }
  | { ok: false; code: CreateAdminCompanyDocumentDownloadUrlErrorCode }

const DOWNLOAD_URL_EXPIRES_SECONDS = 5 * 60

/**
 * Admin authentication/authorization is the caller's responsibility (the
 * "use server" action calls requireAdmin() first, same convention as
 * approveCompanyForMarketplace/suspendCompanyForMarketplace) — this
 * function only resolves the objectKey and signs a short-lived URL. Never
 * persists the URL, never returns the objectKey itself.
 */
export async function createAdminCompanyDocumentDownloadUrl(
  documentId: string,
): Promise<CreateAdminCompanyDocumentDownloadUrlResult> {
  const document = await prisma.companyDocument.findUnique({
    where: { id: documentId },
    select: { objectKey: true },
  })

  if (!document) {
    return { ok: false, code: "document_not_found" }
  }

  const downloadUrl = await createR2SignedDownloadUrl(
    document.objectKey,
    DOWNLOAD_URL_EXPIRES_SECONDS,
  )

  return { ok: true, downloadUrl }
}
