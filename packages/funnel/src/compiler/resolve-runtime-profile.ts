/**
 * Esigenta V2 — Runtime Profile Resolver
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

  runtimePresetSlugs?: RuntimePresetSlug[]
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

function resolvePresetSlugs(
  resolved: ResolvedIntervention,
): RuntimePresetSlug[] {
  const presetSlugs =
    Array.from(
      new Set(
        resolved.runtimePresetSlugs ?? [],
      ),
    ).sort()

  return presetSlugs.length > 0
    ? presetSlugs
    : ["GENERIC"]
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
   * - taxonomy-driven
   */

  const presetSlugs =
    resolvePresetSlugs(resolved)

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
