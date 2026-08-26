import assert from "node:assert/strict"
import test from "node:test"

import { resolveExitFeedbackReasonOptions } from "./resolve-exit-feedback-reason-options"

function reasonCodes(
  options: { reasonCode: string }[],
): string[] {
  return options.map((option) => option.reasonCode)
}

test("resolveExitFeedbackReasonOptions: stepIndex 0 -> elenco 'early', qualunque sia il tipo", () => {
  const options = resolveExitFeedbackReasonOptions({ type: "single_select" }, 0)

  assert.deepEqual(reasonCodes(options), [
    "just_browsing",
    "want_cost_first",
    "not_ready",
    "dont_know_what_to_choose",
    "other",
  ])
})

test("resolveExitFeedbackReasonOptions: tipo location a un indice > 0 -> elenco 'early' comunque", () => {
  const options = resolveExitFeedbackReasonOptions({ type: "location" }, 2)

  assert.deepEqual(reasonCodes(options), [
    "just_browsing",
    "want_cost_first",
    "not_ready",
    "dont_know_what_to_choose",
    "other",
  ])
})

test("resolveExitFeedbackReasonOptions: step tecnico intermedio (non location, non contact, non stepIndex 0) -> elenco 'technical'", () => {
  const options = resolveExitFeedbackReasonOptions({ type: "multi_select" }, 3)

  assert.deepEqual(reasonCodes(options), [
    "dont_know_what_to_choose",
    "too_many_questions",
    "want_cost_first",
    "not_ready",
    "other",
  ])
})

test("resolveExitFeedbackReasonOptions: step photo_upload/number/text/textarea non a stepIndex 0 -> elenco 'technical'", () => {
  for (const type of ["photo_upload", "number", "text", "textarea"] as const) {
    const options = resolveExitFeedbackReasonOptions({ type }, 4)

    assert.deepEqual(reasonCodes(options), [
      "dont_know_what_to_choose",
      "too_many_questions",
      "want_cost_first",
      "not_ready",
      "other",
    ])
  }
})

test("resolveExitFeedbackReasonOptions: tipo contact -> elenco 'contact', anche se fosse stepIndex 0", () => {
  const options = resolveExitFeedbackReasonOptions({ type: "contact" }, 0)

  assert.deepEqual(reasonCodes(options), [
    "dont_want_to_share_contact",
    "want_cost_first",
    "not_ready",
    "just_browsing",
    "other",
  ])
})

test("resolveExitFeedbackReasonOptions: 'not_ready' ha un'etichetta diversa in 'early/technical' rispetto a 'contact'", () => {
  const early = resolveExitFeedbackReasonOptions({ type: "single_select" }, 0)
  const contact = resolveExitFeedbackReasonOptions({ type: "contact" }, 5)

  const earlyNotReady = early.find((option) => option.reasonCode === "not_ready")
  const contactNotReady = contact.find((option) => option.reasonCode === "not_ready")

  assert.equal(earlyNotReady?.label, "Non sono ancora pronto a fare la richiesta")
  assert.equal(contactNotReady?.label, "Non sono ancora pronto a essere contattato")
  assert.notEqual(earlyNotReady?.label, contactNotReady?.label)
})
