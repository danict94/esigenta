import type {
  RequestStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

export type AdminRequestListItem = {
  id: string
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  customerName: string | null
  createdAt: Date
}

export type ListAdminRequestsInput = {
  status?: RequestStatus | RequestStatus[]
}

const defaultAdminRequestStatuses = [
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "CLOSED",
] satisfies RequestStatus[]

function normalizeStatusFilter(
  status: ListAdminRequestsInput["status"],
): RequestStatus[] {
  if (!status) {
    return defaultAdminRequestStatuses
  }

  return Array.isArray(status)
    ? status
    : [status]
}

export async function listAdminRequests({
  status,
}: ListAdminRequestsInput = {}): Promise<AdminRequestListItem[]> {
  const statuses =
    normalizeStatusFilter(status)

  return prisma.request.findMany({
    where: {
      status: {
        in: statuses,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      status: true,
      interventionSlug: true,
      city: true,
      customerName: true,
      createdAt: true,
    },
  })
}
