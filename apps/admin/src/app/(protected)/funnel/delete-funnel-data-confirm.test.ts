import assert from "node:assert/strict"
import test from "node:test"

import {
  DELETE_FUNNEL_DATA_CONFIRM_PHRASE,
  isFunnelDataDeletionConfirmed,
} from "./delete-funnel-data-confirm"

test("isFunnelDataDeletionConfirmed: corrispondenza esatta -> true", () => {
  assert.equal(
    isFunnelDataDeletionConfirmed(DELETE_FUNNEL_DATA_CONFIRM_PHRASE),
    true,
  )
})

test("isFunnelDataDeletionConfirmed: spazi accidentali a inizio/fine vengono tollerati (trim)", () => {
  assert.equal(
    isFunnelDataDeletionConfirmed(`  ${DELETE_FUNNEL_DATA_CONFIRM_PHRASE}  `),
    true,
  )
})

test("isFunnelDataDeletionConfirmed: case-sensitive, mai una corrispondenza case-insensitive", () => {
  assert.equal(
    isFunnelDataDeletionConfirmed(DELETE_FUNNEL_DATA_CONFIRM_PHRASE.toLowerCase()),
    false,
  )
})

test("isFunnelDataDeletionConfirmed: testo vuoto -> false, mai un throw", () => {
  assert.equal(isFunnelDataDeletionConfirmed(""), false)
})

test("isFunnelDataDeletionConfirmed: corrispondenza parziale/sottostringa -> false", () => {
  assert.equal(isFunnelDataDeletionConfirmed("ELIMINA DATI"), false)
  assert.equal(isFunnelDataDeletionConfirmed("ELIMINA DATI FUNNEL!"), false)
  assert.equal(
    isFunnelDataDeletionConfirmed(`${DELETE_FUNNEL_DATA_CONFIRM_PHRASE} `.repeat(2)),
    false,
  )
})

test("isFunnelDataDeletionConfirmed: spazio interno diverso (es. doppio spazio) -> false, non solo trim esterno", () => {
  assert.equal(isFunnelDataDeletionConfirmed("ELIMINA  DATI FUNNEL"), false)
})
