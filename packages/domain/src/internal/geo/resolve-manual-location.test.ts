import assert from "node:assert/strict"
import test from "node:test"

import {
  checkLocationCoherence,
  extractGeoPlaceFromGeocodingResult,
  interpretGeocodingResponse,
  parseManualLocationQuery,
  sanitizeManualLocationQuery,
} from "./resolve-manual-location"

// FASE 8B — resolveManualLocation's actual network call (fetch + reading
// process.env.GOOGLE_MAPS_API_KEY) is deliberately NOT unit-tested here,
// exactly like every other network/DB-touching orchestrator in this
// package (see create-request.ts, cleanup-orphan-request-photos.ts). ALL
// of its interesting logic — sanitation, extraction, coherence
// validation, and the full status/mismatch decision tree — lives in pure
// functions (interpretGeocodingResponse and what it calls) and is fully
// covered below without a network call.
//
// FASE 8B.1 fixtures below use REAL data confirmed via a live,
// read-only call to the Google Geocoding API during this phase's
// verification (see report §4) — not invented coordinates:
//   95022 -> Aci Catena, CT (37.5808209, 15.1434387)
//   95020 -> Aci Bonaccorsi, CT (37.5947056, 15.1068925)
// These are two real, DIFFERENT, adjacent comuni — exactly the case that
// exposed the original bug ("95022 Aci Bonaccorsi" silently resolving to
// Aci Bonaccorsi's coordinates despite the CAP actually belonging to Aci
// Catena).

test("sanitizeManualLocationQuery: input vuoto -> null", () => {
  assert.equal(sanitizeManualLocationQuery(""), null)
  assert.equal(sanitizeManualLocationQuery("   "), null)
})

test("sanitizeManualLocationQuery: input non-stringa -> null", () => {
  assert.equal(sanitizeManualLocationQuery(undefined), null)
  assert.equal(sanitizeManualLocationQuery(null), null)
  assert.equal(sanitizeManualLocationQuery(95022), null)
})

test("sanitizeManualLocationQuery: un CAP valido viene trimmato e restituito", () => {
  assert.equal(sanitizeManualLocationQuery("  95022  "), "95022")
})

test("sanitizeManualLocationQuery: un Comune viene trimmato e restituito", () => {
  assert.equal(sanitizeManualLocationQuery(" Aci Bonaccorsi "), "Aci Bonaccorsi")
})

test("sanitizeManualLocationQuery: 'CAP Comune' insieme viene passato invariato (la risoluzione la fa Google)", () => {
  assert.equal(sanitizeManualLocationQuery("95022 Aci Bonaccorsi"), "95022 Aci Bonaccorsi")
})

// ---------------------------------------------------------------------
// parseManualLocationQuery
// ---------------------------------------------------------------------

test("parseManualLocationQuery: solo CAP -> postalCode valorizzato, city null", () => {
  assert.deepEqual(parseManualLocationQuery("95022"), { postalCode: "95022", city: null })
})

test("parseManualLocationQuery: solo Comune -> city valorizzato, postalCode null", () => {
  assert.deepEqual(parseManualLocationQuery("Aci Bonaccorsi"), {
    postalCode: null,
    city: "Aci Bonaccorsi",
  })
})

test("parseManualLocationQuery: 'CAP Comune' -> entrambi valorizzati", () => {
  assert.deepEqual(parseManualLocationQuery("95020 Aci Bonaccorsi"), {
    postalCode: "95020",
    city: "Aci Bonaccorsi",
  })
})

test("parseManualLocationQuery: 'Comune CAP' (ordine invertito) -> entrambi valorizzati comunque", () => {
  assert.deepEqual(parseManualLocationQuery("Aci Bonaccorsi 95020"), {
    postalCode: "95020",
    city: "Aci Bonaccorsi",
  })
})

test("parseManualLocationQuery: 'CAP, Comune' con virgola -> punteggiatura residua rimossa", () => {
  assert.deepEqual(parseManualLocationQuery("95022, Aci Catena"), {
    postalCode: "95022",
    city: "Aci Catena",
  })
})

test("parseManualLocationQuery: una sequenza di cifre diversa da 5 non viene scambiata per un CAP", () => {
  assert.deepEqual(parseManualLocationQuery("Via Roma 123 Milano"), {
    postalCode: null,
    city: "Via Roma 123 Milano",
  })
})

// ---------------------------------------------------------------------
// checkLocationCoherence
// ---------------------------------------------------------------------

const PLACE_ACI_CATENA = {
  placeId: "ChIJAYIYFlz5ExMRMAFj2SwECxw",
  formattedAddress: "95022 Aci Catena, Metropolitan city of Catania, Italy",
  city: "Aci Catena",
  postalCode: "95022",
  province: "CT",
  latitude: 37.5808209,
  longitude: 15.1434387,
  source: "MANUAL_RESOLVED" as const,
  resolvedAt: "2026-08-22T12:00:00.000Z",
}

const PLACE_ACI_BONACCORSI_NO_CAP = {
  placeId: "ChIJJYHbY6H-ExMRMLZM7w_adcM",
  formattedAddress: "Aci Bonaccorsi, Metropolitan city of Catania, Italy",
  city: "Aci Bonaccorsi",
  postalCode: null,
  province: "CT",
  latitude: 37.5947056,
  longitude: 15.1068925,
  source: "MANUAL_RESOLVED" as const,
  resolvedAt: "2026-08-22T12:00:00.000Z",
}

test("checkLocationCoherence: nessun vincolo esplicito -> sempre coerente", () => {
  assert.equal(checkLocationCoherence({ postalCode: null, city: null }, PLACE_ACI_CATENA), true)
})

test("checkLocationCoherence: CAP esplicito che combacia -> coerente", () => {
  assert.equal(
    checkLocationCoherence({ postalCode: "95022", city: null }, PLACE_ACI_CATENA),
    true,
  )
})

test("checkLocationCoherence: CAP esplicito diverso dal risultato -> mismatch (il bug reale di questa fase)", () => {
  // Scenario esatto trovato in produzione: query "95022 Aci Bonaccorsi",
  // Google risolve al comune (Aci Bonaccorsi) ignorando il CAP realmente
  // richiesto, che appartiene invece ad Aci Catena.
  assert.equal(
    checkLocationCoherence({ postalCode: "95022", city: "Aci Bonaccorsi" }, PLACE_ACI_BONACCORSI_NO_CAP),
    false,
  )
})

test("checkLocationCoherence: CAP esplicito ma il risultato non ne restituisce uno -> mismatch, mai un pass per assenza di prova", () => {
  assert.equal(
    checkLocationCoherence({ postalCode: "95022", city: null }, PLACE_ACI_BONACCORSI_NO_CAP),
    false,
  )
})

test("checkLocationCoherence: Comune esplicito che combacia dopo normalizzazione (maiuscole/spazi) -> coerente", () => {
  assert.equal(
    checkLocationCoherence({ postalCode: null, city: "  aci   BONACCORSI " }, PLACE_ACI_BONACCORSI_NO_CAP),
    true,
  )
})

test("checkLocationCoherence: Comune esplicito palesemente diverso -> mismatch", () => {
  assert.equal(
    checkLocationCoherence({ postalCode: null, city: "Milano" }, PLACE_ACI_BONACCORSI_NO_CAP),
    false,
  )
})

test("checkLocationCoherence: CAP e Comune espliciti entrambi coerenti -> coerente", () => {
  const place95020 = { ...PLACE_ACI_BONACCORSI_NO_CAP, postalCode: "95020" }
  assert.equal(
    checkLocationCoherence({ postalCode: "95020", city: "Aci Bonaccorsi" }, place95020),
    true,
  )
})

// ---------------------------------------------------------------------
// extractGeoPlaceFromGeocodingResult (invariato dalla FASE 8B, fixture
// corretta in questa fase: 95022 appartiene realmente ad Aci Catena, non
// ad Aci Bonaccorsi come la fixture precedente affermava erroneamente)
// ---------------------------------------------------------------------

const RESULT_95022_ACI_CATENA = {
  place_id: "ChIJAYIYFlz5ExMRMAFj2SwECxw",
  formatted_address: "95022 Aci Catena, Metropolitan city of Catania, Italy",
  address_components: [
    { long_name: "Aci Catena", short_name: "Aci Catena", types: ["locality", "political"] },
    { long_name: "Catania", short_name: "CT", types: ["administrative_area_level_2", "political"] },
    { long_name: "Sicily", short_name: "Sicily", types: ["administrative_area_level_1", "political"] },
    { long_name: "Italy", short_name: "IT", types: ["country", "political"] },
    { long_name: "95022", short_name: "95022", types: ["postal_code"] },
  ],
  geometry: { location: { lat: 37.5808209, lng: 15.1434387 } },
}

const RESULT_95020_ACI_BONACCORSI = {
  place_id: "ChIJNYDT5aP-ExMRUAJj2SwECxw",
  formatted_address: "95020 Aci Bonaccorsi, Metropolitan city of Catania, Italy",
  address_components: [
    { long_name: "Aci Bonaccorsi", short_name: "Aci Bonaccorsi", types: ["locality", "political"] },
    { long_name: "Catania", short_name: "CT", types: ["administrative_area_level_2", "political"] },
    { long_name: "Sicily", short_name: "Sicily", types: ["administrative_area_level_1", "political"] },
    { long_name: "Italy", short_name: "IT", types: ["country", "political"] },
    { long_name: "95020", short_name: "95020", types: ["postal_code"] },
  ],
  geometry: { location: { lat: 37.5947056, lng: 15.1068925 } },
}

const RESULT_ACI_BONACCORSI_NO_CAP = {
  place_id: "ChIJJYHbY6H-ExMRMLZM7w_adcM",
  formatted_address: "Aci Bonaccorsi, Metropolitan city of Catania, Italy",
  address_components: [
    { long_name: "Aci Bonaccorsi", short_name: "Aci Bonaccorsi", types: ["locality", "political"] },
    { long_name: "Catania", short_name: "CT", types: ["administrative_area_level_2", "political"] },
    { long_name: "Sicily", short_name: "Sicily", types: ["administrative_area_level_1", "political"] },
    { long_name: "Italy", short_name: "IT", types: ["country", "political"] },
  ],
  geometry: { location: { lat: 37.5947056, lng: 15.1068925 } },
}

test("extractGeoPlaceFromGeocodingResult: 95022 risolve correttamente in Aci Catena (dato reale, non Aci Bonaccorsi)", () => {
  const place = extractGeoPlaceFromGeocodingResult(
    RESULT_95022_ACI_CATENA,
    new Date("2026-08-22T12:00:00.000Z"),
  )

  assert.deepEqual(place, {
    placeId: "ChIJAYIYFlz5ExMRMAFj2SwECxw",
    formattedAddress: "95022 Aci Catena, Metropolitan city of Catania, Italy",
    city: "Aci Catena",
    postalCode: "95022",
    province: "CT",
    latitude: 37.5808209,
    longitude: 15.1434387,
    source: "MANUAL_RESOLVED",
    resolvedAt: "2026-08-22T12:00:00.000Z",
  })
})

test("extractGeoPlaceFromGeocodingResult: un risultato senza address_components utilizzabili (city mancante) produce un errore controllato (null), non un GeoPlace parziale", () => {
  const place = extractGeoPlaceFromGeocodingResult({
    place_id: "ChIJ_no_city",
    formatted_address: "Qualche indirizzo, Italia",
    address_components: [{ long_name: "Italia", short_name: "IT", types: ["country", "political"] }],
    geometry: { location: { lat: 41.9, lng: 12.5 } },
  })

  assert.equal(place, null)
})

test("extractGeoPlaceFromGeocodingResult: coordinate mancanti/non finite producono null", () => {
  const place = extractGeoPlaceFromGeocodingResult({
    place_id: "ChIJ_no_coords",
    formatted_address: "Aci Bonaccorsi CT, Italia",
    address_components: [
      { long_name: "Aci Bonaccorsi", short_name: "Aci Bonaccorsi", types: ["locality", "political"] },
    ],
    geometry: { location: {} },
  })

  assert.equal(place, null)
})

test("extractGeoPlaceFromGeocodingResult: formattedAddress mancante produce null", () => {
  const place = extractGeoPlaceFromGeocodingResult({
    address_components: [
      { long_name: "Aci Bonaccorsi", short_name: "Aci Bonaccorsi", types: ["locality", "political"] },
    ],
    geometry: { location: { lat: 37.6167, lng: 15.1333 } },
  })

  assert.equal(place, null)
})

test("extractGeoPlaceFromGeocodingResult: placeId assente -> null esplicito, non stringa vuota (MANUAL_RESOLVED ammette placeId null)", () => {
  const place = extractGeoPlaceFromGeocodingResult({
    formatted_address: "95022 Aci Catena, Italia",
    address_components: [
      { long_name: "Aci Catena", short_name: "Aci Catena", types: ["locality", "political"] },
    ],
    geometry: { location: { lat: 37.5808209, lng: 15.1434387 } },
  })

  assert.ok(place)
  assert.equal(place?.placeId, null)
  assert.equal(place?.source, "MANUAL_RESOLVED")
})

// ---------------------------------------------------------------------
// interpretGeocodingResponse — copre tutti gli 7 scenari richiesti dalla
// FASE 8B.1 end-to-end (a livello puro, nessuna chiamata di rete), su
// fixture con dati reali confermati via verifica live (report §4/§7).
// ---------------------------------------------------------------------

test("interpretGeocodingResponse: 95022 -> OK, Aci Catena", () => {
  const result = interpretGeocodingResponse(
    { status: "OK", results: [RESULT_95022_ACI_CATENA] },
    "95022",
    new Date("2026-08-22T12:00:00.000Z"),
  )

  assert.equal(result.ok, true)
  assert.ok(result.ok)
  assert.equal(result.place.city, "Aci Catena")
  assert.equal(result.place.postalCode, "95022")
})

test("interpretGeocodingResponse: '95020 Aci Bonaccorsi' -> OK (CAP e Comune coerenti)", () => {
  const result = interpretGeocodingResponse(
    { status: "OK", results: [RESULT_95020_ACI_BONACCORSI] },
    "95020 Aci Bonaccorsi",
    new Date("2026-08-22T12:00:00.000Z"),
  )

  assert.equal(result.ok, true)
  assert.ok(result.ok)
  assert.equal(result.place.city, "Aci Bonaccorsi")
  assert.equal(result.place.postalCode, "95020")
})

test("interpretGeocodingResponse: '95022 Aci Bonaccorsi' -> location_mismatch (il bug reale: 95022 e' di Aci Catena, non Aci Bonaccorsi)", () => {
  // Riproduce esattamente il comportamento osservato in produzione:
  // Google risolve la query al comune (ignorando il CAP contraddittorio)
  // e restituisce Aci Bonaccorsi senza alcun postal_code component.
  const result = interpretGeocodingResponse(
    { status: "OK", results: [RESULT_ACI_BONACCORSI_NO_CAP] },
    "95022 Aci Bonaccorsi",
    new Date("2026-08-22T12:00:00.000Z"),
  )

  assert.deepEqual(result, { ok: false, code: "location_mismatch" })
})

test("interpretGeocodingResponse: 'Aci Bonaccorsi' (solo Comune) -> OK", () => {
  const result = interpretGeocodingResponse(
    { status: "OK", results: [RESULT_ACI_BONACCORSI_NO_CAP] },
    "Aci Bonaccorsi",
    new Date("2026-08-22T12:00:00.000Z"),
  )

  assert.equal(result.ok, true)
  assert.ok(result.ok)
  assert.equal(result.place.city, "Aci Bonaccorsi")
})

test("interpretGeocodingResponse: input inesistente (ZERO_RESULTS) -> unresolvable, mai un throw", () => {
  const result = interpretGeocodingResponse(
    { status: "ZERO_RESULTS", results: [] },
    "xxxxxxx-non-esiste-yyyyyy-zzzzzz-comune-inventato",
  )

  assert.deepEqual(result, { ok: false, code: "unresolvable" })
})

test("interpretGeocodingResponse: status OK ma results vuoto -> unresolvable, non un crash", () => {
  const result = interpretGeocodingResponse({ status: "OK", results: [] }, "95022")

  assert.deepEqual(result, { ok: false, code: "unresolvable" })
})

test("interpretGeocodingResponse: status di errore provider (es. REQUEST_DENIED) -> unresolvable, non propagato come provider_error", () => {
  const result = interpretGeocodingResponse({ status: "REQUEST_DENIED" }, "95022")

  assert.deepEqual(result, { ok: false, code: "unresolvable" })
})
