import { prisma } from "@esigenta/database"

export type InterventionForFunnel = {
  id: string
  slug: string
  name: string
  description: string | null
  // Canonical source (Phase 14.5): read straight from Intervention, no
  // Service/Category cross-reference. Opaque to taxonomy — interpreted
  // only by packages/funnel.
  runtimePresetSlugs: string[]
}

export async function resolveInterventionForFunnel(
  slug: string,
): Promise<InterventionForFunnel | null> {
  const intervention = await prisma.intervention.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      runtimePresetSlugs: true,
    },
  })

  if (!intervention) return null

  return {
    id: intervention.id,
    slug: intervention.slug,
    name: intervention.name,
    description: intervention.description,
    runtimePresetSlugs: intervention.runtimePresetSlugs,
  }
}
