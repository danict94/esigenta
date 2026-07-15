import type { CompanyActor } from "@esigenta/auth"

import { deriveCompanyRequestAccess } from "./derive-company-request-access"
import { listCompanyRequestPreviews } from "./list-company-request-previews"
import {
  buildSharedRequestDetailReadModel,
  type RequestDetailContact,
  type RequestDetailPermissions,
  type RequestDetailRefundState,
} from "./request-detail-read-model"
import type { RequestFormDetail } from "./request-detail-view-model"
import { resolveCompanyRequestDetailCore } from "./resolve-request-detail-core"
import type { RequestCommercialState } from "../../commercial"

type PerfRecorder = (operation: string, durationMs: number) => void

export type PanelRequestDetail =
  | {
      access: "full"
      id: string
      requestCode: string | null
      title: string
      description: string | null
      intervention: { slug: string | null; label: string }
      location: {
        city: string | null
        province: string | null
        postalCode: string | null
      }
      createdAt: Date
      immediateDetails: RequestFormDetail[]
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
  | {
      access: "preview_locked"
      id: string
      title: string
      intervention: { slug: string | null; label: string }
      location: { city: string | null }
      createdAt: Date
      permissions: RequestDetailPermissions
    }

export type GetCompanyRequestPanelDetailResult =
  | { ok: true; detail: PanelRequestDetail }
  | { ok: false; code: "not_found"; message: string }

export async function getCompanyRequestPanelDetail(
  actor: CompanyActor,
  requestId: string,
  creditBalance: number,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyRequestPanelDetailResult> {
  const normalizedRequestId = requestId.trim()
  if (!normalizedRequestId) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  const access = deriveCompanyRequestAccess(actor.company)
  if (access.mode === "preview_locked") {
    const previewResult = await listCompanyRequestPreviews(actor)
    const request = previewResult.ok
      ? previewResult.requests.find((item) => item.id === normalizedRequestId)
      : undefined

    if (!request) {
      return { ok: false, code: "not_found", message: "Richiesta non trovata." }
    }

    return {
      ok: true,
      detail: {
        access: "preview_locked",
        id: request.id,
        title: `${request.interventionName}${request.city ? ` a ${request.city}` : ""}`,
        intervention: {
          slug: request.interventionSlug,
          label: request.interventionName,
        },
        location: { city: request.city },
        createdAt: request.createdAt,
        permissions: {
          canSave: false,
          canUnlock: false,
          canContactCustomer: false,
          canRequestRefund: false,
        },
      },
    }
  }

  if (access.mode !== "full") {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  const startedAt = performance.now()
  const coreResult = await resolveCompanyRequestDetailCore(
    actor,
    normalizedRequestId,
    recordPerf,
  )

  recordPerf?.("panel-batch-total", Math.round(performance.now() - startedAt))
  if (!coreResult.ok) return coreResult

  const shared = buildSharedRequestDetailReadModel({
    actor,
    request: coreResult.request,
    creditBalance,
  })

  return {
    ok: true,
    detail: {
      access: "full",
      id: shared.id,
      requestCode: shared.requestCode,
      title: shared.title,
      description: shared.description,
      intervention: shared.intervention,
      location: shared.location,
      createdAt: shared.createdAt,
      immediateDetails: shared.formDetails.slice(0, 6),
      commercialState: shared.commercialState,
      creditBalance: shared.creditBalance,
      isSaved: shared.isSaved,
      hasUnlocked: shared.hasUnlocked,
      requestUnlockId: shared.requestUnlockId,
      unlockedAt: shared.unlockedAt,
      customerContact: shared.customerContact,
      refundState: shared.refundState,
      permissions: shared.permissions,
    },
  }
}
