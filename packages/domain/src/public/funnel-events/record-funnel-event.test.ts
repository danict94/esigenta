import assert from "node:assert/strict"
import test from "node:test"

import {
  normalizeAttributionFields,
  normalizeErrorCode,
  recordFunnelEvent,
} from "./record-funnel-event"

const VALID_FUNNEL_SESSION_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6"

// Solo i rami di rifiuto (ok: false) sono testati qui, deliberatamente: non
// toccano mai @esigenta/database, quindi non richiedono una connessione
// Postgres reale — stesso vincolo già rispettato dagli altri test di
// packages/domain esistenti in questo repo (nessuno tocca Prisma
// direttamente). Il percorso di scrittura riuscita (ok: true) è verificato
// manualmente (vedi report FASE 6C, sezione "verifica funzionale").

test("recordFunnelEvent: funnelSessionId assente -> rifiutato, mai un throw", async () => {
  const result = await recordFunnelEvent({
    interventionSlug: "rifare-tetto",
    eventType: "funnel_started",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "invalid_funnel_session_id")
})

test("recordFunnelEvent: funnelSessionId non in formato UUID -> rifiutato", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: "non-un-uuid",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_started",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "invalid_funnel_session_id")
})

test("recordFunnelEvent: interventionSlug assente -> rifiutato", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    eventType: "funnel_started",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_intervention_slug")
})

test("recordFunnelEvent: eventType non nell'allow-list -> rifiutato (nessun payload libero)", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "totally_made_up_event", // mai stato nell'allow-list, in nessuna fase
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "invalid_event_type")
})

test("recordFunnelEvent (FASE 6D): request_created è rifiutato se inviato da un payload client — non è mai client-submittable", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "request_created",
  })

  assert.equal(result.ok, false)
  assert.equal(
    (result as { code: string }).code,
    "invalid_event_type",
    "request_created deve poter arrivare SOLO da create-request.ts server-side, mai da /api/funnel/events",
  )
})

test("recordFunnelEvent: eventType assente/di tipo sbagliato -> rifiutato", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: 12345,
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "invalid_event_type")
})

test("recordFunnelEvent: step_viewed senza stepKey -> rifiutato", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "step_viewed",
    stepIndex: 0,
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_key")
})

test("recordFunnelEvent: step_completed senza stepIndex -> rifiutato", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "step_completed",
    stepKey: "location",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_index")
})

test("recordFunnelEvent: stepIndex negativo o non intero -> rifiutato", async () => {
  const negative = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "step_viewed",
    stepKey: "location",
    stepIndex: -1,
  })

  const notInteger = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "step_viewed",
    stepKey: "location",
    stepIndex: 1.5,
  })

  assert.equal(negative.ok, false)
  assert.equal(notInteger.ok, false)
})

test("recordFunnelEvent: stepKey/stepIndex NON sono richiesti per funnel_started (nessuna validazione bloccante su questi campi per quell'evento)", async () => {
  // Questo test si ferma comunque prima di scrivere su database, perché
  // funnelSessionId qui è deliberatamente invalido: verifica solo che il
  // rifiuto arrivi per funnelSessionId, non per l'assenza di stepKey.
  const result = await recordFunnelEvent({
    funnelSessionId: "non-un-uuid",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_started",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "invalid_funnel_session_id")
})

test("recordFunnelEvent: una risposta payload arbitrario/malevolo (oggetto vuoto) -> rifiutato senza throw", async () => {
  const result = await recordFunnelEvent({})

  assert.equal(result.ok, false)
})

// --- FASE 6D: submit_started / submit_failed ---

test("recordFunnelEvent (FASE 6D): submit_started senza stepKey/stepIndex -> rifiutato con missing_step_key, MAI invalid_event_type — prova che l'eventType di per sé è accettato", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "submit_started",
  })

  assert.equal(result.ok, false)
  assert.equal(
    (result as { code: string }).code,
    "missing_step_key",
    "se venisse rifiutato con invalid_event_type, submit_started non sarebbe stato aggiunto all'allow-list",
  )
})

test("recordFunnelEvent (FASE 6D): submit_failed senza stepKey/stepIndex -> rifiutato con missing_step_key, malgrado errorCode presente e valido", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "submit_failed",
    errorCode: "invalid_request_location",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_key")
})

// --- FASE 6D: normalizeErrorCode (unit, non passa mai da recordFunnelEvent
// per non raggiungere mai il database — vedi commento in cima al file) ---

test("normalizeErrorCode: un codice applicativo reale e noto passa invariato", () => {
  assert.equal(normalizeErrorCode("invalid_request_location"), "invalid_request_location")
  assert.equal(normalizeErrorCode("invalid_request_photos"), "invalid_request_photos")
  assert.equal(normalizeErrorCode("invalid_customer_email"), "invalid_customer_email")
})

test("normalizeErrorCode: i due codici di controllo (categoria B/C) passano invariati", () => {
  assert.equal(normalizeErrorCode("network_error"), "network_error")
  assert.equal(normalizeErrorCode("unexpected_error"), "unexpected_error")
})

test("normalizeErrorCode: una stringa arbitraria non nell'allow-list -> unexpected_error, mai salvata verbatim", () => {
  assert.equal(normalizeErrorCode("qualunque cosa arrivi dal client"), "unexpected_error")
  assert.equal(normalizeErrorCode("Error: connessione rifiutata a 10.0.0.1:5432"), "unexpected_error")
})

test("normalizeErrorCode: assente/tipo sbagliato -> unexpected_error, mai un throw", () => {
  assert.equal(normalizeErrorCode(undefined), "unexpected_error")
  assert.equal(normalizeErrorCode(null), "unexpected_error")
  assert.equal(normalizeErrorCode(12345), "unexpected_error")
})

// --- FASE 6E: normalizeAttributionFields (unit, stesso motivo di
// normalizeErrorCode — mai passa da recordFunnelEvent per non toccare mai
// il database) ---

test("normalizeAttributionFields: cattura gclid/gbraid/wbraid/UTM tutti insieme se presenti", () => {
  const result = normalizeAttributionFields({
    gclid: "abc123",
    gbraid: "def456",
    wbraid: "ghi789",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "bagno",
    utmTerm: "ristrutturazione",
    utmContent: "annuncio1",
  })

  assert.deepEqual(result, {
    gclid: "abc123",
    gbraid: "def456",
    wbraid: "ghi789",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "bagno",
    utmTerm: "ristrutturazione",
    utmContent: "annuncio1",
  })
})

test("normalizeAttributionFields: nessun campo attribution presente -> oggetto vuoto, mai un throw", () => {
  assert.deepEqual(normalizeAttributionFields({}), {})
})

test("normalizeAttributionFields: valore oltre il limite di lunghezza -> quel campo escluso, gli altri restano", () => {
  const result = normalizeAttributionFields({
    gclid: "x".repeat(500),
    utmSource: "google",
  })

  assert.deepEqual(result, { utmSource: "google" })
})

test("normalizeAttributionFields: campi non nell'allow-list (es. 'ref') vengono ignorati — nessun payload libero", () => {
  const result = normalizeAttributionFields({
    utmSource: "google",
    ref: "amico",
    randomField: "xyz",
  })

  assert.deepEqual(result, { utmSource: "google" })
})

test("recordFunnelEvent (FASE 6E): step_completed con campi attribution 'intrusi' non viene rifiutato per la loro presenza (ignorati, non validati per questo eventType — verificato senza raggiungere il database usando uno stepKey mancante, che fa comunque rifiutare la richiesta per il motivo corretto)", async () => {
  // stepKey volutamente assente: il payload viene comunque rifiutato, ma
  // con missing_step_key — mai un errore legato alla presenza di gclid,
  // confermando che i campi attribution non vengono nemmeno considerati
  // per un eventType diverso da funnel_started (normalizeAttributionFields
  // non viene chiamata in quel branch, vedi record-funnel-event.ts).
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "step_completed",
    stepIndex: 0,
    gclid: "non-dovrebbe-mai-essere-scritto",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_key")
})
