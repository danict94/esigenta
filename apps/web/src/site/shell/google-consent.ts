import type { CookieConsentPreferences } from "./cookie-consent-storage"

export type GoogleConsentSignal = "granted" | "denied"

export type GoogleConsentState = {
  analytics_storage: GoogleConsentSignal
  ad_storage: GoogleConsentSignal
  ad_user_data: GoogleConsentSignal
  ad_personalization: GoogleConsentSignal
}

export const DEFAULT_DENIED_GOOGLE_CONSENT_STATE: GoogleConsentState = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
}

/**
 * Unico punto che mappa le categorie del banner Esigenta sui quattro segnali
 * Consent Mode v2. Pura: nessuno stato Google viene mai persistito a parte,
 * è sempre derivato da CookieConsentPreferences. Ads non è ancora installato
 * in questa fase, ma i tre segnali ad_* restano derivati correttamente da
 * "marketing" fin da ora.
 */
export function toGoogleConsentState(
  preferences: CookieConsentPreferences,
): GoogleConsentState {
  const adSignal: GoogleConsentSignal = preferences.marketing
    ? "granted"
    : "denied"

  return {
    analytics_storage: preferences.analytics ? "granted" : "denied",
    ad_storage: adSignal,
    ad_user_data: adSignal,
    ad_personalization: adSignal,
  }
}
