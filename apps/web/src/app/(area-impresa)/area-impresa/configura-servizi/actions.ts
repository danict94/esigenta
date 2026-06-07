"use server"

import {
  redirect,
} from "next/navigation"

import {
  type Prisma,
  prisma,
} from "@esigenta/db"

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

function normalizeCategoryIds(
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

type CategoryServiceSelection = {
  categoryId: string
  serviceId: string
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
  const selectedCategoryIds =
    normalizeCategoryIds(
      formData.getAll("categoryIds"),
    )

  const requestedRequestMatchingMode =
    formData.get("requestMatchingMode") ===
    "SELECTED_SERVICES_ONLY"
      ? "SELECTED_SERVICES_ONLY"
      : "CATEGORY_WITH_SERVICE_PRIORITY"

  const requestMatchingMode =
    selectedServiceIds.length > 0
      ? requestedRequestMatchingMode
      : "CATEGORY_WITH_SERVICE_PRIORITY"

  if (selectedCategoryIds.length === 0) {
    redirectWithError("missing_categories")
  }

  if (selectedCategoryIds.length > 6) {
    redirectWithError("too_many_categories")
  }

  const company =
    await prisma.company.findUnique({
      where: {
        id: membership.companyId,
      },
      select: {
        id: true,
      },
    })

  if (!company) {
    redirectWithError("company_not_found")
  }

  const selectedCategories =
    await prisma.category.findMany({
      where: {
        id: {
          in: selectedCategoryIds,
        },
      },
      select: {
        id: true,
      },
    })

  if (
    selectedCategories.length !==
    selectedCategoryIds.length
  ) {
    redirectWithError("missing_categories")
  }

  const selectedCategoryIdSet = new Set(
    selectedCategoryIds,
  )

  const categoryServices: CategoryServiceSelection[] =
    await prisma.categoryService.findMany({
      where: {
        categoryId: {
          in: selectedCategoryIds,
        },
      },
      select: {
        categoryId: true,
        serviceId: true,
      },
    })

  const allowedServiceIds =
    new Set(
      categoryServices.map(
        (service) => service.serviceId,
      ),
    )

  const hasInvalidService =
    selectedServiceIds.some(
      (serviceId) =>
        !allowedServiceIds.has(serviceId),
    )

  if (
    selectedServiceIds.length > 0 &&
    hasInvalidService
  ) {
    redirectWithError("invalid_services")
  }

  const validSelectedServiceIds =
    selectedServiceIds.filter((serviceId) =>
      allowedServiceIds.has(serviceId),
    )

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.company.update({
      where: {
        id: company.id,
      },
      data: {
        requestMatchingMode,
      },
    })

    await tx.companyCategory.deleteMany({
      where: {
        companyId: company.id,
      },
    })

    await tx.companyService.deleteMany({
      where: {
        companyId: company.id,
      },
    })

    await tx.companyCategory.createMany({
      data: selectedCategoryIds
        .filter((categoryId) =>
          selectedCategoryIdSet.has(categoryId),
        )
        .map((categoryId) => ({
          companyId: company.id,
          categoryId,
        })),
    })

    if (validSelectedServiceIds.length > 0) {
      await tx.companyService.createMany({
        data: validSelectedServiceIds.map(
          (serviceId) => ({
            companyId: company.id,
            serviceId,
          }),
        ),
      })
    }
  })

  redirect("/area-impresa/richieste")
}
