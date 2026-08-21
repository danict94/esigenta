import assert from "node:assert/strict"
import test from "node:test"

function installFakeSessionStorage(): void {
  const store = new Map<string, string>()
  const g = globalThis as unknown as Record<string, unknown>

  g.window = globalThis
  g.sessionStorage = {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
}

let importCounter = 0

async function freshModule() {
  importCounter += 1
  return import(`./resolve-funnel-session-id.ts?test-instance=${importCounter}`)
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// --- Test 1: nuova compilazione -> genera un id ---

test("resolveFunnelSessionId: nessun id esistente -> ne genera uno nuovo, in formato UUID", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId } = await freshModule()

  const id = resolveFunnelSessionId("rifare-tetto")

  assert.ok(id)
  assert.match(id, UUID_PATTERN)
})

// --- Test 2: stessa compilazione (refresh/re-render/back-forward) -> stesso id ---

test("resolveFunnelSessionId: due letture consecutive per lo stesso slug (refresh) restituiscono lo stesso id", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId } = await freshModule()

  const first = resolveFunnelSessionId("rifare-tetto")
  const second = resolveFunnelSessionId("rifare-tetto")

  assert.equal(first, second)
})

test("resolveFunnelSessionId: un id già presente in sessionStorage (simula un refresh reale) viene riletto invariato", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId } = await freshModule()

  const key = "esigenta:funnel-session:rifare-tetto"
  const existingId = "11111111-2222-4333-8444-555555555555"

  ;(globalThis as unknown as { sessionStorage: Storage }).sessionStorage.setItem(
    key,
    existingId,
  )

  assert.equal(resolveFunnelSessionId("rifare-tetto"), existingId)
})

test("resolveFunnelSessionId: slug diversi (compilazioni realmente distinte) ottengono id diversi e indipendenti", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId } = await freshModule()

  const idA = resolveFunnelSessionId("rifare-tetto")
  const idB = resolveFunnelSessionId("idraulica-generica")

  assert.notEqual(idA, idB)
  // Rileggere il primo slug non deve essere stato intaccato dalla lettura del secondo.
  assert.equal(resolveFunnelSessionId("rifare-tetto"), idA)
})

// --- Test 6: dopo successo -> l'id viene eliminato ---

test("clearFunnelSessionId: rimuove l'id salvato per quello slug", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId, clearFunnelSessionId } = await freshModule()

  const id = resolveFunnelSessionId("rifare-tetto")

  clearFunnelSessionId("rifare-tetto")

  const idAfterClear = resolveFunnelSessionId("rifare-tetto")

  assert.notEqual(
    idAfterClear,
    id,
    "dopo clear, una nuova compilazione sullo stesso slug non deve ereditare il vecchio id",
  )
})

test("clearFunnelSessionId: non tocca l'id di un altro interventionSlug", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId, clearFunnelSessionId } = await freshModule()

  // Genera anche l'id di "rifare-tetto": serve solo a popolare quella key
  // in sessionStorage prima del clear qui sotto, non viene asserito.
  resolveFunnelSessionId("rifare-tetto")
  const idB = resolveFunnelSessionId("idraulica-generica")

  clearFunnelSessionId("rifare-tetto")

  assert.equal(resolveFunnelSessionId("idraulica-generica"), idB)
})

// --- SSR safety ---

test("resolveFunnelSessionId: senza window (SSR) -> null, nessun crash", async () => {
  const g = globalThis as unknown as Record<string, unknown>

  delete g.window
  delete g.sessionStorage

  // freshModule anche qui (mai una sessionStorage fittizia installata): il
  // punto di questo test è proprio l'assenza di window.
  const { resolveFunnelSessionId } = await freshModule()

  assert.equal(resolveFunnelSessionId("rifare-tetto"), null)
})
