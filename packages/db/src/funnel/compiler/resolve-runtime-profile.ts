/**
 * FixPro V2 — Runtime Profile Resolver
 *
 * FOUNDATION COMPILER
 *
 * IMPORTANT:
 * This file converts:
 *
 * taxonomy semantic resolution
 * ->
 * runtime acquisition profile
 *
 * This layer MUST NEVER:
 * - redefine semantic meaning
 * - duplicate taxonomy logic
 * - implement matching
 * - implement frontend logic
 * - implement workflow branching systems
 */

import type {
  RuntimeCapabilityId,
  RuntimeLeadType,
  RuntimeProfile,
  RuntimePresetSlug,
  RuntimeComplexity,
} from "../types/runtime-profile"

import {
  resolveCapabilities,
} from "./resolve-capabilities"

/**
 * Minimal semantic resolution contract.
 *
 * IMPORTANT:
 * This should eventually come directly
 * from taxonomy runtime resolution.
 *
 * DO NOT duplicate taxonomy structures here.
 */
export type ResolvedIntervention = {
  interventionSlug: string

  categorySlugs: string[]

  serviceSlugs: string[]

  domainSlugs: string[]
}

/**
 * Runtime preset inference result.
 */
type RuntimeInferenceResult = {
  presetSlugs: RuntimePresetSlug[]

  capabilities: RuntimeCapabilityId[]

  complexity: RuntimeComplexity

  leadType: RuntimeLeadType
}

const PLUMBING_EMERGENCY_INTERVENTIONS =
  new Set<string>([
    "perdita-acqua",
    "riparare-tubo",
    "infiltrazione-acqua",
  ])

const PAINTING_INTERVENTIONS =
  new Set<string>([
    "tinteggiare-casa",
    "imbiancare-stanza",
    "tinteggiare-interni",
    "tinteggiare-pareti",
    "tinteggiare-esterni",
  ])

const BATHROOM_RENOVATION_INTERVENTIONS =
  new Set<string>([
    "rifare-bagno",
  ])

const HOME_RENOVATION_INTERVENTIONS =
  new Set<string>([
    "ristrutturare-casa",
    "ristrutturare-appartamento",
  ])

const ELECTRICAL_WORK_INTERVENTIONS =
  new Set<string>([
    "impianto-elettrico-nuovo",
    "saltata-corrente",
    "aggiungere-presa-elettrica",
    "sostituire-interruttore",
    "riparare-quadro-elettrico",
    "montare-lampadario",
    "riparare-citofono",
  ])

function inferPresetSlug(
  interventionSlug: string,
): RuntimePresetSlug {
  if (
    PLUMBING_EMERGENCY_INTERVENTIONS.has(
      interventionSlug,
    )
  ) {
    return "PLUMBING_EMERGENCY"
  }

  if (
    PAINTING_INTERVENTIONS.has(
      interventionSlug,
    )
  ) {
    return "PAINTING"
  }

  if (
    BATHROOM_RENOVATION_INTERVENTIONS.has(
      interventionSlug,
    )
  ) {
    return "BATHROOM_RENOVATION"
  }

  if (
    HOME_RENOVATION_INTERVENTIONS.has(
      interventionSlug,
    )
  ) {
    return "HOME_RENOVATION"
  }

  if (
    ELECTRICAL_WORK_INTERVENTIONS.has(
      interventionSlug,
    )
  ) {
    return "ELECTRICAL_WORK"
  }

  return "GENERIC"
}

/**
 * Infer runtime acquisition strategy
 * from taxonomy semantic resolution.
 *
 * IMPORTANT:
 * This is acquisition inference,
 * NOT semantic ownership.
 */
function inferRuntimeProfile(
  resolved: ResolvedIntervention,
): RuntimeInferenceResult {
  /**
   * Foundation implementation.
   *
   * Current strategy:
   * - lightweight
   * - deterministic
   * - anti-overengineering
   *
   * Future evolution may introduce:
   * - richer runtime metadata
   * - runtime scoring
   * - preset composition rules
   */

  const presetSlugs: RuntimePresetSlug[] = [
    inferPresetSlug(
      resolved.interventionSlug,
    ),
  ]

  const capabilities =
    resolveCapabilities(presetSlugs)

  return {
    presetSlugs,

    capabilities,

    complexity: "medium",

    leadType: "standard",
  }
}

/**
 * Main runtime profile compiler.
 *
 * Converts:
 *
 * taxonomy semantic resolution
 * ->
 * runtime acquisition profile
 */
export function resolveRuntimeProfile(
  resolved: ResolvedIntervention,
): RuntimeProfile {
  const inferred =
    inferRuntimeProfile(resolved)

  const capabilities =
    inferred.capabilities

  return {
    /**
     * IMPORTANT:
     * Semantic authority remains taxonomy.
     */
    interventionSlug:
      resolved.interventionSlug,

    presetSlugs:
      inferred.presetSlugs,

    capabilities,

    /**
     * Lightweight runtime estimation.
     *
     * IMPORTANT:
     * UX estimation only.
     */
    estimatedStepCount:
      capabilities.length,

    complexity:
      inferred.complexity,

    leadType:
      inferred.leadType,
  }
}
