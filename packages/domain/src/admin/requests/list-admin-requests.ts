import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

import {
  deriveRequestAdminBadge,
  type RequestAdminBadge,
} from "./derive-request-admin-badge"

export type AdminRequestListItem = {
  id: string
  status: RequestStatus
  requestCode: string | null
  interventionSlug: string | null
  city: string | null
  customerName: string | null
  customerEmail: string | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  adminBadge: RequestAdminBadge
}

export type AdminRequestStatusFilter =
  | RequestStatus
  | "ALL"

export type AdminRequestStatusCounts = {
  all: number
  pendingVerification: number
  pendingReview: number
  approved: number
  published: number
  rejected: number
  closed: number
}

/**
 * DRAFT deliberately excluded: pre-submission funnel state, never a row an
 * admin needs to see or act on. Everything else (including
 * PENDING_VERIFICATION, now a real selectable tab) is included in "Tutte".
 */
const allAdminRequestStatuses = [
  "PENDING_VERIFICATION",
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "CLOSED",
] satisfies RequestStatus[]

function isRequestStatus(
  value: string | null | undefined,
): value is RequestStatus {
  return (allAdminRequestStatuses as string[]).includes(
    value ?? "",
  )
}

export function normalizeAdminRequestStatusFilter(
  value: string | null | undefined,
): AdminRequestStatusFilter {
  return isRequestStatus(value)
    ? value
    : "ALL"
}

export type ListAdminRequestsInput = {
  status?: AdminRequestStatusFilter
  search?: string
  /**
   * Default false: archived/deleted requests are hidden from the
   * operational list (D-020). Set true to review them (e.g. before
   * unarchiving/restoring) — there is no dedicated admin view for this yet,
   * so callers must pass the flag explicitly.
   */
  includeArchived?: boolean
  includeDeleted?: boolean
}

function normalizeStatusFilter(
  status: AdminRequestStatusFilter | undefined,
): RequestStatus[] {
  if (!status || status === "ALL") {
    return allAdminRequestStatuses
  }

  return [status]
}

function normalizeSearch(
  search: string | undefined,
): string | null {
  const trimmed = search?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Server-side search only, no client-side filtering of a paginated list.
 * All fields searched are scalar columns on Request itself — no joins, no
 * N+1, translated by Prisma/Postgres into a single ILIKE-based query.
 */
function buildSearchWhere(
  search: string | undefined,
): Prisma.RequestWhereInput {
  const normalized = normalizeSearch(search)

  if (!normalized) {
    return {}
  }

  return {
    OR: [
      { requestCode: { contains: normalized, mode: "insensitive" } },
      { customerName: { contains: normalized, mode: "insensitive" } },
      { customerEmail: { contains: normalized, mode: "insensitive" } },
      { customerPhone: { contains: normalized, mode: "insensitive" } },
      { interventionSlug: { contains: normalized, mode: "insensitive" } },
    ],
  }
}

export async function listAdminRequests({
  status,
  search,
  includeArchived = false,
  includeDeleted = false,
}: ListAdminRequestsInput = {}): Promise<AdminRequestListItem[]> {
  const statuses =
    normalizeStatusFilter(status)

  const requests = await prisma.request.findMany({
    where: {
      status: {
        in: statuses,
      },
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...buildSearchWhere(search),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      status: true,
      requestCode: true,
      interventionSlug: true,
      geoLocation: {
        select: { city: true },
      },
      customerName: true,
      customerEmail: true,
      maxUnlocks: true,
      unlockCount: true,
      createdAt: true,
    },
  })

  return requests.map((request) => ({
    id: request.id,
    status: request.status,
    requestCode: request.requestCode,
    interventionSlug: request.interventionSlug,
    city: request.geoLocation?.city ?? null,
    customerName: request.customerName,
    customerEmail: request.customerEmail,
    maxUnlocks: request.maxUnlocks,
    unlockCount: request.unlockCount,
    createdAt: request.createdAt,
    adminBadge: deriveRequestAdminBadge({
      status: request.status,
      maxUnlocks: request.maxUnlocks,
      unlockCount: request.unlockCount,
    }),
  }))
}

/**
 * Tab counts, unaffected by the current search text (search only narrows
 * the list within a tab — counts represent the overall segment sizes, same
 * convention as getAdminCompanyStatusCounts). 7 lightweight COUNT queries
 * in parallel, no joins — consistent with the existing companies pattern.
 */
export async function getAdminRequestStatusCounts(): Promise<AdminRequestStatusCounts> {
  const baseWhere = {
    archivedAt: null,
    deletedAt: null,
  } satisfies Prisma.RequestWhereInput

  const [
    all,
    pendingVerification,
    pendingReview,
    approved,
    published,
    rejected,
    closed,
  ] = await Promise.all([
    prisma.request.count({
      where: { ...baseWhere, status: { in: allAdminRequestStatuses } },
    }),
    prisma.request.count({
      where: { ...baseWhere, status: "PENDING_VERIFICATION" },
    }),
    prisma.request.count({
      where: { ...baseWhere, status: "PENDING_REVIEW" },
    }),
    prisma.request.count({
      where: { ...baseWhere, status: "APPROVED" },
    }),
    prisma.request.count({
      where: { ...baseWhere, status: "PUBLISHED" },
    }),
    prisma.request.count({
      where: { ...baseWhere, status: "REJECTED" },
    }),
    prisma.request.count({
      where: { ...baseWhere, status: "CLOSED" },
    }),
  ])

  return {
    all,
    pendingVerification,
    pendingReview,
    approved,
    published,
    rejected,
    closed,
  }
}
