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
  /**
   * Default false: archived/deleted requests are hidden from the
   * operational list (D-020). Set true to review them (e.g. before
   * unarchiving/restoring) — there is no dedicated admin view for this yet,
   * so callers must pass the flag explicitly.
   */
  includeArchived?: boolean
  includeDeleted?: boolean
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
  includeArchived = false,
  includeDeleted = false,
}: ListAdminRequestsInput = {}): Promise<AdminRequestListItem[]> {
  const statuses =
    normalizeStatusFilter(status)

  return prisma.request.findMany({
    where: {
      status: {
        in: statuses,
      },
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(includeDeleted ? {} : { deletedAt: null }),
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
