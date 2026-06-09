
import {
  prisma,
} from "./prisma/client"

export type PublicBusinessAreaCategory = {
  slug: string
  name: string
}

export type PublicBusinessAreaPageData = {
  categories: PublicBusinessAreaCategory[]
  hasDeactivatedCompany: boolean
}

export async function getPublicBusinessAreaPageData({
  userId,
}: {
  userId?: string | null
}): Promise<PublicBusinessAreaPageData> {
  const [
    categories,
    deactivatedCompanyMembership,
  ] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        slug: true,
        name: true,
      },
    }),
    userId
      ? prisma.companyMembership.findFirst({
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
      : Promise.resolve(null),
  ])

  return {
    categories,
    hasDeactivatedCompany:
      deactivatedCompanyMembership !== null,
  }
}
