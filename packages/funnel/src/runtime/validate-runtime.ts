/**
 * Esigenta V2 - Runtime Validation
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
