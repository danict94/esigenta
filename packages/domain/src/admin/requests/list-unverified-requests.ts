import { prisma } from "@esigenta/database"

export type AdminUnverifiedRequestItem = {
  id: string
  requestCode: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  createdAt: Date
}

/**
 * The recovery queue for PENDING_VERIFICATION requests (P0): the previous
 * default admin moderation list (listAdminRequests) never includes this
 * status, so without this query a request whose verification email never
 * arrives is invisible to every admin workflow. Oldest first, so the
 * longest-stuck requests surface at the top. See
 * docs/pre-release/PENDING_VERIFICATION_RECOVERY_IMPLEMENTATION.md.
 */
export async function listUnverifiedRequests(): Promise<AdminUnverifiedRequestItem[]> {
  const requests = await prisma.request.findMany({
    where: {
      status: "PENDING_VERIFICATION",
      deletedAt: null,
      archivedAt: null,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      requestCode: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      createdAt: true,
    },
  })

  return requests
}
