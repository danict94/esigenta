import {
  Prisma,
} from "@prisma/client"

import {
  prisma,
  resolveCategoryBySlugWithClient,
  resolveInterventionsForCategoryIdsWithClient,
  setCompanyLocationWithClient,
  writeCompanyServiceConfigurationWithClient,
} from "@esigenta/database"

import {
  isFreshGeoPlace,
  type GeoPlace,
} from "@esigenta/shared"

import {
  notifyAdminsOfCompanyPendingReview,
} from "./notify-admins-company-pending-review"

const allowedOperatingRadiusKm = [
  10,
  20,
  30,
  50,
  75,
  100,
] as const

async function listExistingCompanyLinksForUser(
  userId: string,
) {
  return prisma.companyMembership.findMany({
    where: {
      userId,
      company: {
        is: {
          isActive: true,
          deletedAt: null,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      companyId: true,
      userId: true,
      role: true,
      company: {
        select: {
          status: true,
        },
      },
    },
  })
}
export type CompanyOperatingRadiusKm =
  (typeof allowedOperatingRadiusKm)[number]

export type CreateCompanyProfileInput = {
  name: string
  vatNumber: string
  phone: string
  website?: string
  geoPlace: GeoPlace
  operatingRadiusKm?: number
}

export type CreateCompanyForUserInput = {
  userId: string
  onboardingCategorySlug?: string
  company: CreateCompanyProfileInput
}

export type CreateCompanyForUserResult =
  | {
      ok: true
      companyId: string
      membershipId: string
    }
  | {
      ok: false
      code: "company_membership_exists"
      companyId: string
      membershipId: string
      message: string
    }
  | {
      ok: false
      code: "company_vat_number_exists"
      message: string
    }
  | {
      ok: false
      code: "invalid_company_category"
      message: string
    }
  | {
      ok: false
      code: "company_category_configuration_unavailable"
      message: string
    }

export class CompanyOnboardingError extends Error {
  code: "invalid_company_profile"

  constructor(message: string) {
    super(message)
    this.name =
      "CompanyOnboardingError"
    this.code =
      "invalid_company_profile"
  }
}

/**
 * Thrown only inside the createCompanyForUser transaction, when the
 * onboarding category preset cannot be applied (unknown slug, or a real
 * Category whose ProjectGroups resolve to zero Intervention rows — a
 * catalog inconsistency, not a user input error). Thrown mid-transaction
 * so Prisma rolls back Company/GeoLocation/CompanyMembership atomically —
 * there is no successful path that leaves a Company without its category
 * preset when a category was requested. Caught below and mapped to a
 * controlled CreateCompanyForUserResult; never leaks past this file.
 */
class CompanyOnboardingCategoryError extends Error {
  code:
    | "invalid_company_category"
    | "company_category_configuration_unavailable"

  constructor(
    code: CompanyOnboardingCategoryError["code"],
    message: string,
  ) {
    super(message)
    this.name =
      "CompanyOnboardingCategoryError"
    this.code = code
  }
}

function normalizeText(
  value: string | undefined,
): string | undefined {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : undefined
}

function normalizeVatNumber(
  value: string | undefined,
): string | undefined {
  const normalized =
    value
      ?.replace(/\s+/g, "")
      .toUpperCase()

  return normalizeText(normalized)
}

function normalizeOperatingRadiusKm(
  value: number | undefined,
): CompanyOperatingRadiusKm {
  if (value === undefined) {
    return 30
  }

  if (
    allowedOperatingRadiusKm.includes(
      value as CompanyOperatingRadiusKm,
    )
  ) {
    return value as CompanyOperatingRadiusKm
  }

  throw new CompanyOnboardingError(
    "Il raggio d'azione selezionato non e valido.",
  )
}

function normalizeCompanyProfile(
  company: CreateCompanyProfileInput,
) {
  const name =
    normalizeText(company.name)

  const vatNumber =
    normalizeVatNumber(company.vatNumber)

  const phone =
    normalizeText(company.phone)

  if (!name) {
    throw new CompanyOnboardingError(
      "Il nome azienda e obbligatorio.",
    )
  }

  if (!vatNumber) {
    throw new CompanyOnboardingError(
      "La partita IVA e obbligatoria.",
    )
  }

  if (!phone) {
    throw new CompanyOnboardingError(
      "Il numero di telefono aziendale e obbligatorio.",
    )
  }

  if (!isFreshGeoPlace(company.geoPlace)) {
    throw new CompanyOnboardingError(
      "La sede operativa selezionata non e valida.",
    )
  }

  return {
    name,
    vatNumber,
    phone,
    website:
      normalizeText(company.website),
    geoPlace:
      company.geoPlace,
    operatingRadiusKm:
      normalizeOperatingRadiusKm(
        company.operatingRadiusKm,
      ),
  }
}

function buildCompanyCreateData({
  company,
  onboardingCategorySlug,
}: {
  company: ReturnType<
    typeof normalizeCompanyProfile
  >
  onboardingCategorySlug:
    | string
    | undefined
}): Prisma.CompanyCreateInput {
  return {
    name: company.name,
    vatNumber:
      company.vatNumber,
    phone: company.phone,
    status:
      "PENDING_REVIEW",
    operatingRadiusKm:
      company.operatingRadiusKm,
    ...(company.website
      ? {
          website:
            company.website,
        }
      : {}),
    ...(onboardingCategorySlug
      ? {
          onboardingCategorySlug,
        }
      : {}),
  }
}

export async function createCompanyForUser({
  userId,
  onboardingCategorySlug,
  company,
}: CreateCompanyForUserInput): Promise<CreateCompanyForUserResult> {
  const memberships =
    await listExistingCompanyLinksForUser(
      userId,
    )

  if (memberships.length > 0) {
    const membership =
      memberships[0]

    if (!membership) {
      throw new Error(
        "Existing company membership could not be resolved.",
      )
    }

    return {
      ok: false,
      code: "company_membership_exists",
      companyId:
        membership.companyId,
      membershipId:
        membership.id,
      message:
        "Questo account è già collegato a un'impresa. Accedi all'area impresa.",
    }
  }

  const normalizedCompany =
    normalizeCompanyProfile(company)

  const normalizedOnboardingCategorySlug =
    normalizeText(onboardingCategorySlug)

  const existingCompany =
    await prisma.company.findUnique({
      where: {
        vatNumber:
          normalizedCompany.vatNumber,
      },
      select: {
        id: true,
      },
    })

  if (existingCompany) {
    return {
      ok: false,
      code: "company_vat_number_exists",
      message:
        "Esiste gia un'impresa con questa partita IVA.",
    }
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Initial configuration bootstrap: resolved first, inside this
        // same transaction, so an invalid/empty category aborts before
        // any row is written and rolls back atomically —
        // there is no partially-created Company, GeoLocation, or
        // CompanyMembership left behind on failure. Category and
        // Intervention are read here, not before the transaction, so the
        // whole bootstrap is one atomic unit per the approved design.
        let categoryPreset:
          | { categoryId: string; interventionIds: string[] }
          | null = null

        if (normalizedOnboardingCategorySlug) {
          const resolvedCategory =
            await resolveCategoryBySlugWithClient(
              tx,
              normalizedOnboardingCategorySlug,
            )

          if (!resolvedCategory) {
            throw new CompanyOnboardingCategoryError(
              "invalid_company_category",
              "La categoria professionale selezionata non è valida. Torna alla pagina professionisti e riprova.",
            )
          }

          const { interventions } =
            await resolveInterventionsForCategoryIdsWithClient(tx, [
              resolvedCategory.id,
            ])

          if (interventions.length === 0) {
            // Catalog inconsistency, not a user input error: a real
            // Category whose ProjectGroups resolve to zero Intervention
            // rows. Logged via the existing console-based structured
            // logging convention (see notify-admins-company-pending-review.ts)
            // — no new notification system introduced.
            console.error(
              "company_onboarding_category_preset_empty",
              {
                categorySlug: normalizedOnboardingCategorySlug,
                categoryId: resolvedCategory.id,
              },
            )

            throw new CompanyOnboardingCategoryError(
              "company_category_configuration_unavailable",
              "Non è possibile completare la registrazione con questa categoria in questo momento. Riprova più tardi o contatta l'assistenza.",
            )
          }

          categoryPreset = {
            categoryId: resolvedCategory.id,
            interventionIds: interventions.map(
              (intervention) => intervention.id,
            ),
          }
        }

        const companyRecord =
          await tx.company.create({
            data: buildCompanyCreateData({
              company:
                normalizedCompany,
              onboardingCategorySlug:
                normalizedOnboardingCategorySlug,
            }),
            select: {
              id: true,
            },
          })

        await setCompanyLocationWithClient(
          tx,
          companyRecord.id,
          normalizedCompany.geoPlace,
        )

        const membership =
          await tx.companyMembership.create({
            data: {
              companyId:
                companyRecord.id,
              userId,
              role: "OWNER",
            },
            select: {
              id: true,
            },
          })

        // Applied once, only at creation, only when a valid category
        // resolved to at least one Intervention — never re-run against an
        // existing Company (this function only ever creates new
        // companies) and never touched by the separate manual-save path
        // (updateCompanyServicesConfiguration), so a later personalization
        // can never be overwritten by this bootstrap.
        if (categoryPreset) {
          await writeCompanyServiceConfigurationWithClient(tx, {
            companyId: companyRecord.id,
            categoryIds: [categoryPreset.categoryId],
            interventionIds: categoryPreset.interventionIds,
          })
        }

        return {
          ok: true,
          companyId:
            companyRecord.id,
          membershipId:
            membership.id,
        } as const
      },
    )

    await notifyAdminsOfCompanyPendingReview({
      companyId: result.companyId,
      userId,
    })

    return result
  } catch (error) {
    if (error instanceof CompanyOnboardingCategoryError) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        code: "company_vat_number_exists",
        message:
          "Esiste gia un'impresa con questa partita IVA.",
      }
    }

    throw error
  }
}
