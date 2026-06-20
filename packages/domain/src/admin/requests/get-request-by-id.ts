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
  requiredServices: ModerationRequestService[]
}

function mapService(service: {
  slug: string
  name: string
  description: string | null
  categories: Array<{
    category: {
      slug: string
      name: string
      description: string | null
      sector: {
        slug: string
        name: string
      }
    }
  }>
}): ModerationRequestService {
  return {
    slug: service.slug,
    name: service.name,
    description: service.description,
    categories: service.categories.map(({ category }) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      sector: {
        slug: category.sector.slug,
        name: category.sector.name,
      },
    })),
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
      city: true,
      address: true,
      postalCode: true,
      latitude: true,
      longitude: true,
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
      requiredServices: {
        select: {
          service: {
            select: {
              slug: true,
              name: true,
              description: true,
              categories: {
                select: {
                  category: {
                    select: {
                      slug: true,
                      name: true,
                      description: true,
                      sector: {
                        select: {
                          slug: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
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
          services: {
            select: {
              service: {
                select: {
                  slug: true,
                  name: true,
                  description: true,
                  categories: {
                    select: {
                      category: {
                        select: {
                          slug: true,
                          name: true,
                          description: true,
                          sector: {
                            select: {
                              slug: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
    : null

  const { requiredServices, ...requestFields } =
    request

  return {
    ...requestFields,
    requiredServices: requiredServices.map(
      ({ service }) => mapService(service),
    ),
    intervention: intervention
      ? {
          slug: intervention.slug,
          name: intervention.name,
          description: intervention.description,
          services: intervention.services.map(
            ({ service }) => mapService(service),
          ),
        }
      : null,
  }
}
