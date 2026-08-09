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
