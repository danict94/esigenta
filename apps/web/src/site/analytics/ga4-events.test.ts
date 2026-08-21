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

// --- trackFunnelEventGa4 (FASE 6C.1) ---
// Il mirror DB first-party (FunnelEvent) è testato altrove (FASE 6C,
// resolve-funnel-session-id.test.ts / track-funnel-event.test.ts /
// packages/domain funnel-events test) e non dipende in alcun modo da
// questo file: qui si verifica solo il lato GA4.

test("trackFunnelEventGa4 (Caso 1): no-op se il consenso analytics non è concesso, anche con gtag già presente", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  denyAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "funnel_started",
    intervention: "intervento-test",
  })

  assert.equal(calls.length, 0, "nessuna chiamata gtag senza consenso analytics")
})

test("trackFunnelEventGa4 (Caso 2): con analytics concesso, invia funnel_started senza step_key/step_index (nessun sentinel)", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "funnel_started",
    intervention: "intervento-test",
  })

  assert.equal(calls.length, 1)

  const [command, eventName, payload] = calls[0] as [
    string,
    string,
    Record<string, unknown>,
  ]

  assert.equal(command, "event")
  assert.equal(eventName, "funnel_started")
  assert.equal(payload.intervention, "intervento-test")
  assert.equal(payload.send_to, "G-TEST123")
  assert.ok(!("step_key" in payload), "nessun sentinel step_key per funnel_started")
  assert.ok(!("step_index" in payload), "nessun sentinel step_index per funnel_started")
  assert.ok(!("funnelSessionId" in payload), "funnelSessionId non deve mai arrivare a Google")
})

test("trackFunnelEventGa4 (Caso 3): con analytics concesso, invia step_viewed con step_key/step_index", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "step_viewed",
    intervention: "intervento-test",
    stepKey: "location",
    stepIndex: 0,
  })

  assert.equal(calls.length, 1)

  const [command, eventName, payload] = calls[0] as [
    string,
    string,
    Record<string, unknown>,
  ]

  assert.equal(command, "event")
  assert.equal(eventName, "step_viewed")
  assert.equal(payload.intervention, "intervento-test")
  assert.equal(payload.step_key, "location")
  assert.equal(payload.step_index, 0)
  assert.equal(payload.send_to, "G-TEST123")
})

test("trackFunnelEventGa4 (Caso 4): con analytics concesso, invia step_completed con step_key/step_index", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "step_completed",
    intervention: "intervento-test",
    stepKey: "contact",
    stepIndex: 6,
  })

  assert.equal(calls.length, 1)

  const [command, eventName, payload] = calls[0] as [
    string,
    string,
    Record<string, unknown>,
  ]

  assert.equal(command, "event")
  assert.equal(eventName, "step_completed")
  assert.equal(payload.step_key, "contact")
  assert.equal(payload.step_index, 6)
})

test("trackFunnelEventGa4 (Caso 5): con marketing=false e analytics=true, gli eventi funnel GA4 funzionano e Google Ads resta indipendente (non inviato)", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  writeConsent({ analytics: true, marketing: false })

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4, trackGoogleAdsLeadConversion } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "step_completed",
    intervention: "intervento-test",
    stepKey: "photos",
    stepIndex: 3,
  })

  trackGoogleAdsLeadConversion({
    conversionId: "AW-123456789",
    conversionLabel: "LABEL123",
    requestId: "req_test_1",
  })

  assert.equal(calls.length, 1, "solo l'evento funnel GA4 deve partire, non la conversione Ads")

  const [, eventName] = calls[0] as [string, string, Record<string, unknown>]

  assert.equal(eventName, "step_completed")
})

test("trackFunnelEventGa4: no-op se window.gtag non è ancora inizializzato, senza tentare di inizializzarlo", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "funnel_started",
    intervention: "intervento-test",
  })

  const g = globalThis as unknown as Record<string, unknown>

  assert.equal(g.gtag, undefined, "non deve creare un window.gtag")
  assert.equal(g.dataLayer, undefined, "non deve creare un window.dataLayer")
})

// --- FASE 6D: submit_started / submit_failed / request_created ---

test("trackFunnelEventGa4 (FASE 6D, analytics=false): submit_started/submit_failed/request_created non vengono inviati, il DB continua comunque (verificato altrove — qui solo il lato GA4)", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  denyAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", { eventType: "submit_started", intervention: "intervento-test" })
  trackFunnelEventGa4("G-TEST123", {
    eventType: "submit_failed",
    intervention: "intervento-test",
    errorCode: "network_error",
  })
  trackFunnelEventGa4("G-TEST123", { eventType: "request_created", intervention: "intervento-test" })

  assert.equal(calls.length, 0)
})

test("trackFunnelEventGa4 (FASE 6D, analytics=true): submit_started arriva con solo intervention/send_to, nessuno step", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "submit_started",
    intervention: "intervento-test",
  })

  assert.equal(calls.length, 1)

  const [command, eventName, payload] = calls[0] as [string, string, Record<string, unknown>]

  assert.equal(command, "event")
  assert.equal(eventName, "submit_started")
  assert.equal(payload.intervention, "intervento-test")
  assert.equal(payload.send_to, "G-TEST123")
  assert.ok(!("step_key" in payload))
  assert.ok(!("step_index" in payload))
  assert.ok(!("error_code" in payload))
})

test("trackFunnelEventGa4 (FASE 6D, analytics=true): submit_failed arriva con error_code, nessuno step, nessun funnelSessionId", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "submit_failed",
    intervention: "intervento-test",
    errorCode: "invalid_request_location",
  })

  assert.equal(calls.length, 1)

  const [command, eventName, payload] = calls[0] as [string, string, Record<string, unknown>]

  assert.equal(command, "event")
  assert.equal(eventName, "submit_failed")
  assert.equal(payload.error_code, "invalid_request_location")
  assert.ok(!("step_key" in payload))
  assert.ok(!("funnelSessionId" in payload))
})

test("trackFunnelEventGa4 (FASE 6D, analytics=true): request_created arriva con solo intervention/send_to — nessun funnelSessionId, nessun requestId", async () => {
  installFakeWindow()
  installFakeLocalStorage()
  grantAnalyticsConsent()

  const calls: unknown[][] = []
  ;(globalThis as unknown as Record<string, unknown>).gtag = (
    ...args: unknown[]
  ) => {
    calls.push(args)
  }

  const { trackFunnelEventGa4 } = await freshModule()

  trackFunnelEventGa4("G-TEST123", {
    eventType: "request_created",
    intervention: "intervento-test",
  })

  assert.equal(calls.length, 1)

  const [, eventName, payload] = calls[0] as [string, string, Record<string, unknown>]

  assert.equal(eventName, "request_created")
  assert.deepEqual(Object.keys(payload).sort(), ["intervention", "send_to"])
})
