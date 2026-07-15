import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import type { CompanyActor } from "@esigenta/auth"
import { isCompanyMarketplaceReady } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import { resolveCompanyRequestDetailCore } from "./resolve-request-detail-core"

export type ToggleCompanySavedRequestResult =
  | {
      ok: true
      saved: boolean
    }
  | {
      ok: false
      code: string
      message: string
    }

export type CompanySavedRequestListItem = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  structuredData: Prisma.JsonValue | null
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  savedAt: Date
  hasUnlocked: boolean
  requestUnlockId: string | null
  unlockedAt: Date | null
  isSaved: boolean
}

export type CompanyUnlockedRequestListItem = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  structuredData: Prisma.JsonValue | null
  creditCost: number
  requestCreditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  hasUnlocked: true
  requestUnlockId: string
  unlockedAt: Date
  refundedAt: Date | null
  isSaved: boolean
}

function normalizeRequiredId(value: string, fieldName: string) {
  const normalized = value.trim()

  if (!normalized) {
    return {
      ok: false as const,
      code: `missing_${fieldName}`,
      message:
        fieldName === "companyId"
          ? "Impresa non valida."
          : "Richiesta non valida.",
    }
  }

  return {
    ok: true as const,
    value: normalized,
  }
}

export async function toggleCompanySavedRequest({
  actor,
  requestId,
}: {
  actor: CompanyActor
  requestId: string
}): Promise<ToggleCompanySavedRequestResult> {
  if (!isCompanyMarketplaceReady(actor.company)) {
    return {
      ok: false,
      code: "company_not_approved",
      message:
        "Il profilo impresa deve essere approvato per salvare richieste.",
    }
  }

  const normalizedCompanyId =
    normalizeRequiredId(
      actor.company.id,
      "companyId",
    )

  if (!normalizedCompanyId.ok) {
    return normalizedCompanyId
  }

  const normalizedRequestId =
    normalizeRequiredId(requestId, "requestId")

  if (!normalizedRequestId.ok) {
    return normalizedRequestId
  }

  const visibleRequest =
    await resolveCompanyRequestDetailCore(
      actor,
      normalizedRequestId.value,
    )

  if (!visibleRequest.ok) {
    return {
      ok: false,
      code: "request_not_visible",
      message:
        "Questa richiesta non è disponibile per l'impresa.",
    }
  }

  const existing =
    await prisma.companySavedRequest.findUnique({
      where: {
        companyId_requestId: {
          companyId: normalizedCompanyId.value,
          requestId: normalizedRequestId.value,
        },
      },
      select: {
        companyId: true,
      },
    })

  if (existing) {
    await prisma.companySavedRequest.delete({
      where: {
        companyId_requestId: {
          companyId: normalizedCompanyId.value,
          requestId: normalizedRequestId.value,
        },
      },
    })

    return {
      ok: true,
      saved: false,
    }
  }

  await prisma.companySavedRequest.create({
    data: {
      companyId: normalizedCompanyId.value,
      requestId: normalizedRequestId.value,
    },
  })

  return {
    ok: true,
    saved: true,
  }
}
