import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import type { CompanyDocumentStatus, CompanyDocumentType } from "@prisma/client"

import { COMPANY_DOCUMENT_REQUIREMENTS } from "./company-document-requirements"

export type CompanyDocumentPageStatus = CompanyDocumentStatus | "MISSING"

export type CompanyDocumentPageItem = {
  type: CompanyDocumentType
  label: string
  description: string
  requiredByDefault: boolean
  acceptedMimeTypes: readonly string[]
  maxSizeBytes: number
  status: CompanyDocumentPageStatus
  fileName: string | null
  uploadedAt: Date | null
  rejectionReason: string | null
}

export type GetCompanyDocumentsPageResult = {
  documents: CompanyDocumentPageItem[]
}

/**
 * Read-side of the area-impresa documents card: merges the static
 * requirements catalog with whatever rows exist for this company, so a
 * required type with no row renders as "MISSING" — never a DB value.
 */
export async function getCompanyDocumentsPage(
  actor: CompanyActor,
): Promise<GetCompanyDocumentsPageResult> {
  const rows = await prisma.companyDocument.findMany({
    where: { companyId: actor.company.id },
    select: {
      documentType: true,
      status: true,
      fileName: true,
      uploadedAt: true,
      rejectionReason: true,
    },
  })

  const rowsByType = new Map(rows.map((row) => [row.documentType, row]))

  const documents: CompanyDocumentPageItem[] = COMPANY_DOCUMENT_REQUIREMENTS.map(
    (requirement) => {
      const row = rowsByType.get(requirement.type)

      return {
        type: requirement.type,
        label: requirement.label,
        description: requirement.description,
        requiredByDefault: requirement.requiredByDefault,
        acceptedMimeTypes: requirement.acceptedMimeTypes,
        maxSizeBytes: requirement.maxSizeBytes,
        status: row?.status ?? "MISSING",
        fileName: row?.fileName ?? null,
        uploadedAt: row?.uploadedAt ?? null,
        rejectionReason: row?.rejectionReason ?? null,
      }
    },
  )

  return { documents }
}
