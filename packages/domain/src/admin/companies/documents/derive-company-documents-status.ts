import type {
  CompanyDocumentType,
  CompanyDocumentStatus,
  CompanyStatus,
} from "@prisma/client"

import { getRequiredCompanyDocumentTypes } from "../../../company/documents/company-document-requirements"

const DOCUMENT_GRACE_PERIOD_DAYS = 30
const DOCUMENT_SUSPENSION_REVIEW_DAYS = 60

export type CompanyDocumentsStatusSeverity =
  | "ok"
  | "warning"
  | "danger"
  | "neutral"

export type CompanyDocumentsStatus = {
  label: string
  severity: CompanyDocumentsStatusSeverity
  missingRequiredCount: number
  pendingCount: number
  rejectedCount: number
  approvedCount: number
  daysSinceApproval: number | null
  isOverdue: boolean
  recommendedAdminAction: string | null
}

export type DeriveCompanyDocumentsStatusCompany = {
  status: CompanyStatus
  approvedAt: Date | null
}

export type DeriveCompanyDocumentsStatusDocument = {
  documentType: CompanyDocumentType
  status: CompanyDocumentStatus
}

function daysBetween(from: Date, to: Date): number {
  const diffMs = Math.max(0, to.getTime() - from.getTime())
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * THE single source of truth for the admin-facing document signal on a
 * company — pure derivation, never written to Company or CompanyDocument.
 * Company.status remains the only real marketplace gate; this never
 * changes it and is never consulted by isCompanyMarketplaceReady, credit
 * purchase, or unlock. No automatic suspension is ever triggered here —
 * `recommendedAdminAction` is text for a human to read, not an action the
 * system takes.
 *
 * NOT_UPLOADED is never a stored status: a required documentType with no
 * row in `documents` is exactly what missingRequiredCount counts.
 */
export function deriveCompanyDocumentsStatus({
  company,
  documents,
  now = new Date(),
}: {
  company: DeriveCompanyDocumentsStatusCompany
  documents: DeriveCompanyDocumentsStatusDocument[]
  now?: Date
}): CompanyDocumentsStatus {
  const requiredTypes = getRequiredCompanyDocumentTypes()

  const documentsByType = new Map<
    CompanyDocumentType,
    CompanyDocumentStatus
  >(documents.map((document) => [document.documentType, document.status]))

  const missingRequiredCount = requiredTypes.filter(
    (type) => !documentsByType.has(type),
  ).length

  const pendingCount = documents.filter(
    (document) => document.status === "PENDING_REVIEW",
  ).length

  const rejectedCount = documents.filter(
    (document) => document.status === "REJECTED",
  ).length

  const approvedCount = documents.filter(
    (document) => document.status === "APPROVED",
  ).length

  const daysSinceApproval =
    company.status === "APPROVED" && company.approvedAt
      ? daysBetween(company.approvedAt, now)
      : null

  const isOverdue =
    daysSinceApproval !== null &&
    daysSinceApproval >= DOCUMENT_GRACE_PERIOD_DAYS &&
    missingRequiredCount > 0

  const recommendedAdminAction =
    daysSinceApproval !== null &&
    daysSinceApproval >= DOCUMENT_SUSPENSION_REVIEW_DAYS &&
    missingRequiredCount > 0
      ? "Valuta sospensione manuale"
      : null

  if (rejectedCount > 0) {
    return {
      label: "Da correggere",
      severity: "danger",
      missingRequiredCount,
      pendingCount,
      rejectedCount,
      approvedCount,
      daysSinceApproval,
      isOverdue,
      recommendedAdminAction,
    }
  }

  if (pendingCount > 0) {
    return {
      label: "In verifica",
      severity: "neutral",
      missingRequiredCount,
      pendingCount,
      rejectedCount,
      approvedCount,
      daysSinceApproval,
      isOverdue,
      recommendedAdminAction,
    }
  }

  if (missingRequiredCount > 0 && isOverdue) {
    return {
      label: `Mancanti da ${daysSinceApproval} giorni`,
      severity: "warning",
      missingRequiredCount,
      pendingCount,
      rejectedCount,
      approvedCount,
      daysSinceApproval,
      isOverdue,
      recommendedAdminAction,
    }
  }

  if (missingRequiredCount > 0) {
    return {
      label: "Documenti mancanti",
      severity: "warning",
      missingRequiredCount,
      pendingCount,
      rejectedCount,
      approvedCount,
      daysSinceApproval,
      isOverdue,
      recommendedAdminAction,
    }
  }

  return {
    label: "Documenti verificati",
    severity: "ok",
    missingRequiredCount,
    pendingCount,
    rejectedCount,
    approvedCount,
    daysSinceApproval,
    isOverdue,
    recommendedAdminAction,
  }
}
