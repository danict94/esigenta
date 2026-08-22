/**
 * Esigenta — Admin Funnel Dashboard metrics (FASE 6F)
 *
 * READ-ONLY AGGREGATION LAYER
 *
 * Mirrors packages/domain/src/admin/dashboard/admin-dashboard.ts: parallel
 * Promise.all batches of prisma.count()/groupBy() calls, no N+1. The one
 * exception is getAbandonmentByLastStep below, which needs a genuine
 * per-session (not per-event) aggregate and is computed entirely inside
 * Postgres via a parametrized raw query (Prisma.sql — every value is bound,
 * never string-concatenated) — only the small grouped result crosses back
 * into Node. getRecentFunnelSessions is the only place that reads
 * individual event rows, and it is explicitly bounded (see its comment).
 *
 * This module never writes to FunnelEvent (see
 * packages/database/src/funnel/record-funnel-event.ts for the only write
 * path) and never reads any table other than FunnelEvent — no join back to
 * Request, no customer PII of any kind. funnelSessionId is a random
 * client-generated UUID (see packages/domain/.../funnel-session-id.ts),
 * safe to display as-is.
 *
 * IMPORTANT — as of FASE 6F, the FunnelEvent table does not exist in any
 * database yet (migration 20260821120000_add_funnel_event is deliberately
 * unapplied, see FASE 6C/6D/6E reports). Every query here has been
 * typechecked and reviewed but not yet exercised against a live database —
 * see the FASE 6F report, "Residui per FASE 6G".
 */

import { Prisma } from "@prisma/client"

import { prisma } from "@esigenta/database"
import { resolveFunnelModel } from "@esigenta/funnel"

export type AdminFunnelPeriod = "7d" | "30d" | "90d" | "all"
export type AdminFunnelProvenance = "google_ads" | "campaign" | "direct" | "unknown"

export type AdminFunnelFilters = {
  period?: AdminFunnelPeriod
  interventionSlug?: string
  provenance?: AdminFunnelProvenance
}

export type AdminFunnelStepRow = {
  stepKey: string
  stepLabel: string
  stepIndex: number
  viewedCount: number
  completedCount: number
  completionRate: number
}

export type AdminFunnelErrorRow = {
  errorCode: string
  count: number
}

export type AdminFunnelAbandonmentRow = {
  stepKey: string | null
  stepLabel: string
  sessionCount: number
}

export type AdminFunnelAttributionRow = {
  source: AdminFunnelProvenance
  label: string
  sessionCount: number
}

export type AdminFunnelSessionStatus = "converted" | "submitting" | "abandoned"

export type AdminFunnelSessionSummary = {
  funnelSessionId: string
  interventionSlug: string
  startedAt: Date
  status: AdminFunnelSessionStatus
  lastStepLabel: string
  attributionSource: AdminFunnelProvenance
}

export type AdminFunnelMetrics = {
  totalStarted: number
  totalConverted: number
  conversionRate: number
  totalSubmitStarted: number
  totalSubmitFailed: number
  submitFailureRate: number
  totalAbandoned: number
  abandonmentRate: number
  steps: AdminFunnelStepRow[]
  errors: AdminFunnelErrorRow[]
  abandonmentByLastStep: AdminFunnelAbandonmentRow[]
  attribution: AdminFunnelAttributionRow[]
  recentSessions: AdminFunnelSessionSummary[]
  interventionOptions: string[]
}

const RECENT_SESSIONS_LIMIT = 25

// --- Pure helpers (exported for unit testing — no DB access, see
// admin-funnel-metrics.test.ts, same pattern as normalizeErrorCode/
// normalizeAttributionFields in packages/domain/.../funnel-events) ---

export function resolvePeriodSince(
  period: AdminFunnelPeriod | undefined,
  now: Date = new Date(),
): Date | undefined {
  if (!period || period === "all") {
    return undefined
  }

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export function computeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0
  }

  return numerator / denominator
}

export function humanizeStepKey(stepKey: string): string {
  if (!stepKey) {
    return "Avvio funnel"
  }

  return stepKey
    .replace(/[-_:]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Real step question when the intervention model is known (via
 * @esigenta/funnel — pure, no DB), otherwise a humanized fallback of the
 * raw stepKey. Cross-intervention aggregations (no interventionSlug
 * filter) intentionally fall back to the humanized id: the same stepKey
 * can carry a different question in different intervention models — only
 * the common spine (location/photos/note/timing/contact) reliably lines
 * up across all of them.
 */
export function resolveStepLabel(
  stepKey: string,
  interventionSlug?: string,
): string {
  if (interventionSlug) {
    const model = resolveFunnelModel(interventionSlug)
    const capability = model.steps.find((step) => step.id === stepKey)

    if (capability) {
      return capability.question
    }
  }

  return humanizeStepKey(stepKey)
}

const PROVENANCE_LABELS: Record<AdminFunnelProvenance, string> = {
  google_ads: "Google Ads (gclid/gbraid/wbraid)",
  campaign: "Campagna (UTM)",
  direct: "Diretto / organico",
  // FASE 7E: distinta da "direct" — qui la cattura dell'attribution è
  // fallita tecnicamente (es. sessionStorage bloccata), non è stata
  // semplicemente assente. Vedi deriveAttributionSource sotto e il
  // commento sul modello FunnelEvent in schema.prisma.
  unknown: "Non determinabile (errore tecnico)",
}

export function provenanceLabel(provenance: AdminFunnelProvenance): string {
  return PROVENANCE_LABELS[provenance]
}

/**
 * Same classification used to build the provenance filter — reused here to
 * label one funnel_started row for the recent-sessions list. gclid/gbraid/
 * wbraid win over utmSource when both are present (a Google Ads click that
 * also happens to carry UTM tagging is still, primarily, a Google Ads
 * click) — see FASE 6E CONSENT DECISION REQUIRED for why these fields may
 * legitimately be absent even for a real Google Ads session (marketing
 * consent declined).
 *
 * FASE 7E: checked first, ahead of every field-based branch below —
 * attributionStatus === "unknown" means capture itself failed (see the
 * FunnelEvent model comment in schema.prisma), which is a materially
 * different fact from "capture succeeded and found nothing" (the plain
 * "direct" case, still reached whenever attributionStatus is "resolved"
 * or simply absent — e.g. a row written before this field existed).
 */
export function deriveAttributionSource(attribution: {
  gclid?: string | null
  gbraid?: string | null
  wbraid?: string | null
  utmSource?: string | null
  attributionStatus?: string | null
}): AdminFunnelProvenance {
  if (attribution.attributionStatus === "unknown") {
    return "unknown"
  }

  if (attribution.gclid || attribution.gbraid || attribution.wbraid) {
    return "google_ads"
  }

  if (attribution.utmSource) {
    return "campaign"
  }

  return "direct"
}

/**
 * Pure reducer over one session's FunnelEvent eventTypes -> coarse status
 * for the recent-sessions list. "submitting" covers both "still trying"
 * and "gave up after a failed attempt" — eventType alone can't tell those
 * apart, and this list is a glance-level summary, not a diagnostic tool
 * (see the submit/error breakdown table for that).
 */
export function deriveSessionStatus(
  eventTypes: string[],
): AdminFunnelSessionStatus {
  if (eventTypes.includes("request_created")) {
    return "converted"
  }

  if (eventTypes.includes("submit_started")) {
    return "submitting"
  }

  return "abandoned"
}

// --- DB-backed aggregation (everything below touches Prisma) ---

/**
 * NOT { attributionStatus: "unknown" } expressed as an explicit OR of
 * (null OR any other string) rather than a bare `{ not: "unknown" }` —
 * deliberately, to avoid depending on exactly how Prisma's query engine
 * treats NULL under `not` for a nullable column (unlike raw SQL `<>`,
 * which never matches NULL). This form is unambiguous: it matches every
 * row whose attributionStatus is null (the vast majority — legacy rows,
 * or any client build predating FASE 7E) OR any value other than
 * "unknown", and excludes only the rows we actually mean to exclude.
 */
const ATTRIBUTION_STATUS_NOT_UNKNOWN: Prisma.FunnelEventWhereInput = {
  OR: [{ attributionStatus: null }, { attributionStatus: { not: "unknown" } }],
}

function provenanceWhere(
  provenance: AdminFunnelProvenance,
): Prisma.FunnelEventWhereInput {
  // FASE 7E: checked first, mirroring deriveAttributionSource's own
  // precedence — a row with attributionStatus "unknown" is excluded from
  // every other bucket below, never double-counted.
  if (provenance === "unknown") {
    return { attributionStatus: "unknown" }
  }

  if (provenance === "google_ads") {
    // AND, not a spread: ATTRIBUTION_STATUS_NOT_UNKNOWN already has its
    // own top-level OR — spreading both into one object would collide on
    // the `OR` key and silently drop one of the two conditions.
    return {
      AND: [
        ATTRIBUTION_STATUS_NOT_UNKNOWN,
        {
          OR: [
            { gclid: { not: null } },
            { gbraid: { not: null } },
            { wbraid: { not: null } },
          ],
        },
      ],
    }
  }

  if (provenance === "campaign") {
    return {
      AND: [
        ATTRIBUTION_STATUS_NOT_UNKNOWN,
        {
          utmSource: { not: null },
          gclid: null,
          gbraid: null,
          wbraid: null,
        },
      ],
    }
  }

  return {
    AND: [
      ATTRIBUTION_STATUS_NOT_UNKNOWN,
      {
        gclid: null,
        gbraid: null,
        wbraid: null,
        utmSource: null,
      },
    ],
  }
}

/**
 * Abandonment "last known step" breakdown — the one query here that can't
 * be a flat prisma.groupBy(), since it needs a per-session (not per-event)
 * aggregate: the last step each non-converted session reached. Entirely
 * computed inside Postgres via CTEs; only the final, small grouped result
 * (at most a few dozen rows, one per distinct step) crosses back into
 * Node — see module comment re: "no unbounded loads, no N+1".
 */
async function getAbandonmentByLastStep(params: {
  since: Date | undefined
  interventionSlug: string | undefined
  sessionIdRestriction: string[] | undefined
}): Promise<{ stepKey: string | null; sessionCount: number }[]> {
  if (
    params.sessionIdRestriction !== undefined &&
    params.sessionIdRestriction.length === 0
  ) {
    return []
  }

  const conditions: Prisma.Sql[] = [
    Prisma.sql`"eventType" = 'funnel_started'`,
  ]

  if (params.since) {
    conditions.push(Prisma.sql`"createdAt" >= ${params.since}`)
  }

  if (params.interventionSlug) {
    conditions.push(
      Prisma.sql`"interventionSlug" = ${params.interventionSlug}`,
    )
  }

  if (params.sessionIdRestriction) {
    conditions.push(
      Prisma.sql`"funnelSessionId" IN (${Prisma.join(params.sessionIdRestriction)})`,
    )
  }

  const scopeWhere = Prisma.join(conditions, " AND ")

  const rows = await prisma.$queryRaw<
    { step_key: string | null; session_count: number }[]
  >(Prisma.sql`
    WITH scope AS (
      SELECT DISTINCT "funnelSessionId"
      FROM "FunnelEvent"
      WHERE ${scopeWhere}
    ),
    converted AS (
      SELECT DISTINCT "funnelSessionId"
      FROM "FunnelEvent"
      WHERE "eventType" = 'request_created'
    ),
    abandoned AS (
      SELECT s."funnelSessionId"
      FROM scope s
      LEFT JOIN converted c ON c."funnelSessionId" = s."funnelSessionId"
      WHERE c."funnelSessionId" IS NULL
    ),
    last_step AS (
      SELECT DISTINCT ON (fe."funnelSessionId")
        fe."funnelSessionId", fe."stepKey" AS step_key
      FROM "FunnelEvent" fe
      WHERE fe."eventType" IN ('step_viewed', 'step_completed')
        AND fe."funnelSessionId" IN (SELECT "funnelSessionId" FROM abandoned)
      ORDER BY fe."funnelSessionId", fe."stepIndex" DESC
    )
    SELECT ls.step_key AS step_key, COUNT(*)::int AS session_count
    FROM abandoned a
    LEFT JOIN last_step ls ON ls."funnelSessionId" = a."funnelSessionId"
    GROUP BY ls.step_key
    ORDER BY session_count DESC
  `)

  return rows.map((row) => ({
    stepKey: row.step_key,
    sessionCount: row.session_count,
  }))
}

/**
 * Bounded recent-sessions list: exactly 2 queries total no matter how many
 * events each session has (no N+1) — one for the most recent
 * RECENT_SESSIONS_LIMIT funnel_started rows, one for every event belonging
 * to just those sessions (capped at RECENT_SESSIONS_LIMIT sessions x a
 * handful of events each, never unbounded). No PII: funnelSessionId is a
 * random client-generated UUID, never a name/email/address.
 */
async function getRecentFunnelSessions(
  where: Prisma.FunnelEventWhereInput,
): Promise<AdminFunnelSessionSummary[]> {
  const startedRows = await prisma.funnelEvent.findMany({
    where: { ...where, eventType: "funnel_started" },
    orderBy: { createdAt: "desc" },
    take: RECENT_SESSIONS_LIMIT,
    select: {
      funnelSessionId: true,
      interventionSlug: true,
      createdAt: true,
      gclid: true,
      gbraid: true,
      wbraid: true,
      utmSource: true,
      attributionStatus: true,
    },
  })

  if (startedRows.length === 0) {
    return []
  }

  const sessionIds = startedRows.map((row) => row.funnelSessionId)

  const relatedEvents = await prisma.funnelEvent.findMany({
    where: { funnelSessionId: { in: sessionIds } },
    select: {
      funnelSessionId: true,
      eventType: true,
      stepKey: true,
      stepIndex: true,
    },
  })

  const eventsBySession = new Map<string, typeof relatedEvents>()

  for (const event of relatedEvents) {
    const bucket = eventsBySession.get(event.funnelSessionId)

    if (bucket) {
      bucket.push(event)
    } else {
      eventsBySession.set(event.funnelSessionId, [event])
    }
  }

  return startedRows.map((row) => {
    const sessionEvents = eventsBySession.get(row.funnelSessionId) ?? []
    const status = deriveSessionStatus(
      sessionEvents.map((event) => event.eventType),
    )

    const lastStepEvent = sessionEvents
      .filter(
        (event) =>
          event.eventType === "step_viewed" ||
          event.eventType === "step_completed",
      )
      .reduce<(typeof sessionEvents)[number] | null>((latest, event) => {
        if (!latest || event.stepIndex > latest.stepIndex) {
          return event
        }

        return latest
      }, null)

    return {
      funnelSessionId: row.funnelSessionId,
      interventionSlug: row.interventionSlug,
      startedAt: row.createdAt,
      status,
      lastStepLabel: lastStepEvent
        ? resolveStepLabel(lastStepEvent.stepKey, row.interventionSlug)
        : "-",
      attributionSource: deriveAttributionSource(row),
    }
  })
}

export async function getAdminFunnelMetrics(
  filters: AdminFunnelFilters,
): Promise<AdminFunnelMetrics> {
  const since = resolvePeriodSince(filters.period)
  const interventionSlug = filters.interventionSlug

  const sinceScope: Prisma.FunnelEventWhereInput = since
    ? { createdAt: { gte: since } }
    : {}
  const scope: Prisma.FunnelEventWhereInput = {
    ...sinceScope,
    ...(interventionSlug ? { interventionSlug } : {}),
  }

  // Provenance filters attribution columns that only ever exist on
  // funnel_started rows (see FASE 6E) — bridged to the KPI/abandonment/
  // recent-sessions queries via an explicit, period-bounded session id
  // list, rather than applied directly to queries against other
  // eventTypes. Deliberately NOT applied to the per-step table or the
  // submit/error breakdown (see their inline comments below): technical
  // funnel friction is treated as independent of traffic source.
  let sessionIdRestriction: string[] | undefined

  if (filters.provenance) {
    const restrictedStarted = await prisma.funnelEvent.findMany({
      where: {
        ...scope,
        eventType: "funnel_started",
        ...provenanceWhere(filters.provenance),
      },
      select: { funnelSessionId: true },
    })
    sessionIdRestriction = restrictedStarted.map((row) => row.funnelSessionId)
  }

  const sessionRestrictionWhere: Prisma.FunnelEventWhereInput =
    sessionIdRestriction !== undefined
      ? { funnelSessionId: { in: sessionIdRestriction } }
      : {}

  const noResultsFromProvenance =
    sessionIdRestriction !== undefined && sessionIdRestriction.length === 0

  const [
    totalStarted,
    totalConverted,
    totalSubmitStarted,
    totalSubmitFailed,
    stepGroups,
    errorGroups,
    abandonmentByLastStepRaw,
    interventionOptionRows,
    recentSessions,
  ] = await Promise.all([
    sessionIdRestriction !== undefined
      ? Promise.resolve(sessionIdRestriction.length)
      : prisma.funnelEvent.count({
          where: { ...scope, eventType: "funnel_started" },
        }),
    noResultsFromProvenance
      ? Promise.resolve(0)
      : prisma.funnelEvent.count({
          where: {
            ...scope,
            eventType: "request_created",
            ...sessionRestrictionWhere,
          },
        }),
    // submit_started/submit_failed intentionally ignore the provenance
    // filter — see the block comment above.
    prisma.funnelEvent.count({
      where: { ...scope, eventType: "submit_started" },
    }),
    prisma.funnelEvent.count({
      where: { ...scope, eventType: "submit_failed" },
    }),
    prisma.funnelEvent.groupBy({
      by: ["stepKey", "eventType"],
      where: {
        ...scope,
        eventType: { in: ["step_viewed", "step_completed"] },
      },
      _count: { _all: true },
      _min: { stepIndex: true },
    }),
    prisma.funnelEvent.groupBy({
      by: ["errorCode"],
      where: {
        ...scope,
        eventType: "submit_failed",
        errorCode: { not: null },
      },
      _count: { _all: true },
    }),
    noResultsFromProvenance
      ? Promise.resolve([])
      : getAbandonmentByLastStep({ since, interventionSlug, sessionIdRestriction }),
    // Intervention filter options: scoped by period only, never by the
    // currently-selected interventionSlug itself — otherwise picking one
    // intervention would collapse the dropdown to just that one option.
    prisma.funnelEvent.findMany({
      where: { ...sinceScope, eventType: "funnel_started" },
      distinct: ["interventionSlug"],
      select: { interventionSlug: true },
      orderBy: { interventionSlug: "asc" },
    }),
    noResultsFromProvenance
      ? Promise.resolve([])
      : getRecentFunnelSessions({ ...scope, ...sessionRestrictionWhere }),
  ])

  // Per-step table: fold the two-eventType groupBy result into one row per
  // stepKey.
  const stepMap = new Map<
    string,
    { viewedCount: number; completedCount: number; stepIndex: number }
  >()

  for (const group of stepGroups) {
    const minIndex = group._min.stepIndex ?? 0
    const existing = stepMap.get(group.stepKey) ?? {
      viewedCount: 0,
      completedCount: 0,
      stepIndex: minIndex,
    }

    if (group.eventType === "step_viewed") {
      existing.viewedCount = group._count._all
    } else if (group.eventType === "step_completed") {
      existing.completedCount = group._count._all
    }

    existing.stepIndex = Math.min(existing.stepIndex, minIndex)
    stepMap.set(group.stepKey, existing)
  }

  const steps: AdminFunnelStepRow[] = Array.from(stepMap.entries())
    .map(([stepKey, value]) => ({
      stepKey,
      stepLabel: resolveStepLabel(stepKey, interventionSlug),
      stepIndex: value.stepIndex,
      viewedCount: value.viewedCount,
      completedCount: value.completedCount,
      completionRate: computeRate(value.completedCount, value.viewedCount),
    }))
    .sort((a, b) => a.stepIndex - b.stepIndex)

  const errors: AdminFunnelErrorRow[] = errorGroups
    .map((group) => ({
      errorCode: group.errorCode ?? "unexpected_error",
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count)

  const abandonmentByLastStep: AdminFunnelAbandonmentRow[] =
    abandonmentByLastStepRaw.map((row) => ({
      stepKey: row.stepKey,
      stepLabel: row.stepKey
        ? resolveStepLabel(row.stepKey, interventionSlug)
        : "Avvio funnel (nessuno step raggiunto)",
      sessionCount: row.sessionCount,
    }))

  const totalAbandoned = Math.max(0, totalStarted - totalConverted)

  // Attribution summary: this table IS the provenance breakdown, so it is
  // always computed over the period/intervention scope only, independent
  // of the `provenance` filter itself. FASE 7E added "unknown" as a 4th
  // bucket — see deriveAttributionSource/provenanceWhere above for why it
  // is a materially different fact from "direct".
  const [googleAdsCount, campaignCount, directCount, unknownCount] =
    await Promise.all([
      prisma.funnelEvent.count({
        where: {
          ...scope,
          eventType: "funnel_started",
          ...provenanceWhere("google_ads"),
        },
      }),
      prisma.funnelEvent.count({
        where: {
          ...scope,
          eventType: "funnel_started",
          ...provenanceWhere("campaign"),
        },
      }),
      prisma.funnelEvent.count({
        where: {
          ...scope,
          eventType: "funnel_started",
          ...provenanceWhere("direct"),
        },
      }),
      prisma.funnelEvent.count({
        where: {
          ...scope,
          eventType: "funnel_started",
          ...provenanceWhere("unknown"),
        },
      }),
    ])

  const attribution: AdminFunnelAttributionRow[] = [
    {
      source: "google_ads",
      label: provenanceLabel("google_ads"),
      sessionCount: googleAdsCount,
    },
    {
      source: "campaign",
      label: provenanceLabel("campaign"),
      sessionCount: campaignCount,
    },
    {
      source: "direct",
      label: provenanceLabel("direct"),
      sessionCount: directCount,
    },
    {
      source: "unknown",
      label: provenanceLabel("unknown"),
      sessionCount: unknownCount,
    },
  ]

  return {
    totalStarted,
    totalConverted,
    conversionRate: computeRate(totalConverted, totalStarted),
    totalSubmitStarted,
    totalSubmitFailed,
    submitFailureRate: computeRate(totalSubmitFailed, totalSubmitStarted),
    totalAbandoned,
    abandonmentRate: computeRate(totalAbandoned, totalStarted),
    steps,
    errors,
    abandonmentByLastStep,
    attribution,
    recentSessions,
    interventionOptions: interventionOptionRows.map(
      (row) => row.interventionSlug,
    ),
  }
}
