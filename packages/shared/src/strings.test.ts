import assert from "node:assert/strict"
import test from "node:test"

import { normalizeComparableText, normalizeRequiredText } from "./strings"

// FASE 8B.1 — normalizeComparableText backs the coherence check between
// what a user explicitly typed and what Google's Geocoding API resolved
// to (see packages/domain/src/internal/geo/resolve-manual-location.ts).

test("normalizeRequiredText: comportamento preesistente invariato", () => {
  assert.equal(normalizeRequiredText("  Roma  "), "Roma")
  assert.equal(normalizeRequiredText("   "), null)
  assert.equal(normalizeRequiredText(undefined), null)
})

test("normalizeComparableText: case-insensitive", () => {
  assert.equal(normalizeComparableText("ACI BONACCORSI"), normalizeComparableText("aci bonaccorsi"))
})

test("normalizeComparableText: whitespace-insensitive (spazi multipli/estremi)", () => {
  assert.equal(normalizeComparableText("  Aci   Bonaccorsi  "), normalizeComparableText("Aci Bonaccorsi"))
})

test("normalizeComparableText: accent-insensitive", () => {
  assert.equal(normalizeComparableText("Citta di Castello"), normalizeComparableText("Città di Castello"))
})

test("normalizeComparableText: apostrofo/accento-insensitive (varianti tipografiche)", () => {
  const variants = ["Sant'Agata de' Goti", "Sant’Agata de’ Goti", "Sant`Agata de` Goti"]
  const normalized = variants.map(normalizeComparableText)
  assert.ok(normalized.every((value) => value === normalized[0]))
})

test("normalizeComparableText: due comuni realmente diversi restano diversi", () => {
  assert.notEqual(normalizeComparableText("Aci Bonaccorsi"), normalizeComparableText("Aci Catena"))
})
