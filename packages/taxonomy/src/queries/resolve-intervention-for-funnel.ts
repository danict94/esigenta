import { prisma } from "@esigenta/database"

export type InterventionForFunnel = {
  id: string
  slug: string
  name: string
  description: string | null
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
      publicationStatus: true,
    },
  })

  // Publication gate: a draft behaves exactly like a non-existent
  // intervention on this path — no separate "not public yet" response,
  // same notFound() the customer-facing route already uses for a truly
  // unknown slug. No query-plan change: same findUnique on the unique
  // slug index, just an extra in-memory check on the field already
  // selected above.
  if (!intervention || intervention.publicationStatus !== "PUBLISHED") {
    return null
  }

  return {
    id: intervention.id,
    slug: intervention.slug,
    name: intervention.name,
    description: intervention.description,
  }
}
