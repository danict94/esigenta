import assert from "node:assert/strict"
import test from "node:test"

import {
  createAcceptedCookieConsentPreferences,
  createDefaultCookieConsentPreferences,
  parseCookieConsentPreferences,
  readCookieConsentPreferences,
  writeCookieConsentPreferences,
} from "./cookie-consent-storage"

// Stessa chiave privata usata da cookie-consent-storage.ts
// (COOKIE_CONSENT_STORAGE_KEY, non esportata): duplicata qui solo per
// scrivere direttamente lo storage grezzo nei test di compatibilità, senza
// allargare la superficie pubblica del modulo per un bisogno solo di test.
const COOKIE_CONSENT_STORAGE_KEY = "esigenta_cookie_consent"

function installFakeWindow(): void {
  const g = globalThis as unknown as Record<string, unknown>

  g.window = globalThis
}

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

function setUp(): void {
  installFakeWindow()
  installFakeLocalStorage()
}

/**
 * Scrive direttamente il JSON grezzo che un browser potrebbe già avere in
 * localStorage da PRIMA dell'allineamento post-fix Maps/Places (schema v2
 * con la proprietà `functional`, oggi rimossa dal modello di consenso).
 * Bypassa writeCookieConsentPreferences apposta: qui simuliamo uno storage
 * scritto da una build precedente del sito, non dal codice attuale.
 */
function seedLegacyV2Storage(overrides: {
  functional: boolean
  analytics: boolean
  marketing: boolean
}): void {
  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      updatedAt: "2026-01-01T00:00:00.000Z",
      necessary: true,
      ...overrides,
    }),
  )
}

// --- Caso 1: vecchio storage (functional=false, analytics=false, marketing=false) ---

test("parseCookieConsentPreferences: legge correttamente un vecchio storage v2 con functional=false/analytics=false/marketing=false", () => {
  setUp()
  seedLegacyV2Storage({ functional: false, analytics: false, marketing: false })

  const preferences = readCookieConsentPreferences()

  assert.ok(preferences, "un vecchio consenso v2 valido non deve mai tornare null")
  assert.equal(preferences.necessary, true)
  assert.equal(preferences.analytics, false)
  assert.equal(preferences.marketing, false)
})

test("parseCookieConsentPreferences: un vecchio storage v2 non produce mai una proprietà functional nel valore letto", () => {
  setUp()
  seedLegacyV2Storage({ functional: true, analytics: false, marketing: false })

  const preferences = readCookieConsentPreferences()

  assert.ok(preferences)
  assert.equal(
    Object.prototype.hasOwnProperty.call(preferences, "functional"),
    false,
    "functional deve essere ignorata, mai riportata nel valore normalizzato",
  )
  assert.deepEqual(Object.keys(preferences).sort(), [
    "analytics",
    "marketing",
    "necessary",
    "updatedAt",
    "version",
  ])
})

// --- Caso 2: vecchio storage con tutto true ---

test("parseCookieConsentPreferences: un vecchio storage v2 con tutto true mantiene analytics e marketing true", () => {
  setUp()
  seedLegacyV2Storage({ functional: true, analytics: true, marketing: true })

  const preferences = readCookieConsentPreferences()

  assert.ok(preferences)
  assert.equal(preferences.necessary, true)
  assert.equal(preferences.analytics, true)
  assert.equal(preferences.marketing, true)
})

// --- Caso 3: nuovo utente, nessun consenso salvato ---

test("readCookieConsentPreferences: nuovo utente (nessuna chiave salvata) -> null, nessun consenso opzionale attivo prima della scelta", () => {
  setUp()

  assert.equal(readCookieConsentPreferences(), null)
})

test("parseCookieConsentPreferences: valore assente (null) -> null", () => {
  assert.equal(parseCookieConsentPreferences(null), null)
})

test("parseCookieConsentPreferences: JSON non valido -> null, mai un throw", () => {
  assert.equal(parseCookieConsentPreferences("{non-json"), null)
})

test("parseCookieConsentPreferences: versione diversa da quella corrente -> null (comportamento pre-esistente, invariato)", () => {
  const rawWithOldVersion = JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    necessary: true,
    analytics: true,
    marketing: true,
  })

  assert.equal(parseCookieConsentPreferences(rawWithOldVersion), null)
})

// --- Caso 4: Rifiuta ---

test("createDefaultCookieConsentPreferences + writeCookieConsentPreferences (Rifiuta): analytics=false, marketing=false, nessuna proprietà functional", () => {
  setUp()
  writeCookieConsentPreferences(createDefaultCookieConsentPreferences())

  const preferences = readCookieConsentPreferences()

  assert.ok(preferences)
  assert.equal(preferences.necessary, true)
  assert.equal(preferences.analytics, false)
  assert.equal(preferences.marketing, false)
  assert.equal(
    Object.prototype.hasOwnProperty.call(preferences, "functional"),
    false,
  )
})

// --- Caso 5: Accetta ---

test("createAcceptedCookieConsentPreferences + writeCookieConsentPreferences (Accetta): analytics=true, marketing=true", () => {
  setUp()
  writeCookieConsentPreferences(createAcceptedCookieConsentPreferences())

  const preferences = readCookieConsentPreferences()

  assert.ok(preferences)
  assert.equal(preferences.necessary, true)
  assert.equal(preferences.analytics, true)
  assert.equal(preferences.marketing, true)
})

test("createDefaultCookieConsentPreferences / createAcceptedCookieConsentPreferences: nessuna delle due produce una proprietà functional", () => {
  assert.deepEqual(Object.keys(createDefaultCookieConsentPreferences()).sort(), [
    "analytics",
    "marketing",
    "necessary",
    "updatedAt",
    "version",
  ])
  assert.deepEqual(Object.keys(createAcceptedCookieConsentPreferences()).sort(), [
    "analytics",
    "marketing",
    "necessary",
    "updatedAt",
    "version",
  ])
})
