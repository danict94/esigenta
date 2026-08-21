/**
 * Esigenta — Funnel Event Ingestion (FASE 6C, extended FASE 6D/6E)
 *
 * FOUNDATION
 *
 * IMPORTANT:
 * This validates and normalizes ONE untrusted client payload, then
 * delegates the actual write to @esigenta/database's recordFunnelEvent —
 * mirrors packages/domain/src/public/requests/submit-runtime-request.ts.
 *
 * It does NOT:
 * - block the funnel on validation failure (the caller — the API route —
 *   still just returns an HTTP status; the CLIENT is the one responsible
 *   for never letting that affect the user, see
 *   apps/web/.../track-funnel-event.ts)
 * - store any form answer, contact detail, address, coordinates, IP, full
 *   user agent, or free-form metadata
 * - depend on cookie consent in any way
 * - accept "request_created" from a client payload (see FUNNEL_EVENT_TYPES
 *   below) — that eventType is written ONLY server-side, directly by
 *   packages/domain/src/public/requests/create-request.ts, after the
 *   Request's own transaction has committed. Trusting a client-submitted
 *   "request_created" would let a buggy or malicious client record a
 *   creation that never actually happened — this module structurally
 *   cannot do that, since createRequestFromDraft never routes through
 *   this validator, it calls @esigenta/database directly.
 */

import { recordFunnelEvent as writeFunnelEvent } from "@esigenta/database"
import { normalizeRuntimeText } from "@esigenta/funnel"

import { normalizeFunnelSessionId } from "../requests/funnel-session-id"

/**
 * Client-submittable event types only — "request_created" is deliberately
 * absent, see the module comment above. A client payload with
 * eventType: "request_created" is rejected with invalid_event_type, same
 * as any other unrecognized string.
 */
export const FUNNEL_EVENT_TYPES = [
  "funnel_started",
  "step_viewed",
  "step_completed",
  "submit_started",
  "submit_failed",
] as const

export type FunnelEventType = (typeof FUNNEL_EVENT_TYPES)[number]

/** The one eventType that exists in FunnelEvent but is never client-submittable — see module comment. */
export const REQUEST_CREATED_EVENT_TYPE = "request_created"

/**
 * funnel_started/request_created have no associated step. Sentinel values
 * (never a real capability id/index, never a real submit-attempt counter)
 * so the DB's single @@unique constraint dedupes them too — see the
 * schema comment on FunnelEvent for the full explanation, including why
 * submit_started/submit_failed do NOT use these sentinels (they reuse
 * stepKey/stepIndex as a fixed "submit" marker + attempt counter instead,
 * supplied by the caller — see request-stepper.tsx).
 */
export const FUNNEL_EVENT_STEP_SENTINEL_KEY = ""
export const FUNNEL_EVENT_STEP_SENTINEL_INDEX = -1

/**
 * Closed allow-list for submit_failed's errorCode (FASE 6D). Real
 * @esigenta/domain application error codes (same strings create-request.ts/
 * submit-runtime-request.ts already return in the API error response —
 * see request-stepper.tsx's getRequestSubmitErrorMessage, the same list)
 * plus two controlled non-application codes. Never error.message, never a
 * stack trace, never an arbitrary client string: anything outside this
 * list normalizes to "unexpected_error" rather than being rejected —
 * losing the *reason* for a submit_failed is acceptable, losing the event
 * entirely is not.
 */
export const FUNNEL_EVENT_ERROR_CODES = [
  "invalid_customer_email",
  "invalid_customer_name",
  "invalid_customer_phone",
  "invalid_request_location",
  "invalid_request_photos",
  "missing_intervention_slug",
  "missing_intervention",
  "intervention_not_found",
  "missing_required_services",
  "invalid_required_services",
  "invalid_json_payload",
  "request_creation_failed",
  "network_error",
  "unexpected_error",
] as const

export type FunnelEventErrorCode = (typeof FUNNEL_EVENT_ERROR_CODES)[number]

const DEFAULT_ERROR_CODE: FunnelEventErrorCode = "unexpected_error"

/** Defensive bound only — real capability ids/slugs are short kebab-case tokens. */
const MAX_TEXT_FIELD_LENGTH = 128

/**
 * FASE 6E — the 8 attribution fields, only ever read/persisted for
 * eventType === "funnel_started" (see the loop below and the
 * FunnelEvent model comment in schema.prisma, including
 * CONSENT DECISION REQUIRED for gclid/gbraid/wbraid). A client payload
 * with these fields on any OTHER eventType has them silently ignored,
 * never validated, never written — not an error, just outside this
 * function's contract for that eventType.
 */
const ATTRIBUTION_FIELD_NAMES = [
  "gclid",
  "gbraid",
  "wbraid",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
] as const

type AttributionFieldName = (typeof ATTRIBUTION_FIELD_NAMES)[number]

export type RecordFunnelEventInput = Record<string, unknown>

export type RecordFunnelEventResult =
  | { ok: true; outcome: "created" | "duplicate" }
  | { ok: false; status: number; error: string; code: string }

function isFunnelEventType(value: unknown): value is FunnelEventType {
  return (
    typeof value === "string" &&
    (FUNNEL_EVENT_TYPES as readonly string[]).includes(value)
  )
}

/**
 * Never rejects: an unrecognized/missing errorCode is diagnostic
 * information worth keeping in coarser form ("something failed, we don't
 * know exactly why") rather than a reason to reject the whole event.
 * Exported so its coercion behavior is unit-testable on its own — a fully
 * valid submit_failed payload run through recordFunnelEvent() would reach
 * the real database write, which this package's tests deliberately never
 * do (see record-funnel-event.test.ts).
 */
export function normalizeErrorCode(value: unknown): FunnelEventErrorCode {
  if (
    typeof value === "string" &&
    (FUNNEL_EVENT_ERROR_CODES as readonly string[]).includes(value)
  ) {
    return value as FunnelEventErrorCode
  }

  return DEFAULT_ERROR_CODE
}

function normalizeBoundedText(value: unknown): string | undefined {
  const normalized = normalizeRuntimeText(value)

  if (!normalized || normalized.length > MAX_TEXT_FIELD_LENGTH) {
    return undefined
  }

  return normalized
}

function normalizeStepIndex(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return undefined
  }

  return value
}

/**
 * Same trim + length-bound rule as every other text field here (no
 * separate rule for "these are attribution/marketing values") — see
 * ATTRIBUTION_FIELD_NAMES above for why this only ever runs for
 * funnel_started. Exported for the same reason as normalizeErrorCode: a
 * fully valid funnel_started payload run through recordFunnelEvent()
 * would reach the real database write, which this package's tests
 * deliberately never do.
 */
export function normalizeAttributionFields(
  body: RecordFunnelEventInput,
): Partial<Record<AttributionFieldName, string>> {
  const attribution: Partial<Record<AttributionFieldName, string>> = {}

  for (const field of ATTRIBUTION_FIELD_NAMES) {
    const normalized = normalizeBoundedText(body[field])

    if (normalized) {
      attribution[field] = normalized
    }
  }

  return attribution
}

/**
 * Validates one raw client payload for POST /api/funnel/events and, if
 * valid, records it. A rejection here (ok: false) is a normal, expected
 * outcome for garbage/malformed input — never a throw — and carries no
 * consequence for the funnel itself: the API route just returns the
 * status, and the client never waits for or reacts to it (fire-and-forget,
 * see apps/web/.../track-funnel-event.ts).
 */
export async function recordFunnelEvent(
  body: RecordFunnelEventInput,
): Promise<RecordFunnelEventResult> {
  const funnelSessionId = normalizeFunnelSessionId(body.funnelSessionId)

  if (!funnelSessionId) {
    return {
      ok: false,
      status: 400,
      error: "funnelSessionId is required and must be a valid id",
      code: "invalid_funnel_session_id",
    }
  }

  const interventionSlug = normalizeBoundedText(body.interventionSlug)

  if (!interventionSlug) {
    return {
      ok: false,
      status: 400,
      error: "interventionSlug is required",
      code: "missing_intervention_slug",
    }
  }

  if (!isFunnelEventType(body.eventType)) {
    return {
      ok: false,
      status: 400,
      error: "eventType is not one of the recognized funnel events",
      code: "invalid_event_type",
    }
  }

  const eventType = body.eventType

  let stepKey: string = FUNNEL_EVENT_STEP_SENTINEL_KEY
  let stepIndex: number = FUNNEL_EVENT_STEP_SENTINEL_INDEX

  // step_viewed/step_completed: real capability id + index (FASE 6C).
  // submit_started/submit_failed: fixed "submit" + attempt counter,
  // supplied by the caller exactly like a step id/index — no special
  // casing needed here, same required-fields check applies to both.
  if (eventType !== "funnel_started") {
    const normalizedStepKey = normalizeBoundedText(body.stepKey)
    const normalizedStepIndex = normalizeStepIndex(body.stepIndex)

    if (!normalizedStepKey) {
      return {
        ok: false,
        status: 400,
        error: "stepKey is required for this eventType",
        code: "missing_step_key",
      }
    }

    if (normalizedStepIndex === undefined) {
      return {
        ok: false,
        status: 400,
        error: "stepIndex is required for this eventType",
        code: "missing_step_index",
      }
    }

    stepKey = normalizedStepKey
    stepIndex = normalizedStepIndex
  }

  const errorCode =
    eventType === "submit_failed"
      ? normalizeErrorCode(body.errorCode)
      : undefined

  const attribution =
    eventType === "funnel_started" ? normalizeAttributionFields(body) : {}

  const outcome = await writeFunnelEvent({
    funnelSessionId,
    interventionSlug,
    eventType,
    stepKey,
    stepIndex,
    ...(errorCode ? { errorCode } : {}),
    ...attribution,
  })

  return { ok: true, outcome }
}
