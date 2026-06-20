import type {
  CompanyStatus,
} from "@prisma/client"

export function isCompanyMarketplaceEnabled(
  status: CompanyStatus,
): boolean {
  return status === "APPROVED"
}
