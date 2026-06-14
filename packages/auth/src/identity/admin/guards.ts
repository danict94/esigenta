import type {
  AdminRole,
} from "@prisma/client"

import {
  prisma,
} from "@esigenta/database"

export type AdminProfileForUser = {
  id: string
  userId: string
  role: AdminRole
}

export class AdminAuthorizationError extends Error {
  constructor(message = "Admin authorization required.") {
    super(message)
    this.name =
      "AdminAuthorizationError"
  }
}

export async function getAdminProfileForUser(
  userId: string,
): Promise<AdminProfileForUser | null> {
  return prisma.adminProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
      role: true,
    },
  })
}

export async function requireAdminFromUser(
  user: {
    id: string
  },
): Promise<AdminProfileForUser> {
  const adminProfile =
    await getAdminProfileForUser(user.id)

  if (!adminProfile) {
    throw new AdminAuthorizationError()
  }

  return adminProfile
}

export async function requireSuperAdminFromUser(
  user: {
    id: string
  },
): Promise<AdminProfileForUser> {
  const adminProfile =
    await requireAdminFromUser(user)

  if (adminProfile.role !== "SUPER_ADMIN") {
    throw new AdminAuthorizationError(
      "Super admin authorization required.",
    )
  }

  return adminProfile
}
