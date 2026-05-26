/**
 * FixPro V2 - Runtime Validation
 *
 * FOUNDATION RUNTIME
 *
 * IMPORTANT:
 * This validates runtime acquisition contracts only.
 *
 * It does NOT validate:
 * - taxonomy semantics
 * - intervention meaning
 * - service reachability
 * - matching eligibility
 * - persistence rules
 */

import type {
  RuntimeCapabilityId,
  RuntimePresetSlug,
  RuntimeProfile,
} from "../types/runtime-profile"

import type {
  RuntimeAnswers,
} from "./resolve-step-visibility"

export type RuntimeValidationIssue = {
  code: string
  message: string
  field?: string
}

export type RuntimeValidationResult = {
  valid: boolean
  issues: RuntimeValidationIssue[]
}

const KNOWN_CAPABILITIES: RuntimeCapabilityId[] = [
  "location",
  "property",
  "photos",
  "timing",
  "budget",
  "surface-area",
  "rooms",
  "contact",
]

const KNOWN_PRESETS: RuntimePresetSlug[] = [
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
]

function createIssue(
  code: string,
  message: string,
  field?: string,
): RuntimeValidationIssue {
  if (field) {
    return {
      code,
      message,
      field,
    }
  }

  return {
    code,
    message,
  }
}

function hasDuplicates<T extends string>(
  values: T[],
): boolean {
  return new Set(values).size !== values.length
}

function isKnownCapability(
  value: string,
): value is RuntimeCapabilityId {
  return KNOWN_CAPABILITIES.includes(
    value as RuntimeCapabilityId,
  )
}

function isKnownPreset(
  value: string,
): value is RuntimePresetSlug {
  return KNOWN_PRESETS.includes(
    value as RuntimePresetSlug,
  )
}

/**
 * Validate a compiled runtime profile.
 *
 * IMPORTANT:
 * This is structural runtime validation.
 * Taxonomy graph integrity is validated elsewhere.
 */
export function validateRuntimeProfile(
  profile: RuntimeProfile,
): RuntimeValidationResult {
  const issues: RuntimeValidationIssue[] = []

  if (!profile.interventionSlug.trim()) {
    issues.push(
      createIssue(
        "missing_intervention",
        "Runtime profile requires a resolved intervention slug.",
        "interventionSlug",
      ),
    )
  }

  if (profile.presetSlugs.length === 0) {
    issues.push(
      createIssue(
        "missing_presets",
        "Runtime profile requires at least one acquisition preset.",
        "presetSlugs",
      ),
    )
  }

  if (hasDuplicates(profile.presetSlugs)) {
    issues.push(
      createIssue(
        "duplicate_presets",
        "Runtime profile contains duplicate preset slugs.",
        "presetSlugs",
      ),
    )
  }

  for (const presetSlug of profile.presetSlugs) {
    if (!isKnownPreset(presetSlug)) {
      issues.push(
        createIssue(
          "unknown_preset",
          `Unknown runtime preset: ${presetSlug}.`,
          "presetSlugs",
        ),
      )
    }
  }

  if (profile.capabilities.length === 0) {
    issues.push(
      createIssue(
        "missing_capabilities",
        "Runtime profile requires at least one acquisition capability.",
        "capabilities",
      ),
    )
  }

  if (hasDuplicates(profile.capabilities)) {
    issues.push(
      createIssue(
        "duplicate_capabilities",
        "Runtime profile contains duplicate capabilities.",
        "capabilities",
      ),
    )
  }

  for (const capability of profile.capabilities) {
    if (!isKnownCapability(capability)) {
      issues.push(
        createIssue(
          "unknown_capability",
          `Unknown runtime capability: ${capability}.`,
          "capabilities",
        ),
      )
    }
  }

  if (
    !Number.isInteger(profile.estimatedStepCount) ||
    profile.estimatedStepCount < 0
  ) {
    issues.push(
      createIssue(
        "invalid_estimated_step_count",
        "Runtime profile estimated step count must be a non-negative integer.",
        "estimatedStepCount",
      ),
    )
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Validate answers against the active runtime profile.
 *
 * IMPORTANT:
 * This only verifies structural runtime coherence.
 */
export function validateRuntimeAnswers(
  profile: RuntimeProfile,
  answers: RuntimeAnswers,
): RuntimeValidationResult {
  const profileValidation =
    validateRuntimeProfile(profile)

  const issues = [
    ...profileValidation.issues,
  ]

  const activeCapabilities =
    new Set(profile.capabilities)

  for (const key of Object.keys(answers)) {
    if (!isKnownCapability(key)) {
      issues.push(
        createIssue(
          "unknown_answer_key",
          `Unknown runtime answer key: ${key}.`,
          "rawAnswers",
        ),
      )

      continue
    }

    if (!activeCapabilities.has(key)) {
      issues.push(
        createIssue(
          "inactive_answer_key",
          `Runtime answer key is not active in this profile: ${key}.`,
          "rawAnswers",
        ),
      )
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Small assertion helper for compiler entry points.
 */
export function assertValidRuntimeProfile(
  profile: RuntimeProfile,
): void {
  const validation =
    validateRuntimeProfile(profile)

  if (!validation.valid) {
    throw new Error(
      validation.issues
        .map((issue) => issue.message)
        .join(" "),
    )
  }
}
