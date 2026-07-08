/**
 * Esigenta — Lead value derivation (pay-per-lead pricing signal)
 *
 * PURE, SELF-CONTAINED. No DB, no side effects.
 *
 * Maps a request to a commercial lead value: a tier, a suggested `creditCost`
 * and `maxUnlocks` (fields that already exist on Request but are set manually
 * today), plus a `belowFloor` flag — the anti-"€50 job" gate.
 *
 * It does NOT parse funnel answers itself. Signal interpretation is delegated to
 * the single `extractRequestSignals` extractor (which in turn wraps the funnel's
 * one `resolveRequestSignals`). deriveLeadValue only monetizes normalized signals:
 *
 *   score = baseline(group, with per-intervention overrides)
 *           × scaleMultiplier(signals.projectScale)
 *           × actionMultiplier(signals.actionType)   // repair/maintenance/inspection ↓
 *           × urgencyMultiplier(signals.urgency)      // urgent ↑
 *
 * ALL NUMBERS BELOW ARE TUNABLE MONETIZATION CONFIG — change freely.
 */

import { extractRequestSignals } from "../request-signals/extract-request-signals"

import type {
  ExtractedRequestSignals,
  RequestSignalScale,
} from "../request-signals/types"

export type LeadValueTier = "micro" | "small" | "medium" | "large" | "xlarge"

export type DeriveLeadValueInput = {
  interventionSlug: string
  /** Owning project group slug (resolved by the caller from taxonomy). */
  groupSlug: string
  /** Funnel answers (Request.structuredData draft rawAnswers). */
  rawAnswers?: Record<string, unknown>
  /** Persisted Request.structuredData ({ draft }); used when rawAnswers is absent. */
  structuredData?: unknown
  /** Pre-normalized signals — skips extraction (already normalized upstream). */
  signals?: ExtractedRequestSignals
}

export type LeadValue = {
  tier: LeadValueTier
  /** Raw score, rounded to 2 decimals (diagnostic). */
  score: number
  /** Suggested credit price for one unlock. */
  creditCost: number
  /** Suggested cap on how many companies may unlock this lead. */
  maxUnlocks: number
  /** True when the lead is below the monetization floor (a "€50 job"). */
  belowFloor: boolean
  /** Human-readable derivation trail (diagnostics / admin UI). */
  reasons: string[]
}

// ── CONFIG ──────────────────────────────────────────────────────────────────

/** Base lead value per project group (from real job-value research). */
const GROUP_BASELINE: Record<string, number> = {
  ristrutturazioni: 5,
  fotovoltaico: 5,
  riscaldamento: 4,
  tetti: 4,
  "serramenti-e-infissi": 4,
  "facciate-e-balconi": 4,
  "opere-murarie-e-demolizioni": 3,
  pavimentazioni: 3,
  cartongesso: 3,
  "impianti-e-manutenzioni-elettriche": 3,
  climatizzazione: 3,
  "citofoni-sicurezza-e-smart-home": 3,
  "camini-stufe-e-canne-fumarie": 3,
  "esterni-e-giardino": 3,
  idraulica: 2,
  "fabbro-serrande-e-cancelli": 2,
  finiture: 2,
  // Professional/documental services (geometra): no scale signal (no m²), so the
  // baseline lands the tier directly — decimals let it hit the small/medium/large
  // bands. Group center = a medium pratica; per-intervention overrides below.
  "tecnici-e-pratiche-edilizie": 2.2,
  // Big-ticket structured works: high baseline so even a small qualitative scale
  // stays large/xlarge (never a €50 job). Group center = ampliamento; costruire
  // casa overrides higher below.
  "costruzioni-e-ampliamenti": 4,
}

const DEFAULT_BASELINE = 2

/**
 * Per-intervention baseline overrides for outliers whose value differs from
 * their group (low-ticket recurring/micro, single-unit, or low-ticket-premium).
 */
const INTERVENTION_BASELINE: Record<string, number> = {
  // low-ticket recurring / maintenance / micro
  "fare-manutenzione-caldaia": 1,
  "fare-manutenzione-climatizzatore": 1,
  "pulire-canna-fumaria": 1,
  "disostruire-scarichi": 1,
  "riparare-perdita-acqua": 2,
  "riparare-guasto-elettrico": 2,
  "potare-e-curare-il-verde": 2,
  // single-unit items lower than their (project-driven) group baseline
  "riparare-o-sostituire-tapparelle": 3,
  "installare-persiane-o-scuri": 3,
  "installare-porte-interne": 3,
  "installare-zanzariere": 2,
  "installare-o-sostituire-termosifoni": 3,
  "installare-o-sostituire-scaldabagno": 3,
  // low ticket but PREMIUM lead (urgency / high conversion)
  "aprire-porta-bloccata": 3,
  // technical/documental services (geometra) — no scale signal, so baseline sets
  // the tier: APE below the group center, CILA/sanatoria/progetto above it.
  "fare-ape": 1.8,
  "fare-cila-o-scia": 2.8,
  "fare-sanatoria-edilizia": 3.4,
  "fare-progetto-ristrutturazione": 4,
  // New construction: the highest-ticket lead in the catalog — always xlarge
  // (5cr/5unlock) regardless of qualitative scale.
  "costruire-casa": 5.5,
  // Roof-raising: a whole structural floor, heavier than a plain extension — set
  // above the group center so medium/large scale reaches xlarge while a small
  // one stays large. Ladder: costruire > sopraelevazione > ampliamento.
  "fare-sopraelevazione": 4.5,
  // Accessory build (garage/deposito): a real construction but the smallest
  // ticket of the group — below the group center. A small storage stays medium,
  // a single/double garage is large, never xlarge, never below floor.
  "costruire-garage-o-deposito": 3,
}

/** Interventions whose value is dominated by urgency (locksmith emergency). */
const URGENCY_DOMINANT = new Set<string>(["aprire-porta-bloccata"])

const SCALE_MULTIPLIER: Record<RequestSignalScale, number> = {
  micro: 0.6,
  small: 0.8,
  medium: 1,
  large: 1.3,
  whole_home: 1.4,
  unknown: 1,
}

const REPAIR_ACTION_MULTIPLIER = 0.7
const NORMAL_ACTION_MULTIPLIER = 1
const REDUCED_ACTIONS = new Set<string>(["repair", "maintenance", "inspection"])

const URGENCY_MULTIPLIER = 1.15

/** score < threshold → tier (ascending). */
const TIER_THRESHOLDS: Array<[number, LeadValueTier]> = [
  [1.2, "micro"],
  [2, "small"],
  [3, "medium"],
  [4.2, "large"],
]
const TOP_TIER: LeadValueTier = "xlarge"

const CREDIT_COST_BY_TIER: Record<LeadValueTier, number> = {
  micro: 1,
  small: 1,
  medium: 2,
  large: 3,
  xlarge: 5,
}

const MAX_UNLOCKS_BY_TIER: Record<LeadValueTier, number> = {
  micro: 1,
  small: 2,
  medium: 3,
  large: 4,
  xlarge: 5,
}

const FLOOR_TIER: LeadValueTier = "micro"

// ── MAIN ─────────────────────────────────────────────────────────────────────

export function deriveLeadValue(input: DeriveLeadValueInput): LeadValue {
  const reasons: string[] = []

  const signals =
    input.signals ??
    extractRequestSignals({
      interventionSlug: input.interventionSlug,
      groupSlug: input.groupSlug,
      rawAnswers: input.rawAnswers,
      structuredData: input.structuredData,
    })

  const baseline =
    INTERVENTION_BASELINE[input.interventionSlug] ??
    GROUP_BASELINE[input.groupSlug] ??
    DEFAULT_BASELINE
  reasons.push(`baseline ${baseline} (${input.interventionSlug} / ${input.groupSlug})`)

  const scaleMult = SCALE_MULTIPLIER[signals.projectScale]
  reasons.push(`scale ${signals.projectScale} × ${scaleMult}`)

  const actionMult = REDUCED_ACTIONS.has(signals.actionType)
    ? REPAIR_ACTION_MULTIPLIER
    : NORMAL_ACTION_MULTIPLIER
  reasons.push(`action ${signals.actionType} × ${actionMult}`)

  const urgent = signals.urgency === "urgent"
  const urgencyMult = urgent ? URGENCY_MULTIPLIER : 1
  if (urgent) reasons.push(`urgency urgent × ${urgencyMult}`)

  let score = baseline * scaleMult * actionMult * urgencyMult

  // Urgency-dominant interventions (locksmith emergency): the urgent lead is
  // premium even at a small ticket — never let it sink below the floor.
  if (URGENCY_DOMINANT.has(input.interventionSlug) && urgent) {
    score = Math.max(score, 2.2)
    reasons.push("urgency-dominant floor 2.2")
  }

  const tier = toTier(score)
  const belowFloor = tier === FLOOR_TIER

  let maxUnlocks = MAX_UNLOCKS_BY_TIER[tier]
  // A poorly-qualified lead (no geo/contact/photos) should not be sold widely.
  if (signals.leadQuality === "low" && maxUnlocks > 1) {
    maxUnlocks -= 1
    reasons.push("leadQuality low → maxUnlocks -1")
  }

  return {
    tier,
    score: Math.round(score * 100) / 100,
    creditCost: CREDIT_COST_BY_TIER[tier],
    maxUnlocks,
    belowFloor,
    reasons,
  }
}

function toTier(score: number): LeadValueTier {
  for (const [threshold, tier] of TIER_THRESHOLDS) {
    if (score < threshold) return tier
  }
  return TOP_TIER
}

export const __leadValueConfig = {
  GROUP_BASELINE,
  INTERVENTION_BASELINE,
  SCALE_MULTIPLIER,
  CREDIT_COST_BY_TIER,
  MAX_UNLOCKS_BY_TIER,
  TIER_THRESHOLDS,
}
