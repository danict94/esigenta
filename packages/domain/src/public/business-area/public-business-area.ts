import { prisma } from "@esigenta/database"
import { listCompanyProfessions } from "@esigenta/taxonomy/frozen"

export type PublicBusinessAreaCategory = {
  slug: string
  name: string
}

export type PublicBusinessAreaPageData = {
  categories: PublicBusinessAreaCategory[]
  hasDeactivatedCompany: boolean
}

type BusinessAreaClient = {
  companyMembership: {
    findFirst(query: unknown): Promise<{ id: string } | null>
  }
}

export async function getPublicBusinessAreaPageData(
  { userId }: { userId?: string | null },
  client: BusinessAreaClient = prisma,
): Promise<PublicBusinessAreaPageData> {
  const categories = listCompanyProfessions().map(({ slug, name }) => ({
    slug,
    name,
  }))
  const deactivatedCompanyMembership = userId
    ? await client.companyMembership.findFirst({
          where: {
            userId,
            company: {
              is: {
                isActive: false,
              },
            },
          },
          select: {
            id: true,
          },
      })
    : null

  return {
    categories,
    hasDeactivatedCompany:
      deactivatedCompanyMembership !== null,
  }
}
