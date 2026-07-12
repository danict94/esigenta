import type { CompanyStatus } from "@prisma/client"

import { isCompanyMarketplaceReady } from "@esigenta/auth"

export type CompanyRequestAccessMode =
  | "full"
  | "preview_locked"
  | "blocked"

export type CompanyRequestAccess = {
  mode: CompanyRequestAccessMode
  canViewRequestPreview: boolean
  canViewRequestDetails: boolean
  canSaveRequests: boolean
  canUnlockRequests: boolean
  canBuyCredits: boolean
  canReceiveRequestNotifications: boolean
}

export type CompanyRequestAccessState = {
  status: CompanyStatus
  isActive: boolean
  deletedAt: Date | null
}

const blockedAccess: CompanyRequestAccess = {
  mode: "blocked",
  canViewRequestPreview: false,
  canViewRequestDetails: false,
  canSaveRequests: false,
  canUnlockRequests: false,
  canBuyCredits: false,
  canReceiveRequestNotifications: false,
}

/**
 * Read/UI orchestration policy only. Sensitive use cases keep enforcing their
 * own server-side marketplace gates; this does not replace them.
 */
export function deriveCompanyRequestAccess(
  company: CompanyRequestAccessState,
): CompanyRequestAccess {
  if (
    !company.isActive ||
    company.deletedAt !== null
  ) {
    return blockedAccess
  }

  if (isCompanyMarketplaceReady(company)) {
    return {
      mode: "full",
      canViewRequestPreview: true,
      canViewRequestDetails: true,
      canSaveRequests: true,
      canUnlockRequests: true,
      canBuyCredits: true,
      canReceiveRequestNotifications: true,
    }
  }

  if (company.status === "PENDING_REVIEW") {
    return {
      mode: "preview_locked",
      canViewRequestPreview: true,
      canViewRequestDetails: false,
      canSaveRequests: false,
      canUnlockRequests: false,
      canBuyCredits: false,
      canReceiveRequestNotifications: false,
    }
  }

  return blockedAccess
}
