import assert from "node:assert/strict"
import test from "node:test"

import { getCompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"

test("marketplace snapshot uses one read for one or many Categories", async () => {
  let reads = 0
  const snapshot = await getCompanyMarketplaceCapabilitySnapshot(
    "company-1",
    async () => {
      reads += 1
      return {
        id: "company-1",
        isActive: true,
        deletedAt: null,
        status: "APPROVED",
        operatingRadiusKm: 30,
        geoLocation: { latitude: 41.9, longitude: 12.5 },
        categories: [
          { categoryId: "idraulico" },
          { categoryId: "elettricista" },
          { categoryId: "idraulico" },
        ],
        interventions: [
          { interventionId: "water-leak" },
          { interventionId: "water-leak" },
          { interventionId: "radiators" },
        ],
      }
    },
  )

  assert.equal(reads, 1)
  assert.deepEqual(snapshot?.enabledCategoryIds, ["idraulico", "elettricista"])
  assert.deepEqual(snapshot?.selectedInterventionIds, [
    "water-leak",
    "radiators",
  ])
  assert.equal(snapshot?.isConfigured, true)
})
