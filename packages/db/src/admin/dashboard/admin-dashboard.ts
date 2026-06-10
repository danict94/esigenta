import type {
  CompanyStatus,
  RequestStatus,
} from "@prisma/client"

import { prisma } from "../../prisma/client"

import {
  countUnreadAdminConversations,
} from "../../conversations"

export type AdminDashboardMetrics = {
  pendingRequests: number
  totalRequests: number
  publishedRequests: number
  incompletePublishedRequests: number
  activeCompanies: number
  approvedCompanies: number
  pendingCompanyReviews: number
  pendingCreditRefundRequests: number
  pendingCompanyContactChangeRequests: number
  unreadSupportConversations: number
  paidCreditOrders: number
  failedCreditOrders: number
  requestStatusCounts: Record<RequestStatus, number>
  companyStatusCounts: Record<CompanyStatus, number>
}

const requestStatuses: RequestStatus[] = [
  "DRAFT",
  "PENDING_VERIFICATION",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "PUBLISHED",
  "CLOSED",
]

const companyStatuses: CompanyStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "SUSPENDED",
  "BLOCKED",
]

function emptyStatusCounts<T extends string>(
  statuses: T[],
): Record<T, number> {
  return statuses.reduce(
    (counts, status) => {
      counts[status] = 0
      return counts
    },
    {} as Record<T, number>,
  )
}

export async function getAdminDashboardMetrics({
  userId,
}: {
  userId: string
}): Promise<AdminDashboardMetrics> {
  const [
    pendingRequests,
    totalRequests,
    publishedRequests,
    incompletePublishedRequests,
    activeCompanies,
    approvedCompanies,
    pendingCompanyReviews,
    pendingCreditRefundRequests,
    pendingCompanyContactChangeRequests,
    unreadSupportResult,
    paidCreditOrders,
    failedCreditOrders,
    requestStatusGroups,
    companyStatusGroups,
  ] = await Promise.all([
    prisma.request.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),
    prisma.request.count(),
    prisma.request.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.request.count({
      where: {
        status: {
          in: [
            "APPROVED",
            "PUBLISHED",
          ],
        },
        OR: [
          {
            creditCost: null,
          },
          {
            creditCost: {
              lt: 1,
            },
          },
          {
            maxUnlocks: null,
          },
          {
            maxUnlocks: {
              lt: 1,
            },
          },
        ],
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
        status: "APPROVED",
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
        status: "PENDING_REVIEW",
      },
    }),
    prisma.creditRefundRequest.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),
    prisma.companyContactChangeRequest.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),
    countUnreadAdminConversations({
      userId,
    }),
    prisma.creditOrder.count({
      where: {
        status: "PAID",
      },
    }),
    prisma.creditOrder.count({
      where: {
        status: "FAILED",
      },
    }),
    prisma.request.groupBy({
      by: [
        "status",
      ],
      _count: {
        _all: true,
      },
    }),
    prisma.company.groupBy({
      by: [
        "status",
      ],
      where: {
        isActive: true,
        deletedAt: null,
      },
      _count: {
        _all: true,
      },
    }),
  ])

  const requestStatusCounts =
    emptyStatusCounts(requestStatuses)
  const companyStatusCounts =
    emptyStatusCounts(companyStatuses)

  for (const group of requestStatusGroups) {
    requestStatusCounts[group.status] =
      group._count._all
  }

  for (const group of companyStatusGroups) {
    companyStatusCounts[group.status] =
      group._count._all
  }

  return {
    pendingRequests,
    totalRequests,
    publishedRequests,
    incompletePublishedRequests,
    activeCompanies,
    approvedCompanies,
    pendingCompanyReviews,
    pendingCreditRefundRequests,
    pendingCompanyContactChangeRequests,
    unreadSupportConversations:
      unreadSupportResult.ok
        ? unreadSupportResult.count
        : 0,
    paidCreditOrders,
    failedCreditOrders,
    requestStatusCounts,
    companyStatusCounts,
  }
}
