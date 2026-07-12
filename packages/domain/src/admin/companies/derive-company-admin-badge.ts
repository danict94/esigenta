import type { CompanyStatus } from "@prisma/client"

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
 * THE single source of truth for the admin "Stato" pill on a company row —
 * pure UX derivation, never written to Company, never consulted by any
 * operational gate (isCompanyMarketplaceReady, credit purchase, unlock all
 * remain unaware of this).
 *
 * Status-only (Phase 8.G): profile completeness moved to its own separate
 * "Profilo" column/pill, computed directly from
 * deriveCompanyProfileCompleteness where the row is built — so this
 * function no longer conflates "is the company approved" with "is its
 * profile complete," which used to make APPROVED companies show
 * "Completa"/"Incompleta" instead of a real status label.
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
}: {
  status: CompanyStatus
  statusChangeReason: string | null
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
  return {
    color: "green",
    label: "Approvata",
    severity: "ok",
    reasons: [],
  }
}
