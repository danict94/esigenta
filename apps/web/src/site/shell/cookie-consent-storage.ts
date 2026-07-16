const COOKIE_CONSENT_STORAGE_KEY =
  "esigenta_cookie_consent"

export const COOKIE_CONSENT_OPEN_EVENT =
  "esigenta:open-cookie-preferences"

export const COOKIE_CONSENT_CHANGED_EVENT =
  "esigenta:cookie-consent-changed"

/**
 * Bump a 2 in Fase 3B (introduzione GA4): un consenso salvato con versione
 * assente, diversa o non valida è obsoleto e va ignorato — mai migrato in
 * automatico. parseCookieConsentPreferences ritorna null in quel caso, il
 * banner ricompare e l'utente sceglie di nuovo.
 */
const COOKIE_CONSENT_SCHEMA_VERSION = 2 as const

export type CookieConsentCategory =
  | "necessary"
  | "functional"
  | "analytics"
  | "marketing"

export type CookieConsentPreferences = Record<
  CookieConsentCategory,
  boolean
> & {
  version: typeof COOKIE_CONSENT_SCHEMA_VERSION
  updatedAt: string
}

export function createDefaultCookieConsentPreferences(): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  }
}

export function createAcceptedCookieConsentPreferences(): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true,
  }
}

/**
 * Pura, senza I/O: isolata così da essere verificabile con fixture
 * sintetiche senza un localStorage reale. readCookieConsentPreferences() è
 * il solo punto che le passa il valore effettivo del browser.
 */
export function parseCookieConsentPreferences(
  rawValue: string | null,
): CookieConsentPreferences | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(
      rawValue,
    ) as Partial<CookieConsentPreferences>

    if (parsed.version !== COOKIE_CONSENT_SCHEMA_VERSION) {
      return null
    }

    return {
      version: COOKIE_CONSENT_SCHEMA_VERSION,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      necessary: true,
      functional:
        parsed.functional === true,
      analytics:
        parsed.analytics === true,
      marketing:
        parsed.marketing === true,
    } satisfies CookieConsentPreferences
  } catch {
    return null
  }
}

export function readCookieConsentPreferences() {
  if (typeof window === "undefined") {
    return null
  }

  return parseCookieConsentPreferences(
    window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
  )
}

export function writeCookieConsentPreferences(
  preferences: CookieConsentPreferences,
) {
  if (typeof window === "undefined") {
    return
  }

  const nextPreferences = {
    ...preferences,
    necessary: true,
    updatedAt: new Date().toISOString(),
  } satisfies CookieConsentPreferences

  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify(nextPreferences),
  )

  window.dispatchEvent(
    new CustomEvent(
      COOKIE_CONSENT_CHANGED_EVENT,
      {
        detail: nextPreferences,
      },
    ),
  )
}

export function hasFunctionalCookieConsent() {
  return (
    readCookieConsentPreferences()
      ?.functional === true
  )
}

export function openCookiePreferences() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new Event(COOKIE_CONSENT_OPEN_EVENT),
  )
}
