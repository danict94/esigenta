import assert from "node:assert/strict"
import test from "node:test"

import { extractGeoResolveQuery, mapResolverFailure } from "./geo-resolve-contract"

// FASE 8C — route.ts itself is NOT unit-tested here, deliberately: it
// imports resolveManualLocation from @esigenta/domain, whose package
// barrel transitively pulls in @esigenta/funnel/server (server-only
// guarded) — importing it from a bare `node --import tsx --test` process
// throws before any test body even runs (confirmed directly: the first
// version of this file did exactly that). No other route.ts in this repo
// is unit-tested directly for the same reason. All of route.ts's pure
// logic lives in geo-resolve-contract.ts instead (zero @esigenta/domain
// dependency) and is fully covered below.
//
// The full POST handler — including the real network call to Google
// Geocoding for a non-empty, in-bounds query — was verified live,
// one-off, against a local Next dev server exercising the real route
// (95022 -> Aci Catena, "95020 Aci Bonaccorsi" -> OK, "95022 Aci
// Bonaccorsi" -> location_mismatch, an unresolvable query, a simulated
// provider failure) — see the FASE 8C report §7. Not repeated here as a
// permanent automated test to avoid a network-dependent, flaky CI suite,
// consistent with resolve-manual-location.test.ts's own convention.

test("mapResolverFailure: empty_input -> 400", () => {
  const mapped = mapResolverFailure("empty_input")
  assert.equal(mapped.status, 400)
  assert.equal(mapped.code, "empty_input")
})

test("mapResolverFailure: unresolvable -> 422", () => {
  const mapped = mapResolverFailure("unresolvable")
  assert.equal(mapped.status, 422)
  assert.equal(mapped.code, "unresolvable")
})

test("mapResolverFailure: location_mismatch -> 422", () => {
  const mapped = mapResolverFailure("location_mismatch")
  assert.equal(mapped.status, 422)
  assert.equal(mapped.code, "location_mismatch")
})

test("mapResolverFailure: not_configured -> 500, esposto al client come provider_error generico, mai un dettaglio di configurazione", () => {
  const mapped = mapResolverFailure("not_configured")
  assert.equal(mapped.status, 500)
  assert.equal(mapped.code, "provider_error")
  assert.ok(!mapped.error.toLowerCase().includes("google"))
  assert.ok(!mapped.error.toLowerCase().includes("api_key"))
  assert.ok(!mapped.error.toLowerCase().includes("config"))
})

test("mapResolverFailure: provider_error -> 502", () => {
  const mapped = mapResolverFailure("provider_error")
  assert.equal(mapped.status, 502)
  assert.equal(mapped.code, "provider_error")
})

test("mapResolverFailure: un codice sconosciuto viene comunque mappato in modo sicuro (502/provider_error), mai un throw", () => {
  const mapped = mapResolverFailure("qualcosa_di_inatteso")
  assert.equal(mapped.status, 502)
  assert.equal(mapped.code, "provider_error")
})

test("extractGeoResolveQuery: body senza campo query -> empty_input", () => {
  const result = extractGeoResolveQuery({})
  assert.equal(result.ok, false)
  assert.ok(!result.ok && result.error.code === "empty_input")
})

test("extractGeoResolveQuery: body non-oggetto -> empty_input, mai un throw", () => {
  assert.equal(extractGeoResolveQuery(null).ok, false)
  assert.equal(extractGeoResolveQuery(undefined).ok, false)
  assert.equal(extractGeoResolveQuery("stringa").ok, false)
  assert.equal(extractGeoResolveQuery(42).ok, false)
})

test("extractGeoResolveQuery: query vuota/whitespace -> empty_input", () => {
  const result = extractGeoResolveQuery({ query: "   " })
  assert.equal(result.ok, false)
  assert.ok(!result.ok && result.error.code === "empty_input")
})

test("extractGeoResolveQuery: query non-stringa -> empty_input", () => {
  const result = extractGeoResolveQuery({ query: 95022 })
  assert.equal(result.ok, false)
  assert.ok(!result.ok && result.error.code === "empty_input")
})

test("extractGeoResolveQuery: un CAP valido viene trimmato e restituito", () => {
  const result = extractGeoResolveQuery({ query: "  95022  " })
  assert.equal(result.ok, true)
  assert.ok(result.ok && result.query === "95022")
})

test("extractGeoResolveQuery: query implausibilmente lunga -> unresolvable (mai inoltrata al provider, mai troncata)", () => {
  const result = extractGeoResolveQuery({ query: "a".repeat(500) })
  assert.equal(result.ok, false)
  assert.ok(!result.ok && result.error.code === "unresolvable")
})
