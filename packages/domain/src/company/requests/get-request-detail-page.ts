import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import { getDistanceKm } from "@esigenta/shared"

import {
  listAttachedRequestPhotos,
} from "../../internal/request/request-photos"
import type { AttachedRequestPhoto } from "../../internal/request/request-photos"

// ─── Public types ─────────────────────────────────────────────────────────────

export type { AttachedRequestPhoto }

export type AvailableCompanyRequestDetail = {
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
  conversationId: string | null
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
}

export type GetCompanyRequestDetailPageResult =
  | {
      ok: true
      request: AvailableCompanyRequestDetail
      photos: AttachedRequestPhoto[]
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

// ─── Type guard ───────────────────────────────────────────────────────────────

function hasFiniteNumber(v: number | null): v is number {
  return typeof v === "number" && Number.isFinite(v)
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function getCompanyRequestDetailPage(
  actor: CompanyActor,
  requestId: string,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyRequestDetailPageResult> {
  const companyId = actor.company.id
  const trimmedRequestId = requestId.trim()

  if (!trimmedRequestId) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  // Marketplace check via actor — resolveCompanyActorFromUser guarantees
  // isActive: true and deletedAt: null, so only status needs checking.
  if (actor.company.status !== "APPROVED") {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  // Parallel batch: lean company geo + request + unlock + photos.
  // No JOINs on company — actor already validated isActive/deletedAt/status.
  const batchStart = performance.now()
  const [company, request, unlock, photos] = await Promise.all([
    // Only geo fields needed — status/isActive/categories not required here
    measureAsync("detail-company-geo", recordPerf, () =>
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          latitude: true,
          longitude: true,
          operatingRadiusKm: true,
        },
      }),
    ),
    measureAsync("detail-request", recordPerf, () =>
      prisma.request.findFirst({
        where: {
          id: trimmedRequestId,
          status: { in: visibleRequestStatuses },
          archivedAt: null,
          deletedAt: null,
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          id: true,
          requestCode: true,
          status: true,
          interventionSlug: true,
          city: true,
          address: true,
          postalCode: true,
          latitude: true,
          longitude: true,
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
          conversations: {
            where: { type: "COMPANY_CUSTOMER" },
            select: { id: true },
            take: 1,
          },
        },
      }),
    ),
    measureAsync("detail-photos", recordPerf, () =>
      listAttachedRequestPhotos(trimmedRequestId),
    ),
  ])
  recordPerf?.("detail-batch-total", Math.round(performance.now() - batchStart))

  if (
    !company ||
    !hasFiniteNumber(company.latitude) ||
    !hasFiniteNumber(company.longitude) ||
    !hasFiniteNumber(company.operatingRadiusKm)
  ) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  if (
    !request ||
    !hasFiniteNumber(request.latitude) ||
    !hasFiniteNumber(request.longitude)
  ) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  // Geo visibility check
  const distanceKm = getDistanceKm({
    fromLatitude: company.latitude,
    fromLongitude: company.longitude,
    toLatitude: request.latitude,
    toLongitude: request.longitude,
  })

  if (distanceKm > company.operatingRadiusKm) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  return {
    ok: true,
    photos,
    request: {
      id: request.id,
      requestCode: request.requestCode,
      status: request.status,
      interventionSlug: request.interventionSlug,
      city: request.city,
      address: request.address,
      postalCode: request.postalCode,
      latitude: request.latitude,
      longitude: request.longitude,
      structuredData: request.structuredData,
      creditCost: request.creditCost,
      maxUnlocks: request.maxUnlocks,
      unlockCount: request.unlockCount,
      createdAt: request.createdAt,
      isSaved: request.savedByCompanies.length > 0,
      hasUnlocked: Boolean(unlock),
      requestUnlockId: unlock?.id ?? null,
      unlockedAt: unlock?.createdAt ?? null,
      conversationId: unlock?.conversations[0]?.id ?? null,
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
