import assert from "node:assert/strict"
import test from "node:test"

import { buildLegacyQueryRedirectTarget } from "./build-legacy-query-redirect-target"

test("buildLegacyQueryRedirectTarget: null se q non è presente, nessun redirect necessario", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "tinteggiare-pareti",
    searchParams: { gclid: "ABC123" },
  })

  assert.equal(target, null)
})

test("buildLegacyQueryRedirectTarget: null quando non c'è alcun parametro", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "tinteggiare-pareti",
    searchParams: {},
  })

  assert.equal(target, null)
})

test("buildLegacyQueryRedirectTarget: rimuove solo q quando è l'unico parametro", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "tinteggiare-pareti",
    searchParams: { q: "voglio tinteggiare casa" },
  })

  assert.equal(target, "/richiesta/tinteggiare-pareti")
})

test("buildLegacyQueryRedirectTarget: rimuove q ma preserva gclid", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "tinteggiare-pareti",
    searchParams: { q: "legacy", gclid: "ABC123" },
  })

  assert.equal(target, "/richiesta/tinteggiare-pareti?gclid=ABC123")
})

test("buildLegacyQueryRedirectTarget: preserva più parametri oltre a gclid", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "tinteggiare-pareti",
    searchParams: { q: "legacy", gclid: "ABC123", utm_source: "google" },
  })

  assert.equal(
    target,
    "/richiesta/tinteggiare-pareti?gclid=ABC123&utm_source=google",
  )
})

test("buildLegacyQueryRedirectTarget: percent-encode dello slug nel path", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "intervento con spazio",
    searchParams: { q: "legacy" },
  })

  assert.equal(target, "/richiesta/intervento%20con%20spazio")
})

test("buildLegacyQueryRedirectTarget: preserva un parametro ripetuto (array)", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "tinteggiare-pareti",
    searchParams: { q: "legacy", foo: ["a", "b"] },
  })

  assert.equal(target, "/richiesta/tinteggiare-pareti?foo=a&foo=b")
})

test("buildLegacyQueryRedirectTarget: q vuota conta comunque come presente e va rimossa", () => {
  const target = buildLegacyQueryRedirectTarget({
    requestSlug: "tinteggiare-pareti",
    searchParams: { q: "", gclid: "ABC123" },
  })

  assert.equal(target, "/richiesta/tinteggiare-pareti?gclid=ABC123")
})
