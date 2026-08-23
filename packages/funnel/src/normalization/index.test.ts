import assert from "node:assert/strict"
import test from "node:test"

import {
  describeRuntimeLocationAnswerPresence,
  isManualLocationAnswer,
  isRuntimeLocationAnswerComplete,
  readRuntimeLocationAnswer,
  readRuntimeLocationManualQuery,
} from "./index"

// FASE 8D — the hybrid manual geo fallback's normalization layer. Only
// this file is exercised here (see package.json's "test" script,
// deliberately scoped) — packages/funnel/src/server.ts imports the
// server-only package, which throws when loaded from a bare
// `node --import tsx --test` process outside Next's own runtime (same
// issue documented in apps/web/src/app/api/geo/resolve/geo-resolve-contract.ts).
// This file (normalization/index.ts) has no such dependency.

const GOOGLE_PLACE = {
  placeId: "ChIJ_real",
  formattedAddress: "Via Roma 1, Catania, Italia",
  city: "Catania",
  postalCode: "95100",
  province: "CT",
  latitude: 37.5,
  longitude: 15.09,
  source: "GOOGLE_PLACES" as const,
  resolvedAt: "2026-08-23T12:00:00.000Z",
}

const MANUAL_PREVIEW_ANSWER = {
  kind: "manual_location_preview" as const,
  query: "95022",
  preview: {
    city: "Aci Catena",
    postalCode: "95022",
    province: "CT",
    formattedAddress: "95022 Aci Catena, Metropolitan city of Catania, Italy",
  },
}

test("isManualLocationAnswer: accetta un answer manuale confermato completo", () => {
  assert.equal(isManualLocationAnswer(MANUAL_PREVIEW_ANSWER), true)
})

test("isManualLocationAnswer: rifiuta un GeoPlace (kind mancante/diverso)", () => {
  assert.equal(isManualLocationAnswer(GOOGLE_PLACE), false)
})

test("isManualLocationAnswer: rifiuta null/undefined/valori arbitrari, mai un throw", () => {
  assert.equal(isManualLocationAnswer(null), false)
  assert.equal(isManualLocationAnswer(undefined), false)
  assert.equal(isManualLocationAnswer("95022"), false)
  assert.equal(isManualLocationAnswer(42), false)
  assert.equal(isManualLocationAnswer({}), false)
})

test("isManualLocationAnswer: rifiuta un answer con query vuota (mai un fallback confermato senza query reale)", () => {
  assert.equal(
    isManualLocationAnswer({ ...MANUAL_PREVIEW_ANSWER, query: "  " }),
    false,
  )
})

test("isManualLocationAnswer: rifiuta un preview parziale (city mancante)", () => {
  assert.equal(
    isManualLocationAnswer({
      ...MANUAL_PREVIEW_ANSWER,
      preview: { ...MANUAL_PREVIEW_ANSWER.preview, city: "" },
    }),
    false,
  )
})

test("isManualLocationAnswer: rifiuta un preview mancante/malformato", () => {
  assert.equal(
    isManualLocationAnswer({ ...MANUAL_PREVIEW_ANSWER, preview: null }),
    false,
  )
  assert.equal(
    isManualLocationAnswer({ ...MANUAL_PREVIEW_ANSWER, preview: "Aci Catena" }),
    false,
  )
})

test("readRuntimeLocationManualQuery: estrae la query da un answer manuale confermato", () => {
  assert.equal(readRuntimeLocationManualQuery(MANUAL_PREVIEW_ANSWER), "95022")
})

test("readRuntimeLocationManualQuery: undefined per un GeoPlace (non ha significato lì)", () => {
  assert.equal(readRuntimeLocationManualQuery(GOOGLE_PLACE), undefined)
})

test("readRuntimeLocationManualQuery: undefined per null/valori arbitrari, mai un throw", () => {
  assert.equal(readRuntimeLocationManualQuery(null), undefined)
  assert.equal(readRuntimeLocationManualQuery("95022"), undefined)
})

test("readRuntimeLocationAnswer: un answer manuale confermato NON è mai un GeoPlace — draft.geo resta null (il client non costruisce mai un GeoPlace trusted)", () => {
  assert.equal(readRuntimeLocationAnswer(MANUAL_PREVIEW_ANSWER), null)
})

test("readRuntimeLocationAnswer: un GeoPlace reale passa invariato (comportamento pre-FASE-8D)", () => {
  assert.deepEqual(readRuntimeLocationAnswer(GOOGLE_PLACE), GOOGLE_PLACE)
})

test("isRuntimeLocationAnswerComplete: un GeoPlace è completo (invariato)", () => {
  assert.equal(isRuntimeLocationAnswerComplete(GOOGLE_PLACE), true)
})

test("isRuntimeLocationAnswerComplete: un answer manuale confermato è completo (nuovo, FASE 8D)", () => {
  assert.equal(isRuntimeLocationAnswerComplete(MANUAL_PREVIEW_ANSWER), true)
})

test("isRuntimeLocationAnswerComplete: null, testo digitato ma non confermato, o un answer manuale parziale NON sono completi", () => {
  assert.equal(isRuntimeLocationAnswerComplete(null), false)
  assert.equal(isRuntimeLocationAnswerComplete("95022"), false)
  assert.equal(
    isRuntimeLocationAnswerComplete({ ...MANUAL_PREVIEW_ANSWER, query: "" }),
    false,
  )
})

test("describeRuntimeLocationAnswerPresence: distingue GeoPlace, answer manuale e assenza, per diagnostica", () => {
  assert.deepEqual(describeRuntimeLocationAnswerPresence(GOOGLE_PLACE), {
    shape: "object",
    isCompleteGeoPlace: true,
    isManualLocationPreview: false,
  })

  assert.deepEqual(
    describeRuntimeLocationAnswerPresence(MANUAL_PREVIEW_ANSWER),
    {
      shape: "object",
      isCompleteGeoPlace: false,
      isManualLocationPreview: true,
    },
  )

  assert.deepEqual(describeRuntimeLocationAnswerPresence(null), {
    shape: "null",
    isCompleteGeoPlace: false,
    isManualLocationPreview: false,
  })
})
