/**
 * Esigenta — Normalized request signals (monetization vocabulary)
 *
 * The single normalized shape produced by `extractRequestSignals` and consumed
 * by `deriveLeadValue`. Interpretation of funnel answers happens once, in the
 * funnel's `resolveRequestSignals`; this layer only normalizes to the
 * monetization enums and folds in the persisted acquisition signals.
 */

export type RequestSignalScale =
  | "micro"
  | "small"
  | "medium"
  | "large"
  | "whole_home"
  | "unknown"

export type RequestActionType =
  | "repair"
  | "replace"
  | "new"
  | "maintenance"
  | "inspection"
  | "emergency"
  | "unknown"

export type RequestUrgency = "normal" | "urgent" | "unknown"

export type RequestLeadQuality = "low" | "normal" | "high"

export type ExtractedRequestSignals = {
  projectScale: RequestSignalScale
  actionType: RequestActionType
  urgency: RequestUrgency
  leadQuality: RequestLeadQuality
  valueSignals: string[]
}

export type ExtractRequestSignalsInput = {
  /** Optional context (not needed to interpret answers; kept for the contract). */
  interventionSlug?: string
  groupSlug?: string
  /** Funnel answers (preferred direct input). */
  rawAnswers?: Record<string, unknown> | undefined
  /** Persisted `Request.structuredData` ({ draft: RequestDraft }); used when rawAnswers is absent. */
  structuredData?: unknown
}
