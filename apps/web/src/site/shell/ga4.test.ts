import assert from "node:assert/strict"
import test from "node:test"

import {
  writeCookieConsentPreferences,
  type CookieConsentPreferences,
} from "./cookie-consent-storage"

type Listener = () => void

class FakeScriptElement {
  id = ""
  async = false
  src = ""
  onload: Listener | null = null
  onerror: Listener | null = null
  dataset: Record<string, string> = {}
  removed = false
  private listeners: Record<string, Listener[]> = {}

  addEventListener(type: string, cb: Listener): void {
    this.listeners[type] = this.listeners[type] ?? []
    this.listeners[type].push(cb)
  }

  removeEventListener(type: string, cb: Listener): void {
    this.listeners[type] = (this.listeners[type] ?? []).filter(
      (listener) => listener !== cb,
    )
  }

  remove(): void {
    this.removed = true
  }

  simulateLoad(): void {
    this.onload?.()
    for (const cb of this.listeners.load ?? []) cb()
  }

  simulateError(): void {
    this.onerror?.()
    for (const cb of this.listeners.error ?? []) cb()
  }
}

function createFakeDocument() {
  const appended: FakeScriptElement[] = []

  return {
    getElementById(id: string) {
      for (let i = appended.length - 1; i >= 0; i -= 1) {
        const el = appended[i]
        if (el && el.id === id && !el.removed) {
          return el
        }
      }
      return null
    },
    createElement(tag: string) {
      assert.equal(tag, "script")
      return new FakeScriptElement()
    },
    head: {
      appendChild(el: FakeScriptElement) {
        appended.push(el)
      },
    },
    appended,
  }
}

type FakeDocument = ReturnType<typeof createFakeDocument>

function installFakeBrowser(): FakeDocument {
  const doc = createFakeDocument()
  const g = globalThis as unknown as Record<string, unknown>

  g.document = doc
  g.window = globalThis
  g.location = { origin: "https://example.test" }
  delete g.dataLayer
  delete g.gtag
  delete g.localStorage
  delete g.dispatchEvent

  return doc
}

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

let importCounter = 0

// Ogni test importa una nuova istanza del modulo (query string come cache
// buster) per resettare lo stato singleton (ga4ActivationPromise) tra un
// test e l'altro: activateGa4 è pensata per essere un singleton per pagina,
// quindi va reimportata, non richiamata due volte sullo stesso modulo.
async function freshGa4Module() {
  importCounter += 1
  return import(`./ga4.ts?test-instance=${importCounter}`)
}

function dataLayerCommands(): unknown[][] {
  return ((globalThis as unknown as { dataLayer?: unknown[][] }).dataLayer ??
    []) as unknown[][]
}

function firstScript(doc: FakeDocument): FakeScriptElement {
  const script = doc.appended[0]
  assert.ok(script, "lo script gtag.js avrebbe dovuto essere iniettato")
  return script
}

function makePreferences(
  overrides: Partial<CookieConsentPreferences> = {},
): CookieConsentPreferences {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    necessary: true,
    functional: false,
    analytics: true,
    marketing: false,
    ...overrides,
  } as CookieConsentPreferences
}

test("js/config non partono prima del load reale dello script", async () => {
  const doc = installFakeBrowser()
  const { activateGa4 } = await freshGa4Module()

  const activation = activateGa4("G-TEST123", makePreferences())

  const beforeLoad = dataLayerCommands()

  assert.ok(
    beforeLoad.some((c) => c[0] === "consent" && c[1] === "default"),
    "il consent default deve essere già accodato",
  )
  assert.ok(
    beforeLoad.some((c) => c[0] === "consent" && c[1] === "update"),
    "il consent update deve essere già accodato",
  )
  assert.ok(
    !beforeLoad.some((c) => c[0] === "js"),
    "js non deve partire prima del load reale",
  )
  assert.ok(
    !beforeLoad.some((c) => c[0] === "config"),
    "config non deve partire prima del load reale",
  )

  firstScript(doc).simulateLoad()
  await activation

  const afterLoad = dataLayerCommands()
  const configCommand = afterLoad.find((c) => c[0] === "config")

  assert.ok(afterLoad.some((c) => c[0] === "js"))
  assert.ok(configCommand, "config deve essere presente dopo il load")
  assert.equal(configCommand?.[1], "G-TEST123")
  assert.equal(
    configCommand?.length,
    2,
    "config non deve contenere alcun secondo argomento (niente send_page_view:false): il page_view resta automatico",
  )
})

test("due chiamate concorrenti ad activateGa4 condividono la stessa inizializzazione, un solo script, una sola js/config", async () => {
  const doc = installFakeBrowser()
  const { activateGa4 } = await freshGa4Module()
  const preferences = makePreferences()

  const p1 = activateGa4("G-TEST123", preferences)
  const p2 = activateGa4("G-TEST123", preferences)

  assert.equal(p1, p2, "le due chiamate devono condividere la stessa Promise")
  assert.equal(doc.appended.length, 1, "un solo script deve essere iniettato")

  firstScript(doc).simulateLoad()
  await p1

  const configCommands = dataLayerCommands().filter((c) => c[0] === "config")
  const jsCommands = dataLayerCommands().filter((c) => c[0] === "js")

  assert.equal(configCommands.length, 1)
  assert.equal(jsCommands.length, 1)
  assert.equal(
    doc.appended.length,
    1,
    "nessuno script aggiuntivo dopo il load",
  )
})

test("script.onerror non lascia uno stato falsamente inizializzato e permette un retry", async () => {
  const doc = installFakeBrowser()
  const { activateGa4, isGa4Activated } = await freshGa4Module()
  const preferences = makePreferences()

  const firstAttempt = activateGa4("G-TEST123", preferences)

  assert.equal(
    isGa4Activated(),
    true,
    "durante il tentativo lo stato risulta attivo (Promise in-flight)",
  )

  firstScript(doc).simulateError()

  await assert.rejects(firstAttempt)
  assert.equal(
    isGa4Activated(),
    false,
    "dopo l'errore lo stato di attivazione deve azzerarsi",
  )
  assert.equal(doc.appended.length, 1)

  const secondAttempt = activateGa4("G-TEST123", preferences)

  assert.equal(
    doc.appended.length,
    2,
    "un retry dopo l'errore deve poter iniettare un nuovo script",
  )

  doc.appended[1]?.simulateLoad()
  await secondAttempt

  const configCommands = dataLayerCommands().filter((c) => c[0] === "config")

  assert.equal(
    configCommands.length,
    1,
    "solo il tentativo riuscito produce config",
  )
})

test("trackGenerateLead attende il load reale, rispetta l'ordine js->config->generate_lead, invia una sola volta e non ripete init su una chiamata successiva", async () => {
  const doc = installFakeBrowser()
  installFakeLocalStorage()
  writeCookieConsentPreferences(makePreferences())

  const { activateGa4, trackGenerateLead } = await freshGa4Module()
  const leadParams = {
    leadType: "customer_request" as const,
    serviceGroup: "gruppo-test",
    intervention: "intervento-test",
  }

  const activation = activateGa4("G-TEST123", makePreferences())
  const firstLead = trackGenerateLead("G-TEST123", leadParams)

  // Requisito 1: chiamato mentre lo script è ancora in caricamento, non deve
  // inviare l'evento prima del load reale.
  assert.ok(
    !dataLayerCommands().some(
      (c) => c[0] === "event" && c[1] === "generate_lead",
    ),
    "generate_lead non deve partire prima del load reale dello script",
  )

  firstScript(doc).simulateLoad()
  await activation
  await firstLead

  const commands = dataLayerCommands()
  const jsIndex = commands.findIndex((c) => c[0] === "js")
  const configIndex = commands.findIndex((c) => c[0] === "config")
  const leadIndex = commands.findIndex(
    (c) => c[0] === "event" && c[1] === "generate_lead",
  )

  // Requisito 2: ordine js -> config -> generate_lead.
  assert.ok(jsIndex !== -1 && configIndex !== -1 && leadIndex !== -1)
  assert.ok(jsIndex < configIndex, "js deve precedere config")
  assert.ok(configIndex < leadIndex, "config deve precedere generate_lead")

  // Requisito 3: generate_lead inviato una sola volta per questa chiamata.
  const leadCommandsAfterFirstCall = commands.filter(
    (c) => c[0] === "event" && c[1] === "generate_lead",
  )
  assert.equal(leadCommandsAfterFirstCall.length, 1)

  // Parametri/semantica di generate_lead invariati.
  const leadPayload = leadCommandsAfterFirstCall[0]?.[2] as Record<
    string,
    unknown
  >
  assert.equal(leadPayload.lead_type, "customer_request")
  assert.equal(leadPayload.service_group, "gruppo-test")
  assert.equal(leadPayload.intervention, "intervento-test")
  assert.equal(leadPayload.send_to, "G-TEST123")

  // Requisito 4: l'attesa dell'inizializzazione non provoca una seconda config.
  assert.equal(
    commands.filter((c) => c[0] === "config").length,
    1,
    "config deve restare unica dopo l'attesa di trackGenerateLead",
  )

  // Requisito 5: una chiamata successiva usa GA4 già inizializzato, senza un
  // nuovo script e senza ripetere js/config.
  await trackGenerateLead("G-TEST123", leadParams)

  const finalCommands = dataLayerCommands()

  assert.equal(
    finalCommands.filter((c) => c[0] === "config").length,
    1,
    "config resta unica anche dopo una seconda trackGenerateLead",
  )
  assert.equal(
    finalCommands.filter((c) => c[0] === "js").length,
    1,
    "js resta unico anche dopo una seconda trackGenerateLead",
  )
  assert.equal(
    doc.appended.length,
    1,
    "nessun nuovo script iniettato dalla seconda trackGenerateLead",
  )
  assert.equal(
    finalCommands.filter((c) => c[0] === "event" && c[1] === "generate_lead")
      .length,
    2,
    "la seconda chiamata invia comunque il proprio generate_lead",
  )
})

test("integrazione home + funnel: attivazione dalla home poi trackGenerateLead usano la stessa inizializzazione (un solo script, una sola js/config)", async () => {
  const doc = installFakeBrowser()
  installFakeLocalStorage()
  writeCookieConsentPreferences(makePreferences())

  const { activateGa4, trackGenerateLead } = await freshGa4Module()

  // 1. Attivazione dalla home: equivalente a ciò che fa Ga4MinimalLoader al
  // mount quando il consenso è già granted.
  const homeActivation = activateGa4("G-TEST123", makePreferences())

  firstScript(doc).simulateLoad()
  await homeActivation

  assert.equal(
    dataLayerCommands().filter((c) => c[0] === "config").length,
    1,
    "la home deve aver già completato una sola config",
  )

  // 2. Successiva chiamata trackGenerateLead dal funnel, in un momento
  // separato, dopo che l'inizializzazione della home è già risolta.
  await trackGenerateLead("G-TEST123", {
    leadType: "customer_request",
    serviceGroup: "gruppo-test",
    intervention: "intervento-test",
  })

  const finalCommands = dataLayerCommands()

  // 3. Un solo script per l'intero flusso home + funnel.
  assert.equal(doc.appended.length, 1)

  // 4. Una sola js/config in tutto il flusso.
  assert.equal(finalCommands.filter((c) => c[0] === "js").length, 1)
  assert.equal(finalCommands.filter((c) => c[0] === "config").length, 1)

  // 5. generate_lead inviato usando la stessa inizializzazione, con i
  // parametri attesi.
  const leadCommands = finalCommands.filter(
    (c) => c[0] === "event" && c[1] === "generate_lead",
  )

  assert.equal(leadCommands.length, 1)

  const payload = leadCommands[0]?.[2] as Record<string, unknown>

  assert.equal(payload.lead_type, "customer_request")
  assert.equal(payload.service_group, "gruppo-test")
  assert.equal(payload.intervention, "intervento-test")
  assert.equal(payload.send_to, "G-TEST123")
})

test("revoca del consenso durante il caricamento: isGa4Activated() è già true, consent update denied viene accodato prima del load, nessun automatismo può inviare hit con consenso ancora granted", async () => {
  const doc = installFakeBrowser()
  const { activateGa4, updateGa4Consent, isGa4Activated } =
    await freshGa4Module()

  // 1. Consenso analytics=true.
  const grantedPreferences = makePreferences({ analytics: true })

  // 2. activateGa4 avviata, script non ancora caricato.
  const activation = activateGa4("G-TEST123", grantedPreferences)

  assert.equal(
    isGa4Activated(),
    true,
    "isGa4Activated() deve risultare true da subito, anche con lo script ancora in attesa del load",
  )
  assert.equal(doc.appended.length, 1)

  // 3. Il consenso cambia ad analytics=false mentre lo script è ancora in
  // caricamento (equivalente a ciò che fa Ga4MinimalLoader alla ricezione di
  // COOKIE_CONSENT_CHANGED_EVENT quando isGa4Activated() è già true).
  const revokedPreferences = makePreferences({ analytics: false })
  updateGa4Consent("G-TEST123", revokedPreferences)

  // 4. Il consent update denied è accodato subito, ben prima del load.
  const afterRevocation = dataLayerCommands()
  const consentUpdatesBeforeLoad = afterRevocation.filter(
    (c) => c[0] === "consent" && c[1] === "update",
  )

  assert.equal(
    consentUpdatesBeforeLoad.length,
    2,
    "granted iniziale + denied da revoca, entrambi già in coda",
  )
  assert.equal(
    (consentUpdatesBeforeLoad[1]?.[2] as Record<string, string>)
      .analytics_storage,
    "denied",
    "l'update di revoca è accodato con analytics_storage denied prima del load",
  )
  assert.equal(
    (globalThis as unknown as Record<string, unknown>)[
      "ga-disable-G-TEST123"
    ],
    true,
    "ga-disable passa a true sulla revoca, indipendentemente dal load",
  )
  assert.ok(
    !afterRevocation.some((c) => c[0] === "js") &&
      !afterRevocation.some((c) => c[0] === "config"),
    "js/config non sono ancora partiti a questo punto",
  )

  // 5. Dopo il load reale, config parte comunque (Consent Mode non blocca
  // config), ma l'ultimo consent update in coda PRIMA di config è denied, e
  // ga-disable è già true: nessun automatismo di gtag.js può inviare un hit
  // (incluso l'auto page_view) con consenso ancora granted. Il nostro
  // codice, inoltre, non invia più alcun page_view manuale (rimosso).
  firstScript(doc).simulateLoad()
  await activation

  const finalCommands = dataLayerCommands()
  const configIndex = finalCommands.findIndex((c) => c[0] === "config")

  assert.ok(configIndex !== -1, "config deve comunque partire dopo il load")

  const lastConsentStateBeforeConfig = finalCommands
    .slice(0, configIndex)
    .filter((c) => c[0] === "consent" && c[1] === "update")
    .at(-1)?.[2] as Record<string, string>

  assert.equal(
    lastConsentStateBeforeConfig.analytics_storage,
    "denied",
    "al momento in cui config viene processato, il consenso in coda è denied",
  )
  assert.ok(
    !finalCommands.some((c) => c[0] === "event" && c[1] === "page_view"),
    "nessun page_view manuale: la funzione non esiste più nel codice",
  )
})
