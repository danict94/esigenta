import type { CookieConsentPreferences } from "../shell/cookie-consent-storage"

/**
 * I quattro segnali Google Consent Mode v2. Unica funzione che li deriva
 * dalle preferenze del CMP Esigenta — riusata sia dal loader gtag (per gli
 * stati "default"/"update" inviati a Google) sia da qualunque evento che
 * debba conoscere il consenso pubblicitario corrente, cosicché CMP, tag
 * Google, evento GA4 ed evento Google Ads condividano sempre la stessa
 * interpretazione delle preferenze salvate — mai due letture divergenti.
 */
export type GoogleConsentSignals = {
  analytics_storage: "granted" | "denied"
  ad_storage: "granted" | "denied"
  ad_user_data: "granted" | "denied"
  ad_personalization: "granted" | "denied"
}

/**
 * Stato di partenza prima di qualunque scelta dell'utente, come richiesto
 * da Consent Mode v2 prima del primo consenso esplicito.
 */
export const DENIED_CONSENT_SIGNALS: GoogleConsentSignals = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
}

/**
 * `analytics` guida solo `analytics_storage` (GA4). `marketing` guida i tre
 * segnali pubblicitari (Google Ads: `ad_storage`, `ad_user_data`,
 * `ad_personalization`). Le due preferenze restano indipendenti: accettare
 * Analytics non concede mai consenso pubblicitario, e viceversa — vedi
 * apps/web/src/site/shell/cookie-consent.tsx per le due categorie distinte
 * nel pannello.
 */
export function toGoogleConsentSignals(
  preferences: CookieConsentPreferences,
): GoogleConsentSignals {
  const analyticsGranted =
    preferences.analytics === true ? "granted" : "denied"
  const marketingGranted =
    preferences.marketing === true ? "granted" : "denied"

  return {
    analytics_storage: analyticsGranted,
    ad_storage: marketingGranted,
    ad_user_data: marketingGranted,
    ad_personalization: marketingGranted,
  }
}

/**
 * Decide se è il momento di eseguire `gtag('config', GOOGLE_ADS_CONVERSION_ID)`
 * sul tag gtag già caricato (registra Google Ads come seconda destinazione
 * dello stesso, unico Google tag — mai un secondo script). Vero solo se:
 * non è già stato configurato in questa sessione, lo script gtag.js
 * condiviso ha già finito di caricare (il comando "config" va dopo "js",
 * stessa sequenza validata empiricamente per GA4), e il consenso MARKETING
 * corrente è concesso. Il conversion ID stesso non è un parametro qui: il
 * chiamante lo verifica a monte (stesso pattern "if (ENV) {...}" già usato
 * altrove nel repo) così TypeScript può restringerne il tipo prima di
 * passarlo a gtag.
 */
export function shouldConfigureGoogleAdsDestination({
  scriptLoaded,
  alreadyConfigured,
  preferences,
}: {
  scriptLoaded: boolean
  alreadyConfigured: boolean
  preferences: CookieConsentPreferences | null
}): boolean {
  if (alreadyConfigured || !scriptLoaded) {
    return false
  }

  return preferences?.marketing === true
}
