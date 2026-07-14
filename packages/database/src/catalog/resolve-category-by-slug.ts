import type { Prisma } from "@prisma/client"

type CatalogClient = Prisma.TransactionClient

export type ResolvedCategoryBySlug = {
  id: string
}

/**
 * Infrastructural catalog lookup: does this slug match a real Category?
 * Lives here, not @esigenta/domain, because @esigenta/auth's onboarding
 * bootstrap must also call it and cannot depend on @esigenta/domain
 * (which itself depends on @esigenta/auth) — same reason as
 * setCompanyLocationWithClient. Existence is the only question this
 * answers; no product decision (what to do if missing) is made here.
 */
export async function resolveCategoryBySlugWithClient(
  client: CatalogClient,
  slug: string,
): Promise<ResolvedCategoryBySlug | null> {
  return client.category.findUnique({
    where: { slug },
    select: { id: true },
  })
}
