import {
  PageShell,
} from "@esigenta/ui"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"

import {
  RequestDetailCard,
} from "../components/request-detail-card"
import {
  PendingRequestLink,
} from "../components/request-pending-controls"
import {
  toggleSavedRequestAction,
} from "../actions/toggle-saved-request-action"

import {
  contactCustomerAction,
  createRefundRequestAction,
  unlockRequestAction,
} from "../actions/request-detail-actions"
import { formatDate } from "../view-models/request-detail-view-model"
import {
  requireFullRequestDetailPageData,
} from "./load-request-detail"

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
  const [{ id }, resolvedSearchParams, actor] = await Promise.all([
    params,
    searchParams,
    requireAreaImpresaAccess(),
  ])

  const { detail, photos, unlockError } =
    await requireFullRequestDetailPageData({
      actor,
      requestId: id,
      errorParam: resolvedSearchParams.error,
    })

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <div className="mb-6">
        <PendingRequestLink
          href="/area-impresa/richieste"
          pendingChildren="Ritorno alle richieste..."
          className="text-sm font-medium text-eg-text-muted transition-colors hover:text-eg-ink"
        >
          &larr; Nuove richieste
        </PendingRequestLink>
      </div>

      <RequestDetailCard
        unlockError={unlockError}
        requestCode={detail.requestCode}
        title={detail.title}
        city={detail.location.city}
        province={detail.location.province}
        postalCode={detail.location.postalCode}
        createdAt={formatDate(detail.createdAt)}
        description={detail.description}
        formDetails={detail.formDetails}
        photos={photos}
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
        savedAction={toggleSavedRequestAction}
        creditCost={detail.commercialState.creditCost}
        creditBalance={detail.creditBalance}
        maxUnlocks={detail.commercialState.maxUnlocks}
        unlockCount={detail.commercialState.unlockCount}
        hasUnlocked={detail.hasUnlocked}
        requestUnlockId={detail.requestUnlockId}
        unlockedAt={
          detail.unlockedAt
            ? formatDate(detail.unlockedAt)
            : null
        }
        unlockAction={unlockRequestAction}
        contactCustomerAction={
          detail.permissions.canContactCustomer ? contactCustomerAction : undefined
        }
        refundRequestAction={createRefundRequestAction}
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
                createdAt: formatDate(
                  detail.refundState.refundRequest.createdAt,
                ),
              }
            : null
        }
      />
    </PageShell>
  )
}
