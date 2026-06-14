import { prisma } from "@esigenta/database"

export type PendingModerationRequest = {
  id: string
  interventionSlug: string | null
  city: string | null
  customerName: string | null
  createdAt: Date
}

export async function listPendingRequests(): Promise<
  PendingModerationRequest[]
> {
  return prisma.request.findMany({
    where: {
      status: "PENDING_REVIEW",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      interventionSlug: true,
      city: true,
      customerName: true,
      createdAt: true,
    },
  })
}
