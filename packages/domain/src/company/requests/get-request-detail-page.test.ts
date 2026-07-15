import assert from "node:assert/strict"
import test from "node:test"

import { shouldLoadRequestPhotos } from "./get-request-detail-page"

test("skips the photo query when the core read model reports zero photos", () => {
  assert.equal(shouldLoadRequestPhotos(0), false)
})

test("loads photos when the core read model reports at least one photo", () => {
  assert.equal(shouldLoadRequestPhotos(1), true)
  assert.equal(shouldLoadRequestPhotos(5), true)
})
