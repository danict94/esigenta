"use server"

import {
  redirect,
} from "next/navigation"

import {
  prisma,
} from "@fixpro/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

function normalizeServiceIds(
  values: FormDataEntryValue[],
) {
  return Array.from(
    new Set(
      values
        .map((value) =>
          typeof value === "string"
            ? value.trim()
            : "",
        )
        .filter(Boolean),
    ),
  )
}

function redirectWithError(code: string): never {
  redirect(
    `/area-impresa/configura-servizi?error=${encodeURIComponent(code)}`,
  )
}

export async function saveCompanyServicesAction(
  formData: FormData,
) {
  const membership =
    await requireDefaultCompanyMembership()

  const selectedServiceIds =
    normalizeServiceIds(
      formData.getAll("serviceIds"),
    )

  if (selectedServiceIds.length === 0) {
    redirectWithError("missing_services")
  }

  const company =
    await prisma.company.findUnique({
      where: {
        id: membership.companyId,
      },
      select: {
        id: true,
        onboardingCategorySlug: true,
      },
    })

  if (!company) {
    redirectWithError("company_not_found")
  }

  if (!company.onboardingCategorySlug) {
    redirectWithError("missing_category")
  }

  const allowedServices =
    await prisma.categoryService.findMany({
      where: {
        category: {
          slug:
            company.onboardingCategorySlug,
        },
        serviceId: {
          in: selectedServiceIds,
        },
      },
      select: {
        serviceId: true,
      },
    })

  const allowedServiceIds =
    new Set(
      allowedServices.map(
        (service) => service.serviceId,
      ),
    )

  const hasInvalidService =
    selectedServiceIds.some(
      (serviceId) =>
        !allowedServiceIds.has(serviceId),
    )

  if (
    hasInvalidService ||
    allowedServiceIds.size !==
      selectedServiceIds.length
  ) {
    redirectWithError("invalid_services")
  }

  await prisma.$transaction([
    prisma.companyService.deleteMany({
      where: {
        companyId: company.id,
      },
    }),
    prisma.companyService.createMany({
      data: selectedServiceIds.map(
        (serviceId) => ({
          companyId: company.id,
          serviceId,
        }),
      ),
    }),
  ])

  redirect("/area-impresa/richieste")
}
