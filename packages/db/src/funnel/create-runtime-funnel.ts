/**
 * FixPro V2 - Runtime Funnel Bridge
 *
 * MVP RUNTIME
 *
 * Converts a taxonomy-resolved intervention into a working
 * runtime funnel payload.
 *
 * IMPORTANT:
 * This reads taxonomy data from the database.
 * It does NOT duplicate taxonomy source semantics.
 */

import { prisma } from "../prisma/client"

import type {
  RuntimeCapability,
} from "./types/capability"

import type {
  RequestDraft,
} from "./types/request-draft"

import type {
  RuntimeCapabilityId,
  RuntimeProfile,
} from "./types/runtime-profile"

import {
  budgetCapability,
} from "./capabilities/budget"

import {
  contactCapability,
} from "./capabilities/contact"

import {
  locationCapability,
} from "./capabilities/location"

import {
  photosCapability,
} from "./capabilities/photos"

import {
  propertyCapability,
} from "./capabilities/property"

import {
  roomsCapability,
} from "./capabilities/rooms"

import {
  surfaceAreaCapability,
} from "./capabilities/surface-area"

import {
  timingCapability,
} from "./capabilities/timing"

import {
  urgencyCapability,
} from "./capabilities/urgency"

import {
  buildRequestDraft,
} from "./compiler/build-request-draft"

import {
  resolveCapabilities,
} from "./compiler/resolve-capabilities"

import {
  type ResolvedIntervention,
  resolveRuntimeProfile,
} from "./compiler/resolve-runtime-profile"

import {
  resolveStepOrder,
} from "./runtime/resolve-step-order"

import type {
  RuntimeAnswers,
} from "./runtime/resolve-step-visibility"

const CAPABILITY_REGISTRY: Record<
  RuntimeCapabilityId,
  RuntimeCapability
> = {
  location: locationCapability,
  property: propertyCapability,
  photos: photosCapability,
  urgency: urgencyCapability,
  timing: timingCapability,
  budget: budgetCapability,
  "surface-area": surfaceAreaCapability,
  rooms: roomsCapability,
  contact: contactCapability,
}

export type FunnelSelectedIntervention = {
  id: string
  slug: string
  name: string
  description: string | null
}

export type CreateRuntimeFunnelInput = {
  query?: string
  interventionSlug: string
}

export type RuntimeFunnelPayload = {
  originalQuery?: string
  selectedIntervention: FunnelSelectedIntervention
  runtimeProfile: RuntimeProfile
  orderedCapabilities: RuntimeCapability[]
  requestDraft: RequestDraft
}

export type BuildRuntimeRequestDraftInput = {
  query?: string
  interventionSlug: string
  answers?: RuntimeAnswers
  customerDescription?: string
}

type FunnelResolution = {
  selectedIntervention: FunnelSelectedIntervention
  resolvedIntervention: ResolvedIntervention
}

function sortedUnique(values: string[]): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) => value.trim(),
      ),
    ),
  ).sort()
}

function normalizeOptionalText(
  value: string | undefined,
): string | undefined {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : undefined
}

async function resolveInterventionForFunnel(
  interventionSlug: string,
): Promise<FunnelResolution | null> {
  const intervention =
    await prisma.intervention.findUnique({
      where: {
        slug: interventionSlug,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        services: {
          select: {
            service: {
              select: {
                slug: true,
                categories: {
                  select: {
                    category: {
                      select: {
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        domains: {
          select: {
            domain: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    })

  if (!intervention) {
    return null
  }

  const serviceSlugs =
    intervention.services.map(
      (relation) => relation.service.slug,
    )

  const categorySlugs =
    intervention.services.flatMap(
      (relation) =>
        relation.service.categories.map(
          (categoryRelation) =>
            categoryRelation.category.slug,
        ),
    )

  const domainSlugs =
    intervention.domains.map(
      (relation) => relation.domain.slug,
    )

  return {
    selectedIntervention: {
      id: intervention.id,
      slug: intervention.slug,
      name: intervention.name,
      description:
        intervention.description,
    },
    resolvedIntervention: {
      interventionSlug:
        intervention.slug,
      serviceSlugs:
        sortedUnique(serviceSlugs),
      categorySlugs:
        sortedUnique(categorySlugs),
      domainSlugs:
        sortedUnique(domainSlugs),
    },
  }
}

function buildProfile(
  resolvedIntervention: ResolvedIntervention,
): RuntimeProfile {
  const baseProfile =
    resolveRuntimeProfile(
      resolvedIntervention,
    )

  const capabilities =
    resolveCapabilities(
      baseProfile.presetSlugs,
    )

  const orderedCapabilityIds =
    resolveStepOrder(capabilities)

  return {
    ...baseProfile,
    capabilities:
      orderedCapabilityIds,
    estimatedStepCount:
      orderedCapabilityIds.length,
  }
}

function resolveCapabilityDefinitions(
  capabilities: RuntimeCapabilityId[],
): RuntimeCapability[] {
  return capabilities.map(
    (capability) =>
      CAPABILITY_REGISTRY[capability],
  )
}

export async function createRuntimeFunnel({
  query,
  interventionSlug,
}: CreateRuntimeFunnelInput): Promise<RuntimeFunnelPayload | null> {
  const normalizedQuery =
    normalizeOptionalText(query)

  const resolution =
    await resolveInterventionForFunnel(
      interventionSlug,
    )

  if (!resolution) {
    return null
  }

  const runtimeProfile =
    buildProfile(
      resolution.resolvedIntervention,
    )

  const draftInput = {
    resolved:
      resolution.resolvedIntervention,
    runtimeProfile,
    answers: {},
  }

  const requestDraft =
    normalizedQuery
      ? buildRequestDraft({
          ...draftInput,
          originalQuery:
            normalizedQuery,
        })
      : buildRequestDraft(draftInput)

  const payload: RuntimeFunnelPayload = {
    selectedIntervention:
      resolution.selectedIntervention,
    runtimeProfile,
    orderedCapabilities:
      resolveCapabilityDefinitions(
        runtimeProfile.capabilities,
      ),
    requestDraft,
  }

  if (normalizedQuery) {
    payload.originalQuery =
      normalizedQuery
  }

  return payload
}

export async function buildRuntimeRequestDraft({
  query,
  interventionSlug,
  answers = {},
  customerDescription,
}: BuildRuntimeRequestDraftInput): Promise<RequestDraft | null> {
  const normalizedQuery =
    normalizeOptionalText(query)

  const normalizedDescription =
    normalizeOptionalText(
      customerDescription,
    )

  const resolution =
    await resolveInterventionForFunnel(
      interventionSlug,
    )

  if (!resolution) {
    return null
  }

  const runtimeProfile =
    buildProfile(
      resolution.resolvedIntervention,
    )

  return buildRequestDraft({
    resolved:
      resolution.resolvedIntervention,
    runtimeProfile,
    answers,
    ...(normalizedQuery
      ? {
          originalQuery:
            normalizedQuery,
        }
      : {}),
    ...(normalizedDescription
      ? {
          customerDescription:
            normalizedDescription,
        }
      : {}),
  })
}
