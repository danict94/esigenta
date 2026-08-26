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
 *
 * FASE 9A: the funnel page mount event, historically called
 * "funnel_started", is split into two distinct eventTypes —
 * "funnel_opened" (fired once at mount, no interaction required — carries
 * the attribution fields, re-anchored here from the old funnel_started)
 * and a redefined "funnel_started" (fired once at the user's FIRST real
 * answer modification/selection — never mount/focus/scroll/step_viewed
 * alone; see apps/web/.../request-stepper.tsx, updateAnswer/
 * updateCustomerDescription, the only two call sites). Both are sentinel
 * ("at most once per funnelSessionId") eventTypes, same treatment
 * funnel_started alone had before this phase. See trackingVersion below
 * for how a legacy funnel_started row (old meaning) is told apart from a
 * V2 one (new meaning).
 */

import { recordFunnelEvent as writeFunnelEvent } from "@esigenta/database"
import { normalizeRuntimeText } from "@esigenta/funnel"

import { normalizeFunnelSessionId } from "../requests/funnel-session-id"

/**
 * Client-submittable event types only — "request_created" is deliberately
 * absent, see the module comment above. A client payload with
 * eventType: "request_created" is rejected with invalid_event_type, same
 * as any other unrecognized string.
 *
 * FASE 9A: "funnel_opened" added — the mount-triggered event, split off
 * from "funnel_started" (which keeps its name but is redefined to mean
 * the first real interaction — see the module comment above).
 *
 * FASE 9E: "client_validation_failed" added — fired only when the user
 * presses "Avanti"/"Prepara richiesta" and the CURRENT step's answer is
 * not yet complete (see request-stepper.tsx, goNext — the same branch
 * that already calls setError() to show the inline message, never while
 * the user is merely typing/selecting). Uses stepKey/stepIndex exactly
 * like step_viewed/step_completed (same required-fields branch below) —
 * never a sentinel, since knowing WHICH step blocked the user is the
 * entire point. No answer value, error reason, or free text is ever
 * attached — same "diagnostic correlation only" contract as every other
 * eventType here (see the module comment above).
 *
 * FASE 9H: "exit_feedback_submitted" added — DATA LAYER ONLY, no
 * modal/trigger UI produces this yet (see the FASE 9H report). Records a
 * user-chosen, controlled reason code for why they are leaving the
 * funnel, alongside the real step they were on (stepKey/stepIndex, same
 * required-fields branch as step_viewed/step_completed/
 * client_validation_failed). See EXIT_FEEDBACK_REASON_CODES/
 * normalizeReasonCode below — never free text. "At most one definitive
 * exit feedback per funnelSessionId" is enforced in the DATABASE via a
 * partial unique index this validator does not need to know about (see
 * the FunnelEvent model comment in schema.prisma) — a second attempt for
 * the same session surfaces as recordFunnelEvent's ordinary "duplicate"
 * outcome, same as any other dedup case.
 */
export const FUNNEL_EVENT_TYPES = [
  "funnel_opened",
  "funnel_started",
  "step_viewed",
  "step_completed",
  "client_validation_failed",
  "exit_feedback_submitted",
  "submit_started",
  "submit_failed",
] as const

export type FunnelEventType = (typeof FUNNEL_EVENT_TYPES)[number]

/** The one eventType that exists in FunnelEvent but is never client-submittable — see module comment. */
export const REQUEST_CREATED_EVENT_TYPE = "request_created"

/**
 * funnel_opened/funnel_started/request_created have no associated step
 * (FASE 9A adds funnel_opened to this group, same treatment funnel_started
 * alone had before). Sentinel values (never a real capability id/index,
 * never a real submit-attempt counter) so the DB's single @@unique
 * constraint dedupes them too — see the schema comment on FunnelEvent for
 * the full explanation, including why submit_started/submit_failed do NOT
 * use these sentinels (they reuse stepKey/stepIndex as a fixed "submit"
 * marker + attempt counter instead, supplied by the caller — see
 * request-stepper.tsx).
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

/**
 * FASE 9H — closed allow-list for exit_feedback_submitted's reasonCode.
 * Controlled codes ONLY, never free text — matches the exact set agreed
 * for this phase. Unlike FUNNEL_EVENT_ERROR_CODES above (which coerces an
 * unrecognized value to a default rather than rejecting the event —
 * losing the *reason* for a technical failure is acceptable, losing the
 * event is not), an unrecognized/missing reasonCode here is a HARD
 * rejection (see recordFunnelEvent below): for this eventType the
 * reasonCode IS the entire point of the event — a row with no usable
 * reason would carry no information at all, unlike a submit_failed row
 * (still meaningful even with a coarse/unknown errorCode).
 */
export const EXIT_FEEDBACK_REASON_CODES = [
  "just_browsing",
  "too_many_questions",
  "dont_know_what_to_choose",
  "dont_want_to_share_contact",
  "want_cost_first",
  "not_ready",
  "other",
] as const

export type FunnelExitFeedbackReasonCode = (typeof EXIT_FEEDBACK_REASON_CODES)[number]

/** Defensive bound only — real capability ids/slugs are short kebab-case tokens. */
const MAX_TEXT_FIELD_LENGTH = 128

/**
 * FASE 6E — the 8 attribution fields, only ever read/persisted for
 * eventType === "funnel_opened" (FASE 9A: re-anchored from
 * "funnel_started" — see the loop below and the FunnelEvent model comment
 * in schema.prisma, including CONSENT DECISION REQUIRED for gclid/gbraid/
 * wbraid). A client payload with these fields on any OTHER eventType has
 * them silently ignored, never validated, never written — not an error,
 * just outside this function's contract for that eventType.
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

/**
 * FASE 7E — closed allow-list, only meaningful for eventType ===
 * "funnel_opened" (FASE 9A: re-anchored from "funnel_started", same
 * restriction as ATTRIBUTION_FIELD_NAMES above, see
 * normalizeAttributionStatus below). "resolved" = attribution capture
 * ran without error (whether or not it actually found anything to
 * attribute); "unknown" = capture itself failed. See the FunnelEvent
 * model comment in schema.prisma for the full rationale.
 */
export const FUNNEL_ATTRIBUTION_STATUSES = ["resolved", "unknown"] as const

export type FunnelAttributionStatus = (typeof FUNNEL_ATTRIBUTION_STATUSES)[number]

/**
 * FASE 9A — closed allow-list for the legacy/V2 tracking-generation
 * marker (see the trackingVersion doc comment on the FunnelEvent model in
 * schema.prisma). Meaningful for every client-submitted eventType, never
 * gated to a single one like the attribution fields above. "v2" is the
 * one value currently defined; an unrecognized/missing value is simply
 * not persisted (same never-rejects principle as normalizeErrorCode/
 * normalizeAttributionStatus below), never a reason to reject the whole
 * event.
 */
export const FUNNEL_TRACKING_VERSIONS = ["v2"] as const

export type FunnelTrackingVersion = (typeof FUNNEL_TRACKING_VERSIONS)[number]

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

/**
 * FASE 9H — unlike normalizeErrorCode above, this does NOT coerce an
 * unrecognized value to a default: it returns undefined, and the caller
 * (recordFunnelEvent below) turns that into a hard rejection for
 * exit_feedback_submitted specifically (see EXIT_FEEDBACK_REASON_CODES).
 * Exported for the same database-avoidance reason as the other
 * normalizers here: a fully valid exit_feedback_submitted payload run
 * through recordFunnelEvent() would reach the real database write, which
 * this package's tests deliberately never do.
 */
export function normalizeReasonCode(
  value: unknown,
): FunnelExitFeedbackReasonCode | undefined {
  if (
    typeof value === "string" &&
    (EXIT_FEEDBACK_REASON_CODES as readonly string[]).includes(value)
  ) {
    return value as FunnelExitFeedbackReasonCode
  }

  return undefined
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
 * Never rejects — same principle as normalizeErrorCode above: an
 * unrecognized/missing attributionStatus is simply not persisted, never a
 * reason to reject the whole funnel_started event. Only meaningful for
 * eventType === "funnel_started" (see the caller below); on any other
 * eventType this is never even invoked. Exported for the same
 * database-avoidance reason as the other normalizers here.
 */
export function normalizeAttributionStatus(
  value: unknown,
): FunnelAttributionStatus | undefined {
  if (
    typeof value === "string" &&
    (FUNNEL_ATTRIBUTION_STATUSES as readonly string[]).includes(value)
  ) {
    return value as FunnelAttributionStatus
  }

  return undefined
}

/**
 * FASE 9A — never rejects, same principle as normalizeAttributionStatus
 * above: an unrecognized/missing trackingVersion is simply not persisted,
 * never a reason to reject the whole event. Exported for the same
 * database-avoidance reason as the other normalizers here.
 */
export function normalizeTrackingVersion(
  value: unknown,
): FunnelTrackingVersion | undefined {
  if (
    typeof value === "string" &&
    (FUNNEL_TRACKING_VERSIONS as readonly string[]).includes(value)
  ) {
    return value as FunnelTrackingVersion
  }

  return undefined
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

  // step_viewed/step_completed/client_validation_failed (FASE 9E): real
  // capability id + index (FASE 6C for the first two).
  // submit_started/submit_failed: fixed "submit" + attempt counter,
  // supplied by the caller exactly like a step id/index — no special
  // casing needed here, same required-fields check applies to both.
  // funnel_opened/funnel_started (FASE 9A): neither has a real step —
  // both fall through to the sentinel defaults set above, same as
  // funnel_started alone did before this phase.
  if (eventType !== "funnel_opened" && eventType !== "funnel_started") {
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

  // FASE 9H: unlike errorCode above, a missing/unrecognized reasonCode on
  // exit_feedback_submitted is a HARD rejection, not a best-effort
  // fallback — see normalizeReasonCode's own comment for why. Computed
  // (and checked) only for this eventType; every other eventType ignores
  // body.reasonCode entirely (never validated, never written).
  const reasonCode =
    eventType === "exit_feedback_submitted"
      ? normalizeReasonCode(body.reasonCode)
      : undefined

  if (eventType === "exit_feedback_submitted" && !reasonCode) {
    return {
      ok: false,
      status: 400,
      error: "reasonCode is required and must be one of the recognized values",
      code: "invalid_reason_code",
    }
  }

  // FASE 9A: attribution is captured once, at OPEN time — re-anchored from
  // "funnel_started" to "funnel_opened" together with the mount event
  // itself (see the module comment above). Capture logic/consent rules
  // are unchanged; only the eventType they attach to moved.
  const attribution =
    eventType === "funnel_opened" ? normalizeAttributionFields(body) : {}

  const attributionStatus =
    eventType === "funnel_opened"
      ? normalizeAttributionStatus(body.attributionStatus)
      : undefined

  // FASE 9A: unlike attribution above, NOT gated to a single eventType —
  // meaningful (and accepted, if present) for every client-submitted
  // event, so a future new eventType can't silently forget to tag itself.
  const trackingVersion = normalizeTrackingVersion(body.trackingVersion)

  const outcome = await writeFunnelEvent({
    funnelSessionId,
    interventionSlug,
    eventType,
    stepKey,
    stepIndex,
    ...(errorCode ? { errorCode } : {}),
    ...(reasonCode ? { reasonCode } : {}),
    ...attribution,
    ...(attributionStatus ? { attributionStatus } : {}),
    ...(trackingVersion ? { trackingVersion } : {}),
  })

  return { ok: true, outcome }
}
