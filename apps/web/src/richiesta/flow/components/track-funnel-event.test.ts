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
