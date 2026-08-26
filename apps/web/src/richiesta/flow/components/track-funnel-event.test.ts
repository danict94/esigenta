import assert from "node:assert/strict"
import test from "node:test"

function installFakeWindow(): void {
  const g = globalThis as unknown as Record<string, unknown>

  g.window = globalThis
}

function installFakeFetch(impl: (input: unknown, init: unknown) => Promise<unknown>): {
  calls: Array<{ input: unknown; init: unknown }>
} {
  const calls: Array<{ input: unknown; init: unknown }> = []
  const g = globalThis as unknown as Record<string, unknown>

  g.fetch = (input: unknown, init: unknown) => {
    calls.push({ input, init })
    return impl(input, init)
  }

  return { calls }
}

let importCounter = 0

async function freshModule() {
  importCounter += 1
  return import(`./track-funnel-event.ts?test-instance=${importCounter}`)
}

test("trackFunnelEvent: invia il payload corretto a POST /api/funnel/events", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "step_viewed",
    stepKey: "location",
    stepIndex: 0,
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0]?.input, "/api/funnel/events")

  const init = calls[0]?.init as { method: string; body: string }

  assert.equal(init.method, "POST")
  assert.deepEqual(JSON.parse(init.body), {
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "step_viewed",
    trackingVersion: "v2",
    stepKey: "location",
    stepIndex: 0,
  })
})

test("trackFunnelEvent: funnel_started non include stepKey/stepIndex nel payload se non passati", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_started",
  })

  const init = calls[0]?.init as { body: string }
  const payload = JSON.parse(init.body) as Record<string, unknown>

  assert.ok(!("stepKey" in payload))
  assert.ok(!("stepIndex" in payload))
})

// --- FASE 9A: funnel_opened + trackingVersion ---

test("trackFunnelEvent (FASE 9A): eventType funnel_opened viene inviato correttamente, senza stepKey/stepIndex", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_opened",
  })

  const init = calls[0]?.init as { body: string }
  const payload = JSON.parse(init.body) as Record<string, unknown>

  assert.equal(payload.eventType, "funnel_opened")
  assert.ok(!("stepKey" in payload))
  assert.ok(!("stepIndex" in payload))
})

test("trackFunnelEvent (FASE 9A): trackingVersion 'v2' è sempre incluso nel payload, per ogni eventType, senza che il chiamante debba passarlo", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "submit_failed",
    stepKey: "submit",
    stepIndex: 0,
    errorCode: "network_error",
  })

  const init = calls[0]?.init as { body: string }
  const payload = JSON.parse(init.body) as Record<string, unknown>

  assert.equal(payload.trackingVersion, "v2")
})

// --- FASE 9E: client_validation_failed ---

test("trackFunnelEvent (FASE 9E): eventType client_validation_failed viene inviato con stepKey/stepIndex, nessun campo aggiuntivo (nessun valore inserito, nessun codice di errore)", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "client_validation_failed",
    stepKey: "location",
    stepIndex: 0,
  })

  const init = calls[0]?.init as { body: string }
  const payload = JSON.parse(init.body) as Record<string, unknown>

  assert.deepEqual(payload, {
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "client_validation_failed",
    trackingVersion: "v2",
    stepKey: "location",
    stepIndex: 0,
  })
})

// --- FASE 9J: exit_feedback_submitted + reasonCode ---

test("trackFunnelEvent (FASE 9J): eventType exit_feedback_submitted viene inviato con stepKey/stepIndex/reasonCode", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "exit_feedback_submitted",
    stepKey: "location",
    stepIndex: 0,
    reasonCode: "want_cost_first",
  })

  const init = calls[0]?.init as { body: string }
  const payload = JSON.parse(init.body) as Record<string, unknown>

  assert.deepEqual(payload, {
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "exit_feedback_submitted",
    trackingVersion: "v2",
    stepKey: "location",
    stepIndex: 0,
    reasonCode: "want_cost_first",
  })
})

test("trackFunnelEvent (FASE 9J): reasonCode assente non compare nel payload per eventType diversi da exit_feedback_submitted", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "step_viewed",
    stepKey: "location",
    stepIndex: 0,
  })

  const init = calls[0]?.init as { body: string }
  const payload = JSON.parse(init.body) as Record<string, unknown>

  assert.ok(!("reasonCode" in payload))
})

test("trackFunnelEvent: funnelSessionId assente (null) -> nessuna richiesta di rete", async () => {
  installFakeWindow()
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: null,
    interventionSlug: "rifare-tetto",
    eventType: "funnel_started",
  })

  assert.equal(calls.length, 0)
})

test("trackFunnelEvent: un fetch che rifiuta (rete/endpoint down) non genera un unhandled rejection né un throw sincrono", async () => {
  installFakeWindow()
  installFakeFetch(async () => {
    throw new Error("network down")
  })

  const { trackFunnelEvent } = await freshModule()

  assert.doesNotThrow(() => {
    trackFunnelEvent({
      funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      interventionSlug: "rifare-tetto",
      eventType: "funnel_started",
    })
  })

  // Lascia girare il microtask del .catch() prima di concludere il test.
  await new Promise((resolve) => setTimeout(resolve, 0))
})

test("trackFunnelEvent: senza window (SSR) -> nessuna richiesta di rete, nessun crash", async () => {
  const g = globalThis as unknown as Record<string, unknown>

  delete g.window
  const { calls } = installFakeFetch(async () => ({ ok: true }))

  const { trackFunnelEvent } = await freshModule()

  trackFunnelEvent({
    funnelSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_started",
  })

  assert.equal(calls.length, 0)
})
