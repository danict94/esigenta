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
  return import(`./resolve-funnel-query.ts?test-instance=${importCounter}`)
}

test("resolveFunnelQuery: undefined se non è mai stato salvato nulla", async () => {
  installFakeSessionStorage()

  const { resolveFunnelQuery } = await freshModule()

  assert.equal(resolveFunnelQuery("intervento-a"), undefined)
})

test("storeFunnelQuery + resolveFunnelQuery: scrive e rilegge lo stesso valore (refresh/back nella stessa scheda)", async () => {
  installFakeSessionStorage()

  const { storeFunnelQuery, resolveFunnelQuery } = await freshModule()

  storeFunnelQuery("intervento-a", "ho una perdita in bagno")

  assert.equal(resolveFunnelQuery("intervento-a"), "ho una perdita in bagno")
  // Una seconda lettura (refresh/back) deve continuare a trovarlo: la sola
  // lettura di un valore valido non lo rimuove.
  assert.equal(resolveFunnelQuery("intervento-a"), "ho una perdita in bagno")
})

test("storeFunnelQuery: chiavi isolate per interventionSlug diversi", async () => {
  installFakeSessionStorage()

  const { storeFunnelQuery, resolveFunnelQuery } = await freshModule()

  storeFunnelQuery("intervento-a", "testo per A")

  assert.equal(resolveFunnelQuery("intervento-c"), undefined)
})

test("storeFunnelQuery: una nuova ricerca sullo stesso slug sovrascrive la precedente", async () => {
  installFakeSessionStorage()

  const { storeFunnelQuery, resolveFunnelQuery } = await freshModule()

  storeFunnelQuery("intervento-a", "prima ricerca")
  storeFunnelQuery("intervento-a", "seconda ricerca")

  assert.equal(resolveFunnelQuery("intervento-a"), "seconda ricerca")
})

test("resolveFunnelQuery: un valore più vecchio della soglia di scadenza viene scartato e rimosso", async () => {
  installFakeSessionStorage()

  const { resolveFunnelQuery } = await freshModule()

  const key = "esigenta:richiesta:query:intervento-a"
  const staleTimestamp = Date.now() - 31 * 60 * 1000 // 31 minuti fa

  ;(globalThis as unknown as { sessionStorage: Storage }).sessionStorage.setItem(
    key,
    JSON.stringify({ value: "testo vecchio", storedAt: staleTimestamp }),
  )

  assert.equal(
    resolveFunnelQuery("intervento-a"),
    undefined,
    "un valore scaduto non deve mai essere restituito",
  )
  assert.equal(
    (globalThis as unknown as { sessionStorage: Storage }).sessionStorage.getItem(key),
    null,
    "il valore scaduto deve essere rimosso da sessionStorage",
  )
})

test("resolveFunnelQuery: un valore appena sotto la soglia di scadenza resta valido", async () => {
  installFakeSessionStorage()

  const { resolveFunnelQuery } = await freshModule()

  const key = "esigenta:richiesta:query:intervento-a"
  const recentTimestamp = Date.now() - 29 * 60 * 1000 // 29 minuti fa

  ;(globalThis as unknown as { sessionStorage: Storage }).sessionStorage.setItem(
    key,
    JSON.stringify({ value: "testo recente", storedAt: recentTimestamp }),
  )

  assert.equal(resolveFunnelQuery("intervento-a"), "testo recente")
})

test("resolveFunnelQuery: un valore non parsabile viene scartato e rimosso senza errori", async () => {
  installFakeSessionStorage()

  const { resolveFunnelQuery } = await freshModule()

  const key = "esigenta:richiesta:query:intervento-a"

  ;(globalThis as unknown as { sessionStorage: Storage }).sessionStorage.setItem(
    key,
    "non-e-json-valido",
  )

  assert.equal(resolveFunnelQuery("intervento-a"), undefined)
  assert.equal(
    (globalThis as unknown as { sessionStorage: Storage }).sessionStorage.getItem(key),
    null,
  )
})
