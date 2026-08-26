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
 * NOTE — the FASE 6F report's original note here ("the FunnelEvent table
 * does not exist in any database yet") is stale: the migration has since
 * been applied and this table receives live production traffic (see the
 * FASE 9/9A/9B reports for the funnel_opened/funnel_started split and the
 * legacy/V2 attribution fix this file has gone through since).
 */

import { Prisma } from "@prisma/client"

import { prisma } from "@esigenta/database"
import { resolveFunnelModel } from "@esigenta/funnel"

import {
  classifySessionStatus,
  computeSessionRates,
  MEANINGFUL_ACTIVITY_EVENT_TYPES,
  summarizeSessionStatuses,
} from "./funnel-session-status-policy"
import type { AdminFunnelV2SessionStatus } from "./funnel-session-status-policy"
// FASE 9K — reasonCode è già un allow-list del dominio (packages/domain/src/
// public/funnel-events/record-funnel-event.ts, FASE 9H) — riusato qui SOLO
// per etichettarlo e per l'esaustività a compile-time (Record<
// FunnelExitFeedbackReasonCode, string> sotto), mai per validarlo o
// scriverlo: questo file resta esclusivamente in lettura (vedi il module
// comment sopra).
import { EXIT_FEEDBACK_REASON_CODES } from "../../public/funnel-events"
import type { FunnelExitFeedbackReasonCode } from "../../public/funnel-events"

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

/**
 * FASE 9F — "Tentativi bloccati dalla validazione": per ogni step,
 * quante sessioni V2 lo hanno visto e quante di quelle hanno premuto
 * "Avanti"/"Prepara richiesta" almeno una volta senza superare la
 * validazione (vedi client_validation_failed, FASE 9E). viewedCount e
 * validationFailedCount sono entrambi conteggi di SESSIONI distinte
 * (mai di eventi grezzi) — vedi getAdminFunnelMetrics per come questo è
 * garantito senza una GROUP BY separata per sessione.
 */
export type AdminFunnelValidationFailureRow = {
  stepKey: string
  stepLabel: string
  stepIndex: number
  viewedCount: number
  validationFailedCount: number
  /** validationFailedCount / viewedCount, 0 se viewedCount è 0 (computeRate, convenzione invariata). */
  validationFailureRate: number
}

export type AdminFunnelAttributionRow = {
  source: AdminFunnelProvenance
  label: string
  sessionCount: number
}

/**
 * FASE 9K — una riga del breakdown "per step" di un motivo di uscita
 * dichiarato. sessionCount è un conteggio di SESSIONI distinte, mai di
 * eventi grezzi — vedi AdminFunnelExitFeedbackReasonRow per la garanzia
 * che rende questo vero senza una GROUP BY per sessione separata.
 */
export type AdminFunnelExitFeedbackStepBreakdownRow = {
  stepKey: string
  stepLabel: string
  sessionCount: number
}

/**
 * FASE 9K — "Motivi di uscita dichiarati": una riga per OGNI reasonCode
 * dell'allow-list (EXIT_FEEDBACK_REASON_CODES), incluso chi ha 0 sessioni
 * — stesso trattamento già riservato ad AdminFunnelAttributionRow sopra
 * (tassonomia fissa, mai un elenco che appare/scompare in base ai dati).
 * sessionCount è un conteggio di sessioni DISTINTE: l'indice unico
 * parziale su FunnelEvent (funnelSessionId) WHERE eventType =
 * 'exit_feedback_submitted' — vedi il commento sul modello in
 * schema.prisma, non toccato da questa fase — garantisce già al massimo
 * una riga per sessione, quindi un semplice conteggio (senza alcun
 * DISTINCT aggiuntivo) equivale già a "quante sessioni", stessa logica
 * già usata da AdminFunnelValidationFailureRow.
 *
 * FASE 9K.1 — la coorte di riferimento è ora "sessioni V2 con
 * funnel_opened nello scope" (openedSessionIdRestriction in
 * getAdminFunnelMetrics), NON più "sessioni V2 con funnel_started"
 * (sessionIdRestriction): un feedback dato da chi ha aperto il funnel ma
 * non ha mai davvero iniziato (nessuna interazione — vedi
 * AdminFunnelExitFeedbackOriginCounts sotto) deve restare visibile qui,
 * proprio perché è il caso che questa sezione serve a far emergere.
 */
export type AdminFunnelExitFeedbackReasonRow = {
  reasonCode: FunnelExitFeedbackReasonCode
  label: string
  sessionCount: number
  /** sessionCount / totale sessioni con exit_feedback_submitted nello scope, 0 se quel totale è 0 (computeRate). */
  percentage: number
  /** Ordinato per sessionCount decrescente. Vuoto se sessionCount è 0. */
  byStep: AdminFunnelExitFeedbackStepBreakdownRow[]
}

/**
 * FASE 9K.1 — quanti dei feedback in AdminFunnelExitFeedbackReasonRow
 * (sommati su tutti i reasonCode) provengono da una sessione che aveva
 * già funnel_started ("started") contro una che aveva SOLO funnel_opened,
 * mai una vera interazione ("preStart"). Un riepilogo VOLUTAMENTE
 * separato dalla tabella per reasonCode sopra (mai una colonna in più lì)
 * — vedi il commento su getAdminFunnelMetrics per come viene derivato.
 *
 * IMPORTANTE: questa è solo un'etichetta di visualizzazione per questa
 * sezione. Non tocca in alcun modo funnel-session-status-policy.ts — una
 * sessione "preStart" non entra MAI nella coorte classificata da
 * classifySessionStatus (sessionIdRestriction resta quella con
 * funnel_started, invariata) e quindi non può mai diventare un
 * "ABANDONED" della coorte avviata. "Apertura senza inizio" e "abbandono
 * dopo inizio" restano due fatti distinti, mai fusi.
 */
export type AdminFunnelExitFeedbackOriginCounts = {
  preStart: number
  started: number
}

/**
 * FASE 9D — re-exported here (not re-declared) so every consumer of this
 * module keeps importing session-status types from the same place as
 * before; the actual union — converted/in_progress/abandoned/invalid —
 * and its classification policy live in funnel-session-status-policy.ts.
 * Replaces the old "converted" | "submitting" | "abandoned" (eventType-
 * presence heuristic, no timing) — see AdminFunnelMetrics.totalInProgress
 * for why that heuristic was insufficient.
 */
export type { AdminFunnelV2SessionStatus } from "./funnel-session-status-policy"

export type AdminFunnelSessionSummary = {
  funnelSessionId: string
  interventionSlug: string
  startedAt: Date
  status: AdminFunnelV2SessionStatus
  lastStepLabel: string
  attributionSource: AdminFunnelProvenance
}

export type AdminFunnelMetrics = {
  /**
   * FASE 9C — "Aperture funnel": funnel_opened con trackingVersion = "v2",
   * nello scope. Non esiste un equivalente legacy (funnel_opened non
   * esisteva prima della FASE 9A) — nessuna sottrazione/distinzione
   * necessaria qui, a differenza di totalStarted sotto. Non filtrato dal
   * provenance filter, di proposito — stesso trattamento già riservato a
   * totalSubmitStarted/totalSubmitFailed (vedi il commento su
   * getAdminFunnelMetrics): un volume "in cima al funnel" ha senso mostrato
   * per intero, indipendentemente dal segmento di traffico selezionato.
   */
  totalOpened: number
  /**
   * FASE 9C — "Sessioni avviate": SOLO funnel_started con
   * trackingVersion = "v2", nello scope (più l'eventuale restrizione di
   * provenienza). Le righe legacy (trackingVersion NULL) non sono più
   * sommate qui — vedi legacyStartedCount sotto per la loro visibilità
   * separata.
   */
  totalStarted: number
  /**
   * FASE 9C — conteggio informativo, SEPARATO, delle sessioni
   * funnel_started legacy (trackingVersion NULL) nello stesso periodo/
   * intervento. Mai sommato a totalStarted né a nessun'altra metrica V2
   * sotto — i dati legacy restano disponibili/consultabili come numero a
   * sé, non scompaiono, ma smettono di alterare silenziosamente le
   * metriche V2. Non filtrato dal provenance filter: quel filtro opera
   * sulla stessa distinzione V2 che questo numero è già escluso da.
   */
  legacyStartedCount: number
  /**
   * FASE 9D — request_created exists for this funnelSessionId. Now
   * DERIVED from the same per-session status classification as
   * totalInProgress/totalAbandoned below (see resolveSessionStatuses/
   * summarizeSessionStatuses in admin-funnel-metrics.ts), not a separate
   * independent COUNT — this is what guarantees totalStarted =
   * totalConverted + totalInProgress + totalAbandoned (+ totalInvalid) by
   * construction, never two numbers that merely happen to agree.
   */
  totalConverted: number
  /**
   * FASE 9D — SOLO tra le sessioni "resolvedSessions" (converted +
   * abandoned): totalConverted / resolvedSessions. totalInProgress is
   * deliberately excluded from this ratio (a session still being filled
   * in must never count against — or artificially inflate — the
   * conversion rate) and so is totalOpened/totalStarted (see
   * computeSessionRates in funnel-session-status-policy.ts — its
   * signature structurally cannot reference either). 0 when
   * resolvedSessions is 0 (computeRate's existing convention, reused
   * unchanged).
   */
  conversionRate: number
  totalSubmitStarted: number
  totalSubmitFailed: number
  submitFailureRate: number
  /**
   * FASE 9D — sessions classified ABANDONED specifically (see
   * classifySessionStatus in funnel-session-status-policy.ts): not
   * converted, AND last meaningful activity older than
   * FUNNEL_ABANDONMENT_INACTIVITY_MINUTES. No longer the old
   * `totalStarted - totalConverted` subtraction, which counted a session
   * started 30 seconds ago as "abandoned" just as readily as one dead for
   * a week — see totalInProgress below for where that gap went.
   */
  totalAbandoned: number
  /**
   * FASE 9D — a V2 session, not converted, whose last meaningful activity
   * (see MEANINGFUL_ACTIVITY_EVENT_TYPES in funnel-session-status-policy.ts
   * — funnel_started/step_viewed/step_completed/submit_started/
   * submit_failed/request_created; deliberately excludes funnel_opened,
   * the automatic mount event) happened within
   * FUNNEL_ABANDONMENT_INACTIVITY_MINUTES of "now". This is the number
   * that used to be silently folded into totalAbandoned before this
   * phase.
   */
  totalInProgress: number
  /**
   * FASE 9D — always exposed, never hidden (see the module comment on
   * classifySessionStatus's "invalid" branch): a defensive count of V2
   * "started" sessions for which no meaningful-activity row could be
   * found at all — should structurally never be > 0 (every started
   * session has at least its own funnel_started row as activity), but if
   * it ever is, this is where that anomaly becomes visible instead of
   * silently miscounted as abandoned.
   */
  totalInvalid: number
  /**
   * FASE 9D — totalConverted + totalAbandoned; the denominator for
   * conversionRate/abandonmentRate. Excludes totalInProgress AND
   * totalInvalid: neither is a "resolved" outcome yet.
   */
  resolvedSessions: number
  /**
   * FASE 9D — same "resolvedSessions" denominator as conversionRate, see
   * above.
   */
  abandonmentRate: number
  steps: AdminFunnelStepRow[]
  /**
   * FASE 9F — vedi il commento su AdminFunnelValidationFailureRow.
   * Stesso scope V2 + periodo/intervento/provenienza di totalStarted (via
   * sessionIdRestriction) — a differenza della tabella "steps" sopra, che
   * non è mai stata ristretta né per trackingVersion né per provenienza
   * (invariata, fuori scope qui).
   */
  validationFailures: AdminFunnelValidationFailureRow[]
  errors: AdminFunnelErrorRow[]
  abandonmentByLastStep: AdminFunnelAbandonmentRow[]
  attribution: AdminFunnelAttributionRow[]
  /**
   * FASE 9K.1 — "Motivi di uscita dichiarati": exit_feedback_submitted,
   * trackingVersion "v2", ristretto a openedSessionIdRestriction (V2 +
   * periodo/intervento/provenienza — vedi getAdminFunnelMetrics), NON a
   * sessionIdRestriction: include anche i feedback di sessioni che hanno
   * SOLO funnel_opened (mai iniziate — vedi exitFeedbackByOrigin sotto),
   * a differenza di validationFailures sopra (che resta sulla coorte
   * "avviata").
   */
  exitFeedbackReasons: AdminFunnelExitFeedbackReasonRow[]
  /**
   * FASE 9K.1 — riepilogo "prima di iniziare" / "dopo aver iniziato" per
   * lo STESSO insieme di feedback di exitFeedbackReasons sopra (stessa
   * query, mai una seconda derivazione indipendente — vedi
   * getAdminFunnelMetrics).
   */
  exitFeedbackByOrigin: AdminFunnelExitFeedbackOriginCounts
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
 * FASE 9K — etichette admin per ogni reasonCode, deliberatamente DIVERSE
 * dalle etichette mostrate nel modal cliente (funnel-exit-feedback-modal.tsx
 * in apps/web): lì "not_ready" ha due frasi diverse a seconda dello step
 * (contestuali, rivolte all'utente); qui una sola etichetta neutra per
 * reasonCode, indipendente dallo step (il breakdown per step è una colonna
 * separata — vedi AdminFunnelExitFeedbackReasonRow.byStep). Un
 * Record<FunnelExitFeedbackReasonCode, string> (non Record<string,
 * string>) così un nuovo reasonCode aggiunto in futuro all'allow-list del
 * dominio fa fallire il typecheck qui finché non gli si assegna
 * un'etichetta, invece di apparire silenziosamente come stringa grezza.
 */
const EXIT_FEEDBACK_REASON_LABELS: Record<FunnelExitFeedbackReasonCode, string> = {
  just_browsing: "Stavo solo dando un'occhiata",
  too_many_questions: "Ci sono troppe domande",
  dont_know_what_to_choose: "Non so cosa scegliere",
  dont_want_to_share_contact: "Preferisco non lasciare i miei dati",
  want_cost_first: "Vorrei prima capire quanto può costare",
  not_ready: "Non sono ancora pronto",
  other: "Altro motivo",
}

export function exitFeedbackReasonLabel(reasonCode: FunnelExitFeedbackReasonCode): string {
  return EXIT_FEEDBACK_REASON_LABELS[reasonCode]
}

/**
 * Difensivo: un reasonCode non riconosciuto non dovrebbe mai comparire —
 * recordFunnelEvent rifiuta un exit_feedback_submitted senza un reasonCode
 * valido (vedi record-funnel-event.ts) — ma se un'anomalia di dati lo
 * producesse comunque, va verso "other" invece di sparire silenziosamente
 * dal totale (stesso principio di normalizeErrorCode in
 * record-funnel-event.ts: perdere la sfumatura è accettabile, perdere la
 * riga non lo è).
 */
function isKnownExitFeedbackReasonCode(
  value: string | null,
): value is FunnelExitFeedbackReasonCode {
  return (EXIT_FEEDBACK_REASON_CODES as readonly string[]).includes(value ?? "")
}

/**
 * FASE 9F — one raw (stepKey, eventType) group, already reduced to a
 * plain count + its minimum stepIndex. Shaped to be trivially buildable
 * from a Prisma groupBy result without dragging Prisma's own types into
 * this pure function's signature (see buildValidationFailureRows below,
 * exported for unit testing with plain objects, no DB access).
 */
export type ValidationFailureGroupInput = {
  stepKey: string
  eventType: string
  count: number
  minStepIndex: number
}

/**
 * FASE 9F — pure fold, exported for unit testing (same "no DB access"
 * pattern as the other pure helpers here): given the groupBy result over
 * step_viewed + client_validation_failed for an already V2-scoped,
 * period/intervention/provenance-restricted set of sessions (see
 * getAdminFunnelMetrics), produces one row per step with both counts and
 * the resulting rate. Any group whose eventType is neither of the two
 * expected values is silently ignored — defensive, not a validation
 * gate: this function trusts its caller already restricted the query's
 * eventType filter, same posture as the analogous `steps` fold in
 * getAdminFunnelMetrics.
 */
export function buildValidationFailureRows(
  groups: ValidationFailureGroupInput[],
  resolveLabel: (stepKey: string) => string,
): AdminFunnelValidationFailureRow[] {
  const map = new Map<
    string,
    { viewedCount: number; validationFailedCount: number; stepIndex: number }
  >()

  for (const group of groups) {
    const existing = map.get(group.stepKey) ?? {
      viewedCount: 0,
      validationFailedCount: 0,
      stepIndex: group.minStepIndex,
    }

    if (group.eventType === "step_viewed") {
      existing.viewedCount = group.count
    } else if (group.eventType === "client_validation_failed") {
      existing.validationFailedCount = group.count
    }

    existing.stepIndex = Math.min(existing.stepIndex, group.minStepIndex)
    map.set(group.stepKey, existing)
  }

  return Array.from(map.entries())
    .map(([stepKey, value]) => ({
      stepKey,
      stepLabel: resolveLabel(stepKey),
      stepIndex: value.stepIndex,
      viewedCount: value.viewedCount,
      validationFailedCount: value.validationFailedCount,
      validationFailureRate: computeRate(
        value.validationFailedCount,
        value.viewedCount,
      ),
    }))
    .sort((a, b) => a.stepIndex - b.stepIndex)
}

/**
 * FASE 9K.1 — una riga grezza exit_feedback_submitted, una per sessione
 * (garanzia dell'indice unico parziale, vedi AdminFunnelExitFeedbackReasonRow).
 * A differenza della FASE 9K (che riceveva un groupBy già aggregato per
 * (reasonCode, stepKey)), qui serve la riga individuale — con il proprio
 * funnelSessionId — perché SOLO a questo livello si può stabilire se quella
 * sessione era "preStart" o "started" (vedi buildExitFeedbackBreakdown
 * sotto): un groupBy per (reasonCode, stepKey) soltanto perderebbe
 * quell'informazione per costruzione.
 */
export type ExitFeedbackRowInput = {
  funnelSessionId: string
  reasonCode: string | null
  stepKey: string
}

/**
 * FASE 9K.1 — risultato combinato di buildExitFeedbackBreakdown: le due
 * metà (reasons/byOrigin) sono SEMPRE derivate dallo stesso, unico, giro
 * sulle righe in ingresso — mai due conteggi indipendenti che potrebbero
 * andare fuori sincrono tra loro (stesso principio già applicato da
 * summarizeSessionStatuses in funnel-session-status-policy.ts).
 */
export type AdminFunnelExitFeedbackBreakdown = {
  reasons: AdminFunnelExitFeedbackReasonRow[]
  byOrigin: AdminFunnelExitFeedbackOriginCounts
}

/**
 * FASE 9K.1 — pura, esportata per i test: dato l'insieme di righe
 * exit_feedback_submitted (V2, già ristretto a openedSessionIdRestriction
 * — vedi getAdminFunnelMetrics) e l'insieme delle sessioni che hanno ANCHE
 * funnel_started, produce in un solo passaggio:
 * - reasons: una riga per ciascuno dei 7 reasonCode dell'allow-list (mai
 *   un elenco che appare/scompare in base ai dati), ciascuna col proprio
 *   breakdown per step — invariato nella forma rispetto alla FASE 9K, solo
 *   la provenienza dei dati in ingresso è cambiata (righe singole, non più
 *   un groupBy pre-aggregato).
 * - byOrigin: quante di queste sessioni erano "preStart" (solo
 *   funnel_opened) contro "started" (avevano anche funnel_started) — un
 *   riepilogo SEPARATO, mai una colonna in più nella tabella per motivo,
 *   per non complicarla (vedi il brief FASE 9K.1).
 *
 * La percentuale in ogni riga usa come denominatore il totale REALE di
 * sessioni con feedback nello scope (somma di tutte le righe in ingresso),
 * mai il numero di reasonCode possibili.
 */
export function buildExitFeedbackBreakdown(
  rows: ExitFeedbackRowInput[],
  startedSessionIds: ReadonlySet<string>,
  resolveLabel: (stepKey: string) => string,
): AdminFunnelExitFeedbackBreakdown {
  const byReason = new Map<
    FunnelExitFeedbackReasonCode,
    { total: number; byStep: Map<string, number> }
  >()

  for (const reasonCode of EXIT_FEEDBACK_REASON_CODES) {
    byReason.set(reasonCode, { total: 0, byStep: new Map() })
  }

  let grandTotal = 0
  let preStart = 0
  let started = 0

  for (const row of rows) {
    const reasonCode = isKnownExitFeedbackReasonCode(row.reasonCode)
      ? row.reasonCode
      : "other"
    const entry = byReason.get(reasonCode)!

    entry.total += 1
    entry.byStep.set(row.stepKey, (entry.byStep.get(row.stepKey) ?? 0) + 1)
    grandTotal += 1

    if (startedSessionIds.has(row.funnelSessionId)) {
      started += 1
    } else {
      preStart += 1
    }
  }

  const reasons: AdminFunnelExitFeedbackReasonRow[] = EXIT_FEEDBACK_REASON_CODES.map(
    (reasonCode) => {
      const entry = byReason.get(reasonCode)!

      return {
        reasonCode,
        label: exitFeedbackReasonLabel(reasonCode),
        sessionCount: entry.total,
        percentage: computeRate(entry.total, grandTotal),
        byStep: Array.from(entry.byStep.entries())
          .map(([stepKey, count]) => ({
            stepKey,
            stepLabel: resolveLabel(stepKey),
            sessionCount: count,
          }))
          .sort((a, b) => b.sessionCount - a.sessionCount),
      }
    },
  ).sort((a, b) => b.sessionCount - a.sessionCount)

  return { reasons, byOrigin: { preStart, started } }
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
 *
 * FASE 9B: the caller no longer always passes the raw funnel_started row
 * verbatim — for V2 traffic it passes the RESOLVED attribution (from
 * funnel_opened, see mergeSessionAttribution/resolveSessionAttribution
 * above). This function itself is unchanged: it only ever classifies
 * whatever 5-field shape it is given, agnostic to which row it came from.
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

// --- DB-backed aggregation (everything below touches Prisma) ---

/**
 * FASE 9B — one session's attribution-bearing fields, resolved from
 * whichever row actually carries them (see mergeSessionAttribution /
 * resolveSessionAttribution below). Same shape deriveAttributionSource
 * already accepts; funnelSessionId added only so the merge functions can
 * key by it.
 */
export type SessionAttributionRow = {
  funnelSessionId: string
  gclid: string | null
  gbraid: string | null
  wbraid: string | null
  utmSource: string | null
  attributionStatus: string | null
}

const EMPTY_SESSION_ATTRIBUTION: SessionAttributionRow = {
  funnelSessionId: "",
  gclid: null,
  gbraid: null,
  wbraid: null,
  utmSource: null,
  attributionStatus: null,
}

/**
 * FASE 9B — pure merge, exported for unit testing (same "no DB access"
 * pattern as the other pure helpers above): given a session's candidate
 * attribution rows from funnel_started (the legacy baseline — the only
 * place attribution lived before FASE 9A) and funnel_opened (FASE 9A's
 * mount event, where V2 attribution now lives — see the module comment on
 * FunnelEvent in schema.prisma), returns which one is authoritative per
 * session.
 *
 * funnel_opened always wins when present: its mere existence proves the
 * session is V2 — no legacy client could ever have written that
 * eventType, so this is a structurally reliable signal, not a guess. A
 * session with only a funnel_started row (no funnel_opened counterpart —
 * a true legacy session, trackingVersion NULL) keeps reading attribution
 * from that funnel_started row exactly as before FASE 9A. This is what
 * keeps the Provenienza table from going empty/wrong for V2 traffic
 * (attribution moved to funnel_opened) while staying correct for every
 * row written before this phase.
 */
export function mergeSessionAttribution(
  startedRows: SessionAttributionRow[],
  openedRows: SessionAttributionRow[],
): Map<string, SessionAttributionRow> {
  const bySession = new Map<string, SessionAttributionRow>()

  for (const row of startedRows) {
    bySession.set(row.funnelSessionId, row)
  }

  for (const row of openedRows) {
    bySession.set(row.funnelSessionId, row)
  }

  return bySession
}

/**
 * FASE 9B — DB-backed wrapper around mergeSessionAttribution above: fetches
 * the funnel_started and funnel_opened rows for the given sessionIds (two
 * bounded queries, never per-row — same "no N+1" discipline as
 * getAbandonmentByLastStep/getRecentFunnelSessions below) and merges them.
 * Called with the FULL "started" population in scope, once, and reused for
 * every attribution-dependent read (the KPI breakdown, the provenance
 * filter, and the recent-sessions list) — never re-queried per caller.
 */
async function resolveSessionAttribution(
  sessionIds: string[],
): Promise<Map<string, SessionAttributionRow>> {
  if (sessionIds.length === 0) {
    return new Map()
  }

  const select = {
    funnelSessionId: true,
    gclid: true,
    gbraid: true,
    wbraid: true,
    utmSource: true,
    attributionStatus: true,
  } as const

  const [startedRows, openedRows] = await Promise.all([
    prisma.funnelEvent.findMany({
      where: { funnelSessionId: { in: sessionIds }, eventType: "funnel_started" },
      select,
    }),
    prisma.funnelEvent.findMany({
      where: { funnelSessionId: { in: sessionIds }, eventType: "funnel_opened" },
      select,
    }),
  ])

  return mergeSessionAttribution(startedRows, openedRows)
}

/**
 * FASE 9B — looks up a session's resolved attribution in the given map,
 * falling back to "nothing attributed" (never "unknown" — a missing map
 * entry means this session simply has no attribution-bearing row at all,
 * not that capture failed) when absent, then classifies it. Single call
 * site for "map lookup + classify", used by the KPI breakdown, the
 * provenance filter, and the recent-sessions list alike — so the three
 * can never drift out of sync with each other.
 */
function attributionSourceFor(
  sessionId: string,
  attributionBySession: Map<string, SessionAttributionRow>,
): AdminFunnelProvenance {
  return deriveAttributionSource(
    attributionBySession.get(sessionId) ?? EMPTY_SESSION_ATTRIBUTION,
  )
}

/**
 * FASE 9D — resolves, for each of the given (already V2-scoped)
 * sessionIds, whether it has converted, whether it submitted exit
 * feedback, and when its last meaningful activity happened, then
 * classifies it via classifySessionStatus. Three bounded queries (never
 * per-row, same "no N+1" discipline as resolveSessionAttribution above):
 * one to find which sessions have a request_created row, one to find
 * which have an exit_feedback_submitted row (FASE 9I — checked
 * independently of the activity groupBy below, since
 * exit_feedback_submitted is deliberately EXCLUDED from
 * MEANINGFUL_ACTIVITY_EVENT_TYPES, see that constant's doc comment), and
 * one groupBy to find MAX(createdAt) among each session's
 * MEANINGFUL_ACTIVITY_EVENT_TYPES rows. `now` is captured ONCE by the
 * caller (getAdminFunnelMetrics) and threaded through here so every
 * session in the same call is judged against the identical instant —
 * never a fresh `new Date()` per session.
 */
async function resolveSessionStatuses(
  sessionIds: string[],
  now: Date,
): Promise<
  Map<string, { status: AdminFunnelV2SessionStatus; lastMeaningfulActivityAt: Date | null }>
> {
  const result = new Map<
    string,
    { status: AdminFunnelV2SessionStatus; lastMeaningfulActivityAt: Date | null }
  >()

  if (sessionIds.length === 0) {
    return result
  }

  const [convertedRows, exitFeedbackRows, activityGroups] = await Promise.all([
    prisma.funnelEvent.findMany({
      where: { funnelSessionId: { in: sessionIds }, eventType: "request_created" },
      select: { funnelSessionId: true },
      distinct: ["funnelSessionId"],
    }),
    prisma.funnelEvent.findMany({
      where: {
        funnelSessionId: { in: sessionIds },
        eventType: "exit_feedback_submitted",
      },
      select: { funnelSessionId: true },
      distinct: ["funnelSessionId"],
    }),
    prisma.funnelEvent.groupBy({
      by: ["funnelSessionId"],
      where: {
        funnelSessionId: { in: sessionIds },
        eventType: { in: [...MEANINGFUL_ACTIVITY_EVENT_TYPES] },
      },
      _max: { createdAt: true },
    }),
  ])

  const convertedSessionIds = new Set(
    convertedRows.map((row) => row.funnelSessionId),
  )
  const exitFeedbackSessionIds = new Set(
    exitFeedbackRows.map((row) => row.funnelSessionId),
  )
  const lastActivityBySession = new Map(
    activityGroups.map((group) => [group.funnelSessionId, group._max.createdAt]),
  )

  for (const sessionId of sessionIds) {
    const lastMeaningfulActivityAt =
      lastActivityBySession.get(sessionId) ?? null

    result.set(sessionId, {
      status: classifySessionStatus({
        hasConverted: convertedSessionIds.has(sessionId),
        hasExitFeedback: exitFeedbackSessionIds.has(sessionId),
        lastMeaningfulActivityAt,
        now,
      }),
      lastMeaningfulActivityAt,
    })
  }

  return result
}

/**
 * Abandonment "last known step" breakdown — the one query here that can't
 * be a flat prisma.groupBy(), since it needs a per-session (not per-event)
 * aggregate: the last step each session reached. Entirely computed inside
 * Postgres; only the final, small grouped result (at most a few dozen
 * rows, one per distinct step) crosses back into Node — see module
 * comment re: "no unbounded loads, no N+1".
 *
 * FASE 9D — no longer re-derives "abandoned" itself (that used to mean
 * "started, minus converted" via a LEFT JOIN, with no notion of
 * IN_PROGRESS at all). Takes the EXACT set of session ids already
 * classified ABANDONED by resolveSessionStatuses/classifySessionStatus
 * upstream (see getAdminFunnelMetrics) and only computes each one's last
 * step — this is what guarantees this table's rows sum back to
 * totalAbandoned by construction, not by two independently-derived
 * queries merely happening to agree.
 */
async function getAbandonmentByLastStep(
  abandonedSessionIds: string[],
): Promise<{ stepKey: string | null; sessionCount: number }[]> {
  if (abandonedSessionIds.length === 0) {
    return []
  }

  const rows = await prisma.$queryRaw<
    { step_key: string | null; session_count: number }[]
  >(Prisma.sql`
    WITH abandoned("funnelSessionId") AS (
      VALUES ${Prisma.join(abandonedSessionIds.map((id) => Prisma.sql`(${id})`))}
    ),
    last_step AS (
      SELECT DISTINCT ON (fe."funnelSessionId")
        fe."funnelSessionId", fe."stepKey" AS step_key
      FROM "FunnelEvent" fe
      WHERE fe."eventType" IN ('step_viewed', 'step_completed')
        AND fe."funnelSessionId" IN (${Prisma.join(abandonedSessionIds)})
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
 *
 * FASE 9B: no longer selects gclid/gbraid/wbraid/utmSource/
 * attributionStatus off this row directly — attribution is looked up from
 * the pre-resolved attributionBySession map instead (see
 * resolveSessionAttribution), since for a V2 session those fields live on
 * a DIFFERENT row (funnel_opened), not on this funnel_started one.
 *
 * FASE 9C: trackingVersion: "v2" added to the funnel_started filter —
 * this list must stay consistent with totalStarted (now V2-only): a
 * legacy session appearing here, next to a "Sessioni avviate" KPI that no
 * longer counts it, would be exactly the silent legacy/V2 mixing this
 * phase set out to remove.
 *
 * FASE 9D: status is no longer derived locally from this session's own
 * eventTypes (the old deriveSessionStatus heuristic, with no notion of
 * IN_PROGRESS or an inactivity threshold) — it is looked up in the
 * pre-resolved statusBySession map instead (see resolveSessionStatuses),
 * the SAME classification the KPI cards above use, so a row here can
 * never disagree with them. relatedEvents is still needed for
 * lastStepLabel (the last step_viewed/step_completed reached), unrelated
 * to status.
 */
async function getRecentFunnelSessions(
  where: Prisma.FunnelEventWhereInput,
  attributionBySession: Map<string, SessionAttributionRow>,
  statusBySession: Map<
    string,
    { status: AdminFunnelV2SessionStatus; lastMeaningfulActivityAt: Date | null }
  >,
): Promise<AdminFunnelSessionSummary[]> {
  const startedRows = await prisma.funnelEvent.findMany({
    where: { ...where, eventType: "funnel_started", trackingVersion: "v2" },
    orderBy: { createdAt: "desc" },
    take: RECENT_SESSIONS_LIMIT,
    select: {
      funnelSessionId: true,
      interventionSlug: true,
      createdAt: true,
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
    const status: AdminFunnelV2SessionStatus =
      statusBySession.get(row.funnelSessionId)?.status ?? "invalid"

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
      attributionSource: attributionSourceFor(
        row.funnelSessionId,
        attributionBySession,
      ),
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

  // FASE 9C — legacy/V2 split for the base metrics (see the doc comments
  // on AdminFunnelMetrics.totalOpened/totalStarted/legacyStartedCount):
  // - startedInScopeRows: the "Sessioni avviate" population, now
  //   explicitly trackingVersion: "v2" — pushed down here, not derived
  //   implicitly, so nothing that reuses it below can silently drift back
  //   to mixing legacy in.
  // - legacyStartedCount: the SAME eventType, but trackingVersion: null —
  //   counted separately, informational only, never merged into the V2
  //   population above.
  // - totalOpened: funnel_opened has no legacy equivalent (it did not
  //   exist before FASE 9A), so trackingVersion: "v2" here is a defensive
  //   assertion, not a real distinction — see its doc comment for why it
  //   deliberately ignores the provenance filter below.
  //
  // FASE 9K.1 — this used to be a plain count(): now a findMany selecting
  // just funnelSessionId, so its rows can ALSO seed openedSessionIdsV2
  // below (needed for the exit-feedback cohort widening — see
  // openedSessionIdRestriction) without a second query for the same
  // population. Same single round-trip as before, same filter, just a
  // different return shape — totalOpened (the number) is still exactly
  // openedInScopeRows.length.
  const [startedInScopeRows, legacyStartedCount, openedInScopeRows] =
    await Promise.all([
      prisma.funnelEvent.findMany({
        where: { ...scope, eventType: "funnel_started", trackingVersion: "v2" },
        select: { funnelSessionId: true },
      }),
      prisma.funnelEvent.count({
        where: { ...scope, eventType: "funnel_started", trackingVersion: null },
      }),
      prisma.funnelEvent.findMany({
        where: { ...scope, eventType: "funnel_opened", trackingVersion: "v2" },
        select: { funnelSessionId: true },
      }),
    ])

  const startedSessionIdsV2 = startedInScopeRows.map((row) => row.funnelSessionId)
  const startedSessionIdSet = new Set(startedSessionIdsV2)
  const openedSessionIdsV2 = openedInScopeRows.map((row) => row.funnelSessionId)
  const totalOpened = openedInScopeRows.length

  // FASE 9K.1 — resolved over the OPENED population (a strict superset of
  // startedSessionIdsV2: funnel_started never fires without funnel_opened
  // having fired first at mount — see request-stepper.tsx), not just the
  // started one. This is what lets openedSessionIdRestriction below use
  // the SAME map for provenance, no second resolveSessionAttribution call
  // — every id in startedSessionIdsV2 still gets exactly the same
  // attribution row it did before this change.
  const attributionBySession = await resolveSessionAttribution(openedSessionIdsV2)

  // Provenance narrows the (already V2-only) started population by its
  // RESOLVED attribution (funnel_opened — the only source reachable here,
  // since startedSessionIdsV2 is V2-only by construction; see
  // attributionSourceFor above). sessionIdRestriction is now ALWAYS the
  // full V2 population, never "unrestricted" — unlike before FASE 9C,
  // where an absent provenance filter left totalConverted's query
  // (below) with no session restriction at all, silently pulling in
  // conversions from legacy sessions alongside V2 ones. request_created
  // rows carry no trackingVersion of their own (see create-request.ts —
  // unaffected by FASE 9A/9B/9C), so this explicit session id list is the
  // only way to keep that query V2-scoped. Deliberately NOT applied to
  // the per-step table or the submit/error breakdown (see their inline
  // comments below): technical funnel friction is treated as independent
  // of traffic source.
  //
  // UNCHANGED by FASE 9K.1: this remains the "started" cohort exactly as
  // before — resolveSessionStatuses/classifySessionStatus (status policy)
  // and totalStarted are both still derived ONLY from this, never from
  // openedSessionIdRestriction below. A "preStart" session (opened, never
  // started) never enters this array and so can never be classified
  // ABANDONED by the started-cohort status policy — see
  // AdminFunnelExitFeedbackOriginCounts' doc comment.
  const sessionIdRestriction: string[] = filters.provenance
    ? startedSessionIdsV2.filter(
        (id) =>
          attributionSourceFor(id, attributionBySession) ===
          filters.provenance,
      )
    : startedSessionIdsV2

  // FASE 9K.1 — same shape as sessionIdRestriction above, but over the
  // OPENED population: used ONLY by the exit-feedback query below, never
  // by anything status-policy-related. This is what makes a feedback from
  // a session that opened but never started visible in "Motivi di uscita
  // dichiarati" while leaving totalStarted/totalAbandoned/totalInProgress
  // and every status-derived table untouched.
  const openedSessionIdRestriction: string[] = filters.provenance
    ? openedSessionIdsV2.filter(
        (id) =>
          attributionSourceFor(id, attributionBySession) ===
          filters.provenance,
      )
    : openedSessionIdsV2

  const noOpenedSessions = openedSessionIdRestriction.length === 0

  const sessionRestrictionWhere: Prisma.FunnelEventWhereInput = {
    funnelSessionId: { in: sessionIdRestriction },
  }

  const noStartedSessions = sessionIdRestriction.length === 0

  const totalStarted = sessionIdRestriction.length

  // FASE 9D — captured ONCE, threaded through resolveSessionStatuses
  // below: every session in this call is judged "in progress vs
  // abandoned" against the exact same instant, never a fresh `new Date()`
  // per session.
  const now = new Date()

  // FASE 9D — the single per-session classification pass every other
  // status-dependent piece below (totalConverted/totalInProgress/
  // totalAbandoned, the abandonment-by-last-step table, each recent
  // session's badge) is derived from — never re-derived independently, so
  // none of them can drift out of sync with each other (see
  // summarizeSessionStatuses' doc comment for why the sum invariant holds
  // by construction).
  const statusBySession = await resolveSessionStatuses(
    sessionIdRestriction,
    now,
  )
  const statusSummary = summarizeSessionStatuses(
    sessionIdRestriction.map(
      (id) => statusBySession.get(id)?.status ?? "invalid",
    ),
  )
  const abandonedSessionIds = sessionIdRestriction.filter(
    (id) => statusBySession.get(id)?.status === "abandoned",
  )

  const [
    totalSubmitStarted,
    totalSubmitFailed,
    stepGroups,
    validationFailureGroups,
    errorGroups,
    abandonmentByLastStepRaw,
    interventionOptionRows,
    recentSessions,
    exitFeedbackRows,
  ] = await Promise.all([
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
    // FASE 9F — "Tentativi bloccati dalla validazione": UNLIKE the per-step
    // table above, restricted to sessionIdRestriction (V2 + period +
    // intervento + provenienza, the same population totalStarted/status
    // use) and to trackingVersion: "v2" explicitly — both step_viewed and
    // client_validation_failed rows are counted per DISTINCT session, not
    // per raw event: FunnelEvent's own @@unique([funnelSessionId,
    // eventType, stepKey, stepIndex]) already guarantees at most one row
    // per (session, step) for each of these two eventTypes, so a plain
    // COUNT here already equals "how many sessions", with no separate
    // per-session GROUP BY needed (same reasoning already relied on by
    // the per-step table above).
    noStartedSessions
      ? Promise.resolve([])
      : prisma.funnelEvent.groupBy({
          by: ["stepKey", "eventType"],
          where: {
            funnelSessionId: { in: sessionIdRestriction },
            trackingVersion: "v2",
            eventType: { in: ["step_viewed", "client_validation_failed"] },
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
    // FASE 9D: takes the already-classified ABANDONED ids directly — see
    // getAbandonmentByLastStep's own comment for why this replaces the
    // old "started minus converted" re-derivation.
    getAbandonmentByLastStep(abandonedSessionIds),
    // Intervention filter options: scoped by period only, never by the
    // currently-selected interventionSlug itself — otherwise picking one
    // intervention would collapse the dropdown to just that one option.
    // Deliberately NOT restricted to trackingVersion: "v2" like the
    // metrics above — this is a filter's option list, not a summed
    // metric, so an intervention that only ever appears in legacy traffic
    // stays selectable rather than silently disappearing from the
    // dropdown.
    prisma.funnelEvent.findMany({
      where: { ...sinceScope, eventType: "funnel_started" },
      distinct: ["interventionSlug"],
      select: { interventionSlug: true },
      orderBy: { interventionSlug: "asc" },
    }),
    noStartedSessions
      ? Promise.resolve([])
      : getRecentFunnelSessions(
          { ...scope, ...sessionRestrictionWhere },
          attributionBySession,
          statusBySession,
        ),
    // FASE 9K.1 — "Motivi di uscita dichiarati": ristretta a
    // openedSessionIdRestriction (la coorte APERTA, non quella avviata —
    // vedi il suo commento sopra), così un feedback dato da chi ha aperto
    // il funnel ma non l'ha mai davvero iniziato resta visibile qui. Righe
    // individuali (funnelSessionId incluso), non un groupBy pre-aggregato
    // come nella FASE 9K: serve il funnelSessionId di ciascuna riga per
    // poter distinguere preStart/started in buildExitFeedbackBreakdown —
    // un groupBy per (reasonCode, stepKey) soltanto perderebbe
    // quell'informazione per costruzione. Resta una singola query,
    // limitata in pratica dal numero di feedback realmente inviati (al più
    // uno per sessione, per il vincolo unico parziale — schema.prisma, non
    // toccato qui), non dal volume totale di FunnelEvent.
    noOpenedSessions
      ? Promise.resolve([])
      : prisma.funnelEvent.findMany({
          where: {
            funnelSessionId: { in: openedSessionIdRestriction },
            trackingVersion: "v2",
            eventType: "exit_feedback_submitted",
          },
          select: { funnelSessionId: true, reasonCode: true, stepKey: true },
        }),
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

  // FASE 9F — "Tentativi bloccati dalla validazione": già ristretta a
  // sessionIdRestriction + trackingVersion: "v2" a monte nella query
  // stessa; qui solo la conversione verso la forma pura che
  // buildValidationFailureRows si aspetta.
  const validationFailures: AdminFunnelValidationFailureRow[] =
    buildValidationFailureRows(
      validationFailureGroups.map((group) => ({
        stepKey: group.stepKey,
        eventType: group.eventType,
        count: group._count._all,
        minStepIndex: group._min.stepIndex ?? 0,
      })),
      (stepKey) => resolveStepLabel(stepKey, interventionSlug),
    )

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

  // FASE 9D: no longer `totalStarted - totalConverted` — see
  // AdminFunnelMetrics.totalAbandoned's doc comment. totalConverted/
  // totalInProgress/totalAbandoned/totalInvalid all come from the SAME
  // statusSummary computed above, so totalStarted === their sum holds by
  // construction (see summarizeSessionStatuses).
  const { totalConverted, totalInProgress, totalAbandoned, totalInvalid } =
    statusSummary

  // FASE 9D: totalOpened/totalStarted deliberately excluded from this —
  // computeSessionRates' signature only accepts totalConverted/
  // totalAbandoned, so neither can leak in as a denominator (see its doc
  // comment and Test K in funnel-session-status-policy.test.ts).
  const { resolvedSessions, conversionRate, abandonmentRate } =
    computeSessionRates({ totalConverted, totalAbandoned }, computeRate)

  // Attribution summary: this table IS the provenance breakdown, so it is
  // always computed over the period/intervention scope only, independent
  // of the `provenance` filter itself — startedSessionIdsV2/
  // attributionBySession above are already scoped that way, never by
  // sessionIdRestriction. FASE 7E added "unknown" as a 4th bucket — see
  // deriveAttributionSource above for why it is a materially different
  // fact from "direct".
  //
  // FASE 9C: startedSessionIdsV2 is V2-only by construction, so every id
  // iterated below already has a funnel_opened counterpart — the legacy
  // fallback inside mergeSessionAttribution is effectively unreachable
  // from this specific loop, kept only because attributionSourceFor is
  // shared, general-purpose logic (also used, unrestricted, wherever a
  // future caller might still need the legacy fallback).
  //
  // FASE 9B: resolved per session (funnel_opened for V2, funnel_started
  // fallback for legacy — see attributionSourceFor) instead of 4 separate
  // SQL COUNT queries filtered directly on the funnel_started row's own
  // columns. That direct-column approach is what silently went to zero
  // for V2 traffic once attribution moved off funnel_started onto
  // funnel_opened (FASE 9A) — this is the fix. Same classification path
  // (attributionSourceFor) shared with the provenance filter and the
  // recent-sessions list above, so the three can never drift apart.
  const attributionCounts: Record<AdminFunnelProvenance, number> = {
    google_ads: 0,
    campaign: 0,
    direct: 0,
    unknown: 0,
  }

  for (const sessionId of startedSessionIdsV2) {
    attributionCounts[attributionSourceFor(sessionId, attributionBySession)] += 1
  }

  // FASE 9K.1 — exitFeedbackRows è già ristretta a
  // openedSessionIdRestriction + trackingVersion: "v2" a monte nella query
  // stessa; startedSessionIdSet (la coorte "avviata", invariata) è ciò che
  // permette a buildExitFeedbackBreakdown di distinguere preStart/started
  // per ciascuna riga.
  const { reasons: exitFeedbackReasons, byOrigin: exitFeedbackByOrigin } =
    buildExitFeedbackBreakdown(
      exitFeedbackRows,
      startedSessionIdSet,
      (stepKey) => resolveStepLabel(stepKey, interventionSlug),
    )

  const attribution: AdminFunnelAttributionRow[] = (
    ["google_ads", "campaign", "direct", "unknown"] as const
  ).map((source) => ({
    source,
    label: provenanceLabel(source),
    sessionCount: attributionCounts[source],
  }))

  return {
    totalOpened,
    totalStarted,
    legacyStartedCount,
    totalConverted,
    conversionRate,
    totalSubmitStarted,
    totalSubmitFailed,
    submitFailureRate: computeRate(totalSubmitFailed, totalSubmitStarted),
    totalAbandoned,
    totalInProgress,
    totalInvalid,
    resolvedSessions,
    abandonmentRate,
    steps,
    validationFailures,
    errors,
    abandonmentByLastStep,
    attribution,
    exitFeedbackReasons,
    exitFeedbackByOrigin,
    recentSessions,
    interventionOptions: interventionOptionRows.map(
      (row) => row.interventionSlug,
    ),
  }
}
