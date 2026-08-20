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
 *
 * NON bumpata per la rimozione di `functional` (allineamento post-fix
 * Maps/Places, funzionale ora sempre disponibile indipendentemente dal
 * consenso — vedi ui/location/city-autocomplete.tsx): a differenza del bump
 * per GA4, qui il significato di necessary/analytics/marketing non cambia
 * affatto, quindi non c'è nulla da invalidare. Un consenso v2 già salvato
 * con la vecchia proprietà `functional` resta valido e viene letto
 * normalmente da parseCookieConsentPreferences, che la ignora in modo
 * innocuo (vedi sotto) — nessun reset forzato del banner per chi ha già
 * scelto.
 */
const COOKIE_CONSENT_SCHEMA_VERSION = 2 as const

export type CookieConsentCategory =
  | "necessary"
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
    analytics: false,
    marketing: false,
  }
}

export function createAcceptedCookieConsentPreferences(): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    necessary: true,
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

    // Un valore v2 scritto prima dell'allineamento post-fix Maps/Places può
    // ancora avere una proprietà `functional` nel JSON grezzo in
    // localStorage: non viene letta né riportata qui, ignorata in modo
    // innocuo. Non è un errore né uno schema "diverso" — solo una proprietà
    // in più che il resto del codice non guarda più da nessuna parte (vedi
    // commento sopra COOKIE_CONSENT_SCHEMA_VERSION).
    return {
      version: COOKIE_CONSENT_SCHEMA_VERSION,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      necessary: true,
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

export function openCookiePreferences() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new Event(COOKIE_CONSENT_OPEN_EVENT),
  )
}
