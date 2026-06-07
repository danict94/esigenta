import {
  createCompanyForUser,
} from "@esigenta/db"
import type {
  CreateCompanyProfileInput,
} from "@esigenta/db"

import {
  requireUser,
} from "../../auth/server"

export type CreateCompanyForCurrentUserInput = {
  onboardingCategorySlug?: string
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
  onboardingCategorySlug,
}: CreateCompanyForCurrentUserInput): Promise<CreateCompanyForCurrentUserResult> {
  const user =
    await requireUser()

  return createCompanyForUser({
    userId:
      user.id,
    company,
    onboardingCategorySlug,
  })
}
