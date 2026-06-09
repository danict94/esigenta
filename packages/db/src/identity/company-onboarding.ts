import {
  Prisma,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

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
  address?: string
  street?: string
  streetNo?: string
  city?: string
  postalCode?: string
  province?: string
  latitude?: number
  longitude?: number
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

function normalizeFiniteNumber(
  value: number | undefined,
): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : undefined
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

  return {
    name,
    vatNumber,
    phone,
    website:
      normalizeText(company.website),
    address:
      normalizeText(company.address),
    street:
      normalizeText(company.street),
    streetNo:
      normalizeText(company.streetNo),
    city:
      normalizeText(company.city),
    postalCode:
      normalizeText(company.postalCode),
    province:
      normalizeText(company.province)
        ?.toUpperCase(),
    latitude:
      normalizeFiniteNumber(
        company.latitude,
      ),
    longitude:
      normalizeFiniteNumber(
        company.longitude,
      ),
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
    ...(company.address
      ? {
          address:
            company.address,
        }
      : {}),
    ...(company.street
      ? {
          street:
            company.street,
        }
      : {}),
    ...(company.streetNo
      ? {
          streetNo:
            company.streetNo,
        }
      : {}),
    ...(company.city
      ? {
          city:
            company.city,
        }
      : {}),
    ...(company.postalCode
      ? {
          postalCode:
            company.postalCode,
        }
      : {}),
    ...(company.province
      ? {
          province:
            company.province,
        }
      : {}),
    ...(company.latitude !== undefined
      ? {
          latitude:
            company.latitude,
        }
      : {}),
    ...(company.longitude !== undefined
      ? {
          longitude:
            company.longitude,
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
    return await prisma.$transaction(
      async (tx) => {
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

        return {
          ok: true,
          companyId:
            companyRecord.id,
          membershipId:
            membership.id,
        }
      },
    )
  } catch (error) {
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
