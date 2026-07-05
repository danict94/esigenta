/**
 * Esigenta — extractRequestSignals
 *
 * The SINGLE request-signal extractor on the monetization side. It does NOT
 * re-parse funnel answers: token interpretation is delegated to the funnel's
 * `resolveRequestSignals` (one source of truth). This layer only:
 *  - sources rawAnswers/derivedSignals from rawAnswers or persisted structuredData,
 *  - normalizes the funnel primitives to the monetization enums,
 *  - prefers the persisted acquisition signals (leadQuality/projectScale) built
 *    at request time by the same interpreter.
 *
 * PURE. No DB, no side effects.
 */

import { resolveRequestSignals } from "@esigenta/funnel"

import type {
  ExtractRequestSignalsInput,
  ExtractedRequestSignals,
  RequestActionType,
  RequestLeadQuality,
  RequestSignalScale,
  RequestUrgency,
} from "./types"

type PersistedDerived = {
  projectScale?: "small" | "medium" | "large"
  urgency?: "low" | "medium" | "high"
  leadQuality?: "low" | "medium" | "high"
}

/** Defensive read of Request.structuredData ({ draft: RequestDraft }). */
function readDraft(structuredData: unknown): {
  rawAnswers: Record<string, unknown> | undefined
  derived: PersistedDerived | undefined
} {
  const empty = { rawAnswers: undefined, derived: undefined }
  if (!structuredData || typeof structuredData !== "object") return empty
  const draft = (structuredData as { draft?: unknown }).draft
  if (!draft || typeof draft !== "object") return empty
  const d = draft as {
    rawAnswers?: unknown
    derivedSignals?: unknown
  }
  return {
    rawAnswers:
      d.rawAnswers && typeof d.rawAnswers === "object"
        ? (d.rawAnswers as Record<string, unknown>)
        : undefined,
    derived:
      d.derivedSignals && typeof d.derivedSignals === "object"
        ? (d.derivedSignals as PersistedDerived)
        : undefined,
  }
}

function toScale(
  wholeHome: boolean,
  resolved: "small" | "medium" | "large" | undefined,
  persisted: "small" | "medium" | "large" | undefined,
): RequestSignalScale {
  if (wholeHome) return "whole_home"
  return resolved ?? persisted ?? "unknown"
}

function toActionType(
  action: string | undefined,
  emergency: boolean,
): RequestActionType {
  if (emergency) return "emergency"
  switch (action) {
    case "repair":
    case "replace":
    case "new":
    case "maintenance":
    case "inspection":
      return action
    default:
      return "unknown"
  }
}

function toUrgency(
  resolved: "low" | "medium" | "high" | undefined,
  persisted: "low" | "medium" | "high" | undefined,
): RequestUrgency {
  const level = resolved ?? persisted
  if (level === "high") return "urgent"
  if (level === "low" || level === "medium") return "normal"
  return "unknown"
}

function toLeadQuality(
  persisted: "low" | "medium" | "high" | undefined,
): RequestLeadQuality {
  if (persisted === "high") return "high"
  if (persisted === "low") return "low"
  // "medium" or absent → normal
  return "normal"
}

export function extractRequestSignals(
  input: ExtractRequestSignalsInput,
): ExtractedRequestSignals {
  const fromStructured = input.rawAnswers
    ? { rawAnswers: input.rawAnswers, derived: undefined as PersistedDerived | undefined }
    : readDraft(input.structuredData)

  const rawAnswers = input.rawAnswers ?? fromStructured.rawAnswers ?? {}
  const persisted = fromStructured.derived

  const signals = resolveRequestSignals(rawAnswers)
  const wholeHome = signals.valueSignals.includes("whole_home")
  const emergency = signals.valueSignals.includes("emergency")

  return {
    projectScale: toScale(wholeHome, signals.scale, persisted?.projectScale),
    actionType: toActionType(signals.action, emergency),
    urgency: toUrgency(signals.urgency, persisted?.urgency),
    leadQuality: toLeadQuality(persisted?.leadQuality),
    valueSignals: signals.valueSignals,
  }
}
