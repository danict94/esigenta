import assert from "node:assert/strict"
import test from "node:test"

import {
  DENIED_CONSENT_SIGNALS,
  shouldConfigureGoogleAdsDestination,
  toGoogleConsentSignals,
} from "./consent-signals"

import type { CookieConsentPreferences } from "../shell/cookie-consent-storage"

function preferences(
  overrides: Partial<CookieConsentPreferences>,
): CookieConsentPreferences {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    necessary: true,
    analytics: false,
    marketing: false,
    ...overrides,
  }
}

test("toGoogleConsentSignals: reject-all -> tutti i segnali denied", () => {
  const signals = toGoogleConsentSignals(preferences({}))

  assert.deepEqual(signals, DENIED_CONSENT_SIGNALS)
})

test("toGoogleConsentSignals: analytics concesso, marketing negato -> solo analytics_storage granted", () => {
  const signals = toGoogleConsentSignals(preferences({ analytics: true }))

  assert.deepEqual(signals, {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
})

test("toGoogleConsentSignals: marketing concesso, analytics negato -> solo i tre segnali Ads granted", () => {
  const signals = toGoogleConsentSignals(preferences({ marketing: true }))

  assert.deepEqual(signals, {
    analytics_storage: "denied",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  })
})

test("toGoogleConsentSignals: accept-all -> tutti i segnali granted", () => {
  const signals = toGoogleConsentSignals(
    preferences({ analytics: true, marketing: true }),
  )

  assert.deepEqual(signals, {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  })
})

test("shouldConfigureGoogleAdsDestination: false se già configurato in questa sessione, anche con tutto il resto favorevole", () => {
  const result = shouldConfigureGoogleAdsDestination({
    scriptLoaded: true,
    alreadyConfigured: true,
    preferences: preferences({ marketing: true }),
  })

  assert.equal(result, false)
})

test("shouldConfigureGoogleAdsDestination: false se lo script gtag condiviso non ha ancora finito di caricare", () => {
  const result = shouldConfigureGoogleAdsDestination({
    scriptLoaded: false,
    alreadyConfigured: false,
    preferences: preferences({ marketing: true }),
  })

  assert.equal(result, false)
})

test("shouldConfigureGoogleAdsDestination: false se il consenso non è mai stato salvato", () => {
  const result = shouldConfigureGoogleAdsDestination({
    scriptLoaded: true,
    alreadyConfigured: false,
    preferences: null,
  })

  assert.equal(result, false)
})

test("shouldConfigureGoogleAdsDestination: false se marketing non è concesso, anche con analytics concesso", () => {
  const result = shouldConfigureGoogleAdsDestination({
    scriptLoaded: true,
    alreadyConfigured: false,
    preferences: preferences({ analytics: true, marketing: false }),
  })

  assert.equal(
    result,
    false,
    "analytics concesso non deve equivalere a marketing concesso",
  )
})

test("shouldConfigureGoogleAdsDestination: true quando script caricato, non ancora configurato, e marketing concesso", () => {
  const result = shouldConfigureGoogleAdsDestination({
    scriptLoaded: true,
    alreadyConfigured: false,
    preferences: preferences({ marketing: true }),
  })

  assert.equal(result, true)
})
