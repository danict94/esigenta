import { prisma } from "@esigenta/database"
import type { CompanyDocumentStatus, CompanyDocumentType } from "@prisma/client"

import { COMPANY_DOCUMENT_REQUIREMENTS } from "../../../company/documents/company-document-requirements"

export type AdminCompanyDocumentStatus = CompanyDocumentStatus | "MISSING"

export type AdminCompanyDocumentUser = {
  id: string
  name: string | null
  email: string
}

export type AdminCompanyDocumentItem = {
  id: string | null
  type: CompanyDocumentType
  label: string
  description: string
  requiredByDefault: boolean
  status: AdminCompanyDocumentStatus
  fileName: string | null
  mimeType: string | null
  sizeBytes: number | null
  uploadedAt: Date | null
  uploadedByUser: AdminCompanyDocumentUser | null
  reviewedAt: Date | null
  reviewedByAdminUser: AdminCompanyDocumentUser | null
  rejectionReason: string | null
}

/**
 * Admin-facing read of a company's documents — merges the static
 * requirements catalog with whatever CompanyDocument rows exist, so a
 * required/recommended type with no row renders as "MISSING" (id: null)
 * rather than being omitted. Never returns a signed download URL: that is
 * generated on demand by createAdminCompanyDocumentDownloadUrl, not here.
 */
export async function getAdminCompanyDocuments(
  companyId: string,
): Promise<AdminCompanyDocumentItem[]> {
  const rows = await prisma.companyDocument.findMany({
    where: { companyId },
    select: {
      id: true,
      documentType: true,
      status: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      uploadedAt: true,
      uploadedByUser: {
        select: { id: true, name: true, email: true },
      },
      reviewedAt: true,
      reviewedByAdminUser: {
        select: { id: true, name: true, email: true },
      },
      rejectionReason: true,
    },
  })

  const rowsByType = new Map(rows.map((row) => [row.documentType, row]))

  return COMPANY_DOCUMENT_REQUIREMENTS.map((requirement) => {
    const row = rowsByType.get(requirement.type)

    if (!row) {
      return {
        id: null,
        type: requirement.type,
        label: requirement.label,
        description: requirement.description,
        requiredByDefault: requirement.requiredByDefault,
        status: "MISSING",
        fileName: null,
        mimeType: null,
        sizeBytes: null,
        uploadedAt: null,
        uploadedByUser: null,
        reviewedAt: null,
        reviewedByAdminUser: null,
        rejectionReason: null,
      }
    }

    return {
      id: row.id,
      type: requirement.type,
      label: requirement.label,
      description: requirement.description,
      requiredByDefault: requirement.requiredByDefault,
      status: row.status,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      uploadedAt: row.uploadedAt,
      uploadedByUser: row.uploadedByUser,
      reviewedAt: row.reviewedAt,
      reviewedByAdminUser: row.reviewedByAdminUser,
      rejectionReason: row.rejectionReason,
    }
  })
}
