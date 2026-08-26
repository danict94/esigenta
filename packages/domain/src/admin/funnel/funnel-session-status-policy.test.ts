import assert from "node:assert/strict"
import test from "node:test"

import {
  classifySessionStatus,
  computeSessionRates,
  FUNNEL_ABANDONMENT_INACTIVITY_MINUTES,
  MEANINGFUL_ACTIVITY_EVENT_TYPES,
  summarizeSessionStatuses,
} from "./funnel-session-status-policy"

// Tutti i test qui sono puri: nessuno tocca @esigenta/database, stesso
// vincolo già rispettato dagli altri test di packages/domain (vedi
// admin-funnel-metrics.test.ts). NOW è sempre un'istanza fissa passata
// esplicitamente, mai `new Date()` dentro un test — determinismo totale.

const NOW = new Date("2026-08-25T12:00:00.000Z")

function minutesBefore(now: Date, minutes: number): Date {
  return new Date(now.getTime() - minutes * 60_000)
}

// --- MEANINGFUL_ACTIVITY_EVENT_TYPES ---

test("MEANINGFUL_ACTIVITY_EVENT_TYPES: contiene esattamente funnel_started/step_viewed/step_completed/client_validation_failed/submit_started/submit_failed/request_created", () => {
  assert.deepEqual(
    [...MEANINGFUL_ACTIVITY_EVENT_TYPES].sort(),
    [
      "client_validation_failed",
      "funnel_started",
      "request_created",
      "step_completed",
      "step_viewed",
      "submit_failed",
      "submit_started",
    ].sort(),
  )
})

test("MEANINGFUL_ACTIVITY_EVENT_TYPES: NON include funnel_opened (il mount automatico, mai attività reale — FASE 9A)", () => {
  assert.ok(!MEANINGFUL_ACTIVITY_EVENT_TYPES.includes("funnel_opened"))
})

// FASE 9I — RISOLTO: la domanda lasciata aperta in FASE 9H è stata
// decisa nel senso OPPOSTO a client_validation_failed. exit_feedback_submitted
// è ora esplicitamente ESCLUSO da MEANINGFUL_ACTIVITY_EVENT_TYPES: non deve
// mai prolungare IN_PROGRESS come una normale attività — vedi
// classifySessionStatus più sotto per il trattamento dedicato
// (ABANDONED immediato, senza attendere i 30 minuti).
test("MEANINGFUL_ACTIVITY_EVENT_TYPES (FASE 9I, deciso): NON include exit_feedback_submitted — non è attività generica che prolunga la sessione", () => {
  assert.ok(!MEANINGFUL_ACTIVITY_EVENT_TYPES.includes("exit_feedback_submitted"))
})

// FASE 9F — confermato esplicitamente: un tentativo di "Avanti"/"Prepara
// richiesta" bloccato dalla validazione client è un segnale di
// coinvolgimento attivo forte quanto (se non più di) un semplice
// step_viewed passivo — un utente che digita, corregge e ritenta è
// palesemente ancora "in corso", non "abbandonato". L'inclusione era già
// derivata automaticamente da FUNNEL_EVENT_TYPES (nessun cambiamento di
// comportamento in questa fase, vedi il report FASE 9F) — questo test la
// rende un fatto esplicito e verificato, non solo implicito.
test("MEANINGFUL_ACTIVITY_EVENT_TYPES (FASE 9F, confermato intenzionale): INCLUDE client_validation_failed — un tentativo bloccato dalla validazione è comunque attività reale dell'utente, non deve far scadere prematuramente la sessione a ABANDONED", () => {
  assert.ok(MEANINGFUL_ACTIVITY_EVENT_TYPES.includes("client_validation_failed"))
})

// --- Test A-E richiesti dallo scope FASE 9D ---

test("Test A: sessione avviata 30 secondi fa, nessun request_created -> IN_PROGRESS", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    lastMeaningfulActivityAt: minutesBefore(NOW, 0.5), // 30 secondi
    now: NOW,
  })

  assert.equal(status, "in_progress")
})

test("Test B: sessione avviata da tempo ma con ultima attività recente -> IN_PROGRESS (usa l'ultima attività, non startedAt)", () => {
  // Simula: la sessione è "vecchia" (l'unico dato che classifySessionStatus
  // riceve però è lastMeaningfulActivityAt, non uno startedAt separato —
  // la funzione non deve MAI ricevere/usare startedAt, per costruzione
  // della sua stessa firma) — qui l'ultima attività reale è 5 minuti fa,
  // ben dentro la soglia, anche se la sessione fosse "iniziata" ore prima.
  const status = classifySessionStatus({
    hasConverted: false,
    lastMeaningfulActivityAt: minutesBefore(NOW, 5),
    now: NOW,
  })

  assert.equal(status, "in_progress")
})

test("Test C: nessuna attività da oltre la soglia, nessun request_created -> ABANDONED", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    lastMeaningfulActivityAt: minutesBefore(
      NOW,
      FUNNEL_ABANDONMENT_INACTIVITY_MINUTES + 1,
    ),
    now: NOW,
  })

  assert.equal(status, "abandoned")
})

test("Test D: sessione vecchia (ultima attività ben oltre la soglia) ma con request_created -> CONVERTED", () => {
  const status = classifySessionStatus({
    hasConverted: true,
    lastMeaningfulActivityAt: minutesBefore(NOW, 60 * 24 * 7), // una settimana fa
    now: NOW,
  })

  assert.equal(status, "converted")
})

test("Test E: converted ha precedenza anche se l'ultima attività è inattiva da tempo (già coperto da D, verificato di nuovo esplicitamente al confine della soglia)", () => {
  const status = classifySessionStatus({
    hasConverted: true,
    lastMeaningfulActivityAt: minutesBefore(
      NOW,
      FUNNEL_ABANDONMENT_INACTIVITY_MINUTES + 1,
    ),
    now: NOW,
  })

  assert.equal(status, "converted", "hasConverted vince sempre, indipendentemente da lastMeaningfulActivityAt")
})

// --- FASE 9I: exit_feedback_submitted -> ABANDONED immediato ---

test("FASE 9I: hasExitFeedback=true, non converted, attività recentissima (30 secondi) -> ABANDONED comunque, MAI IN_PROGRESS — la regola centrale di questo scope", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    hasExitFeedback: true,
    lastMeaningfulActivityAt: minutesBefore(NOW, 0.5),
    now: NOW,
  })

  assert.equal(
    status,
    "abandoned",
    "exit_feedback_submitted non deve mai essere trattato come attività che prolunga IN_PROGRESS",
  )
})

test("FASE 9I: hasExitFeedback=true insieme a hasConverted=true -> CONVERTED (converted resta precedenza assoluta)", () => {
  const status = classifySessionStatus({
    hasConverted: true,
    hasExitFeedback: true,
    lastMeaningfulActivityAt: minutesBefore(NOW, 0.5),
    now: NOW,
  })

  assert.equal(status, "converted")
})

test("FASE 9I: hasExitFeedback=true anche con lastMeaningfulActivityAt null -> ABANDONED, non INVALID (l'esito è definitivo, non serve alcuna attività per determinarlo)", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    hasExitFeedback: true,
    lastMeaningfulActivityAt: null,
    now: NOW,
  })

  assert.equal(status, "abandoned")
})

test("FASE 9I: hasExitFeedback assente (default false) -> comportamento invariato rispetto a prima di questa fase", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    lastMeaningfulActivityAt: minutesBefore(NOW, 0.5),
    now: NOW,
  })

  assert.equal(status, "in_progress")
})

test("FASE 9I: hasExitFeedback=false esplicito, nessuna attività da oltre la soglia -> ABANDONED per la normale policy dei 30 minuti, non per l'exit feedback", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    hasExitFeedback: false,
    lastMeaningfulActivityAt: minutesBefore(
      NOW,
      FUNNEL_ABANDONMENT_INACTIVITY_MINUTES + 1,
    ),
    now: NOW,
  })

  assert.equal(status, "abandoned")
})

test("classifySessionStatus: al confine esatto della soglia (elapsed === threshold) -> ABANDONED (< stretto, non <=)", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    lastMeaningfulActivityAt: minutesBefore(
      NOW,
      FUNNEL_ABANDONMENT_INACTIVITY_MINUTES,
    ),
    now: NOW,
  })

  assert.equal(status, "abandoned")
})

test("classifySessionStatus: appena un istante prima del confine -> IN_PROGRESS", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    lastMeaningfulActivityAt: new Date(
      minutesBefore(NOW, FUNNEL_ABANDONMENT_INACTIVITY_MINUTES).getTime() + 1,
    ),
    now: NOW,
  })

  assert.equal(status, "in_progress")
})

test("classifySessionStatus: lastMeaningfulActivityAt null e non converted -> INVALID (anomalia difensiva, mai confusa con 'abandoned')", () => {
  const status = classifySessionStatus({
    hasConverted: false,
    lastMeaningfulActivityAt: null,
    now: NOW,
  })

  assert.equal(status, "invalid")
})

test("classifySessionStatus: soglia personalizzata (inactivityThresholdMinutes) sovrascrive il default, mai hardcoded altrove", () => {
  const justOverOneMinute = new Date(NOW.getTime() - 61_000)

  assert.equal(
    classifySessionStatus({
      hasConverted: false,
      lastMeaningfulActivityAt: justOverOneMinute,
      now: NOW,
      inactivityThresholdMinutes: 1,
    }),
    "abandoned",
  )

  assert.equal(
    classifySessionStatus({
      hasConverted: false,
      lastMeaningfulActivityAt: justOverOneMinute,
      now: NOW,
      // default reale (30 minuti): la stessa attività risulta ancora in corso
    }),
    "in_progress",
  )
})

// --- Test G: totalStarted = converted + inProgress + abandoned (+ invalid) ---

test("Test G: summarizeSessionStatuses partiziona ogni stato in esattamente un bucket — la somma dei bucket è sempre uguale alla lunghezza dell'input", () => {
  const statuses = [
    "converted",
    "converted",
    "in_progress",
    "abandoned",
    "abandoned",
    "abandoned",
    "invalid",
  ] as const

  const counts = summarizeSessionStatuses([...statuses])

  assert.deepEqual(counts, {
    totalConverted: 2,
    totalInProgress: 1,
    totalAbandoned: 3,
    totalInvalid: 1,
  })

  const sum =
    counts.totalConverted +
    counts.totalInProgress +
    counts.totalAbandoned +
    counts.totalInvalid

  assert.equal(sum, statuses.length, "totalStarted = converted + inProgress + abandoned + invalid, sempre")
})

test("summarizeSessionStatuses: input vuoto -> tutti i bucket a zero, mai un throw", () => {
  assert.deepEqual(summarizeSessionStatuses([]), {
    totalConverted: 0,
    totalInProgress: 0,
    totalAbandoned: 0,
    totalInvalid: 0,
  })
})

test("summarizeSessionStatuses: totalInvalid è sempre esposto, anche a zero (mai nascosto)", () => {
  const counts = summarizeSessionStatuses(["converted", "abandoned"])

  assert.equal(counts.totalInvalid, 0)
  assert.ok("totalInvalid" in counts)
})

// --- Test K: Aperture funnel non entra nei denominatori dei rate ---

test("Test K: computeSessionRates ha una firma che NON accetta totalOpened/totalStarted — per costruzione non possono mai entrare nel denominatore dei rate", () => {
  // Nessun valore di totalOpened/totalStarted, per quanto grande, può
  // influenzare l'output: la funzione non lo riceve nemmeno come
  // parametro. Qui lo dimostriamo passando SOLO converted/abandoned e
  // verificando che il risultato dipenda esclusivamente da questi due.
  const computeRate = (numerator: number, denominator: number) =>
    denominator <= 0 ? 0 : numerator / denominator

  const rates = computeSessionRates(
    { totalConverted: 3, totalAbandoned: 1 },
    computeRate,
  )

  assert.equal(rates.resolvedSessions, 4, "totalOpened non fa parte del calcolo, in nessun punto")
  assert.equal(rates.conversionRate, 0.75)
  assert.equal(rates.abandonmentRate, 0.25)
})

test("computeSessionRates: totalInProgress non è nemmeno un parametro accettato — le sessioni in corso non intaccano i rate", () => {
  const computeRate = (numerator: number, denominator: number) =>
    denominator <= 0 ? 0 : numerator / denominator

  // Stessi converted/abandoned di prima: il risultato è identico
  // indipendentemente da quante sessioni in_progress esistano altrove
  // (non c'è alcun modo di comunicarle a questa funzione).
  const rates = computeSessionRates(
    { totalConverted: 3, totalAbandoned: 1 },
    computeRate,
  )

  assert.equal(rates.resolvedSessions, 4)
})

// --- Test L: resolvedSessions = 0 gestito senza NaN/Infinity ---

test("Test L: resolvedSessions = 0 (nessuna sessione risolta) -> rate a 0, mai NaN/Infinity", () => {
  const computeRate = (numerator: number, denominator: number) =>
    denominator <= 0 ? 0 : numerator / denominator

  const rates = computeSessionRates(
    { totalConverted: 0, totalAbandoned: 0 },
    computeRate,
  )

  assert.equal(rates.resolvedSessions, 0)
  assert.equal(rates.conversionRate, 0)
  assert.equal(rates.abandonmentRate, 0)
  assert.ok(Number.isFinite(rates.conversionRate))
  assert.ok(Number.isFinite(rates.abandonmentRate))
})
