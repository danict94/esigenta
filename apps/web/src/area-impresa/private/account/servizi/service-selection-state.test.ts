import assert from "node:assert/strict"
import test from "node:test"

import {
  initializeInterventionSelection,
  replaceProjectGroupInterventionSelection,
  toggleInterventionSelection,
} from "./service-selection-state"

test("configuration starts from persisted CompanyIntervention ids", () => {
  const persisted = ["radiators", "floor-heating"]
  const state = initializeInterventionSelection(persisted)

  assert.deepEqual(state, persisted)
  assert.notEqual(state, persisted)
})

test("individual selections can be removed and added", () => {
  assert.deepEqual(toggleInterventionSelection(["radiators"], "radiators"), [])
  assert.deepEqual(toggleInterventionSelection(["radiators"], "boiler"), [
    "radiators",
    "boiler",
  ])
})

test("group selection replaces only that group's ids", () => {
  const current = ["outside", "old-in-group"]
  const groupIds = ["old-in-group", "new-in-group"]

  assert.deepEqual(
    replaceProjectGroupInterventionSelection(current, groupIds, true),
    ["outside", "old-in-group", "new-in-group"],
  )
  assert.deepEqual(
    replaceProjectGroupInterventionSelection(current, groupIds, false),
    ["outside"],
  )
})
