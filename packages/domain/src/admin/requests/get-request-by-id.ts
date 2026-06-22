import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

export type ModerationRequestCategory = {
  slug: string
  name: string
  description: string | null
  sector: {
    slug: string
    name: string
  }
}

export type ModerationRequestService = {
  slug: string
  name: string
  description: string | null
  categories: ModerationRequestCategory[]
}

export type ModerationRequestIntervention = {
  slug: string
  name: string
  description: string | null
  // Frozen taxonomy path (Phase 15B): the categories an intervention
  // belongs to come from Intervention.projectGroupId -> Category
  // (Category.projectGroupIds), the same relation search/discovery use —
  // no Service/CategoryService/InterventionService traversal. Kept as a
  // single-element "services" array (rather than exposing categories
  // directly on the intervention) so the admin UI's existing card list
  // and category-derivation logic need no changes: the Intervention is
  // now the sole operational unit a "service" used to represent.
  services: ModerationRequestService[]
}

export type ModerationRequestAdminActor = {
  id: string
  name: string | null
  email: string
}

export type ModerationRequestDetail = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  structuredData: Prisma.JsonValue | null
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  archivedAt: Date | null
  archivedByAdminUser: ModerationRequestAdminActor | null
  archiveReason: string | null
  deletedAt: Date | null
  deletedByAdminUser: ModerationRequestAdminActor | null
  deleteReason: string | null
  intervention: ModerationRequestIntervention | null
}

function mapCategory(category: {
  slug: string
  name: string
  description: string | null
  sector: {
    slug: string
    name: string
  }
}): ModerationRequestCategory {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    sector: {
      slug: category.sector.slug,
      name: category.sector.name,
    },
  }
}

export async function getRequestById(
  id: string,
): Promise<ModerationRequestDetail | null> {
  const request = await prisma.request.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      requestCode: true,
      status: true,
      interventionSlug: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      geoLocation: {
        select: {
          city: true,
          formattedAddress: true,
          postalCode: true,
          latitude: true,
          longitude: true,
        },
      },
      structuredData: true,
      creditCost: true,
      maxUnlocks: true,
      unlockCount: true,
      createdAt: true,
      archivedAt: true,
      archiveReason: true,
      archivedByAdminUser: {
        select: { id: true, name: true, email: true },
      },
      deletedAt: true,
      deleteReason: true,
      deletedByAdminUser: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!request) {
    return null
  }

  const intervention = request.interventionSlug
    ? await prisma.intervention.findUnique({
        where: {
          slug: request.interventionSlug,
        },
        select: {
          slug: true,
          name: true,
          description: true,
          projectGroupId: true,
        },
      })
    : null

  const categories = intervention?.projectGroupId
    ? await prisma.category.findMany({
        where: {
          projectGroupIds: { has: intervention.projectGroupId },
        },
        select: {
          slug: true,
          name: true,
          description: true,
          sector: { select: { slug: true, name: true } },
        },
      })
    : []

  const { geoLocation, ...requestFields } = request

  return {
    ...requestFields,
    city: geoLocation?.city ?? null,
    address: geoLocation?.formattedAddress ?? null,
    postalCode: geoLocation?.postalCode ?? null,
    latitude: geoLocation?.latitude ?? null,
    longitude: geoLocation?.longitude ?? null,
    intervention: intervention
      ? {
          slug: intervention.slug,
          name: intervention.name,
          description: intervention.description,
          services: [
            {
              slug: intervention.slug,
              name: intervention.name,
              description: intervention.description,
              categories: categories.map(mapCategory),
            },
          ],
        }
      : null,
  }
}
