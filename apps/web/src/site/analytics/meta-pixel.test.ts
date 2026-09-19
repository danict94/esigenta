import assert from "node:assert/strict"
import test from "node:test"

import {
  writeCookieConsentPreferences,
  type CookieConsentPreferences,
} from "../shell/cookie-consent-storage"

type FakeScript = {
  async: boolean
  id: string
  src: string
}

function installBrowser(): { scripts: Map<string, FakeScript> } {
  const store = new Map<string, string>()
  const scripts = new Map<string, FakeScript>()
  const g = globalThis as unknown as Record<string, unknown>

  g.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
  g.window = globalThis
  g.dispatchEvent = () => true
  delete g.fbq
  delete g._fbq
  g.document = {
    getElementById: (id: string) => scripts.get(id) ?? null,
    createElement: () => ({ id: "", src: "", async: false }),
    head: {
      appendChild: (script: FakeScript) => {
        scripts.set(script.id, script)
        return script
      },
    },
  }

  return { scripts }
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

async function freshModule() {
  importCounter += 1
  return import(`./meta-pixel.ts?test-instance=${importCounter}`)
}

test("Meta Pixel: non inizializza nulla prima del consenso marketing", async () => {
  const { scripts } = installBrowser()
  writeConsent({ marketing: false })

  const { initializeMetaPixel } = await freshModule()

  assert.equal(initializeMetaPixel(), false)
  assert.equal((globalThis as unknown as Record<string, unknown>).fbq, undefined)
  assert.equal(scripts.size, 0)
})

test("Meta Pixel: inizializza solo dopo il consenso marketing", async () => {
  const { scripts } = installBrowser()
  writeConsent({ marketing: true })

  const { initializeMetaPixel, META_PIXEL_ID } = await freshModule()

  assert.equal(initializeMetaPixel(), true)
  assert.equal(scripts.get("esigenta-meta-pixel")?.src, "https://connect.facebook.net/en_US/fbevents.js")

  const fbq = (globalThis as unknown as { fbq: { queue: unknown[][] } }).fbq
  assert.deepEqual(fbq.queue[0], ["init", META_PIXEL_ID])
})

test("Meta Pixel: PageView è deduplicato per URL", async () => {
  installBrowser()
  writeConsent({ marketing: true })

  const { trackMetaPageView } = await freshModule()

  trackMetaPageView("/costi")
  trackMetaPageView("/costi")
  trackMetaPageView("/costi/rifare-tetto")

  const queue = (globalThis as unknown as { fbq: { queue: unknown[][] } }).fbq.queue
  const pageViews = queue.filter((call) => call[0] === "track" && call[1] === "PageView")

  assert.equal(pageViews.length, 2)
})

test("Meta Pixel: dopo il caricamento di fbevents.js Lead usa callMethod e non resta in coda", async () => {
  installBrowser()
  writeConsent({ marketing: true })

  const { initializeMetaPixel, trackMetaLead, trackMetaPageView } = await freshModule()

  initializeMetaPixel()
  trackMetaPageView("/richiesta/rifare-tetto")

  const fbq = (globalThis as unknown as {
    fbq: {
      callMethod?: (...args: unknown[]) => void
      queue: unknown[][]
    }
  }).fbq
  const queuedBeforeLoad = fbq.queue.length
  const dispatched: unknown[][] = []

  fbq.callMethod = (...args: unknown[]) => {
    dispatched.push(args)
  }

  trackMetaLead()

  assert.deepEqual(dispatched, [["track", "Lead"]])
  assert.equal(fbq.queue.length, queuedBeforeLoad)
})

test("Meta Pixel: Lead non viene emesso dall'inizializzazione o dai PageView e parte solo alla chiamata di successo", async () => {
  installBrowser()
  writeConsent({ marketing: true })

  const { initializeMetaPixel, trackMetaLead, trackMetaPageView } = await freshModule()

  initializeMetaPixel()
  trackMetaPageView("/richiesta/rifare-tetto")

  let queue = (globalThis as unknown as { fbq: { queue: unknown[][] } }).fbq.queue
  assert.equal(queue.filter((call) => call[1] === "Lead").length, 0)

  trackMetaLead()
  queue = (globalThis as unknown as { fbq: { queue: unknown[][] } }).fbq.queue
  assert.equal(queue.filter((call) => call[1] === "Lead").length, 1)
})
