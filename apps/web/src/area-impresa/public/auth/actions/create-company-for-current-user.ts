import {
  createCompanyForUser,
} from "@esigenta/auth"
import type {
  CreateCompanyProfileInput,
} from "@esigenta/auth"

import {
  requireUser,
} from "../../../../auth/server"

export type CreateCompanyForCurrentUserInput = {
  initialCategorySlug?: string
  company: CreateCompanyProfileInput
}

export type CreateCompanyForCurrentUserResult =
  Awaited<
    ReturnType<
      typeof createCompanyForUser
    >
  >

export async function createCompanyForCurrentUser({
  company,
  initialCategorySlug,
}: CreateCompanyForCurrentUserInput): Promise<CreateCompanyForCurrentUserResult> {
  const user =
    await requireUser()

  return createCompanyForUser({
    userId:
      user.id,
    company,
    initialCategorySlug,
  })
}
