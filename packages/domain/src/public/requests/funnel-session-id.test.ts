import assert from "node:assert/strict"
import test from "node:test"

import { normalizeFunnelSessionId } from "./funnel-session-id"

test("normalizeFunnelSessionId: accetta un UUID valido (formato crypto.randomUUID()) invariato", () => {
  const id = "3fa85f64-5717-4562-b3fc-2c963f66afa6"

  assert.equal(normalizeFunnelSessionId(id), id)
})

test("normalizeFunnelSessionId: accetta un UUID in maiuscolo, restituito invariato (non rimappato in minuscolo)", () => {
  const id = "3FA85F64-5717-4562-B3FC-2C963F66AFA6"

  assert.equal(normalizeFunnelSessionId(id), id)
})

// --- Test 8: payload invalido -> rifiutato/normalizzato, mai un throw ---

test("normalizeFunnelSessionId: undefined -> undefined", () => {
  assert.equal(normalizeFunnelSessionId(undefined), undefined)
})

test("normalizeFunnelSessionId: null -> undefined", () => {
  assert.equal(normalizeFunnelSessionId(null), undefined)
})

test("normalizeFunnelSessionId: stringa vuota -> undefined", () => {
  assert.equal(normalizeFunnelSessionId(""), undefined)
})

test("normalizeFunnelSessionId: stringa arbitraria non-UUID -> undefined", () => {
  assert.equal(normalizeFunnelSessionId("not-a-uuid"), undefined)
})

test("normalizeFunnelSessionId: stringa troppo lunga (payload arbitrario/malevolo) -> undefined, mai troncata e accettata", () => {
  assert.equal(
    normalizeFunnelSessionId("3fa85f64-5717-4562-b3fc-2c963f66afa6" + "x".repeat(10_000)),
    undefined,
  )
})

test("normalizeFunnelSessionId: un email/PII passata per errore come funnelSessionId non viene mai accettata come tale", () => {
  assert.equal(normalizeFunnelSessionId("cliente@esempio.it"), undefined)
})

test("normalizeFunnelSessionId: tipi non-stringa (numero, oggetto, array) -> undefined, mai un throw", () => {
  assert.equal(normalizeFunnelSessionId(12345), undefined)
  assert.equal(normalizeFunnelSessionId({}), undefined)
  assert.equal(normalizeFunnelSessionId([]), undefined)
})
