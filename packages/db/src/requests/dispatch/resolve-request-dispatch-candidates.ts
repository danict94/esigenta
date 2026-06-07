import type {
  Prisma,
} from "@prisma/client"

import {
  prisma,
} from "../../prisma/client"

import {
  getDistanceKm,
} from "../distance"

import type {
  RequestDispatchCandidate,
  RequestDispatchServiceSource,
  ResolveRequestDispatchCandidatesResult,
} from "./types"

type DispatchResolverClient =
  Prisma.TransactionClient

function normalizeRequiredId(
  value: string,
): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function hasValidNumber(
  value: number | null,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
}

function normalizeEmail(
  value: string | null,
): string | null {
  const email = value?.trim().toLowerCase()

  if (!email) {
    return null
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  )
    ? email
    : null
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values))
}

async function resolveRequestServiceIds({
  client,
  requestId,
  interventionSlug,
  requiredServiceIds,
}: {
  client: DispatchResolverClient
  requestId: string
  interventionSlug: string | null
  requiredServiceIds: string[]
}): Promise<
  | {
      ok: true
      serviceSource: RequestDispatchServiceSource
      serviceIds: string[]
    }
  | {
      ok: false
    }
> {
  const requestRequiredServiceIds =
    uniqueStrings(requiredServiceIds)

  if (requestRequiredServiceIds.length > 0) {
    return {
      ok: true,
      serviceSource:
        "request_required_service",
      serviceIds: requestRequiredServiceIds,
    }
  }

  const normalizedInterventionSlug =
    interventionSlug?.trim()

  if (!normalizedInterventionSlug) {
    return {
      ok: false,
    }
  }

  const intervention =
    await client.intervention.findUnique({
      where: {
        slug: normalizedInterventionSlug,
      },
      select: {
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

  const interventionServiceIds =
    uniqueStrings(
      intervention?.services.map(
        (service) => service.serviceId,
      ) ?? [],
    )

  if (interventionServiceIds.length === 0) {
    return {
      ok: false,
    }
  }

  return {
    ok: true,
    serviceSource: "intervention_service",
    serviceIds: interventionServiceIds,
  }
}

async function resolveCandidates({
  client,
  requestLatitude,
  requestLongitude,
  serviceIds,
  categoryIds,
  serviceSource,
}: {
  client: DispatchResolverClient
  requestLatitude: number
  requestLongitude: number
  serviceIds: string[]
  categoryIds: string[]
  serviceSource: RequestDispatchServiceSource
}): Promise<RequestDispatchCandidate[]> {
  if (categoryIds.length === 0) {
    return []
  }

  const companies =
    await client.company.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        status: "APPROVED",
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        operatingRadiusKm: {
          gt: 0,
        },
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      },
      select: {
        id: true,
        requestMatchingMode: true,
        memberships: {
          where: {
            role: "OWNER",
          },
          take: 1,
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        latitude: true,
        longitude: true,
        operatingRadiusKm: true,
        categories: {
          where: {
            categoryId: {
              in: categoryIds,
            },
          },
          select: {
            categoryId: true,
          },
        },
        services: {
          where: {
            serviceId: {
              in: serviceIds,
            },
          },
          select: {
            serviceId: true,
          },
        },
      },
    })

  return companies.flatMap((company) => {
    if (
      !hasValidNumber(company.latitude) ||
      !hasValidNumber(company.longitude) ||
      company.operatingRadiusKm <= 0
    ) {
      return []
    }

    const matchedCategoryIds =
      uniqueStrings(
        company.categories.map(
          (category) => category.categoryId,
        ),
      )

    if (matchedCategoryIds.length === 0) {
      return []
    }

    const matchedServiceIds =
      uniqueStrings(
        company.services.map(
          (service) => service.serviceId,
        ),
      )

    if (
      company.requestMatchingMode ===
        "SELECTED_SERVICES_ONLY" &&
      matchedServiceIds.length === 0
    ) {
      return []
    }

    const distanceKm =
      getDistanceKm({
        fromLatitude: company.latitude,
        fromLongitude: company.longitude,
        toLatitude: requestLatitude,
        toLongitude: requestLongitude,
      })

    if (
      distanceKm > company.operatingRadiusKm
    ) {
      return []
    }

    const matchStrength =
      matchedServiceIds.length > 0
        ? "SERVICE_MATCH"
        : "CATEGORY_MATCH"

    const matchReason: Prisma.InputJsonObject = {
      requestMatchingMode:
        company.requestMatchingMode,
      categoryMatchMode:
        "derived_from_resolved_services",
      serviceSource,
      serviceMatchMode:
        matchedServiceIds.length > 0
          ? "any"
          : "category_fallback",
      matchStrength,
      resolvedServiceIds: serviceIds,
      derivedCategoryIds: categoryIds,
      matchedCategoryIds,
      matchedServiceIds,
      distanceKm,
      operatingRadiusKm:
        company.operatingRadiusKm,
    }

    return [
      {
        companyId: company.id,
        recipientEmail: normalizeEmail(
          company.memberships[0]?.user.email ?? null,
        ),
        distanceKm,
        operatingRadiusKm:
          company.operatingRadiusKm,
        matchedServiceIds,
        matchReason,
      },
    ]
  })
}

export async function resolveRequestDispatchCandidatesWithClient(
  client: DispatchResolverClient,
  requestId: string,
): Promise<ResolveRequestDispatchCandidatesResult> {
  const normalizedRequestId =
    normalizeRequiredId(requestId)

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "request_not_found",
      message: "Request not found.",
    }
  }

  const request =
    await client.request.findUnique({
      where: {
        id: normalizedRequestId,
      },
      select: {
        id: true,
        requestCode: true,
        interventionSlug: true,
        city: true,
        latitude: true,
        longitude: true,
        requiredServices: {
          select: {
            serviceId: true,
          },
        },
      },
    })

  if (!request) {
    return {
      ok: false,
      code: "request_not_found",
      message: "Request not found.",
    }
  }

  if (
    !hasValidNumber(request.latitude) ||
    !hasValidNumber(request.longitude)
  ) {
    return {
      ok: false,
      code: "request_missing_coordinates",
      message:
        "Request latitude and longitude are required for dispatch.",
    }
  }

  const serviceResolution =
    await resolveRequestServiceIds({
      client,
      requestId: request.id,
      interventionSlug:
        request.interventionSlug,
      requiredServiceIds:
        request.requiredServices.map(
          (service) => service.serviceId,
        ),
    })

  if (!serviceResolution.ok) {
    return {
      ok: false,
      code: "request_services_not_resolved",
      message:
        "Request services could not be resolved for dispatch.",
    }
  }

  const categoryServices =
    await client.categoryService.findMany({
      where: {
        serviceId: {
          in: serviceResolution.serviceIds,
        },
      },
      select: {
        categoryId: true,
      },
    })

  const categoryIds =
    uniqueStrings(
      categoryServices.map(
        (categoryService) =>
          categoryService.categoryId,
      ),
    )

  const candidates =
    await resolveCandidates({
      client,
      requestLatitude: request.latitude,
      requestLongitude: request.longitude,
      serviceIds:
        serviceResolution.serviceIds,
      categoryIds,
      serviceSource:
        serviceResolution.serviceSource,
    })

  return {
    ok: true,
    requestId: request.id,
    requestCode: request.requestCode,
    interventionSlug:
      request.interventionSlug,
    city: request.city,
    resolvedServiceIds:
      serviceResolution.serviceIds,
    resolvedServiceCount:
      serviceResolution.serviceIds.length,
    eligibleCompanyCount:
      candidates.length,
    candidates,
  }
}

export async function resolveRequestDispatchCandidates(
  requestId: string,
): Promise<ResolveRequestDispatchCandidatesResult> {
  return resolveRequestDispatchCandidatesWithClient(
    prisma,
    requestId,
  )
}
