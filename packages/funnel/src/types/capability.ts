/**
 * Esigenta V2 — Funnel Capability Contracts
 *
 * FOUNDATION CONTRACT
 *
 * This file defines reusable runtime acquisition primitives.
 *
 * IMPORTANT:
 * Capabilities are NOT semantic meaning.
 *
 * They represent:
 * - reusable acquisition units
 * - adaptive runtime inputs
 * - lightweight wizard building blocks
 *
 * The taxonomy remains the semantic authority.
 */

import type {
  RuntimeStepId,
} from "./runtime-profile"

export type RuntimeStepType =
  | "location"
  | "contact"
  | "single_select"
  | "multi_select"
  | "text"
  | "textarea"
  | "number"
  | "photo_upload"

export type RuntimeConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "includes"
  | "not_includes"

export type RuntimeCondition = {
  /**
   * Step identifier to inspect.
   *
   * Example:
   * "property"
   * "surface-area"
   * "cartongesso:controsoffitto:needs"
   */
  field: RuntimeStepId

  /**
   * Runtime comparison operator.
   */
  operator: RuntimeConditionOperator

  /**
   * Runtime comparison value.
   */
  value: unknown
}

export type RuntimeOption = {
  /**
   * Stable runtime value.
   *
   * IMPORTANT:
   * Must remain stable for runtime logic.
   */
  value: string

  /**
   * Human-readable UI label.
   */
  label: string
}

export type RuntimeCapability = {
  /**
   * Stable funnel step identifier.
   *
   * Common reusable steps use a RuntimeCapabilityId; intervention-model steps
   * use their own namespaced id (see RuntimeStepId).
   */
  id: RuntimeStepId

  /**
   * Runtime rendering type.
   */
  type: RuntimeStepType

  /**
   * User-facing acquisition question.
   */
  question: string

  /**
   * Optional helper text.
   */
  description?: string

  /**
   * Optional input placeholder for free-form capabilities.
   */
  placeholder?: string

  /**
   * Runtime options for select-based capabilities.
   */
  options?: RuntimeOption[]

  /**
   * Marks capability as optional.
   *
   * IMPORTANT:
   * Optional in runtime UX,
   * not necessarily optional operationally.
   */
  optional?: boolean

  /**
   * Conditional runtime visibility.
   *
   * Used for lightweight adaptive behavior.
   *
   * IMPORTANT:
   * The runtime must remain linear-first.
   *
   * Avoid:
   * - deep branching
   * - workflow graphs
   * - complex decision trees
   */
  visibleWhen?: RuntimeCondition[]

  /**
   * Conditional runtime skipping.
   */
  skipWhen?: RuntimeCondition[]
}
