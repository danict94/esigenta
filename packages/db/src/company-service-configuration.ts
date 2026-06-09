import {
  prisma,
} from "./prisma/client"

const maximumCompanyServiceCategories =
  6

export type CompanyServiceConfigurationErrorCode =
  | "missing_categories"
  | "too_many_categories"
  | "invalid_services"
  | "company_not_found"

export type CompanyServiceConfigurationRequestMatchingMode =
  | "CATEGORY_WITH_SERVICE_PRIORITY"
  | "SELECTED_SERVICES_ONLY"

export type CompanyServiceConfigurationPageCompany = {
  id: string
  name: string
  onboardingCategorySlug: string | null
  categories: Array<{
    categoryId: string
  }>
  services: Array<{
    serviceId: string
  }>
}

export type ConfigurableCompanyServiceCategory = {
  id: string
  slug: string
  name: string
  sector: {
    name: string
  } | null
  services: Array<{
    service: {
      id: string
      name: string
      description: string | null
    }
  }>
}

export type GetCompanyServiceConfigurationPageDataResult = {
  company: CompanyServiceConfigurationPageCompany | null
  categories: ConfigurableCompanyServiceCategory[]
}

export async function getCompanyServiceConfigurationPageData({
  companyId,
}: {
  companyId: string
}): Promise<GetCompanyServiceConfigurationPageDataResult> {
  const companyPromise =
    prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        onboardingCategorySlug: true,
        categories: {
          select: {
            categoryId: true,
          },
        },
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

  const categoriesPromise =
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
        sector: {
          select: {
            name: true,
          },
        },
        services: {
          orderBy: {
            service: {
              name: "asc",
            },
          },
          select: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

  const [company, categories] =
    await Promise.all([
      companyPromise,
      categoriesPromise,
    ])

  return {
    company,
    categories,
  }
}

function normalizeSelectedIds(
  values: string[],
) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
}

export type UpdateCompanyServiceConfigurationInput = {
  companyId: string
  selectedCategoryIds: string[]
  selectedServiceIds: string[]
  requestedRequestMatchingMode: CompanyServiceConfigurationRequestMatchingMode
}

export type UpdateCompanyServiceConfigurationResult =
  | {
      ok: true
    }
  | {
      ok: false
      code: CompanyServiceConfigurationErrorCode
    }

export async function updateCompanyServiceConfiguration({
  companyId,
  selectedCategoryIds: rawSelectedCategoryIds,
  selectedServiceIds: rawSelectedServiceIds,
  requestedRequestMatchingMode,
}: UpdateCompanyServiceConfigurationInput): Promise<UpdateCompanyServiceConfigurationResult> {
  const selectedCategoryIds =
    normalizeSelectedIds(
      rawSelectedCategoryIds,
    )

  const selectedServiceIds =
    normalizeSelectedIds(
      rawSelectedServiceIds,
    )

  const requestMatchingMode =
    selectedServiceIds.length > 0
      ? requestedRequestMatchingMode
      : "CATEGORY_WITH_SERVICE_PRIORITY"

  if (selectedCategoryIds.length === 0) {
    return {
      ok: false,
      code: "missing_categories",
    }
  }

  if (
    selectedCategoryIds.length >
    maximumCompanyServiceCategories
  ) {
    return {
      ok: false,
      code: "too_many_categories",
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
    return {
      ok: false,
      code: "missing_categories",
    }
  }

  const categoryServices =
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
    return {
      ok: false,
      code: "invalid_services",
    }
  }

  const validSelectedServiceIds =
    selectedServiceIds.filter((serviceId) =>
      allowedServiceIds.has(serviceId),
    )

  await prisma.$transaction(async (tx) => {
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
      data: selectedCategoryIds.map(
        (categoryId) => ({
          companyId: company.id,
          categoryId,
        }),
      ),
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

  return {
    ok: true,
  }
}
