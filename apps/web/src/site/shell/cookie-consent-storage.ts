const COOKIE_CONSENT_STORAGE_KEY =
  "esigenta_cookie_consent"

export const COOKIE_CONSENT_OPEN_EVENT =
  "esigenta:open-cookie-preferences"

export const COOKIE_CONSENT_CHANGED_EVENT =
  "esigenta:cookie-consent-changed"

export type CookieConsentCategory =
  | "necessary"
  | "functional"
  | "analytics"
  | "marketing"

export type CookieConsentPreferences = Record<
  CookieConsentCategory,
  boolean
> & {
  version: 1
  updatedAt: string
}

export function createDefaultCookieConsentPreferences(): CookieConsentPreferences {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  }
}

export function createAcceptedCookieConsentPreferences(): CookieConsentPreferences {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true,
  }
}

export function readCookieConsentPreferences() {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue =
    window.localStorage.getItem(
      COOKIE_CONSENT_STORAGE_KEY,
    )

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(
      rawValue,
    ) as Partial<CookieConsentPreferences>

    return {
      version: 1,
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
