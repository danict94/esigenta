/**
 * FixPro V2 — Runtime Step Visibility
 *
 * FOUNDATION RUNTIME
 *
 * IMPORTANT:
 * This runtime layer controls lightweight adaptive
 * visibility for runtime capabilities.
 *
 * Supported behavior:
 * - show
 * - hide
 * - skip
 *
 * IMPORTANT:
 * Keep runtime adaptation:
 * - lightweight
 * - deterministic
 * - linear-first
 *
 * Avoid:
 * - workflow engines
 * - branching graphs
 * - recursive orchestration
 * - no-code systems
 */

import type {
  RuntimeCapability,
  RuntimeCondition,
} from "../types/capability"

import type {
  RuntimeCapabilityId,
} from "../types/runtime-profile"

/**
 * Lightweight runtime answers map.
 *
 * IMPORTANT:
 * Keys correspond to capability ids.
 */
export type RuntimeAnswers = Partial<
  Record<
    RuntimeCapabilityId,
    unknown
  >
>

/**
 * Evaluate lightweight runtime condition.
 *
 * IMPORTANT:
 * Keep deterministic and minimal.
 */
function evaluateCondition(
  condition: RuntimeCondition,
  answers: RuntimeAnswers,
): boolean {
  const currentValue =
    answers[condition.field]

  switch (condition.operator) {
    case "eq":
      return currentValue === condition.value

    case "neq":
      return currentValue !== condition.value

    case "includes":
      return Array.isArray(currentValue)
        ? currentValue.includes(
            condition.value,
          )
        : false

    case "not_includes":
      return Array.isArray(currentValue)
        ? !currentValue.includes(
            condition.value,
          )
        : true

    case "gt":
      return Number(currentValue) >
        Number(condition.value)

    case "gte":
      return Number(currentValue) >=
        Number(condition.value)

    case "lt":
      return Number(currentValue) <
        Number(condition.value)

    case "lte":
      return Number(currentValue) <=
        Number(condition.value)

    default:
      return false
  }
}

/**
 * Evaluate all runtime conditions.
 */
function evaluateConditions(
  conditions: RuntimeCondition[],
  answers: RuntimeAnswers,
): boolean {
  return conditions.every(
    (condition) =>
      evaluateCondition(
        condition,
        answers,
      ),
  )
}

/**
 * Resolve runtime capability visibility.
 *
 * IMPORTANT:
 * Runtime adaptation should remain:
 * - lightweight
 * - predictable
 * - UX-oriented
 */
export function resolveStepVisibility(
  capability: RuntimeCapability,
  answers: RuntimeAnswers,
): boolean {
  /**
   * Explicit skip conditions.
   */
  if (
    capability.skipWhen &&
    evaluateConditions(
      capability.skipWhen,
      answers,
    )
  ) {
    return false
  }

  /**
   * Conditional visibility rules.
   */
  if (
    capability.visibleWhen &&
    capability.visibleWhen.length > 0
  ) {
    return evaluateConditions(
      capability.visibleWhen,
      answers,
    )
  }

  /**
   * Default visible behavior.
   */
  return true
}
