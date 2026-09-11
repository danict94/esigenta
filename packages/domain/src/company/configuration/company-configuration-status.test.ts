import assert from "node:assert/strict"
import test from "node:test"

import { deriveCompanyConfigurationStatus } from "./company-configuration-status"

test("configured requires at least one Category and one CompanyIntervention", () => {
  assert.equal(
    deriveCompanyConfigurationStatus({
      categoryIds: ["category"],
      interventionIds: ["intervention"],
    }).isConfigured,
    true,
  )
  assert.equal(
    deriveCompanyConfigurationStatus({
      categoryIds: ["category"],
      interventionIds: [],
    }).isConfigured,
    false,
  )
  assert.equal(
    deriveCompanyConfigurationStatus({
      categoryIds: [],
      interventionIds: ["intervention"],
    }).isConfigured,
    false,
  )
})
