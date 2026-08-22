import assert from "node:assert/strict"
import test from "node:test"

import {
  computeRate,
  deriveAttributionSource,
  deriveSessionStatus,
  humanizeStepKey,
  provenanceLabel,
  resolvePeriodSince,
  resolveStepLabel,
} from "./admin-funnel-metrics"

// Solo le funzioni pure sono testate qui, deliberatamente: nessuna tocca
// @esigenta/database, quindi nessuna richiede una connessione Postgres
// reale — stesso vincolo già rispettato dagli altri test di packages/domain
// (vedi packages/domain/src/public/funnel-events/record-funnel-event.test.ts).
// getAdminFunnelMetrics stesso (e le sue query Prisma/raw SQL) non è
// testato qui: la tabella FunnelEvent non esiste ancora in nessun database
// (migrazione non applicata, vedi report FASE 6F, "Residui per FASE 6G").

// --- resolvePeriodSince ---

test("resolvePeriodSince: 'all' o assente -> undefined (nessun filtro temporale)", () => {
  const now = new Date("2026-08-21T12:00:00.000Z")

  assert.equal(resolvePeriodSince("all", now), undefined)
  assert.equal(resolvePeriodSince(undefined, now), undefined)
})

test("resolvePeriodSince: '7d'/'30d'/'90d' -> now meno N giorni esatti", () => {
  const now = new Date("2026-08-21T12:00:00.000Z")

  assert.equal(
    resolvePeriodSince("7d", now)?.toISOString(),
    "2026-08-14T12:00:00.000Z",
  )
  assert.equal(
    resolvePeriodSince("30d", now)?.toISOString(),
    "2026-07-22T12:00:00.000Z",
  )
  assert.equal(
    resolvePeriodSince("90d", now)?.toISOString(),
    "2026-05-23T12:00:00.000Z",
  )
})

// --- computeRate ---

test("computeRate: divisione normale", () => {
  assert.equal(computeRate(25, 100), 0.25)
})

test("computeRate: denominatore zero o negativo -> 0, mai un throw/NaN/Infinity", () => {
  assert.equal(computeRate(5, 0), 0)
  assert.equal(computeRate(0, 0), 0)
  assert.equal(computeRate(5, -1), 0)
})

// --- humanizeStepKey ---

test("humanizeStepKey: id kebab-case/namespaced -> testo leggibile", () => {
  assert.equal(humanizeStepKey("location"), "Location")
  assert.equal(humanizeStepKey("tetti:rifare-tetto:tipo-lavoro"), "Tetti Rifare Tetto Tipo Lavoro")
})

test("humanizeStepKey: stringa vuota (sentinel funnel_started/request_created) -> etichetta dedicata, mai vuota", () => {
  assert.equal(humanizeStepKey(""), "Avvio funnel")
})

// --- resolveStepLabel ---

test("resolveStepLabel: interventionSlug reale e stepKey noto -> la domanda reale del modello", () => {
  assert.equal(
    resolveStepLabel("location", "rifare-tetto"),
    "Dove devi eseguire il lavoro?",
  )
})

test("resolveStepLabel: senza interventionSlug -> fallback umanizzato, nessun accesso al modello", () => {
  assert.equal(resolveStepLabel("location"), "Location")
})

test("resolveStepLabel: interventionSlug reale ma stepKey non presente in quel modello -> fallback umanizzato, mai un throw", () => {
  assert.equal(
    resolveStepLabel("uno-stepKey-mai-esistito", "rifare-tetto"),
    "Uno StepKey Mai Esistito",
  )
})

test("resolveStepLabel: interventionSlug sconosciuto -> risolve comunque (modello di default), mai un throw", () => {
  assert.equal(
    resolveStepLabel("location", "intervento-che-non-esiste"),
    "Dove devi eseguire il lavoro?",
  )
})

// --- provenanceLabel ---

test("provenanceLabel: le 4 etichette sono stabili e distinte (FASE 7E aggiunge 'unknown')", () => {
  const labels = new Set([
    provenanceLabel("google_ads"),
    provenanceLabel("campaign"),
    provenanceLabel("direct"),
    provenanceLabel("unknown"),
  ])

  assert.equal(labels.size, 4)
})

// --- deriveAttributionSource ---

test("deriveAttributionSource: gclid/gbraid/wbraid presente -> google_ads, anche insieme a utmSource", () => {
  assert.equal(deriveAttributionSource({ gclid: "abc" }), "google_ads")
  assert.equal(deriveAttributionSource({ gbraid: "abc" }), "google_ads")
  assert.equal(deriveAttributionSource({ wbraid: "abc" }), "google_ads")
  assert.equal(
    deriveAttributionSource({ gclid: "abc", utmSource: "google" }),
    "google_ads",
    "gclid vince su utmSource quando entrambi presenti",
  )
})

test("deriveAttributionSource: solo utmSource -> campaign", () => {
  assert.equal(deriveAttributionSource({ utmSource: "newsletter" }), "campaign")
})

test("deriveAttributionSource: nessun campo attribution -> direct", () => {
  assert.equal(deriveAttributionSource({}), "direct")
  assert.equal(
    deriveAttributionSource({ gclid: null, gbraid: null, wbraid: null, utmSource: null }),
    "direct",
  )
})

// --- FASE 7E: attributionStatus "unknown" ---

test("deriveAttributionSource (FASE 7E): attributionStatus 'unknown' -> unknown, anche se per errore fossero presenti campi attribution (non dovrebbe succedere mai in pratica, ma la precedenza deve restare esplicita)", () => {
  assert.equal(
    deriveAttributionSource({ attributionStatus: "unknown" }),
    "unknown",
  )
  assert.equal(
    deriveAttributionSource({ gclid: "abc", attributionStatus: "unknown" }),
    "unknown",
    "unknown vince sempre, indipendentemente da cosa contengono gli altri campi",
  )
})

test("deriveAttributionSource (FASE 7E): attributionStatus 'resolved' o assente -> comportamento invariato, mai 'unknown'", () => {
  assert.equal(
    deriveAttributionSource({ gclid: "abc", attributionStatus: "resolved" }),
    "google_ads",
  )
  assert.equal(
    deriveAttributionSource({ attributionStatus: "resolved" }),
    "direct",
  )
  assert.equal(
    deriveAttributionSource({}),
    "direct",
    "un campo attributionStatus del tutto assente (riga scritta prima della FASE 7E) non deve mai risultare 'unknown'",
  )
})

// --- deriveSessionStatus ---

test("deriveSessionStatus: request_created presente -> converted, indipendentemente da altri eventi", () => {
  assert.equal(
    deriveSessionStatus(["funnel_started", "step_viewed", "submit_started", "request_created"]),
    "converted",
  )
})

test("deriveSessionStatus: submit_started senza request_created -> submitting", () => {
  assert.equal(
    deriveSessionStatus(["funnel_started", "step_viewed", "submit_started", "submit_failed"]),
    "submitting",
  )
})

test("deriveSessionStatus: né submit né request_created -> abandoned", () => {
  assert.equal(deriveSessionStatus(["funnel_started", "step_viewed"]), "abandoned")
  assert.equal(deriveSessionStatus([]), "abandoned")
})
