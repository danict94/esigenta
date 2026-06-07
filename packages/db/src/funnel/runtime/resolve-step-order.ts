/**
 * Esigenta V2 — Runtime Step Ordering
 *
 * FOUNDATION RUNTIME
 *
 * IMPORTANT:
 * This file defines the lightweight runtime UX order
 * for acquisition capabilities.
 *
 * Capabilities define:
 * - WHAT information is collected
 *
 * This runtime layer defines:
 * - WHEN capabilities are shown
 *
 * IMPORTANT:
 * Keep runtime ordering:
 * - lightweight
 * - deterministic
 * - UX-first
 *
 * Avoid:
 * - workflow engines
 * - graph orchestration
 * - complex branching systems
 */

import type {
  RuntimeCapabilityId,
} from "../types/runtime-profile"

/**
 * Stable lightweight runtime acquisition order.
 *
 * IMPORTANT:
 * This order is UX-oriented,
 * NOT semantic ownership.
 */
const STEP_ORDER: RuntimeCapabilityId[] = [
  /**
   * Geo and operational context first.
   */
  "location",

  /**
   * Property context.
   */
  "property",

  /**
   * Work understanding.
   *
   * Future capabilities.
   */
  "surface-area",

  "rooms",

  /**
   * Media collection.
   */
  "photos",

  /**
   * Timing and operational urgency.
   */
  "timing",

  /**
   * Soft commercial context near the end.
   */
  "budget",

  /**
   * Contact collection near the end.
   */
  "contact",
]

/**
 * Resolve deterministic runtime capability order.
 *
 * IMPORTANT:
 * Returned order must remain stable.
 */
export function resolveStepOrder(
  capabilities: RuntimeCapabilityId[],
): RuntimeCapabilityId[] {
  const capabilitySet =
    new Set(capabilities)

  return STEP_ORDER.filter(
    (capability) =>
      capabilitySet.has(capability),
  )
}
