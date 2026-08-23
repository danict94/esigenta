import assert from "node:assert/strict"
import test from "node:test"

import { Prisma } from "@prisma/client"

import {
  isSubmissionSessionIdCollision,
  resolveGeoForCreation,
  toIdempotentRetryResult,
} from "./create-request"

// FASE 7B — solo le due funzioni pure sono testate qui, deliberatamente:
// né isSubmissionSessionIdCollision né toIdempotentRetryResult toccano mai
// @esigenta/database, quindi non richiedono una connessione Postgres reale
// — stesso vincolo già rispettato da ogni altro test di packages/domain
// (record-funnel-event.test.ts, funnel-session-id.test.ts, ecc.).
//
// LIMITE DOCUMENTATO (richiesto esplicitamente dal task FASE 7B §14, Caso
// 1/2/3/4/5/6/7/8): createRequestFromDraft nel suo complesso — inclusa la
// vera race concorrente su Postgres, il fast-path che recupera una Request
// già esistente, l'assenza di un secondo invio email, l'assenza di una
// seconda riga request_created — NON può essere verificato qui senza un
// database Postgres reale (richiede @prisma/client connesso, una vera
// transazione, un vero vincolo UNIQUE). Questi percorsi sono stati invece
// verificati per costruzione tramite lettura del codice (vedi report FASE
// 7B) e restano da esercitare end-to-end una volta che questa migration
// sarà applicata (analogo a quanto fatto per FunnelEvent in FASE 6G).
// Quello che QUI è testabile e coperto: la logica pura che decide "questo
// P2002 è davvero una collisione di submissionSessionId?" (il cuore del
// ramo Caso 3/race) e "come si costruisce una risposta di retry
// idempotente?" (il cuore di Caso 1/2/4/5 lato forma della risposta).

test("isSubmissionSessionIdCollision: P2002 con target che include submissionSessionId (array) -> true", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed on the fields: (`submissionSessionId`)",
    {
      code: "P2002",
      clientVersion: "test",
      meta: { target: ["submissionSessionId"] },
    },
  )

  assert.equal(isSubmissionSessionIdCollision(error), true)
})

test("isSubmissionSessionIdCollision: P2002 con target come stringa del nome vincolo -> true", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed",
    {
      code: "P2002",
      clientVersion: "test",
      meta: { target: "Request_submissionSessionId_key" },
    },
  )

  assert.equal(isSubmissionSessionIdCollision(error), true)
})

test("isSubmissionSessionIdCollision: P2002 su un vincolo diverso (es. requestCode) -> false, non va confuso con una collisione di sessione", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed on the fields: (`requestCode`)",
    {
      code: "P2002",
      clientVersion: "test",
      meta: { target: ["requestCode"] },
    },
  )

  assert.equal(isSubmissionSessionIdCollision(error), false)
})

test("isSubmissionSessionIdCollision: un codice Prisma diverso da P2002 -> false", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "Record not found",
    {
      code: "P2025",
      clientVersion: "test",
      meta: { target: ["submissionSessionId"] },
    },
  )

  assert.equal(isSubmissionSessionIdCollision(error), false)
})

test("isSubmissionSessionIdCollision: P2002 senza alcun meta.target ma senza il campo nel messaggio -> false, mai un throw", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed",
    { code: "P2002", clientVersion: "test" },
  )

  assert.equal(isSubmissionSessionIdCollision(error), false)
})

test("isSubmissionSessionIdCollision (FASE 7B.1 — regressione su un bug reale trovato con dati di produzione): P2002 senza alcun meta.target, campo riconosciuto solo dal messaggio -> true. Riproduce esattamente la forma osservata con @prisma/adapter-pg: meta = { modelName, driverAdapterError }, nessun target", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "\n  Invalid `tx.request.create()` invocation\n  Unique constraint failed on the fields: (`submissionSessionId`)",
    {
      code: "P2002",
      clientVersion: "test",
      meta: { modelName: "Request", driverAdapterError: new Error("duplicate key") },
    },
  )

  assert.equal(isSubmissionSessionIdCollision(error), true)
})

test("isSubmissionSessionIdCollision (FASE 7B.1): P2002 senza target e senza il nome del campo nel messaggio, su un altro modello -> false, non va confuso con una collisione di sessione", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "\n  Invalid `tx.request.create()` invocation\n  Unique constraint failed on the fields: (`requestCode`)",
    {
      code: "P2002",
      clientVersion: "test",
      meta: { modelName: "Request", driverAdapterError: new Error("duplicate key") },
    },
  )

  assert.equal(isSubmissionSessionIdCollision(error), false)
})

test("isSubmissionSessionIdCollision: un errore qualunque, non Prisma -> false, mai un throw", () => {
  assert.equal(isSubmissionSessionIdCollision(new Error("boom")), false)
  assert.equal(isSubmissionSessionIdCollision("stringa arbitraria"), false)
  assert.equal(isSubmissionSessionIdCollision(null), false)
  assert.equal(isSubmissionSessionIdCollision(undefined), false)
})

test("toIdempotentRetryResult: forma della risposta identica a un successo normale (status/verificationEmailProvider fissi, verificationEmailSent sempre false — FASE 7B.1, mai una certezza inventata)", () => {
  const result = toIdempotentRetryResult(
    {
      id: "req_existing_123",
      interventionSlug: "rifare-tetto",
      serviceGroupSlug: "tetti",
    },
    "rifare-tetto",
  )

  assert.deepEqual(result, {
    requestId: "req_existing_123",
    status: "PENDING_VERIFICATION",
    verificationEmailSent: false,
    verificationEmailProvider: "resend",
    interventionSlug: "rifare-tetto",
    serviceGroupSlug: "tetti",
  })
})

test("toIdempotentRetryResult (FASE 7B.1): verificationEmailSent è sempre false, mai true — questa funzione non invia mai una seconda email e non conosce l'esito del primo invio", () => {
  const result = toIdempotentRetryResult(
    { id: "req_x", interventionSlug: "rifare-tetto", serviceGroupSlug: null },
    "rifare-tetto",
  )

  assert.equal(result.verificationEmailSent, false)
})

test("toIdempotentRetryResult: interventionSlug della Request esistente nullo -> usa il fallback fornito dal chiamante, mai una stringa vuota/undefined", () => {
  const result = toIdempotentRetryResult(
    {
      id: "req_existing_456",
      interventionSlug: null,
      serviceGroupSlug: null,
    },
    "rifare-impianto-elettrico",
  )

  assert.equal(result.interventionSlug, "rifare-impianto-elettrico")
  assert.equal(result.serviceGroupSlug, null)
})

test("toIdempotentRetryResult: mai un errore da dati vuoti/minimi", () => {
  const result = toIdempotentRetryResult(
    { id: "req_x", interventionSlug: null, serviceGroupSlug: null },
    "",
  )

  assert.equal(result.requestId, "req_x")
  assert.equal(result.interventionSlug, "")
})

// ---------------------------------------------------------------------
// resolveGeoForCreation (FASE 8B.2 — trust boundary fix)
//
// Confermato con una chiamata REALE a createRequestFromDraft, contro il
// database di produzione (vedi report §2): un draft.geo forgiato dal
// client con source "MANUAL_RESOLVED" e coordinate arbitrarie, prima di
// questo fix, superava la validazione applicativa (isResolvedGeoPlace) e
// raggiungeva tx.geoLocation.create() dentro la transazione — fermato
// SOLO da Postgres, perché l'enum GeoSource non aveva ancora il valore
// MANUAL_RESOLVED (migration non applicata). Con la migration applicata,
// quella scrittura sarebbe silenziosamente riuscita.
//
// I test sotto coprono i soli rami di resolveGeoForCreation che NON
// toccano la rete (il ramo "MANUAL_RESOLVED risolto per davvero" chiama
// resolveManualLocation, quindi tocca Google — verificato separatamente
// con una chiamata live one-off, vedi report §2/§7, non ripetuto qui come
// test automatico per non rendere la suite dipendente dalla rete).

function minimalDraft(overrides: Partial<Parameters<typeof resolveGeoForCreation>[0]>) {
  return {
    interventionSlug: "qualunque-intervento",
    rawAnswers: {},
    contact: {},
    derivedSignals: {},
    routingSignals: {},
    createdAt: new Date(),
    geo: null,
    ...overrides,
  } as Parameters<typeof resolveGeoForCreation>[0]
}

const FRESH_GOOGLE_PLACE = {
  placeId: "ChIJ_real_google_place",
  formattedAddress: "Via Roma 1, Catania, Italia",
  city: "Catania",
  postalCode: "95100",
  province: "CT",
  latitude: 37.5,
  longitude: 15.09,
  source: "GOOGLE_PLACES" as const,
  resolvedAt: "2026-08-22T12:00:00.000Z",
}

test("resolveGeoForCreation: un GOOGLE_PLACES fresco viene restituito invariato (comportamento pre-FASE-8B invariato)", async () => {
  const draft = minimalDraft({ geo: FRESH_GOOGLE_PLACE })

  const result = await resolveGeoForCreation(draft)

  assert.deepEqual(result, FRESH_GOOGLE_PLACE)
})

test("resolveGeoForCreation: un draft.geo forgiato dal client con source MANUAL_RESOLVED (e coordinate arbitrarie) viene rifiutato, mai usato direttamente — riproduce l'exploit reale trovato in questa fase", async () => {
  const draft = minimalDraft({
    geo: {
      placeId: null,
      formattedAddress: "FASE 8B.2 EXPLOIT TEST",
      city: "FASE 8B.2 EXPLOIT TEST",
      postalCode: null,
      province: null,
      latitude: 999,
      longitude: 999,
      source: "MANUAL_RESOLVED",
      resolvedAt: new Date().toISOString(),
    },
  })

  await assert.rejects(
    () => resolveGeoForCreation(draft),
    (error: unknown) => {
      assert.ok(error instanceof Error)
      assert.equal((error as { code?: string }).code, "invalid_request_location")
      return true
    },
  )
})

test("resolveGeoForCreation: coordinate diverse/palesemente arbitrarie in un draft.geo MANUAL_RESOLVED forgiato — rifiutate comunque, non solo il caso specifico sopra", async () => {
  const draft = minimalDraft({
    geo: {
      placeId: null,
      formattedAddress: "Un altro posto inventato",
      city: "Un altro posto inventato",
      postalCode: null,
      province: null,
      latitude: -999.5,
      longitude: 12345,
      source: "MANUAL_RESOLVED",
      resolvedAt: new Date().toISOString(),
    },
  })

  await assert.rejects(() => resolveGeoForCreation(draft))
})

test("resolveGeoForCreation: nessun draft.geo valido e nessuna query manuale -> rifiutato", async () => {
  const draft = minimalDraft({ geo: null })

  await assert.rejects(
    () => resolveGeoForCreation(draft),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, "invalid_request_location")
      return true
    },
  )
})

test("resolveGeoForCreation: geoManualQuery vuoto/whitespace non innesca mai una chiamata di rete e viene comunque rifiutato", async () => {
  const draft = minimalDraft({ geo: null, geoManualQuery: "   " })

  await assert.rejects(() => resolveGeoForCreation(draft))
})
