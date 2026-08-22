import assert from "node:assert/strict"
import test from "node:test"

function installFakeBrowser(
  search: string,
  options?: { throwOnGet?: boolean; throwOnSet?: boolean },
): {
  sessionStorage: Record<string, string>
} {
  const store = new Map<string, string>()
  const g = globalThis as unknown as Record<string, unknown>

  g.window = globalThis
  g.location = { search }
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
      store.delete(key)
    },
  }

  return {
    get sessionStorage() {
      return Object.fromEntries(store)
    },
  }
}

let importCounter = 0

async function freshModule() {
  importCounter += 1
  return import(`./funnel-attribution.ts?test-instance=${importCounter}`)
}

// --- Casi A/B/C/D: gclid / gbraid / wbraid / UTM preservati ---

test("resolveFunnelAttribution (Caso A — Google Ads): gclid nell'URL viene catturato", async () => {
  installFakeBrowser("?gclid=Cj0KCQjw_test_value")

  const { resolveFunnelAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelAttribution(), { gclid: "Cj0KCQjw_test_value" })
})

test("resolveFunnelAttribution (Caso B — gbraid): gbraid nell'URL viene catturato", async () => {
  installFakeBrowser("?gbraid=some-gbraid-value")

  const { resolveFunnelAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelAttribution(), { gbraid: "some-gbraid-value" })
})

test("resolveFunnelAttribution (Caso C — wbraid): wbraid nell'URL viene catturato", async () => {
  installFakeBrowser("?wbraid=some-wbraid-value")

  const { resolveFunnelAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelAttribution(), { wbraid: "some-wbraid-value" })
})

test("resolveFunnelAttribution (Caso D — UTM): tutti e 5 i parametri UTM vengono catturati", async () => {
  installFakeBrowser(
    "?utm_source=google&utm_medium=cpc&utm_campaign=bagno&utm_term=ristrutturazione&utm_content=annuncio1",
  )

  const { resolveFunnelAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelAttribution(), {
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "bagno",
    utmTerm: "ristrutturazione",
    utmContent: "annuncio1",
  })
})

test("resolveFunnelAttribution: gclid + UTM insieme vengono catturati entrambi", async () => {
  installFakeBrowser("?gclid=abc123&utm_source=google&utm_medium=cpc")

  const { resolveFunnelAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelAttribution(), {
    gclid: "abc123",
    utmSource: "google",
    utmMedium: "cpc",
  })
})

// --- Caso E: nessuna attribution ---

test("resolveFunnelAttribution (Caso E): nessun parametro -> null, nessun crash", async () => {
  installFakeBrowser("")

  const { resolveFunnelAttribution } = await freshModule()

  assert.equal(resolveFunnelAttribution(), null)
})

// --- Test 5: router.push senza query params -> attribution NON persa ---

test("resolveFunnelAttribution: un'attribution già in sessionStorage (simula il router.push verso /richiesta/[slug] senza più i parametri originali) resta disponibile", async () => {
  const browser = installFakeBrowser("?gclid=abc123")

  const { resolveFunnelAttribution } = await freshModule()

  // Prima "pagina" (landing, con gclid nell'URL): cattura.
  resolveFunnelAttribution()

  // Simula la navigazione client-side: l'URL della pagina successiva
  // (/richiesta/[slug]) non contiene più alcun parametro.
  ;(globalThis as unknown as { location: { search: string } }).location.search = ""

  // Stessa istanza di modulo, stesso sessionStorage: la seconda chiamata
  // (equivalente a RequestStepper al momento di funnel_started) deve
  // ancora trovare l'attribution catturata sulla pagina precedente.
  assert.deepEqual(resolveFunnelAttribution(), { gclid: "abc123" })
  assert.ok(browser.sessionStorage["esigenta:funnel-attribution"])
})

// --- Parametri non supportati / arbitrari ---

test("resolveFunnelAttribution: parametri non nell'allow-list vengono ignorati", async () => {
  installFakeBrowser("?ref=amico&utm_source=google&random_param=xyz")

  const { resolveFunnelAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelAttribution(), { utmSource: "google" })
})

// --- Test 7: valore oltre limite / invalido -> ignorato, funnel non bloccato ---

test("resolveFunnelAttribution: un valore oltre il limite di lunghezza viene ignorato (non l'intero risultato)", async () => {
  const tooLong = "x".repeat(500)

  installFakeBrowser(`?gclid=${tooLong}&utm_source=google`)

  const { resolveFunnelAttribution } = await freshModule()

  // gclid troppo lungo scartato, utm_source valido mantenuto — mai un
  // throw, mai un blocco del resto della cattura.
  assert.deepEqual(resolveFunnelAttribution(), { utmSource: "google" })
})

test("resolveFunnelAttribution: valore vuoto per un parametro presente ma senza valore -> ignorato", async () => {
  installFakeBrowser("?gclid=&utm_source=google")

  const { resolveFunnelAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelAttribution(), { utmSource: "google" })
})

test("resolveFunnelAttribution: senza window (SSR) -> null, nessun crash", async () => {
  const g = globalThis as unknown as Record<string, unknown>

  delete g.window
  delete g.location
  delete g.sessionStorage

  const { resolveFunnelAttribution } = await freshModule()

  assert.equal(resolveFunnelAttribution(), null)
})

// --- applyAttributionConsent (CONSENT DECISION REQUIRED, vedi report) ---

test("applyAttributionConsent: con marketing concesso, tutti i campi passano invariati", async () => {
  const { applyAttributionConsent } = await freshModule()

  const attribution = { gclid: "abc123", utmSource: "google" }

  assert.deepEqual(applyAttributionConsent(attribution, true), attribution)
})

test("applyAttributionConsent: senza marketing, gclid/gbraid/wbraid vengono rimossi ma gli UTM restano", async () => {
  const { applyAttributionConsent } = await freshModule()

  const attribution = {
    gclid: "abc123",
    gbraid: "def456",
    wbraid: "ghi789",
    utmSource: "google",
    utmMedium: "cpc",
  }

  assert.deepEqual(applyAttributionConsent(attribution, false), {
    utmSource: "google",
    utmMedium: "cpc",
  })
})

test("applyAttributionConsent: senza marketing e senza UTM (solo gclid) -> null, non un oggetto vuoto", async () => {
  const { applyAttributionConsent } = await freshModule()

  assert.equal(applyAttributionConsent({ gclid: "abc123" }, false), null)
})

test("applyAttributionConsent: attribution assente -> null indipendentemente dal consenso", async () => {
  const { applyAttributionConsent } = await freshModule()

  assert.equal(applyAttributionConsent(null, true), null)
  assert.equal(applyAttributionConsent(null, false), null)
})

// ============================================================
// FASE 7D — resolveFunnelStartedAttribution: l'attribution può fallire,
// funnel_started (calcolato da request-stepper.tsx a partire dal valore
// ritornato qui) mai. Tutti i casi sotto verificano solo che questa
// funzione non lanci MAI e ritorni sempre un valore utilizzabile — la
// prova che funnel_started viene comunque inviato al DB/GA4 è strutturale
// (vedi request-stepper.tsx: trackFunnelEvent/trackFunnelEventGa4 sono
// chiamate incondizionatamente, sulle righe DOPO il try/catch, mai al
// suo interno) e non richiede un secondo test qui.
//
// FASE 7E: il ritorno non è più solo l'attribution — è
// { status: "resolved" | "unknown", attribution }. I casi sotto sono stati
// aggiornati per verificare anche lo status, non solo l'assenza di throw.
// ============================================================

// --- Caso 1 (task): attribution normale ---

test("resolveFunnelStartedAttribution (Caso 1): UTM presenti e marketing concesso -> status resolved, attribution risolta correttamente", async () => {
  installFakeBrowser("?utm_source=google&utm_medium=cpc&gclid=abc123")

  const { resolveFunnelStartedAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelStartedAttribution(true), {
    status: "resolved",
    attribution: {
      utmSource: "google",
      utmMedium: "cpc",
      gclid: "abc123",
    },
  })
})

// --- Caso 2 (task): sessionStorage.getItem lancia ---

test("resolveFunnelStartedAttribution (Caso 2 — FASE 7E): sessionStorage.getItem lancia -> nessun throw, status unknown (non 'resolved con attribution null')", async () => {
  // Nessun parametro nell'URL: forza il ramo che rilegge da sessionStorage
  // (readStoredAttribution), l'unico che chiama getItem.
  installFakeBrowser("", { throwOnGet: true })

  const { resolveFunnelStartedAttribution } = await freshModule()

  assert.doesNotThrow(() => {
    assert.deepEqual(resolveFunnelStartedAttribution(true), {
      status: "unknown",
      attribution: null,
    })
  })
})

// --- Caso 3 (task): sessionStorage.setItem lancia ---

test("resolveFunnelStartedAttribution (Caso 3): sessionStorage.setItem lancia durante la cattura da URL -> nessun throw, status resolved e l'attribution appena catturata viene comunque ritornata", async () => {
  installFakeBrowser("?utm_source=google", { throwOnSet: true })

  const { resolveFunnelStartedAttribution } = await freshModule()

  assert.doesNotThrow(() => {
    const resolution = resolveFunnelStartedAttribution(true)

    // Lo scrivere in sessionStorage è solo un mirror best-effort (FASE 6E),
    // già hardened di suo (safeWriteStoredRaw, FASE 7D): un suo fallimento
    // non deve nemmeno far scattare lo status "unknown" — la risoluzione
    // in sé è comunque riuscita.
    assert.deepEqual(resolution, {
      status: "resolved",
      attribution: { utmSource: "google" },
    })
  })
})

// --- Caso 4 (task): storage corrotto ---

test("resolveFunnelStartedAttribution (Caso 4): sessionStorage contiene JSON invalido -> status resolved, attribution vuota (null) — corrotto è già gestito internamente, non è un 'unknown'", async () => {
  installFakeBrowser("")

  ;(globalThis as unknown as { sessionStorage: Storage }).sessionStorage.setItem(
    "esigenta:funnel-attribution",
    "{questo non è JSON valido",
  )

  const { resolveFunnelStartedAttribution } = await freshModule()

  assert.doesNotThrow(() => {
    assert.deepEqual(resolveFunnelStartedAttribution(true), {
      status: "resolved",
      attribution: null,
    })
  })
})

// --- Caso 5 (task): marketing=false, comportamento gate invariato ---

test("resolveFunnelStartedAttribution (Caso 5): marketing=false -> status resolved, UTM preservata, gclid filtrato, comportamento invariato dalla FASE 6E", async () => {
  installFakeBrowser("?utm_source=google&gclid=XYZ")

  const { resolveFunnelStartedAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelStartedAttribution(false), {
    status: "resolved",
    attribution: { utmSource: "google" },
  })
})

// --- Robustezza aggiuntiva: fallimento combinato (getItem lancia E lo storage sarebbe comunque stato corrotto) ---

test("resolveFunnelStartedAttribution: nessun parametro URL e sessionStorage del tutto inaccessibile -> status unknown, mai un throw", async () => {
  installFakeBrowser("", { throwOnGet: true, throwOnSet: true })

  const { resolveFunnelStartedAttribution } = await freshModule()

  assert.doesNotThrow(() => {
    assert.deepEqual(resolveFunnelStartedAttribution(true), {
      status: "unknown",
      attribution: null,
    })
    assert.deepEqual(resolveFunnelStartedAttribution(false), {
      status: "unknown",
      attribution: null,
    })
  })
})

// --- FASE 7E: nessun parametro URL, nessuno storage precedente, nessun errore -> status resolved con attribution null (Caso A, genuinamente non attribuito — non "unknown") ---

test("resolveFunnelStartedAttribution (FASE 7E — Caso A vs B): nessuna attribution reale e nessun errore -> status resolved (attribution null), MAI unknown", async () => {
  installFakeBrowser("")

  const { resolveFunnelStartedAttribution } = await freshModule()

  assert.deepEqual(resolveFunnelStartedAttribution(true), {
    status: "resolved",
    attribution: null,
  })
})
