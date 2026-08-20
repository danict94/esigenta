import assert from "node:assert/strict"
import test from "node:test"

import {
  writeCookieConsentPreferences,
  type CookieConsentPreferences,
} from "../../site/shell/cookie-consent-storage"

import { canLoadGoogleMapsPlaces } from "./city-autocomplete"

const TEST_API_KEY = "test-google-maps-key"

function installFakeLocalStorage(): void {
  const store = new Map<string, string>()
  const g = globalThis as unknown as Record<string, unknown>

  g.localStorage = {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
  g.dispatchEvent = () => true
}

function writeConsent(overrides: Partial<CookieConsentPreferences>): void {
  writeCookieConsentPreferences({
    version: 2,
    updatedAt: new Date().toISOString(),
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    ...overrides,
  })
}

// Le tre scritture di consenso qui sotto non vengono mai lette da
// canLoadGoogleMapsPlaces — è esattamente questo il punto: se in futuro
// qualcuno reintroducesse per errore una dipendenza dal consenso dentro il
// loader di Maps/Places, il test "tutti rifiutati" sotto tornerebbe a
// fallire, facendo da guardia di regressione sul bug corretto in questa
// fase (audit: Maps bloccato quando functional !== true).

test("canLoadGoogleMapsPlaces: con API key presente e nessuna scelta cookie ancora salvata (consent = null), Maps/Places può inizializzarsi", () => {
  installFakeLocalStorage()
  // Nessuna scrittura: localStorage vuoto, equivalente a
  // readCookieConsentPreferences() === null nel resto dell'app.

  assert.equal(canLoadGoogleMapsPlaces(TEST_API_KEY), true)
})

test("canLoadGoogleMapsPlaces: con tutti i consensi opzionali rifiutati (functional=false, analytics=false, marketing=false), Maps/Places può comunque inizializzarsi", () => {
  installFakeLocalStorage()
  writeConsent({ functional: false, analytics: false, marketing: false })

  assert.equal(canLoadGoogleMapsPlaces(TEST_API_KEY), true)
})

test("canLoadGoogleMapsPlaces: con tutti i consensi accettati (functional=true, analytics=true, marketing=true), Maps/Places continua a inizializzarsi normalmente", () => {
  installFakeLocalStorage()
  writeConsent({ functional: true, analytics: true, marketing: true })

  assert.equal(canLoadGoogleMapsPlaces(TEST_API_KEY), true)
})

test("canLoadGoogleMapsPlaces: false se manca la API key, indipendentemente da qualunque stato di consenso salvato", () => {
  installFakeLocalStorage()
  writeConsent({ functional: true, analytics: true, marketing: true })

  assert.equal(canLoadGoogleMapsPlaces(undefined), false)
  assert.equal(canLoadGoogleMapsPlaces(null), false)
  assert.equal(canLoadGoogleMapsPlaces(""), false)
})
