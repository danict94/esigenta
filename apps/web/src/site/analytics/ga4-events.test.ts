import assert from "node:assert/strict"
import test from "node:test"

import { writeCookieConsentPreferences } from "../shell/cookie-consent-storage"

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
    functional: false,
    analytics: true,
    marketing: false,
  })
}

function denyAnalyticsConsent(): void {
  writeCookieConsentPreferences({
    version: 2,
    updatedAt: new Date().toISOString(),
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
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
