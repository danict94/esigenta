export type {
  AdminFunnelAbandonmentRow,
  AdminFunnelAttributionRow,
  AdminFunnelErrorRow,
  AdminFunnelExitFeedbackOriginCounts,
  AdminFunnelExitFeedbackReasonRow,
  AdminFunnelExitFeedbackStepBreakdownRow,
  AdminFunnelFilters,
  AdminFunnelMetrics,
  AdminFunnelPeriod,
  AdminFunnelProvenance,
  AdminFunnelSessionSummary,
  AdminFunnelStepRow,
  AdminFunnelV2SessionStatus,
  AdminFunnelValidationFailureRow,
} from "./admin-funnel-metrics"

export {
  computeRate,
  deriveAttributionSource,
  exitFeedbackReasonLabel,
  getAdminFunnelMetrics,
  humanizeStepKey,
  provenanceLabel,
  resolvePeriodSince,
  resolveStepLabel,
} from "./admin-funnel-metrics"

// FASE 9D — V2 session status policy (inactivity threshold, meaningful
// activity eventTypes, the pure classifier/reducer/rate functions) —
// re-exported here so apps/admin can reach it the same way as everything
// else in this barrel, without importing from the policy file directly.
export type {
  ClassifySessionStatusInput,
  SessionRates,
  SessionStatusCounts,
} from "./funnel-session-status-policy"

export {
  classifySessionStatus,
  computeSessionRates,
  FUNNEL_ABANDONMENT_INACTIVITY_MINUTES,
  MEANINGFUL_ACTIVITY_EVENT_TYPES,
  summarizeSessionStatuses,
} from "./funnel-session-status-policy"

// FASE 9G — destructive, admin-only: hard-deletes every FunnelEvent row.
// See delete-all-funnel-events.ts for why this is safe by construction
// and why it is structurally isolated from Request/every other table.
export type {
  DeleteAllFunnelEventsInput,
  DeleteAllFunnelEventsResult,
} from "./delete-all-funnel-events"

export { deleteAllFunnelEvents } from "./delete-all-funnel-events"
