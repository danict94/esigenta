import assert from "node:assert/strict"
import test from "node:test"

import type { CompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"
import { evaluateCompanyRequestEligibility } from "./company-request-eligibility"
import { evaluateRequestVisibility } from "./request-visibility"

const companySnapshot: CompanyMarketplaceCapabilitySnapshot = {
  companyId: "company-1",
  marketplaceState: {
    isActive: true,
    deletedAt: null,
    status: "APPROVED",
  },
  coordinates: { latitude: 41.9028, longitude: 12.4964 },
  operatingRadiusKm: 30,
  enabledCategoryIds: ["category-1"],
  enabledCategoryProjectGroupIds: ["project-group-1"],
  selectedInterventionIds: ["intervention-selected"],
}

const nearbyRequest = {
  interventionId: "intervention-category",
  interventionProjectGroupId: "project-group-1",
  coordinates: { latitude: 41.91, longitude: 12.5 },
}

test("matches a request through an enabled category project group", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: nearbyRequest,
  })

  assert.equal(result.eligible, true)
  assert.equal(result.matchesCategory, true)
  assert.equal(result.reason, "eligible_by_category")
})

test("matches an explicitly selected intervention", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: {
      ...nearbyRequest,
      interventionId: "intervention-selected",
      interventionProjectGroupId: "another-project-group",
    },
  })

  assert.equal(result.eligible, true)
  assert.equal(result.matchesSelectedIntervention, true)
  assert.equal(result.reason, "eligible_by_selected_intervention")
})

test("rejects a request with no compatible intervention", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: {
      ...nearbyRequest,
      interventionId: "other-intervention",
      interventionProjectGroupId: "other-project-group",
    },
  })

  assert.equal(result.eligible, false)
  assert.equal(result.reason, "no_compatible_intervention")
})

test("rejects a company without geolocation", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot: { ...companySnapshot, coordinates: null },
    requestSnapshot: nearbyRequest,
  })

  assert.equal(result.eligible, false)
  assert.equal(result.reason, "company_location_missing")
})

test("rejects a request outside the operating radius", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: {
      ...nearbyRequest,
      coordinates: { latitude: 45.4642, longitude: 9.19 },
    },
  })

  assert.equal(result.eligible, false)
  assert.equal(result.withinOperatingRadius, false)
  assert.equal(result.reason, "outside_operating_radius")
})

test("accepts a request inside the operating radius", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: nearbyRequest,
  })

  assert.equal(result.eligible, true)
  assert.equal(result.withinOperatingRadius, true)
})

test("a category configuration without operational project groups is not configured", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot: {
      ...companySnapshot,
      enabledCategoryProjectGroupIds: [],
      selectedInterventionIds: [],
    },
    requestSnapshot: nearbyRequest,
  })

  assert.equal(result.eligible, false)
  assert.equal(result.isConfigured, false)
  assert.equal(result.reason, "company_not_configured")
})

test("explicit interventions remain valid when category configuration exists", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: {
      ...nearbyRequest,
      interventionId: "intervention-selected",
      interventionProjectGroupId: null,
    },
  })

  assert.equal(result.eligible, true)
  assert.equal(result.reason, "eligible_by_selected_intervention")
})

test("visibility preserves grant bypass and marketplace readiness semantics", () => {
  const outsideRadius = {
    ...nearbyRequest,
    coordinates: { latitude: 45.4642, longitude: 9.19 },
  }
  const granted = evaluateRequestVisibility({
    companySnapshot,
    request: outsideRadius,
    grants: { hasUnlock: true, hasSaved: false, hasDispatch: false },
  })
  const suspended = evaluateRequestVisibility({
    companySnapshot: {
      ...companySnapshot,
      marketplaceState: {
        ...companySnapshot.marketplaceState,
        status: "SUSPENDED",
      },
    },
    request: nearbyRequest,
    grants: { hasUnlock: true, hasSaved: false, hasDispatch: false },
  })

  assert.deepEqual(granted, {
    visible: true,
    isLiveMatch: false,
    hasGrant: true,
  })
  assert.deepEqual(suspended, {
    visible: false,
    isLiveMatch: false,
    hasGrant: false,
  })
})
