import type { CompanyStatus } from "@prisma/client"

import {
  companyProfileCompletenessFieldLabels,
  type CompanyProfileCompleteness,
} from "../../company/profile/derive-company-profile-completeness"

export type CompanyAdminBadgeColor =
  | "green"
  | "orange"
  | "yellow"
  | "red"
  | "gray"

export type CompanyAdminBadgeSeverity =
  | "ok"
  | "warning"
  | "danger"
  | "neutral"

export type CompanyAdminBadge = {
  color: CompanyAdminBadgeColor
  label: string
  reasons: string[]
  severity: CompanyAdminBadgeSeverity
}

/**
 * THE single source of truth for the admin "traffic light" on a company row
 * — pure UX derivation, never written to Company, never consulted by any
 * operational gate (isCompanyMarketplaceReady, credit purchase, unlock all
 * remain unaware of this). Reuses deriveCompanyProfileCompleteness's output
 * rather than re-deriving completeness itself.
 *
 * SUSPENDED is orange (not red) deliberately, to keep the same visual
 * distinction the admin list already made before this badge existed
 * (SUSPENDED = warning, BLOCKED = danger) — suspended is reversible and
 * less severe than blocked.
 *
 * "yellow" exists in the color type for forward compatibility with a
 * future document-verification badge (Phase 8.A's conceptual model), but
 * no branch below produces it yet — there is nothing to verify today.
 */
export function deriveCompanyAdminBadge({
  status,
  statusChangeReason,
  profileCompleteness,
}: {
  status: CompanyStatus
  statusChangeReason: string | null
  profileCompleteness: CompanyProfileCompleteness
}): CompanyAdminBadge {
  if (status === "BLOCKED") {
    return {
      color: "red",
      label: "Bloccata",
      severity: "danger",
      reasons: statusChangeReason ? [statusChangeReason] : [],
    }
  }

  if (status === "SUSPENDED") {
    return {
      color: "orange",
      label: "Sospesa",
      severity: "warning",
      reasons: statusChangeReason ? [statusChangeReason] : [],
    }
  }

  if (status === "PENDING_REVIEW") {
    return {
      color: "gray",
      label: "Da approvare",
      severity: "neutral",
      reasons: ["In attesa di verifica admin"],
    }
  }

  // APPROVED
  if (profileCompleteness.isComplete) {
    return {
      color: "green",
      label: "Operativa e completa",
      severity: "ok",
      reasons: [],
    }
  }

  return {
    color: "orange",
    label: "Operativa, profilo incompleto",
    severity: "warning",
    reasons: profileCompleteness.missing.map(
      (field) => companyProfileCompletenessFieldLabels[field],
    ),
  }
}
