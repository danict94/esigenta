import assert from "node:assert/strict"
import test from "node:test"

import {
  EXIT_FEEDBACK_REASON_CODES,
  normalizeAttributionFields,
  normalizeAttributionStatus,
  normalizeErrorCode,
  normalizeReasonCode,
  normalizeTrackingVersion,
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

// --- FASE 9E: client_validation_failed ---

test("recordFunnelEvent (FASE 9E): client_validation_failed senza stepKey -> rifiutato con missing_step_key, MAI invalid_event_type — prova che l'eventType di per sé è accettato (stesso trattamento di step_viewed/step_completed, mai un sentinel)", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "client_validation_failed",
    stepIndex: 0,
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_key")
})

test("recordFunnelEvent (FASE 9E): client_validation_failed senza stepIndex -> rifiutato con missing_step_index", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "client_validation_failed",
    stepKey: "location",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_index")
})

// --- FASE 9H: exit_feedback_submitted (solo base dati/tracking, nessun
// modal/trigger esiste ancora — vedi il report FASE 9H) ---

test("recordFunnelEvent (FASE 9H): exit_feedback_submitted senza stepKey -> rifiutato con missing_step_key, MAI invalid_event_type — prova che l'eventType di per sé è accettato (stesso trattamento di step_viewed/step_completed/client_validation_failed, mai un sentinel)", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "exit_feedback_submitted",
    stepIndex: 0,
    reasonCode: "just_browsing",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_key")
})

test("recordFunnelEvent (FASE 9H): exit_feedback_submitted senza stepIndex -> rifiutato con missing_step_index", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "exit_feedback_submitted",
    stepKey: "location",
    reasonCode: "just_browsing",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_index")
})

test("recordFunnelEvent (FASE 9H): exit_feedback_submitted senza reasonCode -> rifiutato con invalid_reason_code (a differenza di errorCode, qui è un rifiuto duro, non un fallback silenzioso)", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "exit_feedback_submitted",
    stepKey: "location",
    stepIndex: 0,
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "invalid_reason_code")
})

test("recordFunnelEvent (FASE 9H): exit_feedback_submitted con reasonCode non nell'allow-list -> rifiutato con invalid_reason_code", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "exit_feedback_submitted",
    stepKey: "location",
    stepIndex: 0,
    reasonCode: "qualunque cosa arrivi dal client",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "invalid_reason_code")
})

test("recordFunnelEvent (FASE 9H): stepKey/stepIndex mancanti vengono rilevati PRIMA di reasonCode (ordine di validazione) — un payload senza nessuno dei due viene rifiutato per missing_step_key, non per il reasonCode", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: VALID_FUNNEL_SESSION_ID,
    interventionSlug: "rifare-tetto",
    eventType: "exit_feedback_submitted",
  })

  assert.equal(result.ok, false)
  assert.equal((result as { code: string }).code, "missing_step_key")
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

// --- FASE 9A: funnel_opened (nuovo eventType, mount) + trackingVersion ---

test("recordFunnelEvent (FASE 9A): funnel_opened è un eventType riconosciuto, mai rifiutato con invalid_event_type", async () => {
  // Stesso trucco dei test sopra: funnelSessionId deliberatamente invalido
  // per fermarsi prima del database, verificando solo che il rifiuto
  // arrivi per funnelSessionId — se funnel_opened non fosse nell'allow-list
  // il codice sarebbe invalid_event_type, non invalid_funnel_session_id.
  const result = await recordFunnelEvent({
    funnelSessionId: "non-un-uuid",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_opened",
  })

  assert.equal(result.ok, false)
  assert.equal(
    (result as { code: string }).code,
    "invalid_funnel_session_id",
    "se funnel_opened non fosse nell'allow-list, il codice sarebbe invalid_event_type",
  )
})

test("recordFunnelEvent (FASE 9A): stepKey/stepIndex NON sono richiesti per funnel_opened, stessa esenzione già valida per funnel_started", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: "non-un-uuid",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_opened",
  })

  assert.equal(result.ok, false)
  assert.equal(
    (result as { code: string }).code,
    "invalid_funnel_session_id",
    "mai missing_step_key/missing_step_index per funnel_opened",
  )
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

// --- FASE 9H: normalizeReasonCode (unit, stesso motivo di
// normalizeErrorCode — mai passa da recordFunnelEvent per non toccare mai
// il database). A differenza di normalizeErrorCode, NON coercisce a un
// default: ritorna undefined, ed è recordFunnelEvent a trasformarlo in un
// rifiuto duro per exit_feedback_submitted (vedi i test sopra). ---

test("EXIT_FEEDBACK_REASON_CODES: contiene esattamente i 7 codici concordati per questa fase", () => {
  assert.deepEqual(
    [...EXIT_FEEDBACK_REASON_CODES].sort(),
    [
      "just_browsing",
      "too_many_questions",
      "dont_know_what_to_choose",
      "dont_want_to_share_contact",
      "want_cost_first",
      "not_ready",
      "other",
    ].sort(),
  )
})

test("normalizeReasonCode: ciascuno dei 7 codici validi passa invariato", () => {
  for (const code of EXIT_FEEDBACK_REASON_CODES) {
    assert.equal(normalizeReasonCode(code), code)
  }
})

test("normalizeReasonCode: una stringa arbitraria non nell'allow-list -> undefined, mai salvata verbatim, mai un throw", () => {
  assert.equal(normalizeReasonCode("qualunque cosa arrivi dal client"), undefined)
  assert.equal(normalizeReasonCode("Other"), undefined, "case-sensitive, nessuna normalizzazione implicita")
})

test("normalizeReasonCode: assente/tipo sbagliato -> undefined, mai un throw", () => {
  assert.equal(normalizeReasonCode(undefined), undefined)
  assert.equal(normalizeReasonCode(null), undefined)
  assert.equal(normalizeReasonCode(12345), undefined)
  assert.equal(normalizeReasonCode({}), undefined)
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

// --- FASE 7E: normalizeAttributionStatus (unit, stesso motivo di
// normalizeErrorCode/normalizeAttributionFields — mai passa da
// recordFunnelEvent per non toccare mai il database) ---

test("normalizeAttributionStatus: 'resolved' e 'unknown' passano invariati", () => {
  assert.equal(normalizeAttributionStatus("resolved"), "resolved")
  assert.equal(normalizeAttributionStatus("unknown"), "unknown")
})

test("normalizeAttributionStatus: una stringa arbitraria non nell'allow-list -> undefined, mai salvata verbatim, mai un throw", () => {
  assert.equal(normalizeAttributionStatus("qualunque cosa arrivi dal client"), undefined)
  assert.equal(normalizeAttributionStatus("Resolved"), undefined, "case-sensitive, nessuna normalizzazione implicita")
})

test("normalizeAttributionStatus: assente/tipo sbagliato -> undefined, mai un throw", () => {
  assert.equal(normalizeAttributionStatus(undefined), undefined)
  assert.equal(normalizeAttributionStatus(null), undefined)
  assert.equal(normalizeAttributionStatus(12345), undefined)
  assert.equal(normalizeAttributionStatus({}), undefined)
})

test("recordFunnelEvent (FASE 7E): attributionStatus non valido su funnel_started non viene rifiutato, viene semplicemente omesso (verificato senza raggiungere il database tramite un funnelSessionId invalido, che fa comunque rifiutare la richiesta per il motivo corretto)", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: "non-un-uuid",
    interventionSlug: "rifare-tetto",
    eventType: "funnel_started",
    attributionStatus: "qualcosa-di-non-valido",
  })

  assert.equal(result.ok, false)
  assert.equal(
    (result as { code: string }).code,
    "invalid_funnel_session_id",
    "mai un errore legato ad attributionStatus: quel campo non blocca mai la validazione",
  )
})

// --- FASE 9A: normalizeTrackingVersion (unit, stesso motivo di
// normalizeErrorCode/normalizeAttributionFields/normalizeAttributionStatus
// — mai passa da recordFunnelEvent per non toccare mai il database) ---

test("normalizeTrackingVersion: 'v2' passa invariato", () => {
  assert.equal(normalizeTrackingVersion("v2"), "v2")
})

test("normalizeTrackingVersion: una stringa arbitraria non nell'allow-list -> undefined, mai salvata verbatim, mai un throw", () => {
  assert.equal(normalizeTrackingVersion("qualunque cosa arrivi dal client"), undefined)
  assert.equal(normalizeTrackingVersion("v1"), undefined)
  assert.equal(normalizeTrackingVersion("V2"), undefined, "case-sensitive, nessuna normalizzazione implicita")
})

test("normalizeTrackingVersion: assente/tipo sbagliato -> undefined, mai un throw", () => {
  assert.equal(normalizeTrackingVersion(undefined), undefined)
  assert.equal(normalizeTrackingVersion(null), undefined)
  assert.equal(normalizeTrackingVersion(12345), undefined)
  assert.equal(normalizeTrackingVersion({}), undefined)
})

test("recordFunnelEvent (FASE 9A): trackingVersion non valido non viene rifiutato, viene semplicemente omesso (verificato senza raggiungere il database tramite un funnelSessionId invalido, che fa comunque rifiutare la richiesta per il motivo corretto)", async () => {
  const result = await recordFunnelEvent({
    funnelSessionId: "non-un-uuid",
    interventionSlug: "rifare-tetto",
    eventType: "step_viewed",
    stepKey: "location",
    stepIndex: 0,
    trackingVersion: "qualcosa-di-non-valido",
  })

  assert.equal(result.ok, false)
  assert.equal(
    (result as { code: string }).code,
    "invalid_funnel_session_id",
    "mai un errore legato a trackingVersion: quel campo non blocca mai la validazione",
  )
})
