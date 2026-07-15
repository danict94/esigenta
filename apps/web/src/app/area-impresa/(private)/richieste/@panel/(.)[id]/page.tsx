import { notFound } from "next/navigation"

import { getCompanyRequestPanelDetail } from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../../../auth/server"
import { createPerfTrace } from "../../../../../../area-impresa/monitoring/area-impresa-perf-trace"
import { toggleSavedRequestAction } from "../../../../../../area-impresa/private/opportunita/actions/toggle-saved-request-action"
import {
  contactCustomerAction,
  createRefundRequestAction,
  unlockRequestAction,
} from "../../../../../../area-impresa/private/opportunita/actions/request-detail-actions"
import { RequestDetailPanel } from "../../../../../../area-impresa/private/opportunita/components/request-detail-panel"
import { RequestPanelOverlay } from "../../../../../../area-impresa/private/opportunita/components/request-panel-overlay"
import {
  formatDate,
  getRequestUnlockError,
} from "../../../../../../area-impresa/private/opportunita/view-models/request-detail-view-model"

export const dynamic = "force-dynamic"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const [{ id }, resolvedSearchParams, actor] = await Promise.all([
    params,
    searchParams,
    requireAreaImpresaAccess(),
  ])
  const trace = createPerfTrace({ scope: "request-panel" })
  const result = await getCompanyRequestPanelDetail(actor, id, trace.add)

  if (!result.ok) {
    trace.finish({ requestId: id, status: "not-found" })
    notFound()
  }

  const detail = result.detail
  trace.finish({ requestId: id, status: "ok", access: detail.access })

  if (detail.access === "preview_locked") {
    return (
      <RequestPanelOverlay>
        <RequestDetailPanel
          title={detail.title}
          intervention={detail.intervention.label}
          city={detail.location.city}
          province={null}
          postalCode={null}
          createdAt={formatDate(detail.createdAt)}
          description={null}
          formDetails={[]}
          photos={[]}
          requestId={detail.id}
          creditCost={null}
          creditBalance={0}
          maxUnlocks={null}
          unlockCount={0}
          hasUnlocked={false}
          restrictedNotice="Dettagli, foto e contatti si sbloccano dopo l'approvazione del profilo. Il costo in crediti sarà visibile a quel punto."
        />
      </RequestPanelOverlay>
    )
  }

  return (
    <RequestPanelOverlay>
      <RequestDetailPanel
        unlockError={getRequestUnlockError(resolvedSearchParams.error)}
        requestCode={detail.requestCode}
        title={detail.title}
        intervention={detail.intervention.label}
        city={detail.location.city}
        province={detail.location.province}
        postalCode={detail.location.postalCode}
        createdAt={formatDate(detail.createdAt)}
        description={detail.description}
        formDetails={detail.immediateDetails}
        photos={[]}
        {...(detail.hasUnlocked
          ? {
              customerContact: {
                name: detail.customerContact?.name ?? null,
                email: detail.customerContact?.email ?? null,
                phone: detail.customerContact?.phone ?? null,
              },
            }
          : {})}
        requestId={detail.id}
        isSaved={detail.isSaved}
        savedAction={detail.permissions.canSave ? toggleSavedRequestAction : undefined}
        creditCost={detail.commercialState.creditCost}
        creditBalance={detail.creditBalance}
        maxUnlocks={detail.commercialState.maxUnlocks}
        unlockCount={detail.commercialState.unlockCount}
        hasUnlocked={detail.hasUnlocked}
        requestUnlockId={detail.requestUnlockId}
        unlockedAt={detail.unlockedAt ? formatDate(detail.unlockedAt) : null}
        unlockAction={detail.permissions.canUnlock ? unlockRequestAction : undefined}
        contactCustomerAction={
          detail.permissions.canContactCustomer ? contactCustomerAction : undefined
        }
        refundRequestAction={
          detail.permissions.canRequestRefund ? createRefundRequestAction : undefined
        }
        requestUnlockRefundedAt={
          detail.refundState?.refundedAt
            ? formatDate(detail.refundState.refundedAt)
            : null
        }
        requestUnlockRefundTransactionId={
          detail.refundState?.refundTransactionId ?? null
        }
        refundRequest={
          detail.refundState?.refundRequest
            ? {
                id: detail.refundState.refundRequest.id,
                status: detail.refundState.refundRequest.status,
                createdAt: formatDate(detail.refundState.refundRequest.createdAt),
              }
            : null
        }
        fullDetailHref={`/area-impresa/richieste/${detail.id}`}
      />
    </RequestPanelOverlay>
  )
}
