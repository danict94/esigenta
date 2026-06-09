
import type {
  CompanyContactChangeRequestResult,
  CreateCompanyContactChangeRequestData,
} from "./company-contact-change-requests"
import {
  createCompanyContactChangeRequest,
} from "./company-contact-change-requests"
import {
  prisma,
} from "./prisma/client"

const allowedRadiusKm = [
  10,
  20,
  30,
  50,
  75,
  100,
] as const

export type UpdateCompanyProfileErrorCode =
  | "invalid_website"
  | "invalid_radius"
  | "invalid_coordinates"
  | "company_not_found"

export type UpdateCompanyProfileResult =
  | {
      ok: true
    }
  | {
      ok: false
      code: UpdateCompanyProfileErrorCode
    }

export type UpdateCompanyProfileInput = {
  companyId: string
  website: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  province: string | null
  latitude: string | null
  longitude: string | null
  operatingRadiusKm: string | null
}

export type RequestCompanyPhoneContactChangeInput = {
  companyId: string
  requestedByUserId: string
  requestedPhone: string | null
}

function normalizeText(
  value: string | null | undefined,
) {
  return value?.trim() ?? ""
}

function normalizeOptionalText(
  value: string | null | undefined,
) {
  const normalized = normalizeText(value)

  return normalized || null
}

function normalizeWebsite(
  value: string | null | undefined,
) {
  const website = normalizeText(value)

  if (!website) {
    return null
  }

  try {
    const url = new URL(website)

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return undefined
    }

    return url.toString()
  } catch {
    return undefined
  }
}

function normalizeCoordinate(
  value: string | null | undefined,
) {
  const normalized = normalizeText(value)

  if (!normalized) {
    return null
  }

  const numberValue = Number(
    normalized.replace(",", "."),
  )

  return Number.isFinite(numberValue)
    ? numberValue
    : undefined
}

export async function getCompanyProfilePageData({
  companyId,
}: {
  companyId: string
}) {
  const company =
    await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        vatNumber: true,
        phone: true,
        website: true,
        address: true,
        street: true,
        streetNo: true,
        city: true,
        postalCode: true,
        province: true,
        latitude: true,
        longitude: true,
        operatingRadiusKm: true,
        onboardingCategorySlug: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        services: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            service: {
              name: "asc",
            },
          },
        },
      },
    })

  if (!company) {
    return {
      company: null,
      categories: [],
      services: [],
      pendingContactChangeRequests: [],
    }
  }

  const [
    fallbackCategory,
    pendingContactChangeRequests,
  ] = await Promise.all([
    company.categories.length === 0 &&
    company.onboardingCategorySlug
      ? prisma.category.findUnique({
          where: {
            slug: company.onboardingCategorySlug,
          },
          select: {
            id: true,
            name: true,
          },
        })
      : Promise.resolve(null),
    prisma.companyContactChangeRequest.findMany({
      where: {
        companyId: company.id,
        status: "PENDING_REVIEW",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        field: true,
        currentValue: true,
        requestedValue: true,
        createdAt: true,
      },
    }),
  ])

  const categories =
    company.categories.length > 0
      ? company.categories.map(
          ({ category }) => category,
        )
      : fallbackCategory
        ? [fallbackCategory]
        : []

  const services =
    company.services.map(
      ({ service }) => service,
    )

  return {
    company,
    categories,
    services,
    pendingContactChangeRequests,
  }
}

export async function updateCompanyProfile({
  companyId,
  website: rawWebsite,
  address,
  city,
  postalCode,
  province,
  latitude: rawLatitude,
  longitude: rawLongitude,
  operatingRadiusKm,
}: UpdateCompanyProfileInput): Promise<UpdateCompanyProfileResult> {
  const website =
    normalizeWebsite(rawWebsite)
  const radiusValue =
    Number(normalizeText(operatingRadiusKm))
  const latitude =
    normalizeCoordinate(rawLatitude)
  const longitude =
    normalizeCoordinate(rawLongitude)

  if (website === undefined) {
    return {
      ok: false,
      code: "invalid_website",
    }
  }

  if (
    !allowedRadiusKm.includes(
      radiusValue as (typeof allowedRadiusKm)[number],
    )
  ) {
    return {
      ok: false,
      code: "invalid_radius",
    }
  }

  if (
    latitude === undefined ||
    longitude === undefined ||
    (latitude === null && longitude !== null) ||
    (latitude !== null && longitude === null)
  ) {
    return {
      ok: false,
      code: "invalid_coordinates",
    }
  }

  const company =
    await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
      },
    })

  if (!company) {
    return {
      ok: false,
      code: "company_not_found",
    }
  }

  await prisma.company.update({
    where: {
      id: company.id,
    },
    data: {
      website,
      address: normalizeOptionalText(address),
      city: normalizeOptionalText(city),
      postalCode:
        normalizeOptionalText(postalCode),
      province:
        normalizeOptionalText(province),
      latitude,
      longitude,
      operatingRadiusKm: radiusValue,
    },
  })

  return {
    ok: true,
  }
}

export async function requestCompanyPhoneContactChange({
  companyId,
  requestedByUserId,
  requestedPhone,
}: RequestCompanyPhoneContactChangeInput): Promise<
  CompanyContactChangeRequestResult<CreateCompanyContactChangeRequestData>
> {
  const normalizedPhone =
    normalizeText(requestedPhone)

  if (!normalizedPhone) {
    return {
      ok: false,
      code: "requested_value_unchanged",
      message:
        "Non hai modificato il telefono aziendale.",
    }
  }

  return createCompanyContactChangeRequest({
    companyId,
    requestedByUserId,
    field: "PHONE",
    requestedValue: normalizedPhone,
  })
}
