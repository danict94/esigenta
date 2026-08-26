/**
 * Esigenta — Admin Funnel: V2 session status policy (FASE 9D)
 *
 * FOUNDATION — PURE, NO DB ACCESS
 *
 * Single source of truth for two things admin-funnel-metrics.ts needs to
 * classify a V2 funnel session (funnel_started with trackingVersion "v2")
 * into exactly one of CONVERTED / IN_PROGRESS / ABANDONED (or the
 * defensive INVALID branch — see classifySessionStatus below):
 *
 * 1. MEANINGFUL_ACTIVITY_EVENT_TYPES — which eventTypes count as real user
 *    activity for the purpose of "when did this session last do
 *    something", as opposed to just startedAt.
 * 2. FUNNEL_ABANDONMENT_INACTIVITY_MINUTES — how long since the last
 *    meaningful activity before a non-converted session stops being
 *    "in progress" and becomes "abandoned".
 *
 * No existing session/inactivity policy was found elsewhere in this
 * codebase to reuse (searched for INACTIVITY-, SESSION_TIMEOUT-,
 * STALE_MINUTES-, ABANDONMENT-style constants across packages/domain,
 * packages/database, apps/admin — see the FASE 9D report). The auth
 * Session model's expiresAt in schema.prisma is a different concept
 * entirely (a logged-in admin/company session's token lifetime),
 * unrelated to an anonymous funnel visitor's inactivity — not reused,
 * not repurposed.
 */

import {
  FUNNEL_EVENT_TYPES,
  REQUEST_CREATED_EVENT_TYPE,
} from "../../public/funnel-events"

/**
 * "Meaningful activity" = every real signal that a session is (or was)
 * actively being worked on by a person — every client-submittable
 * eventType EXCEPT funnel_opened, plus request_created. funnel_opened is
 * deliberately excluded: it fires automatically at mount, with zero
 * interaction required (see FunnelEvent's model comment in schema.prisma
 * and request-stepper.tsx) — that is the entire reason FASE 9A introduced
 * funnel_started as a separate, interaction-gated event in the first
 * place. Treating funnel_opened as "activity" here would silently
 * reintroduce the exact ambiguity FASE 9A removed.
 *
 * Derived from the canonical eventType allow-lists (FUNNEL_EVENT_TYPES +
 * REQUEST_CREATED_EVENT_TYPE) rather than hand-typed strings, so this can
 * never reference an eventType that does not actually exist in the
 * system — a new client eventType added later becomes "meaningful" by
 * default unless explicitly excluded here, which is the safer default
 * (a new real user action should count as activity unless proven
 * otherwise).
 *
 * FASE 9F — CONFIRMED, on purpose: "client_validation_failed" (FASE 9E,
 * fired only when the user explicitly presses "Avanti"/"Prepara
 * richiesta" and the current step is not yet valid — see
 * request-stepper.tsx, goNext) is included here through this same
 * derivation, with no special-casing needed. This was verified
 * deliberately, not left as an accidental side effect of the derivation
 * above: someone typing, correcting, and retrying on a blocked step is
 * unambiguously still working on the funnel — arguably a STRONGER
 * engagement signal than a passive step_viewed. Excluding it would let a
 * session that is visibly still being fought over expire into ABANDONED
 * purely because no OTHER event happened to fire in the meantime. See
 * funnel-session-status-policy.test.ts for the test that locks this in.
 *
 * FASE 9I — CONFIRMED, the OPPOSITE way: "exit_feedback_submitted" (FASE
 * 9H) is explicitly EXCLUDED here, overriding the "included by default
 * unless proven otherwise" rule stated above. Left in this derived list
 * (as it was between FASE 9H and FASE 9I) it would silently PROLONG a
 * session's IN_PROGRESS window every time someone submitted exit
 * feedback — exactly backwards: telling us "why I'm leaving" is the one
 * signal that a session is over, not evidence it is still being worked
 * on. See classifySessionStatus below for where this eventType is
 * instead given its own immediate-ABANDONED handling, ahead of the
 * time-based threshold entirely.
 */
export const MEANINGFUL_ACTIVITY_EVENT_TYPES: readonly string[] = [
  ...FUNNEL_EVENT_TYPES.filter(
    (eventType) =>
      eventType !== "funnel_opened" && eventType !== "exit_feedback_submitted",
  ),
  REQUEST_CREATED_EVENT_TYPE,
]

/**
 * FASE 9D — the IN_PROGRESS/ABANDONED boundary: a non-converted V2
 * session is IN_PROGRESS if its last meaningful activity happened within
 * this many minutes of "now", ABANDONED otherwise. 30 minutes: long
 * enough that a customer genuinely filling in photos/notes/contact
 * details — including a real pause to find a document or a photo — is
 * never misclassified mid-task, short enough that a truly abandoned
 * session is not still reported as "in progress" hours or days later.
 *
 * The one place this number appears — never hardcoded a second time
 * anywhere else (see classifySessionStatus's default parameter and its
 * callers in admin-funnel-metrics.ts).
 */
export const FUNNEL_ABANDONMENT_INACTIVITY_MINUTES = 30

/**
 * FASE 9D — the four possible outcomes for a V2 funnel session.
 * "invalid" is a defensive-only branch, never a real business status —
 * see classifySessionStatus below for exactly when it can occur.
 */
export type AdminFunnelV2SessionStatus =
  | "converted"
  | "in_progress"
  | "abandoned"
  | "invalid"

export type ClassifySessionStatusInput = {
  /** Does this session have at least one request_created event? */
  hasConverted: boolean
  /**
   * FASE 9I — does this session have at least one exit_feedback_submitted
   * event? Checked independently of lastMeaningfulActivityAt/
   * MEANINGFUL_ACTIVITY_EVENT_TYPES (exit_feedback_submitted is
   * deliberately EXCLUDED from that activity set — see its doc comment
   * above): this is a separate, definitive signal, not a form of
   * "activity" that should extend IN_PROGRESS. Defaults to false so every
   * existing caller/test that predates this field keeps its original
   * behavior unchanged.
   */
  hasExitFeedback?: boolean
  /** MAX(createdAt) among this session's MEANINGFUL_ACTIVITY_EVENT_TYPES rows, or null if none exist at all. */
  lastMeaningfulActivityAt: Date | null
  /** Captured once by the caller (never `new Date()` inside this pure function) so every session in the same call is judged against the identical instant. */
  now: Date
  /** Defaults to FUNNEL_ABANDONMENT_INACTIVITY_MINUTES — overridable only for tests, never hardcoded again at a call site. */
  inactivityThresholdMinutes?: number
}

/**
 * Pure classifier — exported for unit testing (no DB access).
 *
 * Precedence, top to bottom, each one absolute over everything below it:
 *
 * 1. CONVERTED — hasConverted always wins, regardless of how stale
 *    lastMeaningfulActivityAt is or whether exit feedback was ever
 *    submitted: request_created is the one server-authoritative signal
 *    (written directly by create-request.ts after its own transaction
 *    commits — see FunnelEvent's model comment in schema.prisma), and a
 *    customer can legitimately still be verifying their email or
 *    otherwise following up long after their last funnel interaction (or
 *    even after telling us, earlier, that they were leaving — a session
 *    can recover).
 * 2. ABANDONED, immediately (FASE 9I) — hasExitFeedback, when true and
 *    not converted, short-circuits straight to "abandoned", WITHOUT ever
 *    consulting lastMeaningfulActivityAt or the 30-minute threshold.
 *    Deliberate: exit_feedback_submitted is excluded from
 *    MEANINGFUL_ACTIVITY_EVENT_TYPES precisely so it is never treated as
 *    generic activity that would prolong IN_PROGRESS — a person who told
 *    us why they are leaving is not "still working on it" just because
 *    the clock hasn't hit 30 minutes yet.
 * 3. INVALID — reached ONLY when lastMeaningfulActivityAt is null (no
 *    exit feedback either, per #2 above) — i.e. the caller believes this
 *    session belongs to the V2 "started" cohort (see
 *    admin-funnel-metrics.ts) yet no meaningful-activity row was found
 *    for it at all. Should not be structurally possible: every V2
 *    session in the "started" cohort has, BY DEFINITION, at least its own
 *    funnel_started row, and funnel_started IS one of the
 *    MEANINGFUL_ACTIVITY_EVENT_TYPES above. If it happens anyway (a data
 *    anomaly, a caller bug, a race), this branch exists specifically so
 *    it is surfaced as "invalid" and counted separately — never silently
 *    miscounted as "abandoned".
 * 4. IN_PROGRESS / ABANDONED by the 30-minute threshold — the original
 *    FASE 9D policy, unchanged, for every session that reaches this
 *    point (not converted, no exit feedback, has a real
 *    lastMeaningfulActivityAt).
 */
export function classifySessionStatus({
  hasConverted,
  hasExitFeedback = false,
  lastMeaningfulActivityAt,
  now,
  inactivityThresholdMinutes = FUNNEL_ABANDONMENT_INACTIVITY_MINUTES,
}: ClassifySessionStatusInput): AdminFunnelV2SessionStatus {
  if (hasConverted) {
    return "converted"
  }

  if (hasExitFeedback) {
    return "abandoned"
  }

  if (!lastMeaningfulActivityAt) {
    return "invalid"
  }

  const thresholdMs = inactivityThresholdMinutes * 60_000
  const elapsedMs = now.getTime() - lastMeaningfulActivityAt.getTime()

  return elapsedMs < thresholdMs ? "in_progress" : "abandoned"
}

export type SessionStatusCounts = {
  totalConverted: number
  totalInProgress: number
  totalAbandoned: number
  /** Always exposed, even when 0 — see the module comment on "invalid" above: never hidden. */
  totalInvalid: number
}

/**
 * Pure reducer — exported for unit testing. Partitions every status in
 * `statuses` into exactly one of the four buckets, so
 * `statuses.length === totalConverted + totalInProgress + totalAbandoned
 * + totalInvalid` holds by construction, not by coincidence — this is
 * what guarantees totalStarted = converted + inProgress + abandoned
 * (+ invalid, when present) in admin-funnel-metrics.ts, rather than two
 * independently-computed numbers that merely happen to agree.
 */
export function summarizeSessionStatuses(
  statuses: AdminFunnelV2SessionStatus[],
): SessionStatusCounts {
  const counts: SessionStatusCounts = {
    totalConverted: 0,
    totalInProgress: 0,
    totalAbandoned: 0,
    totalInvalid: 0,
  }

  for (const status of statuses) {
    if (status === "converted") {
      counts.totalConverted += 1
    } else if (status === "in_progress") {
      counts.totalInProgress += 1
    } else if (status === "abandoned") {
      counts.totalAbandoned += 1
    } else {
      counts.totalInvalid += 1
    }
  }

  return counts
}

export type SessionRates = {
  /** totalConverted + totalAbandoned — deliberately excludes totalInProgress AND totalInvalid: neither is a "resolved" outcome yet. */
  resolvedSessions: number
  conversionRate: number
  abandonmentRate: number
}

/**
 * Pure — exported for unit testing. Takes ONLY totalConverted/
 * totalAbandoned as input: by construction (this signature), totalOpened
 * and totalStarted can never leak into these rates as a denominator — see
 * the FASE 9D report, invariant "Aperture funnel non entra nei
 * denominatori dei rate". Zero-denominator case (resolvedSessions === 0)
 * reuses the SAME convention already established by computeRate in
 * admin-funnel-metrics.ts (0, never NaN/Infinity) — passed in by the
 * caller rather than reimplemented here, so there is exactly one
 * "denominator <= 0 -> 0" rule in the codebase, not two.
 */
export function computeSessionRates(
  { totalConverted, totalAbandoned }: { totalConverted: number; totalAbandoned: number },
  computeRate: (numerator: number, denominator: number) => number,
): SessionRates {
  const resolvedSessions = totalConverted + totalAbandoned

  return {
    resolvedSessions,
    conversionRate: computeRate(totalConverted, resolvedSessions),
    abandonmentRate: computeRate(totalAbandoned, resolvedSessions),
  }
}
