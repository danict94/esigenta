import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import { getCompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"
import {
  evaluateRequestVisibility,
} from "./request-visibility"

// ─── Public types ─────────────────────────────────────────────────────────────

export type ResolvedCompanyRequestDetailCore = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  structuredData: Prisma.JsonValue | null
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  isSaved: boolean
  hasUnlocked: boolean
  requestUnlockId: string | null
  unlockedAt: Date | null
  customerContact: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
  requestUnlockRefund: {
    refundedAt: Date | null
    refundTransactionId: string | null
    refundRequest: {
      id: string
      status: string
      createdAt: Date
    } | null
  } | null
  createdAt: Date
  photoCount: number
}

export type ResolveCompanyRequestDetailCoreResult =
  | {
      ok: true
      request: ResolvedCompanyRequestDetailCore
    }
  | {
      ok: false
      code: "not_found"
      message: string
    }

// ─── Constants ────────────────────────────────────────────────────────────────

const visibleRequestStatuses: RequestStatus[] = ["APPROVED", "PUBLISHED"]

// ─── Perf helper ─────────────────────────────────────────────────────────────

type PerfRecorder = (operation: string, durationMs: number) => void

async function measureAsync<T>(
  operation: string,
  recordPerf: PerfRecorder | undefined,
  task: () => Promise<T>,
): Promise<T> {
  if (!recordPerf) return task()
  const start = performance.now()
  try {
    return await task()
  } finally {
    recordPerf(operation, Math.round(performance.now() - start))
  }
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────
//
// Visibility is decided in exactly one place — evaluateRequestVisibility
// (request-visibility.ts) — combining the same eligibility computation the
// browse list uses (company-request-eligibility.ts) with this request's
// grants (unlock/save/dispatch). See
// docs/domain-invariants/03_REQUEST_VISIBILITY.md.

export async function resolveCompanyRequestDetailCore(
  actor: CompanyActor,
  requestId: string,
  recordPerf?: PerfRecorder,
): Promise<ResolveCompanyRequestDetailCoreResult> {
  const companyId = actor.company.id
  const trimmedRequestId = requestId.trim()

  if (!trimmedRequestId) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  const batchStart = performance.now()
  const [companySnapshot, request, unlock] = await Promise.all([
    measureAsync("detail-eligibility", recordPerf, () =>
      getCompanyMarketplaceCapabilitySnapshot(companyId),
    ),
    measureAsync("detail-request", recordPerf, () =>
      prisma.request.findFirst({
        where: {
          id: trimmedRequestId,
          status: { in: visibleRequestStatuses },
          archivedAt: null,
          deletedAt: null,
          geoLocationId: { not: null },
        },
        select: {
          id: true,
          requestCode: true,
          status: true,
          interventionId: true,
          interventionSlug: true,
          intervention: {
            select: {
              projectGroupId: true,
            },
          },
          geoLocation: {
            select: {
              city: true,
              formattedAddress: true,
              postalCode: true,
              latitude: true,
              longitude: true,
            },
          },
          structuredData: true,
          creditCost: true,
          maxUnlocks: true,
          unlockCount: true,
          createdAt: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          savedByCompanies: {
            where: { companyId },
            select: { createdAt: true },
            take: 1,
          },
          dispatches: {
            where: { companyId },
            select: { id: true },
            take: 1,
          },
          _count: {
            select: {
              photos: {
                where: { status: "ATTACHED" },
              },
            },
          },
        },
      }),
    ),
    measureAsync("detail-unlock", recordPerf, () =>
      prisma.requestUnlock.findFirst({
        where: { requestId: trimmedRequestId, companyId },
        select: {
          id: true,
          createdAt: true,
          refundedAt: true,
          refundTransactionId: true,
          refundRequest: {
            select: { id: true, status: true, createdAt: true },
          },
        },
      }),
    ),
  ])
  recordPerf?.("detail-core-total", Math.round(performance.now() - batchStart))

  if (!companySnapshot || !request?.geoLocation) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  const hasSaved = request.savedByCompanies.length > 0
  const hasDispatch = request.dispatches.length > 0

  const { visible } = evaluateRequestVisibility({
    companySnapshot,
    request: {
      interventionId: request.interventionId,
      interventionProjectGroupId:
        request.intervention?.projectGroupId ?? null,
      coordinates: request.geoLocation,
    },
    grants: {
      hasUnlock: Boolean(unlock),
      hasSaved,
      hasDispatch,
    },
  })

  if (!visible) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  return {
    ok: true,
    request: {
      id: request.id,
      requestCode: request.requestCode,
      status: request.status,
      interventionSlug: request.interventionSlug,
      city: request.geoLocation.city,
      address: request.geoLocation.formattedAddress,
      postalCode: request.geoLocation.postalCode,
      latitude: request.geoLocation.latitude,
      longitude: request.geoLocation.longitude,
      structuredData: request.structuredData,
      creditCost: request.creditCost,
      maxUnlocks: request.maxUnlocks,
      unlockCount: request.unlockCount,
      createdAt: request.createdAt,
      photoCount: request._count.photos,
      isSaved: hasSaved,
      hasUnlocked: Boolean(unlock),
      requestUnlockId: unlock?.id ?? null,
      unlockedAt: unlock?.createdAt ?? null,
      customerContact: unlock
        ? {
            name: request.customerName,
            email: request.customerEmail,
            phone: request.customerPhone,
          }
        : null,
      requestUnlockRefund: unlock
        ? {
            refundedAt: unlock.refundedAt,
            refundTransactionId: unlock.refundTransactionId,
            refundRequest: unlock.refundRequest,
          }
        : null,
    },
  }
}
