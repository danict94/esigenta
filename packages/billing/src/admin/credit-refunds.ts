import type {
  CreditRefundRequestReason,
  CreditRefundRequestStatus,
  RequestStatus,
} from "@prisma/client"
import {
  Prisma,
} from "@prisma/client"

import { prisma } from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

import type {
  CreditLedgerResult,
} from "./credit-ledger"
import {
  refundCompanyCreditsForRequestUnlockInTransaction,
} from "./credit-ledger"

export type AdminCreditRefundRequestReviewItem = {
  id: string
  status: CreditRefundRequestStatus
  reason: CreditRefundRequestReason
  description: string
  companyContactAttempted: boolean
  lastContactAttemptAt: Date | null
  createdAt: Date
  requestUnlock: {
    id: string
    createdAt: Date
    creditCost: number
    refundedAt: Date | null
  }
  company: {
    id: string
    name: string
  }
  request: {
    id: string
    requestCode: string | null
    city: string | null
    interventionSlug: string | null
    status: RequestStatus
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
  }
  companyRefundRequestsLast30Days: number
  companyApprovedRefundRequestsLast30Days: number
  companyRejectedRefundRequestsLast30Days: number
  reviewedAt: Date | null
  adminNotes: string | null
  reviewedByAdminUser: {
    id: string
    email: string
    name: string | null
  } | null
}

export type ApproveCreditRefundRequestInput = {
  creditRefundRequestId: string
  adminUserId: string
  adminNotes?: string | null
}

export type RejectCreditRefundRequestInput = {
  creditRefundRequestId: string
  adminUserId: string
  adminNotes: string
}

export type ReviewCreditRefundRequestData = {
  creditRefundRequestId: string
  status: CreditRefundRequestStatus
}

export async function approveCreditRefundRequest({
  creditRefundRequestId,
  adminUserId,
  adminNotes,
}: ApproveCreditRefundRequestInput): Promise<
  CreditLedgerResult<ReviewCreditRefundRequestData>
> {
  const normalizedCreditRefundRequestId =
    normalizeRequiredText(
      creditRefundRequestId,
    )
  const normalizedAdminUserId =
    normalizeRequiredText(adminUserId)
  const normalizedAdminNotes =
    adminNotes
      ? normalizeRequiredText(adminNotes)
      : null

  if (!normalizedCreditRefundRequestId) {
    return {
      ok: false,
      code: "invalid_credit_refund_request_id",
      message:
        "Richiesta rimborso non valida.",
    }
  }

  if (!normalizedAdminUserId) {
    return {
      ok: false,
      code: "invalid_admin_user_id",
      message: "Admin non valido.",
    }
  }

  const now =
    new Date()

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "CreditRefundRequest"
        WHERE "id" = ${normalizedCreditRefundRequestId}
        FOR UPDATE
      `

      const refundRequest =
        await tx.creditRefundRequest.findUnique({
          where: {
            id: normalizedCreditRefundRequestId,
          },
          select: {
            id: true,
            status: true,
            requestUnlockId: true,
            reason: true,
          },
        })

      if (!refundRequest) {
        return {
          ok: false as const,
          code: "credit_refund_request_not_found",
          message:
            "Richiesta rimborso non trovata.",
        }
      }

      if (
        refundRequest.status !==
        "PENDING_REVIEW"
      ) {
        return {
          ok: false as const,
          code: "credit_refund_request_not_pending",
          message:
            "Questa pratica non è più in revisione.",
        }
      }

      const ledgerResult =
        await refundCompanyCreditsForRequestUnlockInTransaction(
          tx,
          {
            requestUnlockId:
              refundRequest.requestUnlockId,
            adminUserId:
              normalizedAdminUserId,
            reason:
              normalizedAdminNotes ??
              `Rimborso approvato: ${refundRequest.reason}`,
            now,
          },
        )

      if (!ledgerResult.ok) {
        return ledgerResult
      }

      await tx.creditRefundRequest.update({
        where: {
          id: refundRequest.id,
        },
        data: {
          status: "APPROVED",
          reviewedAt: now,
          reviewedByAdminUserId:
            normalizedAdminUserId,
          adminNotes:
            normalizedAdminNotes,
        },
      })

      return {
        ok: true as const,
        data: {
          creditRefundRequestId:
            refundRequest.id,
          status: "APPROVED" as const,
        },
      }
    })
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        code: "request_unlock_already_refunded",
        message:
          "Questo sblocco è già stato rimborsato.",
      }
    }

    throw error
  }
}

export async function rejectCreditRefundRequest({
  creditRefundRequestId,
  adminUserId,
  adminNotes,
}: RejectCreditRefundRequestInput): Promise<
  CreditLedgerResult<ReviewCreditRefundRequestData>
> {
  const normalizedCreditRefundRequestId =
    normalizeRequiredText(
      creditRefundRequestId,
    )
  const normalizedAdminUserId =
    normalizeRequiredText(adminUserId)
  const normalizedAdminNotes =
    normalizeRequiredText(adminNotes)

  if (!normalizedCreditRefundRequestId) {
    return {
      ok: false,
      code: "invalid_credit_refund_request_id",
      message:
        "Richiesta rimborso non valida.",
    }
  }

  if (!normalizedAdminUserId) {
    return {
      ok: false,
      code: "invalid_admin_user_id",
      message: "Admin non valido.",
    }
  }

  if (
    !normalizedAdminNotes ||
    normalizedAdminNotes.length < 3
  ) {
    return {
      ok: false,
      code: "invalid_admin_notes",
      message:
        "Inserisci una nota admin di almeno 3 caratteri.",
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "CreditRefundRequest"
      WHERE "id" = ${normalizedCreditRefundRequestId}
      FOR UPDATE
    `

    const refundRequest =
      await tx.creditRefundRequest.findUnique({
        where: {
          id: normalizedCreditRefundRequestId,
        },
        select: {
          id: true,
          status: true,
        },
      })

    if (!refundRequest) {
      return {
        ok: false,
        code: "credit_refund_request_not_found",
        message:
          "Richiesta rimborso non trovata.",
      }
    }

    if (
      refundRequest.status !==
      "PENDING_REVIEW"
    ) {
      return {
        ok: false,
        code: "credit_refund_request_not_pending",
        message:
          "Questa pratica non è più in revisione.",
      }
    }

    await tx.creditRefundRequest.update({
      where: {
        id: refundRequest.id,
      },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedByAdminUserId:
          normalizedAdminUserId,
        adminNotes:
          normalizedAdminNotes,
      },
    })

    return {
      ok: true,
      data: {
        creditRefundRequestId:
          refundRequest.id,
        status: "REJECTED",
      },
    }
  })
}

export async function listCreditRefundRequestsForAdminReview(): Promise<
  AdminCreditRefundRequestReviewItem[]
> {
  const refundRequests =
    await prisma.creditRefundRequest.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        reason: true,
        description: true,
        companyContactAttempted: true,
        lastContactAttemptAt: true,
        reviewedAt: true,
        adminNotes: true,
        createdAt: true,
        reviewedByAdminUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        requestUnlock: {
          select: {
            id: true,
            createdAt: true,
            creditCost: true,
            refundedAt: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        request: {
          select: {
            id: true,
            requestCode: true,
            city: true,
            interventionSlug: true,
            status: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
          },
        },
      },
    })

  const companyIds = [
    ...new Set(
      refundRequests.map(
        (refundRequest) =>
          refundRequest.company.id,
      ),
    ),
  ]

  const last30Days =
    new Date(
      Date.now() -
        30 * 24 * 60 * 60 * 1000,
    )

  const groupedCounts =
    companyIds.length > 0
      ? await prisma.creditRefundRequest.groupBy({
          by: [
            "companyId",
            "status",
          ],
          where: {
            companyId: {
              in: companyIds,
            },
            createdAt: {
              gte: last30Days,
            },
          },
          _count: {
            _all: true,
          },
        })
      : []

  const countsByCompany =
    new Map<
      string,
      {
        total: number
        approved: number
        rejected: number
      }
    >()

  for (const count of groupedCounts) {
    const current =
      countsByCompany.get(
        count.companyId,
      ) ?? {
        total: 0,
        approved: 0,
        rejected: 0,
      }

    current.total +=
      count._count._all

    if (count.status === "APPROVED") {
      current.approved +=
        count._count._all
    }

    if (count.status === "REJECTED") {
      current.rejected +=
        count._count._all
    }

    countsByCompany.set(
      count.companyId,
      current,
    )
  }

  return refundRequests.map(
    (refundRequest) => {
      const counts =
        countsByCompany.get(
          refundRequest.company.id,
        ) ?? {
          total: 0,
          approved: 0,
          rejected: 0,
        }

      return {
        ...refundRequest,
        companyRefundRequestsLast30Days:
          counts.total,
        companyApprovedRefundRequestsLast30Days:
          counts.approved,
        companyRejectedRefundRequestsLast30Days:
          counts.rejected,
      }
    },
  )
}
