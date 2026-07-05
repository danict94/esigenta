/**
 * Esigenta — Request signal interpreter (SINGLE SOURCE OF TRUTH)
 *
 * The ONE place that reads funnel `rawAnswers` and interprets them into
 * normalized primitives (scale / action / urgency / value signals). Both the
 * acquisition layer (`enrich-request`, same package) and the monetization layer
 * (`@esigenta/domain` `extractRequestSignals`, which imports this) go through
 * here — there must be no second parser of funnel answers anywhere.
 *
 * Scale travels only on `:superficie|quante|quanti|quanto|lunghezza` steps,
 * carrying either a qualitative bucket token or a numeric m² value — both
 * resolved here. No special/legacy step ids (`scale`, `surface-area`).
 *
 * PURE. rawAnswers-only. No DB, no draft-wide fields (geo/contact/photos/
 * leadQuality live in enrich-request, which needs the whole draft).
 */

export type RuntimeRequestScale = "small" | "medium" | "large"

export type RuntimeRequestAction =
  | "new"
  | "replace"
  | "repair"
  | "maintenance"
  | "inspection"

export type RuntimeRequestUrgency = "low" | "medium" | "high"

export type RuntimeRequestSignals = {
  scale: RuntimeRequestScale | undefined
  action: RuntimeRequestAction | undefined
  urgency: RuntimeRequestUrgency | undefined
  /** Coarse boolean-ish hints for downstream (e.g. "whole_home", "urgent"). */
  valueSignals: string[]
}

// ── scale tokens (funnel qualifier buckets, all conventions) ─────────────────

const SMALL_TOKENS = new Set<string>([
  "one", "small", "short", "one_room", "up_to_50",
])
const MEDIUM_TOKENS = new Set<string>([
  "some", "medium", "two_four", "two_three", "part_house",
  "fifty_to_onehundred",
])
const LARGE_TOKENS = new Set<string>([
  "whole_house", "whole_apartment", "large", "long", "five_plus",
  "four_plus", "four_six", "five_eight", "over_twohundred",
  "onehundred_to_twohundred", "whole_garden",
])
const WHOLE_HOME_TOKENS = new Set<string>(["whole_house", "whole_apartment"])

/** Step ids whose answer is a scale/quantity qualifier. */
const SCALE_STEP_SUFFIX = /:(superficie|quante|quanti|quanto|lunghezza)$/

/** Step ids carrying the primary work choice. */
const MAIN_STEP_SUFFIX = /:(tipo-lavoro|obiettivo|tipo-intervento)$/

const EMERGENCY_TOKENS = new Set<string>([
  "locked_out", "lost_keys", "jammed_door",
])

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value !== "string") {
    return undefined
  }
  const parsed = Number(value.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : undefined
}

function resolveScale(
  rawAnswers: Record<string, unknown>,
): { scale: RuntimeRequestScale | undefined; wholeHome: boolean } {
  let wholeHome = false

  // Every scale signal travels on a `:superficie|quante|quanti|quanto|lunghezza`
  // step — either a qualitative bucket token or a numeric m² value.
  for (const [key, value] of Object.entries(rawAnswers)) {
    if (!SCALE_STEP_SUFFIX.test(key)) {
      continue
    }

    if (typeof value === "string") {
      if (WHOLE_HOME_TOKENS.has(value)) {
        wholeHome = true
      }
      if (LARGE_TOKENS.has(value)) return { scale: "large", wholeHome }
      if (MEDIUM_TOKENS.has(value)) return { scale: "medium", wholeHome }
      if (SMALL_TOKENS.has(value)) return { scale: "small", wholeHome }
    }

    const surface = toNumber(value)
    if (surface !== undefined) {
      if (surface >= 80) return { scale: "large", wholeHome }
      if (surface >= 25) return { scale: "medium", wholeHome }
      if (surface > 0) return { scale: "small", wholeHome }
    }
  }

  return { scale: undefined, wholeHome }
}

function resolveAction(
  rawAnswers: Record<string, unknown>,
): { action: RuntimeRequestAction | undefined; emergency: boolean } {
  let value: string | undefined
  for (const [key, raw] of Object.entries(rawAnswers)) {
    if (MAIN_STEP_SUFFIX.test(key) && typeof raw === "string") {
      value = raw
      break
    }
  }

  if (!value) return { action: undefined, emergency: false }

  const emergency = EMERGENCY_TOKENS.has(value)

  let action: RuntimeRequestAction | undefined
  if (/^(maintenance|cleaning|cleaning_and_check|flue_check|garden_maintenance)$/.test(value)) {
    action = "maintenance"
  } else if (value === "inspection") {
    action = "inspection"
  } else if (/^(repair|not_working|motor_issue)$/.test(value) || value.startsWith("repair_")) {
    action = "repair"
  } else if (value === "new" || value.startsWith("new_")) {
    action = "new"
  } else if (value.startsWith("replace") || value.startsWith("switch_")) {
    action = "replace"
  }

  return { action, emergency }
}

function resolveUrgency(
  rawAnswers: Record<string, unknown>,
): RuntimeRequestUrgency | undefined {
  const timing = rawAnswers["timing"]
  switch (timing) {
    case "as_soon_as_possible":
      return "high"
    case "within_7_days":
      return "medium"
    case "within_30_days":
    case "flexible":
    case "evaluating":
      return "low"
    default:
      return undefined
  }
}

export function resolveRequestSignals(
  rawAnswers: Record<string, unknown> | undefined | null,
): RuntimeRequestSignals {
  const answers = rawAnswers ?? {}

  const { scale, wholeHome } = resolveScale(answers)
  const { action, emergency } = resolveAction(answers)
  const urgency = resolveUrgency(answers)

  const valueSignals: string[] = []
  if (wholeHome) valueSignals.push("whole_home")
  if (scale === "large") valueSignals.push("large_scale")
  if (urgency === "high") valueSignals.push("urgent")
  if (emergency) valueSignals.push("emergency")
  if (action === "repair") valueSignals.push("repair")
  if (action === "maintenance") valueSignals.push("maintenance")

  return { scale, action, urgency, valueSignals }
}
