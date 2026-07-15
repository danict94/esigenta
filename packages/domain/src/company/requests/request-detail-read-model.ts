import type { CompanyActor } from "@esigenta/auth"

import {
  getRequestCommercialState,
  type RequestCommercialState,
} from "../../commercial"
import { deriveCompanyRequestAccess } from "./derive-company-request-access"
import type { ResolvedCompanyRequestDetailCore } from "./resolve-request-detail-core"
import {
  buildRequestDetailViewModel,
  formatInterventionLabel,
  type RequestFormDetail,
} from "./request-detail-view-model"

export type RequestDetailPermissions = {
  canSave: boolean
  canUnlock: boolean
  canContactCustomer: boolean
  canRequestRefund: boolean
}

export type RequestDetailContact = {
  name: string | null
  email: string | null
  phone: string | null
}

export type RequestDetailRefundState = {
  refundedAt: Date | null
  refundTransactionId: string | null
  refundRequest: {
    id: string
    status: string
    createdAt: Date
  } | null
}

export type SharedRequestDetailReadModel = {
  id: string
  requestCode: string | null
  title: string
  description: string | null
  intervention: {
    slug: string | null
    label: string
  }
  location: {
    city: string | null
    province: string | null
    postalCode: string | null
  }
  createdAt: Date
  formDetails: RequestFormDetail[]
  commercialState: RequestCommercialState
  creditBalance: number
  isSaved: boolean
  hasUnlocked: boolean
  requestUnlockId: string | null
  unlockedAt: Date | null
  customerContact: RequestDetailContact | null
  refundState: RequestDetailRefundState | null
  permissions: RequestDetailPermissions
}

export function buildSharedRequestDetailReadModel({
  actor,
  request,
  creditBalance,
}: {
  actor: CompanyActor
  request: ResolvedCompanyRequestDetailCore
  creditBalance: number
}): SharedRequestDetailReadModel {
  const content = buildRequestDetailViewModel({ request })
  const commercialState = getRequestCommercialState(request)
  const access = deriveCompanyRequestAccess(actor.company)
  const hasRefundedUnlock = Boolean(
    request.requestUnlockRefund?.refundedAt ||
      request.requestUnlockRefund?.refundTransactionId,
  )

  return {
    id: request.id,
    requestCode: request.requestCode,
    title: content.title,
    description: content.description,
    intervention: {
      slug: request.interventionSlug,
      label: formatInterventionLabel(request.interventionSlug),
    },
    location: {
      city: request.city,
      province: content.province,
      postalCode: request.postalCode,
    },
    createdAt: request.createdAt,
    formDetails: content.formDetails,
    commercialState,
    creditBalance,
    isSaved: request.isSaved,
    hasUnlocked: request.hasUnlocked,
    requestUnlockId: request.requestUnlockId,
    unlockedAt: request.unlockedAt,
    customerContact: request.customerContact,
    refundState: request.requestUnlockRefund,
    permissions: {
      canSave: access.canSaveRequests,
      canUnlock:
        access.canUnlockRequests &&
        commercialState.isCommerciallyConfigured &&
        !commercialState.isSoldOut &&
        !request.hasUnlocked &&
        commercialState.creditCost !== null &&
        creditBalance >= commercialState.creditCost,
      canContactCustomer:
        request.hasUnlocked && !hasRefundedUnlock,
      canRequestRefund:
        request.hasUnlocked &&
        request.requestUnlockId !== null &&
        !hasRefundedUnlock &&
        !request.requestUnlockRefund?.refundRequest,
    },
  }
}
