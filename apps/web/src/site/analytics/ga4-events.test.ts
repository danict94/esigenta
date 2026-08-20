import assert from "node:assert/strict"
import test from "node:test"

import {
  writeCookieConsentPreferences,
  type CookieConsentPreferences,
} from "../shell/cookie-consent-storage"

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

function installFakeWindow(): void {
  const g = globalThis as unknown as Record<string, unknown>

  g.window = globalThis
  delete g.gtag
}

function grantAnalyticsConsent(): void {
  writeCookieConsentPreferences({
    version: 2,
    updatedAt: new Date().toISOString(),
    necessary: true,
    analytics: true,
    marketing: false,
  })
}

function denyAnalyticsConsent(): void {
  writeCookieConsentPreferences({
    version: 2,
    updatedAt: new Date().toISOString(),
    necessary: true,
    analytics: false,
    marketing: false,
  })
}

function writeConsent(overrides: Partial<CookieConsentPreferences>): void {
  writeCookieConsentPreferences({
    version: 2,
    updatedAt: new Date().toISOString(),
    necessary: true,
    analytics: false,
    marketing: false,
    ...overrides,
  })
}

let importCounter = 0

// Il modulo non ha stato singleton proprio, ma reimportarlo con un cache
// buster tiene ogni test isolato dagli altri senza assunzioni sull'ordine.
async function freshModule() {
  importCounter += 1
  return import(`./ga4-events.ts?test-instance=${importCounter}`)
}

test("trackGenerateLead: no-op se il consenso analytics non è concesso, anche con gtag già presente", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  denyAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGenerateLead } = await freshModule()

  trackGenerateLead("G-TEST123", {
    leadType: "customer_request",
    serviceGroup: "gruppo-test",
    intervention: "intervento-test",
  })

  assert.equal(calls.length, 0, "nessuna chiamata gtag senza consenso analytics")
})

test("trackGenerateLead: no-op se window.gtag non è ancora inizializzato, senza tentare di inizializzare GA4", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const { trackGenerateLead } = await freshModule()

  trackGenerateLead("G-TEST123", {
    leadType: "customer_request",
    serviceGroup: "gruppo-test",
    intervention: "intervento-test",
  })

  const g = globalThis as unknown as Record<string, unknown>

  assert.equal(g.gtag, undefined, "non deve creare un window.gtag")
  assert.equal(g.dataLayer, undefined, "non deve creare un window.dataLayer")
})

test("trackGenerateLead: invia generate_lead con i parametri corretti quando consenso concesso e gtag già inizializzato altrove", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGenerateLead } = await freshModule()

  trackGenerateLead("G-TEST123", {
    leadType: "customer_request",
    serviceGroup: "gruppo-test",
    intervention: "intervento-test",
  })

  assert.equal(calls.length, 1)

  const [command, eventName, payload] = calls[0] as [string, string, Record<string, unknown>]

  assert.equal(command, "event")
  assert.equal(eventName, "generate_lead")
  assert.equal(payload.lead_type, "customer_request")
  assert.equal(payload.service_group, "gruppo-test")
  assert.equal(payload.intervention, "intervento-test")
  assert.equal(payload.send_to, "G-TEST123")
})

test("trackGenerateLead: omette service_group quando null, senza inviarlo come chiave vuota", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGenerateLead } = await freshModule()

  trackGenerateLead("G-TEST123", {
    leadType: "customer_request",
    serviceGroup: null,
    intervention: "intervento-test",
  })

  const payload = calls[0]?.[2] as Record<string, unknown>

  assert.ok(!("service_group" in payload))
})

test("trackGoogleAdsLeadConversion: no-op se conversionId non è configurato, anche con consenso e gtag presenti", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  writeConsent({ marketing: true })

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGoogleAdsLeadConversion } = await freshModule()

  trackGoogleAdsLeadConversion({
    conversionId: undefined,
    conversionLabel: "LABEL123",
    requestId: "req_test_1",
  })

  assert.equal(calls.length, 0)
})

test("trackGoogleAdsLeadConversion: no-op se conversionLabel non è configurato, anche con consenso e gtag presenti", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  writeConsent({ marketing: true })

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGoogleAdsLeadConversion } = await freshModule()

  trackGoogleAdsLeadConversion({
    conversionId: "AW-123456789",
    conversionLabel: undefined,
    requestId: "req_test_1",
  })

  assert.equal(calls.length, 0)
})

test("trackGoogleAdsLeadConversion: no-op se il consenso marketing non è concesso, anche con analytics concesso", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  writeConsent({ analytics: true, marketing: false })

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGoogleAdsLeadConversion } = await freshModule()

  trackGoogleAdsLeadConversion({
    conversionId: "AW-123456789",
    conversionLabel: "LABEL123",
    requestId: "req_test_1",
  })

  assert.equal(
    calls.length,
    0,
    "analytics concesso non deve equivalere a marketing concesso",
  )
})

test("trackGoogleAdsLeadConversion: no-op se il consenso non è mai stato salvato", async () => {
  installFakeWindow()
  installFakeLocalStorage()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGoogleAdsLeadConversion } = await freshModule()

  trackGoogleAdsLeadConversion({
    conversionId: "AW-123456789",
    conversionLabel: "LABEL123",
    requestId: "req_test_1",
  })

  assert.equal(calls.length, 0)
})

test("trackGoogleAdsLeadConversion: no-op se window.gtag non è ancora inizializzato, senza tentare di inizializzare gtag", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  writeConsent({ marketing: true })

  const { trackGoogleAdsLeadConversion } = await freshModule()

  trackGoogleAdsLeadConversion({
    conversionId: "AW-123456789",
    conversionLabel: "LABEL123",
    requestId: "req_test_1",
  })

  const g = globalThis as unknown as Record<string, unknown>

  assert.equal(g.gtag, undefined, "non deve creare un window.gtag")
  assert.equal(g.dataLayer, undefined, "non deve creare un window.dataLayer")
})

test("trackGoogleAdsLeadConversion: invia conversion con send_to e transaction_id corretti quando marketing concesso", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  writeConsent({ marketing: true })

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGoogleAdsLeadConversion } = await freshModule()

  trackGoogleAdsLeadConversion({
    conversionId: "AW-123456789",
    conversionLabel: "LABEL123",
    requestId: "req_test_1",
  })

  assert.equal(calls.length, 1)

  const [command, eventName, payload] = calls[0] as [
    string,
    string,
    Record<string, unknown>,
  ]

  assert.equal(command, "event")
  assert.equal(eventName, "conversion")
  assert.equal(payload.send_to, "AW-123456789/LABEL123")
  assert.equal(payload.transaction_id, "req_test_1")
})

test("trackGoogleAdsLeadConversion: il payload contiene solo send_to e transaction_id, nessun dato personale", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  writeConsent({ marketing: true })

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackGoogleAdsLeadConversion } = await freshModule()

  trackGoogleAdsLeadConversion({
    conversionId: "AW-123456789",
    conversionLabel: "LABEL123",
    requestId: "req_test_1",
  })

  const payload = calls[0]?.[2] as Record<string, unknown>

  assert.deepEqual(Object.keys(payload).sort(), [
    "send_to",
    "transaction_id",
  ])
})
