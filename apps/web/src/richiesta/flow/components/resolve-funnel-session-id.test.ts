import assert from "node:assert/strict"
import test from "node:test"

function installFakeSessionStorage(options?: {
  throwOnGet?: boolean
  throwOnSet?: boolean
  throwOnRemove?: boolean
}): void {
  const store = new Map<string, string>()
  const g = globalThis as unknown as Record<string, unknown>

  g.window = globalThis
  // FASE 7C.1: reset window.name for every (re-)install — a real,
  // independently-opened new tab always starts with window.name === "".
  // Without this reset, tests would leak carrier state into each other
  // through the one real `globalThis.name` shared across this whole file
  // (freshModule() re-imports the module under test, but does not — and
  // must not — reset unrelated browser globals).
  g.name = ""
  g.sessionStorage = {
    getItem: (key: string) => {
      if (options?.throwOnGet) {
        throw new Error("sessionStorage.getItem blocked (test)")
      }

      return store.has(key) ? (store.get(key) as string) : null
    },
    setItem: (key: string, value: string) => {
      if (options?.throwOnSet) {
        throw new Error("sessionStorage.setItem blocked (test)")
      }

      store.set(key, value)
    },
    removeItem: (key: string) => {
      if (options?.throwOnRemove) {
        throw new Error("sessionStorage.removeItem blocked (test)")
      }

      store.delete(key)
    },
  }
}

// FASE 7C — crypto è un global reale in Node (Web Crypto). Le funzioni
// sotto lo sostituiscono temporaneamente per simulare le tre condizioni
// richieste (assente, che lancia, del tutto indisponibile) e lo
// ripristinano subito dopo ogni test che lo manipola, per non far trapelare
// lo stato tra un test e l'altro nello stesso processo — freshModule()
// ricarica solo il modulo sotto test, non i global reali.
const REAL_CRYPTO = globalThis.crypto

function restoreRealCrypto(): void {
  Object.defineProperty(globalThis, "crypto", {
    value: REAL_CRYPTO,
    configurable: true,
  })
}

function installCryptoWithoutRandomUUID(): void {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      getRandomValues: REAL_CRYPTO.getRandomValues.bind(REAL_CRYPTO),
    },
    configurable: true,
  })
}

function installCryptoThatThrowsOnRandomUUID(): void {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => {
        throw new Error("crypto.randomUUID blocked (test)")
      },
      getRandomValues: REAL_CRYPTO.getRandomValues.bind(REAL_CRYPTO),
    },
    configurable: true,
  })
}

function installCryptoFullyUnavailable(): void {
  Object.defineProperty(globalThis, "crypto", {
    value: undefined,
    configurable: true,
  })
}

let importCounter = 0

async function freshModule() {
  importCounter += 1
  return import(`./resolve-funnel-session-id.ts?test-instance=${importCounter}`)
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// --- Test 1 (task): percorso normale ---

test("resolveFunnelSessionId (Test 1): nessun id esistente -> ne genera uno nuovo, in formato UUID", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId } = await freshModule()

  const id = resolveFunnelSessionId("rifare-tetto")

  assert.ok(id)
  assert.match(id, UUID_PATTERN)
})

test("resolveFunnelSessionId (Test 1): due letture consecutive per lo stesso slug (refresh) restituiscono lo stesso id", async () => {
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

// --- Test 5 (task): interventi differenti ---

test("resolveFunnelSessionId (Test 5): slug diversi (compilazioni realmente distinte) ottengono id diversi e indipendenti", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId } = await freshModule()

  const idA = resolveFunnelSessionId("rifare-tetto")
  const idB = resolveFunnelSessionId("idraulica-generica")

  assert.notEqual(idA, idB)
  // Rileggere il primo slug non deve essere stato intaccato dalla lettura del secondo.
  assert.equal(resolveFunnelSessionId("rifare-tetto"), idA)
})

// --- crypto.randomUUID assente/lancia -> fallback genera id valido (FASE 7C) ---

test("resolveFunnelSessionId: crypto.randomUUID assente -> il fallback genera comunque un id valido, nessun throw", async () => {
  installFakeSessionStorage()
  installCryptoWithoutRandomUUID()

  try {
    const { resolveFunnelSessionId } = await freshModule()

    const id = resolveFunnelSessionId("rifare-tetto")

    assert.ok(id)
    assert.match(id, UUID_PATTERN)
  } finally {
    restoreRealCrypto()
  }
})

test("resolveFunnelSessionId: crypto.randomUUID lancia -> il fallback genera comunque un id valido, nessun throw", async () => {
  installFakeSessionStorage()
  installCryptoThatThrowsOnRandomUUID()

  try {
    const { resolveFunnelSessionId } = await freshModule()

    const id = resolveFunnelSessionId("rifare-tetto")

    assert.ok(id)
    assert.match(id, UUID_PATTERN)
  } finally {
    restoreRealCrypto()
  }
})

// --- Test 2 (task): storage completamente rotto ---

test("resolveFunnelSessionId (Test 2): sessionStorage.getItem e .setItem lanciano entrambi -> un id valido viene restituito comunque, nessun crash", async () => {
  installFakeSessionStorage({ throwOnGet: true, throwOnSet: true })

  const { resolveFunnelSessionId } = await freshModule()

  const id = resolveFunnelSessionId("rifare-tetto")

  assert.ok(id)
  assert.match(id, UUID_PATTERN)
})

test("clearFunnelSessionId: sessionStorage.removeItem lancia -> nessun throw", async () => {
  installFakeSessionStorage({ throwOnRemove: true })

  const { resolveFunnelSessionId, clearFunnelSessionId } = await freshModule()

  resolveFunnelSessionId("rifare-tetto")

  assert.doesNotThrow(() => {
    clearFunnelSessionId("rifare-tetto")
  })
})

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

// --- SSR ---

test("resolveFunnelSessionId: senza window (SSR) -> null, nessun crash", async () => {
  const g = globalThis as unknown as Record<string, unknown>

  delete g.window
  delete g.sessionStorage
  delete g.name

  // freshModule anche qui (mai una sessionStorage fittizia installata): il
  // punto di questo test è proprio l'assenza di window.
  const { resolveFunnelSessionId } = await freshModule()

  assert.equal(resolveFunnelSessionId("rifare-tetto"), null)
})

test("clearFunnelSessionId: senza window (SSR) -> nessun crash", async () => {
  const g = globalThis as unknown as Record<string, unknown>

  delete g.window
  delete g.sessionStorage
  delete g.name

  const { clearFunnelSessionId } = await freshModule()

  assert.doesNotThrow(() => {
    clearFunnelSessionId("rifare-tetto")
  })
})

// ============================================================
// FASE 7C.1 — continuità forte tramite il carrier window.name
// ============================================================

// --- Test 3 (task, IL PIÙ IMPORTANTE): storage rotto + hard refresh simulato ---

test("resolveFunnelSessionId (Test 3 — FASE 7C.1): sessionStorage del tutto rotta + hard refresh simulato della stessa scheda -> stesso id, grazie al carrier window.name", async () => {
  // sessionStorage rotta per l'intero test (getItem E setItem lanciano
  // sempre) — non viene MAI reinstallata, quindi resta rotta anche dopo il
  // "refresh" simulato sotto: prova che la continuità arriva davvero dal
  // carrier window.name, non da una sessionStorage che nel frattempo torna
  // a funzionare.
  installFakeSessionStorage({ throwOnGet: true, throwOnSet: true })

  const { resolveFunnelSessionId: resolveBeforeReload } = await freshModule()

  const first = resolveBeforeReload("rifare-tetto")
  assert.ok(first)

  // Simula un hard refresh della STESSA scheda: nuova istanza di modulo
  // (equivalente a una nuova esecuzione JS dopo il ricaricamento) — ma
  // window.name, che un vero refresh NON cancella, resta quello scritto
  // sopra, e sessionStorage resta lo stesso oggetto fittizio, ancora rotto.
  const { resolveFunnelSessionId: resolveAfterReload } = await freshModule()

  const second = resolveAfterReload("rifare-tetto")

  assert.equal(
    second,
    first,
    "con sessionStorage del tutto rotta, il carrier window.name deve comunque preservare lo stesso id attraverso un hard refresh",
  )
})

// --- Test 10 (task): scenario business principale, framing esplicito ---

test("resolveFunnelSessionId (Test 10 — scenario business): Request creata con ID A, risposta persa, hard refresh con storage rotta, retry -> stesso ID A (garanzia lato client per l'idempotenza server della FASE 7B)", async () => {
  installFakeSessionStorage({ throwOnGet: true, throwOnSet: true })

  const { resolveFunnelSessionId: beforeResponseLost } = await freshModule()

  // Equivalente a: submitDraft() genera/usa questo id, POST /api/requests
  // crea davvero la Request lato server, ma la risposta si perde prima che
  // il client la riconosca (vedi FASE 7A, scenario BLOCKER).
  const idAtSubmitTime = beforeResponseLost("rifare-tetto")

  // L'utente ricarica la pagina (hard refresh) e ritenta.
  const { resolveFunnelSessionId: afterHardRefresh } = await freshModule()

  const idAtRetryTime = afterHardRefresh("rifare-tetto")

  assert.equal(
    idAtRetryTime,
    idAtSubmitTime,
    "il retry deve inviare lo STESSO funnelSessionId della richiesta originale, così il fast-path/P2002 recovery della FASE 7B lo riconosce come lo stesso tentativo invece di crearne uno nuovo",
  )
})

// --- Test 4 (task): nuova compilazione dopo clear ---

test("resolveFunnelSessionId (Test 4): compilazione conclusa (clear) -> una nuova compilazione sullo stesso slug ottiene un id diverso, anche con storage rotta", async () => {
  installFakeSessionStorage({ throwOnGet: true, throwOnSet: true, throwOnRemove: true })

  const { resolveFunnelSessionId, clearFunnelSessionId } = await freshModule()

  const idA = resolveFunnelSessionId("rifare-tetto")

  clearFunnelSessionId("rifare-tetto")

  const idB = resolveFunnelSessionId("rifare-tetto")

  assert.notEqual(idB, idA)
})

// --- Test 6 (task): due compilazioni indipendenti dello stesso intervento ---

test("resolveFunnelSessionId (Test 6 — FASE 7C.1): due schede aperte indipendentemente (mai duplicate) sullo stesso interventionSlug ottengono id diversi", async () => {
  // "Scheda" 1: sessionStorage e window.name partono vuoti.
  installFakeSessionStorage()
  const { resolveFunnelSessionId: resolveTab1 } = await freshModule()
  const idTab1 = resolveTab1("rifare-tetto")

  // "Scheda" 2, aperta indipendentemente: una vera nuova scheda (non una
  // duplicazione) riparte SEMPRE con sessionStorage/window.name propri e
  // vuoti — reinstallare il fake è esattamente questo.
  installFakeSessionStorage()
  const { resolveFunnelSessionId: resolveTab2 } = await freshModule()
  const idTab2 = resolveTab2("rifare-tetto")

  assert.notEqual(
    idTab2,
    idTab1,
    "due compilazioni realmente indipendenti non devono mai fondersi in una sola, nemmeno con lo stesso interventionSlug",
  )
})

// --- Test 7 (task): scheda duplicata ---

test("resolveFunnelSessionId (Test 7 — FASE 7C.1): una scheda duplicata (eredita lo stesso sessionStorage e window.name) ottiene lo stesso id — stessa compilazione, per semantica scelta esplicitamente", async () => {
  installFakeSessionStorage()
  const { resolveFunnelSessionId: resolveOriginal } = await freshModule()
  const idOriginal = resolveOriginal("rifare-tetto")

  // Scheda duplicata: eredita lo stesso sessionStorage E lo stesso
  // window.name della scheda originale (comportamento reale della
  // maggior parte dei browser per "Duplica scheda") — qui simulato senza
  // reinstallare i fake, che restano condivisi con la riga sopra.
  const { resolveFunnelSessionId: resolveDuplicated } = await freshModule()
  const idDuplicated = resolveDuplicated("rifare-tetto")

  assert.equal(
    idDuplicated,
    idOriginal,
    "una scheda duplicata rappresenta lo stesso tentativo business della compilazione originale",
  )

  // Ma la duplicazione non deve MAI impedire l'avvio di una nuova
  // compilazione intenzionale in seguito (es. dopo un invio riuscito nella
  // scheda duplicata).
  const {
    resolveFunnelSessionId: resolveAfterSuccess,
    clearFunnelSessionId,
  } = await freshModule()

  clearFunnelSessionId("rifare-tetto")

  const idAfterSuccess = resolveAfterSuccess("rifare-tetto")

  assert.notEqual(
    idAfterSuccess,
    idOriginal,
    "dopo un successo, una nuova compilazione (anche nella scheda duplicata) deve ottenere un id nuovo",
  )
})

// --- Test 8 (task): fallback UUID sempre valido per normalizeFunnelSessionId() ---

test("resolveFunnelSessionId (Test 8): con crypto del tutto indisponibile, molti id generati dal fallback sono tutti in formato UUID valido e tutti distinti", async () => {
  installFakeSessionStorage()
  installCryptoFullyUnavailable()

  try {
    const { resolveFunnelSessionId } = await freshModule()

    // Un id per slug distinto (resolveFunnelSessionId dedupe per slug via
    // sessionStorage/window.name, quindi slug diversi sono l'unico modo di
    // ottenere N generazioni realmente indipendenti dallo stesso modulo).
    // Numero volutamente contenuto — non un test statistico.
    const ids = Array.from({ length: 200 }, (_, index) =>
      resolveFunnelSessionId(`test-slug-${index}`),
    )

    for (const id of ids) {
      assert.ok(id)
      assert.match(id, UUID_PATTERN)
    }

    assert.equal(
      new Set(ids).size,
      ids.length,
      "nessuna collisione tra gli id generati dal fallback",
    )
  } finally {
    restoreRealCrypto()
  }
})

// --- Test 9 (task): privacy — nessun leak nel carrier stesso ---

test("resolveFunnelSessionId (Test 9 — privacy): il carrier window.name non contiene mai altro che id per interventionSlug — nessun payload arbitrario, nessuna struttura leggibile come URL/query", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId } = await freshModule()

  resolveFunnelSessionId("rifare-tetto")

  const rawWindowName = (globalThis as unknown as { name: string }).name

  // Non è mai una querystring/URL-like, e non contiene mai `http`/`?`/`&`
  // — window.name resta un dato puramente interno al carrier, mai
  // qualcosa che assomigli a un valore che potrebbe finire loggato come
  // URL da un sistema esterno.
  assert.ok(rawWindowName.startsWith("esigenta:funnel-session-carrier:"))
  assert.ok(!rawWindowName.includes("http"))
  assert.ok(!rawWindowName.includes("?"))

  // La prova strutturale che funnelSessionId non raggiunge mai GA4 resta
  // in site/analytics/ga4-events.test.ts (trackFunnelEventGa4 non accetta
  // e non invia mai funnelSessionId/requestId nel payload, per nessun
  // eventType) — invariato in questa fase, non ri-duplicato qui.
})

// ============================================================
// FASE 7C.2 — verifica: cross-origin + back (window.name "sporcato")
// ============================================================

test("resolveFunnelSessionId (FASE 7C.2 — cross-origin + back): window.name sovrascritto da un sito esterno (stringa arbitraria, non JSON) -> nessun crash, nessun id corrotto, viene generato un id nuovo valido", async () => {
  installFakeSessionStorage({ throwOnGet: true, throwOnSet: true })

  const g = globalThis as unknown as { name: string }

  // Simula un'escursione cross-origin che ha sovrascritto window.name con
  // qualcosa di completamente estraneo — né il nostro prefisso, né JSON.
  g.name = "qualche-altro-sito-ha-scritto-questo"

  const { resolveFunnelSessionId } = await freshModule()

  assert.doesNotThrow(() => {
    const id = resolveFunnelSessionId("rifare-tetto")

    assert.ok(id)
    assert.match(id, UUID_PATTERN)
  })
})

test("resolveFunnelSessionId (FASE 7C.2 — cross-origin + back): window.name con JSON valido ma di forma estranea (array, non l'oggetto atteso) -> nessun crash, trattato come assente", async () => {
  installFakeSessionStorage({ throwOnGet: true, throwOnSet: true })

  const g = globalThis as unknown as { name: string }

  g.name = "esigenta:funnel-session-carrier:" + JSON.stringify(["non", "un", "oggetto"])

  const { resolveFunnelSessionId } = await freshModule()

  assert.doesNotThrow(() => {
    const id = resolveFunnelSessionId("rifare-tetto")

    assert.ok(id)
    assert.match(id, UUID_PATTERN)
  })
})

test("resolveFunnelSessionId (FASE 7C.2 — cross-origin + back): sessionStorage disponibile con id già presente sopravvive comunque a un window.name sporcato da un sito esterno", async () => {
  installFakeSessionStorage()

  const { resolveFunnelSessionId: resolveFirst } = await freshModule()

  const idBeforeExcursion = resolveFirst("rifare-tetto")

  // sessionStorage è per-origine e non viene toccata da una visita ad un
  // altro sito — solo window.name (per-scheda, non per-origine) viene
  // "sporcato" qui per simulare il ritorno da un'escursione cross-origin.
  const g = globalThis as unknown as { name: string }

  g.name = "contenuto-di-un-altro-sito"

  const { resolveFunnelSessionId: resolveAfterBack } = await freshModule()

  assert.equal(
    resolveAfterBack("rifare-tetto"),
    idBeforeExcursion,
    "con sessionStorage intatta, il ritorno da un'escursione cross-origin non deve mai perdere l'id",
  )
})
