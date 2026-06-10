import {
  notFound,
} from "next/navigation"

import {
  PageShell,
} from "@esigenta/ui"

import {
  getAvailableRequestForCompanyDetail,
  listAttachedRequestPhotos,
} from "@esigenta/db"

import {
  createRequestPhotoDisplayItems,
} from "@esigenta/uploads/server"

import {
  requireCompanyActor,
} from "../../../../../auth/server"

import {
  RequestDetailCard,
} from "../../_components/request-detail-card"
import {
  PendingRequestLink,
} from "../../_components/request-pending-controls"
import {
  createPerfTrace,
} from "../../_lib/perf-log"
import {
  toggleSavedRequestAction,
} from "../actions"

import {
  contactCustomerAction,
  createRefundRequestAction,
  unlockRequestAction,
} from "./actions"
import {
  buildRequestDetailViewModel,
  formatDate,
} from "./view-model"

export const dynamic = "force-dynamic"

type RequestDetailPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    error?: string | string[]
    unlocked?: string | string[]
  }>
}

export default async function RequestDetailPage({
  params,
  searchParams,
}: RequestDetailPageProps) {
  const trace = createPerfTrace({
    scope: "request-detail",
  })
  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  const actor = await trace.measure("actor", () =>
    requireCompanyActor(),
  )

  const visibility = await getAvailableRequestForCompanyDetail({
    companyId: actor.company.id,
    requestId: id,
    recordPerf: trace.add,
  })

  if (!visibility.ok || !visibility.request) {
    trace.finish({
      requestId: id,
      status: "not-found",
    })
    notFound()
  }

  const request = visibility.request
  const attachedPhotos = await trace.measure("attachments-db", () =>
    listAttachedRequestPhotos(request.id),
  )
  const photos = await trace.measure("uploadthing-sign", () =>
    createRequestPhotoDisplayItems(attachedPhotos),
  )
  const viewModel = trace.measureSync("render-final", () =>
    buildRequestDetailViewModel({
      request,
      error: resolvedSearchParams.error,
    }),
  )

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
          className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
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
        requestId={visibility.request.id}
        isSaved={visibility.request.isSaved}
        savedAction={toggleSavedRequestAction}
        creditCost={request.creditCost}
        maxUnlocks={request.maxUnlocks}
        unlockCount={request.unlockCount}
        hasUnlocked={viewModel.hasUnlocked}
        requestUnlockId={visibility.request.requestUnlockId}
        unlockedAt={
          visibility.request.unlockedAt
            ? formatDate(visibility.request.unlockedAt)
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