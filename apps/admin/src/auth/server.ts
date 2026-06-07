import {
  headers,
} from "next/headers"

import {
  requireAdminFromUser,
  requireSuperAdminFromUser,
} from "@esigenta/db"

import {
  getCurrentUserFromHeaders,
  requireUserFromHeaders,
} from "@esigenta/db/auth"

export async function getCurrentAdmin() {
  const user =
    await getCurrentUser()

  if (!user) {
    return null
  }

  return requireAdminFromUser(user)
}

export async function getCurrentUser() {
  return getCurrentUserFromHeaders(
    await headers(),
  )
}

export async function requireUser() {
  return requireUserFromHeaders(
    await headers(),
  )
}

export async function requireAdmin() {
  const user =
    await requireUser()

  return requireAdminFromUser(user)
}

export async function requireSuperAdmin() {
  const user =
    await requireUser()

  return requireSuperAdminFromUser(user)
}
