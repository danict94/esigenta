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
  ResolvedIntervention,
  RuntimeProfile,
} from "../types/runtime-profile"

import {
  buildRequestDraft,
} from "../compiler/build-request-draft"

import {
  resolveFunnelModel,
} from "../intervention-models"

import type {
  RuntimeAnswers,
} from "../runtime/resolve-step-visibility"

export type FunnelSelectedIntervention = {
  id: string
  slug: string
  name: string
  description: string | null
}

/**
 * A caller either already resolved the intervention (e.g. the funnel page,
 * which needs the record for notFound() handling before it can render
 * anything, so the lookup must not be repeated) or only has the slug (e.g.
 * the runtime API route). Both resolve to the same FunnelResolution below.
 */
export type FunnelInterventionSource =
  | { interventionSlug: string; intervention?: undefined }
  | { intervention: FunnelSelectedIntervention; interventionSlug?: undefined }

export type CreateRuntimeFunnelInput = FunnelInterventionSource & {
  query?: string
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

function normalizeOptionalText(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim()

  return trimmed ? trimmed : undefined
}

function isResolvedInterventionSource(
  source: FunnelInterventionSource,
): source is {
  intervention: FunnelSelectedIntervention
  interventionSlug?: undefined
} {
  return source.intervention !== undefined
}

async function resolveFunnelIntervention(
  source: FunnelInterventionSource,
): Promise<FunnelResolution | null> {
  const data = isResolvedInterventionSource(source)
    ? source.intervention
    : await findInterventionForFunnel(source.interventionSlug)

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
    },
  }
}

type ResolvedProfile = {
  profile: RuntimeProfile
  /** Ordered step definitions consumed by the wizard (UI). */
  orderedSteps: RuntimeCapability[]
}

/**
 * Resolve the funnel profile + ordered step definitions for an intervention.
 *
 * Single system: the funnel model (bespoke if defined, otherwise the generic
 * default) is the only source of steps. There is no preset path.
 */
function buildProfile(
  resolvedIntervention: ResolvedIntervention,
): ResolvedProfile {
  const orderedSteps = resolveFunnelModel(
    resolvedIntervention.interventionSlug,
  ).steps

  return {
    profile: {
      interventionSlug:
        resolvedIntervention.interventionSlug,
      capabilities: orderedSteps.map(
        (step) => step.id,
      ),
      estimatedStepCount: orderedSteps.length,
      complexity: "medium",
      leadType: "standard",
    },
    orderedSteps,
  }
}

export async function createRuntimeFunnel({
  query,
  ...source
}: CreateRuntimeFunnelInput): Promise<RuntimeFunnelPayload | null> {
  const normalizedQuery =
    normalizeOptionalText(query)

  const resolution =
    await resolveFunnelIntervention(
      source,
    )

  if (!resolution) {
    return null
  }

  const { profile: runtimeProfile, orderedSteps } =
    buildProfile(
      resolution.resolvedIntervention,
    )

  const draftInput = {
    resolved:
      resolution.resolvedIntervention,
    runtimeProfile,
    answers: {},
    stepDefinitions: orderedSteps,
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
      orderedSteps,
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
    await resolveFunnelIntervention(
      { interventionSlug },
    )

  if (!resolution) {
    return null
  }

  const { profile: runtimeProfile, orderedSteps } =
    buildProfile(
      resolution.resolvedIntervention,
    )

  return buildRequestDraft({
    resolved:
      resolution.resolvedIntervention,
    runtimeProfile,
    answers,
    stepDefinitions: orderedSteps,
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
