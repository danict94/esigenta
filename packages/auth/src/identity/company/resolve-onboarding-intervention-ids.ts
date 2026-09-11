import type { Prisma } from "@prisma/client"

import { resolveProfessionOnboardingDefaults } from "@esigenta/taxonomy/frozen"

type OnboardingMembershipResolver = typeof resolveProfessionOnboardingDefaults

export async function resolveOnboardingInterventionIdsWithClient(
  client: Prisma.TransactionClient,
  categorySlug: string,
  resolveDefaults: OnboardingMembershipResolver =
    resolveProfessionOnboardingDefaults,
): Promise<string[]> {
  const resolved = resolveDefaults(categorySlug)

  if (!resolved) {
    throw new Error(`[company-onboarding] Missing frozen Category: ${categorySlug}`)
  }

  const interventionSlugs = Array.from(
    new Set(
      resolved.projectGroups.flatMap(({ interventions }) =>
        interventions.map((intervention) => intervention.slug),
      ),
    ),
  )

  if (interventionSlugs.length === 0) {
    return []
  }

  const rows = await client.intervention.findMany({
    where: { slug: { in: interventionSlugs } },
    select: { id: true, slug: true },
  })
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]))

  return interventionSlugs.map((interventionSlug) => {
    const row = rowsBySlug.get(interventionSlug)

    if (!row) {
      throw new Error(
        `[company-onboarding] Missing DB Intervention for frozen slug: ${interventionSlug}`,
      )
    }

    return row.id
  })
}
