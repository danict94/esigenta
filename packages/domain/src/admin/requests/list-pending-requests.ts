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
  const requests = await prisma.request.findMany({
    where: {
      status: "PENDING_REVIEW",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      interventionSlug: true,
      geoLocation: {
        select: { city: true },
      },
      customerName: true,
      createdAt: true,
    },
  })

  return requests.map((request) => ({
    id: request.id,
    interventionSlug: request.interventionSlug,
    city: request.geoLocation?.city ?? null,
    customerName: request.customerName,
    createdAt: request.createdAt,
  }))
}
