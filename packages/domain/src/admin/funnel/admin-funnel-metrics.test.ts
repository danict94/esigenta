import assert from "node:assert/strict"
import test from "node:test"

import {
  buildExitFeedbackBreakdown,
  buildValidationFailureRows,
  computeRate,
  deriveAttributionSource,
  exitFeedbackReasonLabel,
  humanizeStepKey,
  mergeSessionAttribution,
  provenanceLabel,
  resolvePeriodSince,
  resolveStepLabel,
} from "./admin-funnel-metrics"

import type {
  SessionAttributionRow,
  ValidationFailureGroupInput,
} from "./admin-funnel-metrics"

// Solo le funzioni pure sono testate qui, deliberatamente: nessuna tocca
// @esigenta/database, quindi nessuna richiede una connessione Postgres
// reale — stesso vincolo già rispettato dagli altri test di packages/domain
// (vedi packages/domain/src/public/funnel-events/record-funnel-event.test.ts).
// getAdminFunnelMetrics stesso (e le sue query Prisma/raw SQL) non è testato
// qui per lo stesso motivo — non per l'assenza della tabella FunnelEvent
// (nota storica della FASE 6F, ormai superata: la tabella esiste e riceve
// traffico reale in produzione), ma perché richiederebbe una connessione
// Postgres reale, fuori portata per questi test unitari.

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

// --- FASE 9B: mergeSessionAttribution ---

function attributionRow(
  overrides: Partial<SessionAttributionRow> & { funnelSessionId: string },
): SessionAttributionRow {
  return {
    gclid: null,
    gbraid: null,
    wbraid: null,
    utmSource: null,
    attributionStatus: null,
    ...overrides,
  }
}

test("mergeSessionAttribution: sessione solo legacy (solo funnel_started) -> usa l'attribution del funnel_started", () => {
  const started = [
    attributionRow({ funnelSessionId: "s1", gclid: "legacy-click-id" }),
  ]

  const merged = mergeSessionAttribution(started, [])

  assert.deepEqual(merged.get("s1"), started[0])
})

test("mergeSessionAttribution (FASE 9B): sessione V2 (funnel_started + funnel_opened) -> l'attribution di funnel_opened vince sempre, quella di funnel_started viene ignorata", () => {
  const started = [
    attributionRow({ funnelSessionId: "s1", utmSource: "non-dovrebbe-vincere" }),
  ]
  const opened = [
    attributionRow({ funnelSessionId: "s1", gclid: "v2-click-id" }),
  ]

  const merged = mergeSessionAttribution(started, opened)

  assert.deepEqual(merged.get("s1"), opened[0])
})

test("mergeSessionAttribution: sessione con solo funnel_opened (nessun funnel_started) -> usa comunque l'attribution di funnel_opened", () => {
  const opened = [
    attributionRow({ funnelSessionId: "s1", utmSource: "google" }),
  ]

  const merged = mergeSessionAttribution([], opened)

  assert.deepEqual(merged.get("s1"), opened[0])
})

test("mergeSessionAttribution: più sessioni miste (legacy + V2) non si mescolano tra loro", () => {
  const started = [
    attributionRow({ funnelSessionId: "legacy-1", gclid: "legacy-gclid" }),
    attributionRow({ funnelSessionId: "v2-1", utmSource: "non-dovrebbe-vincere" }),
  ]
  const opened = [
    attributionRow({ funnelSessionId: "v2-1", gclid: "v2-gclid" }),
  ]

  const merged = mergeSessionAttribution(started, opened)

  assert.equal(merged.size, 2)
  assert.deepEqual(merged.get("legacy-1"), started[0])
  assert.deepEqual(merged.get("v2-1"), opened[0])
})

test("mergeSessionAttribution: input vuoti -> mappa vuota, mai un throw", () => {
  const merged = mergeSessionAttribution([], [])

  assert.equal(merged.size, 0)
})

test("mergeSessionAttribution + deriveAttributionSource (FASE 9B, verifica end-to-end): una sessione V2 con gclid SOLO su funnel_opened viene classificata google_ads, non 'direct' come accadrebbe leggendo solo funnel_started", () => {
  const started = [attributionRow({ funnelSessionId: "s1" })] // nessuna attribution qui, come una vera riga funnel_started V2
  const opened = [attributionRow({ funnelSessionId: "s1", gclid: "abc" })]

  const merged = mergeSessionAttribution(started, opened)

  assert.equal(deriveAttributionSource(merged.get("s1")!), "google_ads")
})

// --- FASE 9F: buildValidationFailureRows ---

function group(
  overrides: Partial<ValidationFailureGroupInput> & { stepKey: string; eventType: string },
): ValidationFailureGroupInput {
  return {
    count: 0,
    minStepIndex: 0,
    ...overrides,
  }
}

test("buildValidationFailureRows: una riga per step con viewedCount/validationFailedCount/rate corretti", () => {
  const rows = buildValidationFailureRows(
    [
      group({ stepKey: "location", eventType: "step_viewed", count: 10, minStepIndex: 0 }),
      group({ stepKey: "location", eventType: "client_validation_failed", count: 3, minStepIndex: 0 }),
    ],
    (stepKey) => `Label(${stepKey})`,
  )

  assert.deepEqual(rows, [
    {
      stepKey: "location",
      stepLabel: "Label(location)",
      stepIndex: 0,
      viewedCount: 10,
      validationFailedCount: 3,
      validationFailureRate: 0.3,
    },
  ])
})

test("buildValidationFailureRows: step visualizzato ma senza alcun client_validation_failed -> validationFailedCount 0, rate 0 (mai omesso)", () => {
  const rows = buildValidationFailureRows(
    [group({ stepKey: "contact", eventType: "step_viewed", count: 5, minStepIndex: 3 })],
    (stepKey) => stepKey,
  )

  assert.deepEqual(rows, [
    {
      stepKey: "contact",
      stepLabel: "contact",
      stepIndex: 3,
      viewedCount: 5,
      validationFailedCount: 0,
      validationFailureRate: 0,
    },
  ])
})

test("buildValidationFailureRows: viewedCount 0 -> rate 0, mai NaN/Infinity (computeRate riusato, non reimplementato)", () => {
  const rows = buildValidationFailureRows(
    [group({ stepKey: "contact", eventType: "client_validation_failed", count: 2, minStepIndex: 3 })],
    (stepKey) => stepKey,
  )

  assert.equal(rows[0]?.viewedCount, 0)
  assert.equal(rows[0]?.validationFailedCount, 2)
  assert.equal(rows[0]?.validationFailureRate, 0)
  assert.ok(Number.isFinite(rows[0]?.validationFailureRate))
})

test("buildValidationFailureRows: più step vengono ordinati per stepIndex crescente, mai per ordine di arrivo dei gruppi", () => {
  const rows = buildValidationFailureRows(
    [
      group({ stepKey: "contact", eventType: "step_viewed", count: 4, minStepIndex: 5 }),
      group({ stepKey: "location", eventType: "step_viewed", count: 10, minStepIndex: 0 }),
      group({ stepKey: "photos", eventType: "step_viewed", count: 7, minStepIndex: 2 }),
    ],
    (stepKey) => stepKey,
  )

  assert.deepEqual(
    rows.map((row) => row.stepKey),
    ["location", "photos", "contact"],
  )
})

test("buildValidationFailureRows: input vuoto -> array vuoto, mai un throw", () => {
  assert.deepEqual(buildValidationFailureRows([], (stepKey) => stepKey), [])
})

test("buildValidationFailureRows: un eventType estraneo (difensivo) viene ignorato, mai fatto contare come viewed o validationFailed", () => {
  const rows = buildValidationFailureRows(
    [
      group({ stepKey: "location", eventType: "step_viewed", count: 10, minStepIndex: 0 }),
      group({ stepKey: "location", eventType: "step_completed", count: 999, minStepIndex: 0 }),
    ],
    (stepKey) => stepKey,
  )

  assert.equal(rows[0]?.viewedCount, 10)
  assert.equal(rows[0]?.validationFailedCount, 0)
})

// --- FASE 9K.1: exitFeedbackReasonLabel + buildExitFeedbackBreakdown ---

test("exitFeedbackReasonLabel: le 7 etichette sono stabili e distinte", () => {
  const labels = [
    exitFeedbackReasonLabel("just_browsing"),
    exitFeedbackReasonLabel("too_many_questions"),
    exitFeedbackReasonLabel("dont_know_what_to_choose"),
    exitFeedbackReasonLabel("dont_want_to_share_contact"),
    exitFeedbackReasonLabel("want_cost_first"),
    exitFeedbackReasonLabel("not_ready"),
    exitFeedbackReasonLabel("other"),
  ]

  assert.deepEqual(labels, [
    "Stavo solo dando un'occhiata",
    "Ci sono troppe domande",
    "Non so cosa scegliere",
    "Preferisco non lasciare i miei dati",
    "Vorrei prima capire quanto può costare",
    "Non sono ancora pronto",
    "Altro motivo",
  ])
  assert.equal(new Set(labels).size, labels.length)
})

test("buildExitFeedbackBreakdown: input vuoto -> tutti e 7 i reasonCode presenti a 0 e byOrigin a 0, mai un elenco che appare/scompare in base ai dati", () => {
  const { reasons, byOrigin } = buildExitFeedbackBreakdown(
    [],
    new Set(),
    (stepKey) => stepKey,
  )

  assert.equal(reasons.length, 7)
  assert.ok(reasons.every((row) => row.sessionCount === 0))
  assert.ok(reasons.every((row) => row.percentage === 0))
  assert.ok(reasons.every((row) => row.byStep.length === 0))
  assert.deepEqual(byOrigin, { preStart: 0, started: 0 })
  assert.deepEqual(
    new Set(reasons.map((row) => row.reasonCode)),
    new Set([
      "just_browsing",
      "too_many_questions",
      "dont_know_what_to_choose",
      "dont_want_to_share_contact",
      "want_cost_first",
      "not_ready",
      "other",
    ]),
  )
})

test("buildExitFeedbackBreakdown: sessionCount/percentage corretti, denominatore = totale reale di sessioni con feedback (mai il numero di reasonCode possibili)", () => {
  const { reasons } = buildExitFeedbackBreakdown(
    [
      { funnelSessionId: "s1", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s2", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s3", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s4", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s5", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s6", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s7", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s8", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s9", reasonCode: "dont_want_to_share_contact", stepKey: "location" },
      { funnelSessionId: "s10", reasonCode: "want_cost_first", stepKey: "location" },
    ],
    new Set(),
    (stepKey) => stepKey,
  )

  const contactRefusal = reasons.find((row) => row.reasonCode === "dont_want_to_share_contact")
  const wantCost = reasons.find((row) => row.reasonCode === "want_cost_first")
  const other = reasons.find((row) => row.reasonCode === "other")

  assert.equal(contactRefusal?.sessionCount, 9)
  assert.equal(contactRefusal?.percentage, 0.9)
  assert.equal(wantCost?.sessionCount, 1)
  assert.ok(Math.abs((wantCost?.percentage ?? 0) - 0.1) < 1e-9)
  assert.equal(other?.sessionCount, 0)
  assert.equal(other?.percentage, 0)
})

test("buildExitFeedbackBreakdown: breakdown per step aggregato correttamente, ordinato per sessionCount decrescente (esempio del brief: Contact 8, altri step 1)", () => {
  const { reasons } = buildExitFeedbackBreakdown(
    [
      { funnelSessionId: "s1", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s2", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s3", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s4", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s5", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s6", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s7", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s8", reasonCode: "dont_want_to_share_contact", stepKey: "contact" },
      { funnelSessionId: "s9", reasonCode: "dont_want_to_share_contact", stepKey: "location" },
    ],
    new Set(),
    (stepKey) => (stepKey === "contact" ? "Contact" : stepKey),
  )

  const row = reasons.find((r) => r.reasonCode === "dont_want_to_share_contact")

  assert.deepEqual(row?.byStep, [
    { stepKey: "contact", stepLabel: "Contact", sessionCount: 8 },
    { stepKey: "location", stepLabel: "location", sessionCount: 1 },
  ])
})

test("buildExitFeedbackBreakdown: righe ordinate per sessionCount decrescente", () => {
  const { reasons } = buildExitFeedbackBreakdown(
    [
      { funnelSessionId: "s1", reasonCode: "not_ready", stepKey: "photos" },
      { funnelSessionId: "s2", reasonCode: "not_ready", stepKey: "photos" },
      { funnelSessionId: "s3", reasonCode: "just_browsing", stepKey: "location" },
      { funnelSessionId: "s4", reasonCode: "just_browsing", stepKey: "location" },
      { funnelSessionId: "s5", reasonCode: "just_browsing", stepKey: "location" },
      { funnelSessionId: "s6", reasonCode: "just_browsing", stepKey: "location" },
      { funnelSessionId: "s7", reasonCode: "just_browsing", stepKey: "location" },
    ],
    new Set(),
    (stepKey) => stepKey,
  )

  assert.equal(reasons[0]?.reasonCode, "just_browsing")
  assert.equal(reasons[1]?.reasonCode, "not_ready")
})

test("buildExitFeedbackBreakdown: reasonCode non riconosciuto (difensivo, non dovrebbe mai accadere) -> confluisce in 'other', mai perso dal totale", () => {
  const { reasons } = buildExitFeedbackBreakdown(
    [{ funnelSessionId: "s1", reasonCode: "un-valore-mai-esistito", stepKey: "location" }],
    new Set(),
    (stepKey) => stepKey,
  )

  const other = reasons.find((row) => row.reasonCode === "other")

  assert.equal(other?.sessionCount, 1)
  assert.equal(other?.percentage, 1)
})

test("buildExitFeedbackBreakdown: reasonCode null (difensivo) -> confluisce in 'other', mai un throw", () => {
  const { reasons } = buildExitFeedbackBreakdown(
    [{ funnelSessionId: "s1", reasonCode: null, stepKey: "location" }],
    new Set(),
    (stepKey) => stepKey,
  )

  const other = reasons.find((row) => row.reasonCode === "other")

  assert.equal(other?.sessionCount, 1)
})

// --- FASE 9K.1: distinzione preStart/started ---

test("buildExitFeedbackBreakdown (FASE 9K.1): sessione con SOLO funnel_opened (assente da startedSessionIds) -> preStart, mai started", () => {
  const { byOrigin } = buildExitFeedbackBreakdown(
    [{ funnelSessionId: "s1", reasonCode: "just_browsing", stepKey: "" }],
    new Set(), // nessuna sessione avviata
    (stepKey) => stepKey,
  )

  assert.deepEqual(byOrigin, { preStart: 1, started: 0 })
})

test("buildExitFeedbackBreakdown (FASE 9K.1): sessione presente in startedSessionIds -> started, mai preStart", () => {
  const { byOrigin } = buildExitFeedbackBreakdown(
    [{ funnelSessionId: "s1", reasonCode: "not_ready", stepKey: "contact" }],
    new Set(["s1"]),
    (stepKey) => stepKey,
  )

  assert.deepEqual(byOrigin, { preStart: 0, started: 1 })
})

test("buildExitFeedbackBreakdown (FASE 9K.1): mix di sessioni preStart e started viene ripartito correttamente, indipendentemente dal reasonCode", () => {
  const { byOrigin, reasons } = buildExitFeedbackBreakdown(
    [
      { funnelSessionId: "opened-only-1", reasonCode: "just_browsing", stepKey: "" },
      { funnelSessionId: "opened-only-2", reasonCode: "other", stepKey: "location" },
      { funnelSessionId: "started-1", reasonCode: "not_ready", stepKey: "contact" },
    ],
    new Set(["started-1"]),
    (stepKey) => stepKey,
  )

  assert.deepEqual(byOrigin, { preStart: 2, started: 1 })
  // La ripartizione preStart/started è ortogonale al reasonCode: il totale
  // per reasonCode (usato da percentage/byStep) resta 3, invariato.
  const totalAcrossReasons = reasons.reduce((sum, row) => sum + row.sessionCount, 0)
  assert.equal(totalAcrossReasons, 3)
})

// --- deriveSessionStatus: rimossa in FASE 9D, sostituita da
// classifySessionStatus (funnel-session-status-policy.ts, test in
// funnel-session-status-policy.test.ts) — la vecchia euristica basata
// solo sulla presenza di eventType, senza alcuna nozione di tempo/
// inattività, non rifletteva più la semantica CONVERTED/IN_PROGRESS/
// ABANDONED richiesta. Vedi il report FASE 9D.
