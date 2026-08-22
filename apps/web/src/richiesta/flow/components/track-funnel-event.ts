/**
 * "request_created" è deliberatamente ASSENTE da questo tipo (FASE 6D):
 * quell'eventType è scritto solo server-side, direttamente da
 * create-request.ts — trackFunnelEvent (il tracker DB first-party lato
 * client) non deve mai poterlo inviare. Per il mirror GA4-only di
 * request_created lato client vedi trackFunnelEventGa4 in
 * site/analytics/ga4-events.ts, chiamata separatamente da
 * request-stepper.tsx solo dopo una risposta 200 già ricevuta.
 */
export type FunnelEventType =
  | "funnel_started"
  | "step_viewed"
  | "step_completed"
  | "submit_started"
  | "submit_failed"

export type TrackFunnelEventInput = {
  funnelSessionId: string | null
  interventionSlug: string
  eventType: FunnelEventType
  /** Richiesto dal server per ogni eventType tranne funnel_started. */
  stepKey?: string
  stepIndex?: number
  /** Solo per submit_failed (FASE 6D) — un codice tecnico noto, mai error.message. */
  errorCode?: string
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
      ...(input.stepKey !== undefined ? { stepKey: input.stepKey } : {}),
      ...(input.stepIndex !== undefined ? { stepIndex: input.stepIndex } : {}),
      ...(input.errorCode !== undefined ? { errorCode: input.errorCode } : {}),
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
