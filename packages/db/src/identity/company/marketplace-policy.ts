import type {
  CompanyStatus,
} from "@prisma/client"

import {
  prisma,
} from "../../prisma/client"

export type CompanyMarketplaceState = {
  isActive: boolean
  deletedAt: Date | null
  status: CompanyStatus
}

export class CompanyMarketplaceAuthorizationError extends Error {
  code:
    | "invalid_company_id"
    | "company_not_found"
    | "company_not_active"
    | "COMPANY_NOT_APPROVED_FOR_MARKETPLACE"
    | "COMPANY_NOT_APPROVED_FOR_CREDITS"

  constructor({
    code,
    message,
  }: {
    code: CompanyMarketplaceAuthorizationError["code"]
    message: string
  }) {
    super(message)

    this.name =
      "CompanyMarketplaceAuthorizationError"
    this.code =
      code
  }
}

function normalizeCompanyId(
  companyId: string,
) {
  const normalized =
    companyId.trim()

  return normalized
    ? normalized
    : null
}

export function isCompanyMarketplaceApproved(
  company: CompanyMarketplaceState,
) {
  return (
    company.isActive &&
    company.deletedAt === null &&
    company.status === "APPROVED"
  )
}

async function loadCompanyMarketplaceState(
  companyId: string,
): Promise<CompanyMarketplaceState | null> {
  return prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      isActive: true,
      deletedAt: true,
      status: true,
    },
  })
}

async function assertCompanyMarketplaceState({
  companyId,
  rejectedCode,
  rejectedMessage,
}: {
  companyId: string
  rejectedCode:
    | "COMPANY_NOT_APPROVED_FOR_MARKETPLACE"
    | "COMPANY_NOT_APPROVED_FOR_CREDITS"
  rejectedMessage: string
}) {
  const normalizedCompanyId =
    normalizeCompanyId(companyId)

  if (!normalizedCompanyId) {
    throw new CompanyMarketplaceAuthorizationError({
      code: "invalid_company_id",
      message: "Impresa non valida.",
    })
  }

  const company =
    await loadCompanyMarketplaceState(
      normalizedCompanyId,
    )

  if (!company) {
    throw new CompanyMarketplaceAuthorizationError({
      code: "company_not_found",
      message: "Impresa non trovata.",
    })
  }

  if (
    !company.isActive ||
    company.deletedAt !== null
  ) {
    throw new CompanyMarketplaceAuthorizationError({
      code: "company_not_active",
      message:
        "Questa impresa non è attiva.",
    })
  }

  if (
    !isCompanyMarketplaceApproved(
      company,
    )
  ) {
    throw new CompanyMarketplaceAuthorizationError({
      code: rejectedCode,
      message:
        rejectedMessage,
    })
  }
}

export async function assertCompanyCanUseMarketplace({
  companyId,
}: {
  companyId: string
}) {
  await assertCompanyMarketplaceState({
    companyId,
    rejectedCode:
      "COMPANY_NOT_APPROVED_FOR_MARKETPLACE",
    rejectedMessage:
      "Il profilo impresa deve essere approvato prima di usare il marketplace.",
  })
}

export async function assertCompanyCanBuyCredits({
  companyId,
}: {
  companyId: string
}) {
  await assertCompanyMarketplaceState({
    companyId,
    rejectedCode:
      "COMPANY_NOT_APPROVED_FOR_CREDITS",
    rejectedMessage:
      "Il profilo impresa deve essere approvato prima di acquistare crediti.",
  })
}
