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
