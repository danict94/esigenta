import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import { generateUniqueCompanyPublicSlug } from "./generate-company-public-slug"

type PerfRecorder = (label: string, ms: number) => void

const PUBLIC_NAME_MAX = 80
const SHORT_DESCRIPTION_MAX = 240
const FULL_DESCRIPTION_MAX = 2000
const YEARS_OF_EXPERIENCE_MAX = 60

export type UpdateCompanyPublicProfileErrorCode =
  | "invalid_public_name"
  | "invalid_short_description"
  | "invalid_full_description"
  | "invalid_years_of_experience"
  | "company_not_found"

export type UpdateCompanyPublicProfileResult =
  | { ok: true }
  | { ok: false; code: UpdateCompanyPublicProfileErrorCode }

export type UpdateCompanyPublicProfileInput = {
  publicName: string | null
  shortDescription: string | null
  fullDescription: string | null
  yearsOfExperience: string | null
  publicProfileConsent: boolean
}

function normalizeBoundedText(
  raw: string | null,
  maxLength: number,
): string | null | undefined {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  if (trimmed.length > maxLength) return undefined
  return trimmed
}

function normalizeYearsOfExperience(raw: string | null): number | null | undefined {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  const value = Number(trimmed)
  if (!Number.isInteger(value) || value < 0 || value > YEARS_OF_EXPERIENCE_MAX) {
    return undefined
  }

  return value
}

/**
 * Separate from updateCompanyProfile (website/radius/geo) on purpose — that
 * flow stays untouched. This one owns only the future-vetrina-facing fields
 * plus consent, none of which affect Company.status or any operational
 * gate (isCompanyMarketplaceReady is unaware of all of this).
 */
export async function updateCompanyPublicProfile(
  actor: CompanyActor,
  input: UpdateCompanyPublicProfileInput,
  recordPerf?: PerfRecorder,
): Promise<UpdateCompanyPublicProfileResult> {
  const publicName = normalizeBoundedText(input.publicName, PUBLIC_NAME_MAX)
  if (publicName === undefined) return { ok: false, code: "invalid_public_name" }

  const shortDescription = normalizeBoundedText(
    input.shortDescription,
    SHORT_DESCRIPTION_MAX,
  )
  if (shortDescription === undefined) {
    return { ok: false, code: "invalid_short_description" }
  }

  const fullDescription = normalizeBoundedText(
    input.fullDescription,
    FULL_DESCRIPTION_MAX,
  )
  if (fullDescription === undefined) {
    return { ok: false, code: "invalid_full_description" }
  }

  const yearsOfExperience = normalizeYearsOfExperience(input.yearsOfExperience)
  if (yearsOfExperience === undefined) {
    return { ok: false, code: "invalid_years_of_experience" }
  }

  const t0 = performance.now()

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.company.findUnique({
      where: { id: actor.company.id },
      select: { publicSlug: true, publicProfileConsentAt: true },
    })

    if (!current) return { ok: false as const, code: "company_not_found" as const }

    const publicSlug =
      current.publicSlug ?? (publicName ? await generateUniqueCompanyPublicSlug(publicName, tx) : null)

    const updated = await tx.company.updateMany({
      where: { id: actor.company.id },
      data: {
        publicName,
        publicSlug,
        shortDescription,
        fullDescription,
        yearsOfExperience,
        publicProfileConsentAt: input.publicProfileConsent
          ? (current.publicProfileConsentAt ?? new Date())
          : null,
      },
    })

    if (updated.count === 0) return { ok: false as const, code: "company_not_found" as const }

    return { ok: true as const }
  })

  recordPerf?.("public-profile-update", Math.round(performance.now() - t0))

  return result
}
