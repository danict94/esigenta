import assert from "node:assert/strict"
import test from "node:test"

import { isFreshGeoPlace, isGeoPlace, isResolvedGeoPlace, type GeoPlace } from "./geo"

// FASE 8B — packages/shared had no test file before this phase (isGeoPlace/
// isFreshGeoPlace/resolvePlaceFromGooglePlace were untested). These tests
// cover the three predicates' behavior across all three GeoPlaceSource
// values, with special attention to the regression requirement: adding
// MANUAL_RESOLVED must not change isFreshGeoPlace's own behavior at all
// (that predicate stays Company's write-boundary gate, unchanged).

const GOOGLE: GeoPlace = {
  placeId: "ChIJ_google_place_id",
  formattedAddress: "Via Roma 1, 95022 Aci Bonaccorsi CT, Italia",
  city: "Aci Bonaccorsi",
  postalCode: "95022",
  province: "CT",
  latitude: 37.6167,
  longitude: 15.1333,
  source: "GOOGLE_PLACES",
  resolvedAt: "2026-08-22T12:00:00.000Z",
}

const MANUAL: GeoPlace = {
  placeId: null,
  formattedAddress: "95022 Aci Bonaccorsi CT, Italia",
  city: "Aci Bonaccorsi",
  postalCode: "95022",
  province: "CT",
  latitude: 37.6167,
  longitude: 15.1333,
  source: "MANUAL_RESOLVED",
  resolvedAt: "2026-08-22T12:00:00.000Z",
}

const LEGACY: GeoPlace = {
  placeId: null,
  formattedAddress: "Via Vecchia 1, Catania, Italia",
  city: "Catania",
  postalCode: null,
  province: null,
  latitude: 37.5,
  longitude: 15.09,
  source: "LEGACY_BACKFILL",
  resolvedAt: "2020-01-01T00:00:00.000Z",
}

test("isGeoPlace: accetta GOOGLE_PLACES, LEGACY_BACKFILL e (nuovo, FASE 8B) MANUAL_RESOLVED", () => {
  assert.equal(isGeoPlace(GOOGLE), true)
  assert.equal(isGeoPlace(LEGACY), true)
  assert.equal(isGeoPlace(MANUAL), true)
})

test("isGeoPlace: rifiuta un oggetto con source sconosciuta o mancante", () => {
  assert.equal(isGeoPlace({ ...GOOGLE, source: "SOMETHING_ELSE" }), false)
  assert.equal(isGeoPlace({ ...GOOGLE, source: undefined }), false)
})

test("isGeoPlace: rifiuta un MANUAL_RESOLVED parziale (city mancante)", () => {
  const partial = { ...MANUAL, city: "" }
  assert.equal(isGeoPlace(partial), false)
})

test("isGeoPlace: rifiuta un MANUAL_RESOLVED parziale (coordinate mancanti)", () => {
  const partial = { ...MANUAL, latitude: Number.NaN }
  assert.equal(isGeoPlace(partial), false)
})

test("isFreshGeoPlace: INVARIATA — continua ad accettare solo GOOGLE_PLACES con placeId", () => {
  assert.equal(isFreshGeoPlace(GOOGLE), true)
})

test("isFreshGeoPlace: INVARIATA — continua a rifiutare LEGACY_BACKFILL", () => {
  assert.equal(isFreshGeoPlace(LEGACY), false)
})

test("isFreshGeoPlace: (regressione FASE 8B) rifiuta un MANUAL_RESOLVED, anche se completo — Company deve continuare a richiedere solo Google", () => {
  assert.equal(isFreshGeoPlace(MANUAL), false)
})

test("isResolvedGeoPlace: accetta un GOOGLE_PLACES fresco (comportamento Request invariato)", () => {
  assert.equal(isResolvedGeoPlace(GOOGLE), true)
})

test("isResolvedGeoPlace: accetta un MANUAL_RESOLVED completo", () => {
  assert.equal(isResolvedGeoPlace(MANUAL), true)
})

test("isResolvedGeoPlace: rifiuta un MANUAL_RESOLVED parziale (formattedAddress mancante)", () => {
  const partial = { ...MANUAL, formattedAddress: "" }
  assert.equal(isResolvedGeoPlace(partial), false)
})

test("isResolvedGeoPlace: rifiuta LEGACY_BACKFILL (né Google fresco né manuale)", () => {
  assert.equal(isResolvedGeoPlace(LEGACY), false)
})

test("isResolvedGeoPlace: rifiuta un input arbitrario che si autodichiara 'trusted' senza rispettare la shape completa", () => {
  // Un client non può limitarsi a dichiarare source: MANUAL_RESOLVED — deve
  // comunque fornire una shape completa (city/formattedAddress/coordinate
  // finite). Questo è lo stesso livello di trust già esistente oggi per
  // GOOGLE_PLACES (nessuna verifica server-side del placeId contro
  // l'API Google) — non un regresso di sicurezza introdotto da MANUAL_RESOLVED.
  assert.equal(isResolvedGeoPlace({ source: "MANUAL_RESOLVED" }), false)
  assert.equal(
    isResolvedGeoPlace({
      source: "MANUAL_RESOLVED",
      city: "Roma",
      formattedAddress: "Roma",
      // niente coordinate
    }),
    false,
  )
})

test("isResolvedGeoPlace: rifiuta valori non-oggetto", () => {
  assert.equal(isResolvedGeoPlace(null), false)
  assert.equal(isResolvedGeoPlace(undefined), false)
  assert.equal(isResolvedGeoPlace("95022"), false)
})
