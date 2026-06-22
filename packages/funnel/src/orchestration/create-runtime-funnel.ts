import {
  resolveInterventionForFunnel as findInterventionForFunnel,
} from "@esigenta/taxonomy"

import type {
  RuntimeCapability,
} from "../types/capability"

import type {
  RequestDraft,
} from "../types/request-draft"

import type {
  RuntimeCapabilityId,
  RuntimeProfile,
  RuntimePresetSlug,
} from "../types/runtime-profile"

import {
  budgetCapability,
} from "../capabilities/budget"

import {
  contactCapability,
} from "../capabilities/contact"

import {
  locationCapability,
} from "../capabilities/location"

import {
  photosCapability,
} from "../capabilities/photos"

import {
  propertyCapability,
} from "../capabilities/property"

import {
  roomsCapability,
} from "../capabilities/rooms"

import {
  surfaceAreaCapability,
} from "../capabilities/surface-area"

import {
  timingCapability,
} from "../capabilities/timing"

import {
  buildRequestDraft,
} from "../compiler/build-request-draft"

import {
  resolveCapabilities,
} from "../compiler/resolve-capabilities"

import {
  type ResolvedIntervention,
  resolveRuntimeProfile,
} from "../compiler/resolve-runtime-profile"

import {
  resolveStepOrder,
} from "../runtime/resolve-step-order"

import type {
  RuntimeAnswers,
} from "../runtime/resolve-step-visibility"

const CAPABILITY_REGISTRY: Record<
  RuntimeCapabilityId,
  RuntimeCapability
> = {
  location: locationCapability,
  property: propertyCapability,
  photos: photosCapability,
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

const VALID_RUNTIME_PRESET_SLUGS = new Set<RuntimePresetSlug>([
  "INTERIOR_WORK",
  "EXTERIOR_WORK",
  "EMERGENCY_REPAIR",
  "RENOVATION",
  "QUICK_SERVICE",
  "PAINTING",
  "PLUMBING_EMERGENCY",
  "HOME_RENOVATION",
  "BATHROOM_RENOVATION",
  "ELECTRICAL_WORK",
  "GENERIC",
])

function isRuntimePresetSlug(value: string): value is RuntimePresetSlug {
  return VALID_RUNTIME_PRESET_SLUGS.has(value as RuntimePresetSlug)
}

// Canonical source (Phase 14.5): Intervention.runtimePresetSlugs, read
// directly off the DB row via findInterventionForFunnel. Replaces the
// legacy cross-reference through taxonomySource.services/.categories —
// taxonomy now carries this as one opaque, pre-merged field per
// Intervention, nothing to merge here anymore. Validated at this boundary
// since the DB column has no compile-time guarantee of matching the
// RuntimePresetSlug union.
function sortedValidRuntimePresetSlugs(
  values: string[],
): RuntimePresetSlug[] {
  return Array.from(new Set(values.filter(isRuntimePresetSlug))).sort()
}

function normalizeOptionalText(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim()

  return trimmed ? trimmed : undefined
}

async function resolveInterventionForFunnel(
  interventionSlug: string,
): Promise<FunnelResolution | null> {
  const data = await findInterventionForFunnel(interventionSlug)

  if (!data) return null

  return {
    selectedIntervention: {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
    },
    resolvedIntervention: {
      interventionSlug: data.slug,
      runtimePresetSlugs: sortedValidRuntimePresetSlugs(
        data.runtimePresetSlugs,
      ),
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
