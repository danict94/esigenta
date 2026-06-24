import {
  notFound,
} from "next/navigation"

import {
  PageShell,
} from "@esigenta/ui"

import {
  getCompanyRequestDetailPage,
} from "@esigenta/domain"

import {
  createRequestPhotoDisplayItems,
} from "@esigenta/uploads/server"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../platform/monitoring/area-monitoring"

import {
  RequestDetailCard,
} from "../components/request-detail-card"
import {
  PendingRequestLink,
} from "../components/request-pending-controls"
import {
  createPerfTrace,
} from "../../../monitoring/area-impresa-perf-trace"
import {
  toggleSavedRequestAction,
} from "../actions/toggle-saved-request-action"

import {
  contactCustomerAction,
  createRefundRequestAction,
  unlockRequestAction,
} from "../actions/request-detail-actions"
import {
  buildRequestDetailViewModel,
  formatDate,
} from "../view-models/request-detail-view-model"

export type RequestDetailPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    error?: string | string[]
    unlocked?: string | string[]
  }>
}

export async function RequestDetailPage({
  params,
  searchParams,
}: RequestDetailPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  const trace = createPerfTrace({
    scope: "request-detail",
  })
  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  if (monitored) {
    areaLog("area.model.requestDetail.start", {
      requestIdSafe: shortId(id),
    })
  }

  const authStart = areaTimestamp()
  const actor = await trace.measure("actor", () =>
    requireAreaImpresaAccess(),
  )
  const authMs = Math.round(areaTimestamp() - authStart)

  const detailStart = areaTimestamp()
  const pageData = await getCompanyRequestDetailPage(
    actor,
    id,
    trace.add,
  )
  const detailMs = Math.round(areaTimestamp() - detailStart)

  if (!pageData.ok) {
    if (monitored) {
      areaLog("area.model.requestDetail.end", {
        requestIdSafe: shortId(id),
        result: "not-found",
        durationMs: Math.round(areaTimestamp() - pageStart),
        authMs,
        detailMs,
      })
    }
    trace.finish({
      requestId: id,
      status: "not-found",
    })
    notFound()
  }

  const request = pageData.request
  const photos = await trace.measure("uploadthing-sign", () =>
    createRequestPhotoDisplayItems(pageData.photos),
  )
  const viewModel = trace.measureSync("render-final", () =>
    buildRequestDetailViewModel({
      request,
      error: resolvedSearchParams.error,
    }),
  )

  if (monitored) {
    areaLog("area.model.requestDetail.end", {
      requestIdSafe: shortId(id),
      result: "ok",
      hasUnlocked: viewModel.hasUnlocked,
      durationMs: Math.round(areaTimestamp() - pageStart),
      authMs,
      detailMs,
    })
  }

  trace.finish({
    requestId: id,
    status: "ok",
  })

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <div className="mb-6">
        <PendingRequestLink
          href="/area-impresa/richieste"
          pendingChildren="Ritorno alle richieste..."
          className="text-sm font-medium text-cantiere-ink-secondary transition-colors hover:text-cantiere-ink"
        >
          &larr; Nuove richieste
        </PendingRequestLink>
      </div>

      <RequestDetailCard
        unlockError={viewModel.unlockError}
        requestCode={request.requestCode}
        title={viewModel.title}
        city={request.city}
        province={viewModel.province}
        postalCode={request.postalCode}
        createdAt={formatDate(request.createdAt)}
        description={viewModel.description}
        formDetails={viewModel.formDetails}
        photos={photos}
        {...(viewModel.hasUnlocked
          ? {
              customerContact: {
                name: viewModel.customerContact?.name ?? null,
                email: viewModel.customerContact?.email ?? null,
                phone: viewModel.customerContact?.phone ?? null,
              },
            }
          : {})}
        requestId={request.id}
        isSaved={request.isSaved}
        savedAction={toggleSavedRequestAction}
        creditCost={request.creditCost}
        maxUnlocks={request.maxUnlocks}
        unlockCount={request.unlockCount}
        hasUnlocked={viewModel.hasUnlocked}
        requestUnlockId={request.requestUnlockId}
        unlockedAt={
          request.unlockedAt
            ? formatDate(request.unlockedAt)
            : null
        }
        unlockAction={unlockRequestAction}
        contactCustomerAction={
          viewModel.hasUnlocked ? contactCustomerAction : undefined
        }
        refundRequestAction={createRefundRequestAction}
        requestUnlockRefundedAt={
          viewModel.requestUnlockRefundState?.refundedAt
            ? formatDate(viewModel.requestUnlockRefundState.refundedAt)
            : null
        }
        requestUnlockRefundTransactionId={
          viewModel.requestUnlockRefundState?.refundTransactionId ?? null
        }
        refundRequest={
          viewModel.requestUnlockRefundState?.refundRequest
            ? {
                id: viewModel.requestUnlockRefundState.refundRequest.id,
                status: viewModel.requestUnlockRefundState.refundRequest.status,
                createdAt: formatDate(
                  viewModel.requestUnlockRefundState.refundRequest.createdAt,
                ),
              }
            : null
        }
      />
    </PageShell>
  )
}
