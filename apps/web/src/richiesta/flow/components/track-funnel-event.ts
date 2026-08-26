/**
 * "request_created" è deliberatamente ASSENTE da questo tipo (FASE 6D):
 * quell'eventType è scritto solo server-side, direttamente da
 * create-request.ts — trackFunnelEvent (il tracker DB first-party lato
 * client) non deve mai poterlo inviare. Per il mirror GA4-only di
 * request_created lato client vedi trackFunnelEventGa4 in
 * site/analytics/ga4-events.ts, chiamata separatamente da
 * request-stepper.tsx solo dopo una risposta 200 già ricevuta.
 *
 * FASE 9A: "funnel_opened" aggiunto — il mount del funnel, separato da
 * "funnel_started" (che mantiene il nome ma ora significa la prima vera
 * interazione dell'utente con una risposta — vedi request-stepper.tsx).
 *
 * FASE 9E: "client_validation_failed" aggiunto — un tentativo esplicito
 * di "Avanti"/"Prepara richiesta" bloccato dalla validazione client dello
 * step corrente (mai mentre l'utente digita/seleziona — vedi goNext in
 * request-stepper.tsx).
 *
 * FASE 9J: "exit_feedback_submitted" aggiunto — l'utente ha scelto un
 * motivo nel modal di uscita dal funnel (vedi funnel-exit-feedback-modal.tsx
 * e request-stepper.tsx, attemptControlledExit). Il server già supportava
 * questo eventType dalla FASE 9H (data layer only); qui viene solo esposto
 * al primo vero chiamante client.
 */
export type FunnelEventType =
  | "funnel_opened"
  | "funnel_started"
  | "step_viewed"
  | "step_completed"
  | "client_validation_failed"
  | "exit_feedback_submitted"
  | "submit_started"
  | "submit_failed"

/**
 * FASE 9J — mirror del closed allow-list EXIT_FEEDBACK_REASON_CODES in
 * packages/domain/.../record-funnel-event.ts. Duplicato qui di proposito,
 * stessa scelta già fatta per FunnelEventType sopra: questo modulo non
 * importa mai @esigenta/domain direttamente (evita di trascinare
 * dipendenze server/DB nel bundle client) — il server resta comunque
 * l'autorità che valida/rifiuta un valore non riconosciuto.
 */
export type FunnelExitFeedbackReasonCode =
  | "just_browsing"
  | "too_many_questions"
  | "dont_know_what_to_choose"
  | "dont_want_to_share_contact"
  | "want_cost_first"
  | "not_ready"
  | "other"

export type TrackFunnelEventInput = {
  funnelSessionId: string | null
  interventionSlug: string
  eventType: FunnelEventType
  /** Richiesto dal server per ogni eventType tranne funnel_opened/funnel_started. */
  stepKey?: string
  stepIndex?: number
  /** Solo per submit_failed (FASE 6D) — un codice tecnico noto, mai error.message. */
  errorCode?: string
  /** Solo per exit_feedback_submitted (FASE 9J) — uno dei valori controllati sopra, mai testo libero. */
  reasonCode?: FunnelExitFeedbackReasonCode
  /**
   * Solo per funnel_started (FASE 6E) — il server ignora questi campi per
   * ogni altro eventType. Il chiamante (request-stepper.tsx) decide già
   * COSA passare qui, incluso l'eventuale filtro su consenso marketing
   * per gclid/gbraid/wbraid (vedi site/analytics/funnel-attribution.ts) —
   * questa funzione si limita a spedire quello che riceve, stessa
   * responsabilità già valeva per errorCode.
   */
  gclid?: string
  gbraid?: string
  wbraid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  /**
   * Solo per funnel_started (FASE 7E) — "resolved" | "unknown". Distingue
   * "nessuna attribution da determinare/persistere" da "la risoluzione
   * dell'attribution è fallita per un errore tecnico". Vedi
   * site/analytics/funnel-attribution.ts, resolveFunnelStartedAttribution.
   */
  attributionStatus?: "resolved" | "unknown"
}

/**
 * FASE 9A — marcatore legacy/V2 del tracking (vedi il commento doc su
 * FunnelEvent.trackingVersion in schema.prisma e
 * packages/domain/.../record-funnel-event.ts per l'allow-list). Impostato
 * qui, in un UNICO punto centralizzato, su OGNI evento inviato da questa
 * funzione — mai una responsabilità lasciata al singolo chiamante in
 * request-stepper.tsx, così non può essere dimenticata per un nuovo
 * eventType introdotto in futuro.
 */
const TRACKING_VERSION = "v2"

/**
 * FASE 6C — invio fire-and-forget di UN evento di avanzamento funnel a
 * POST /api/funnel/events. Non ritorna una Promise che il chiamante debba
 * gestire: nessun throw, nessun retry, nessun log rumoroso lato utente. Il
 * funnel deve comportarsi in modo identico se questa chiamata riesce,
 * fallisce, o l'endpoint non risponde affatto — la telemetria è
 * osservabilità, mai logica business (vedi request-stepper.tsx).
 *
 * Del tutto indipendente dal consenso cookie: nessun import da
 * site/shell/cookie-consent-storage qui, di proposito — stesso principio
 * già applicato a Maps/Places (FASE 1) e a funnelSessionId (FASE 6B).
 */
export function trackFunnelEvent(input: TrackFunnelEventInput): void {
  if (typeof window === "undefined" || !input.funnelSessionId) {
    return
  }

  void fetch("/api/funnel/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      funnelSessionId: input.funnelSessionId,
      interventionSlug: input.interventionSlug,
      eventType: input.eventType,
      trackingVersion: TRACKING_VERSION,
      ...(input.stepKey !== undefined ? { stepKey: input.stepKey } : {}),
      ...(input.stepIndex !== undefined ? { stepIndex: input.stepIndex } : {}),
      ...(input.errorCode !== undefined ? { errorCode: input.errorCode } : {}),
      ...(input.reasonCode !== undefined ? { reasonCode: input.reasonCode } : {}),
      ...(input.gclid !== undefined ? { gclid: input.gclid } : {}),
      ...(input.gbraid !== undefined ? { gbraid: input.gbraid } : {}),
      ...(input.wbraid !== undefined ? { wbraid: input.wbraid } : {}),
      ...(input.utmSource !== undefined ? { utmSource: input.utmSource } : {}),
      ...(input.utmMedium !== undefined ? { utmMedium: input.utmMedium } : {}),
      ...(input.utmCampaign !== undefined ? { utmCampaign: input.utmCampaign } : {}),
      ...(input.utmTerm !== undefined ? { utmTerm: input.utmTerm } : {}),
      ...(input.utmContent !== undefined ? { utmContent: input.utmContent } : {}),
      ...(input.attributionStatus !== undefined
        ? { attributionStatus: input.attributionStatus }
        : {}),
    }),
  }).catch(() => {
    // Silenzioso di proposito: vedi il commento sulla funzione.
  })
}
