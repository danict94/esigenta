import { readCookieConsentPreferences } from "../shell/cookie-consent-storage"

type GtagWindow = Window &
  typeof globalThis & {
    gtag?: (...args: unknown[]) => void
  }

export type TrackGenerateLeadParams = {
  leadType: "customer_request"
  /** Slug tassonomico pubblico già validato lato server, mai testo libero. */
  serviceGroup: string | null
  /** Slug tassonomico pubblico già validato lato server, mai testo libero. */
  intervention: string
}

/**
 * generate_lead per una richiesta cliente realmente acquisita (transazione
 * committata). No-op silenzioso — mai un throw — se il consenso analytics
 * non è concesso nelle preferenze CORRENTI (rilette qui, non cache di stato
 * React: un utente può aver revocato dopo l'inizializzazione), o se
 * window.gtag non è ancora stato inizializzato da nessun loader. Non
 * inizializza mai GA4 da sé — usa soltanto un gtag già esistente. Nessun
 * requestId/requestCode/dato cliente in ingresso: la firma accetta solo i
 * due slug tassonomici.
 */
export function trackGenerateLead(
  measurementId: string,
  params: TrackGenerateLeadParams,
): void {
  if (readCookieConsentPreferences()?.analytics !== true) {
    return
  }

  const gtag = (window as GtagWindow).gtag

  if (!gtag) {
    return
  }

  gtag("event", "generate_lead", {
    lead_type: params.leadType,
    ...(params.serviceGroup ? { service_group: params.serviceGroup } : {}),
    intervention: params.intervention,
    send_to: measurementId,
  })
}

export type TrackGoogleAdsLeadConversionParams = {
  /** NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID, formato AW-XXXXXXXXX. undefined se non configurata in questo ambiente. */
  conversionId: string | undefined
  /** NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL della specifica azione di conversione. undefined se non configurata. */
  conversionLabel: string | undefined
  /** Request.id (cuid) della richiesta già committata sul server. Unico identificatore inviato — un token tecnico opaco, non PII. */
  requestId: string
}

/**
 * conversion Google Ads per una richiesta cliente realmente acquisita
 * (stessa transazione già committata di trackGenerateLead — chiamata dallo
 * stesso punto in request-stepper.tsx). No-op silenzioso — mai un throw —
 * se conversionId/conversionLabel non sono configurate in questo ambiente,
 * se il consenso MARKETING (non analytics: le due preferenze sono
 * indipendenti, vedi consent-signals.ts) non è concesso nelle preferenze
 * CORRENTI, o se window.gtag non è ancora inizializzato. Non inizializza
 * mai gtag da sé — usa soltanto un gtag già esistente (caricato da
 * Ga4MinimalLoader). Il payload contiene solo send_to e transaction_id:
 * nessuna email/telefono/nome/indirizzo/testo libero.
 */
export function trackGoogleAdsLeadConversion(
  params: TrackGoogleAdsLeadConversionParams,
): void {
  const { conversionId, conversionLabel, requestId } = params

  if (!conversionId || !conversionLabel) {
    return
  }

  if (readCookieConsentPreferences()?.marketing !== true) {
    return
  }

  const gtag = (window as GtagWindow).gtag

  if (!gtag) {
    return
  }

  gtag("event", "conversion", {
    send_to: `${conversionId}/${conversionLabel}`,
    transaction_id: requestId,
  })
}

export type FunnelEventGa4Type =
  | "funnel_started"
  | "step_viewed"
  | "step_completed"
  | "submit_started"
  | "submit_failed"
  | "request_created"

export type TrackFunnelEventGa4Params = {
  eventType: FunnelEventGa4Type
  /** Slug tassonomico pubblico — stesso valore già inviato al DB first-party (FASE 6C). */
  intervention: string
  /** Richiesto per step_viewed/step_completed, omesso per ogni altro eventType — mai un sentinel/attempt-counter inviato a Google. */
  stepKey?: string
  stepIndex?: number
  /** Solo per submit_failed (FASE 6D) — uno dei codici noti di FUNNEL_EVENT_ERROR_CODES, mai error.message. */
  errorCode?: string
}

/**
 * FASE 6C.1 (estesa FASE 6D con submit_started/submit_failed/
 * request_created) — mirror su GA4 degli eventi first-party già scritti su
 * FunnelEvent (packages/database, FASE 6C/6D), che restano la fonte
 * completa e indipendente: questa funzione non li sostituisce né li
 * condiziona in alcun modo, li affianca solo quando il consenso lo
 * permette (vedi request-stepper.tsx: la chiamata al DB non è mai dentro
 * un `if` che dipenda da questa). No-op silenzioso — mai un throw — con
 * le stesse due guardie già usate da trackGenerateLead: consenso
 * ANALYTICS (riletto qui, non cache di stato React — un utente può aver
 * revocato dopo l'inizializzazione) e window.gtag già inizializzato da
 * Ga4MinimalLoader.
 *
 * Nessun funnelSessionId né requestId nel payload, in nessun evento — di
 * proposito, per non introdurre lato Google un identificatore di
 * correlazione senza una necessità tecnica precisa — e nessun altro dato
 * del form: solo slug dell'intervento, step (se pertinente) ed
 * eventualmente errorCode. Per request_created in particolare: il DB
 * resta l'unica fonte server-authoritative (scritto direttamente da
 * create-request.ts, mai da questa funzione); questa chiamata a
 * trackFunnelEventGa4 va invocata SOLO dal client dopo una risposta 200
 * già ricevuta da /api/requests — vedi request-stepper.tsx — non prima.
 */
export function trackFunnelEventGa4(
  measurementId: string,
  params: TrackFunnelEventGa4Params,
): void {
  if (readCookieConsentPreferences()?.analytics !== true) {
    return
  }

  const gtag = (window as GtagWindow).gtag

  if (!gtag) {
    return
  }

  gtag("event", params.eventType, {
    intervention: params.intervention,
    ...(params.stepKey !== undefined ? { step_key: params.stepKey } : {}),
    ...(params.stepIndex !== undefined ? { step_index: params.stepIndex } : {}),
    ...(params.errorCode !== undefined ? { error_code: params.errorCode } : {}),
    send_to: measurementId,
  })
}
