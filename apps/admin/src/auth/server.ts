import {
  headers,
} from "next/headers"

import {
  requireAdminFromUser,
  getCurrentUserFromHeaders,
  requireUserFromHeaders,
} from "@esigenta/auth"

async function getCurrentUser() {
  return getCurrentUserFromHeaders(
    await headers(),
  )
}

async function requireUser() {
  return requireUserFromHeaders(
    await headers(),
  )
}

export async function requireAdmin() {
  const user =
    await requireUser()

  return requireAdminFromUser(user)
}
