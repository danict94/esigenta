import assert from "node:assert/strict"
import test from "node:test"

import { resolveProfessionOnboardingDefaults } from "@esigenta/taxonomy/frozen"

import type { CompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"
import { evaluateCompanyRequestEligibility } from "./company-request-eligibility"
import { evaluateRequestVisibility } from "./request-visibility"

const companySnapshot: CompanyMarketplaceCapabilitySnapshot = {
  companyId: "company-1",
  marketplaceState: { isActive: true, deletedAt: null, status: "APPROVED" },
  coordinates: { latitude: 41.9028, longitude: 12.4964 },
  operatingRadiusKm: 30,
  enabledCategoryIds: ["idraulico"],
  selectedInterventionIds: ["riparare-perdita-acqua"],
  isConfigured: true,
}

const nearbyRequest = {
  interventionId: "riparare-perdita-acqua",
  coordinates: { latitude: 41.91, longitude: 12.5 },
}

test("an explicitly persisted CompanyIntervention is eligible", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: nearbyRequest,
  })
  assert.equal(result.eligible, true)
  assert.equal(result.matchesSelectedIntervention, true)
  assert.equal(result.reason, "eligible_by_selected_intervention")
})

test("Category alone neither configures nor makes a request eligible", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot: {
      ...companySnapshot,
      selectedInterventionIds: [],
      isConfigured: false,
    },
    requestSnapshot: nearbyRequest,
  })
  assert.equal(result.eligible, false)
  assert.equal(result.isConfigured, false)
  assert.equal(result.reason, "company_not_configured")
})

test("an unselected Intervention stays invisible even within the same profession", () => {
  const result = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: {
      ...nearbyRequest,
      interventionId: "installare-o-sostituire-caldaia",
    },
  })
  assert.equal(result.eligible, false)
  assert.equal(result.reason, "no_compatible_intervention")
})

test("adding and removing CompanyIntervention immediately changes eligibility", () => {
  const boilerRequest = {
    ...nearbyRequest,
    interventionId: "installare-o-sostituire-caldaia",
  }
  const added = evaluateCompanyRequestEligibility({
    companySnapshot: {
      ...companySnapshot,
      selectedInterventionIds: [
        ...companySnapshot.selectedInterventionIds,
        "installare-o-sostituire-caldaia",
      ],
    },
    requestSnapshot: boilerRequest,
  })
  const removed = evaluateCompanyRequestEligibility({
    companySnapshot: {
      ...companySnapshot,
      selectedInterventionIds: ["installare-o-sostituire-termosifoni"],
    },
    requestSnapshot: nearbyRequest,
  })
  assert.equal(added.eligible, true)
  assert.equal(removed.eligible, false)
  assert.equal(removed.reason, "no_compatible_intervention")
})

test("the Idraulico signup preset exposes 7 defaults but not boiler or heat pump", () => {
  const defaults = resolveProfessionOnboardingDefaults("idraulico")
  assert.ok(defaults)
  const selectedInterventionIds = defaults.projectGroups.flatMap(
    ({ interventions }) => interventions.map((intervention) => intervention.slug),
  )
  const presetSnapshot = { ...companySnapshot, selectedInterventionIds }
  const evaluate = (interventionId: string) =>
    evaluateCompanyRequestEligibility({
      companySnapshot: presetSnapshot,
      requestSnapshot: { ...nearbyRequest, interventionId },
    })

  assert.equal(selectedInterventionIds.length, 7)
  assert.equal(evaluate("riparare-perdita-acqua").eligible, true)
  assert.equal(evaluate("installare-o-sostituire-termosifoni").eligible, true)
  assert.equal(evaluate("installare-o-sostituire-caldaia").eligible, false)
  assert.equal(evaluate("installare-pompa-di-calore").eligible, false)
})

test("location, radius and marketplace readiness gates remain unchanged", () => {
  assert.equal(
    evaluateCompanyRequestEligibility({
      companySnapshot: { ...companySnapshot, coordinates: null },
      requestSnapshot: nearbyRequest,
    }).reason,
    "company_location_missing",
  )
  assert.equal(
    evaluateCompanyRequestEligibility({
      companySnapshot,
      requestSnapshot: {
        ...nearbyRequest,
        coordinates: { latitude: 45.4642, longitude: 9.19 },
      },
    }).reason,
    "outside_operating_radius",
  )
  assert.equal(
    evaluateCompanyRequestEligibility({
      companySnapshot: {
        ...companySnapshot,
        marketplaceState: {
          ...companySnapshot.marketplaceState,
          status: "SUSPENDED",
        },
      },
      requestSnapshot: nearbyRequest,
    }).reason,
    "company_not_marketplace_ready",
  )
})

test("saved, unlock and dispatch grants remain independent of live eligibility", () => {
  const ineligibleRequest = {
    ...nearbyRequest,
    interventionId: "installare-o-sostituire-caldaia",
    coordinates: { latitude: 45.4642, longitude: 9.19 },
  }
  for (const grants of [
    { hasUnlock: true, hasSaved: false, hasDispatch: false },
    { hasUnlock: false, hasSaved: true, hasDispatch: false },
    { hasUnlock: false, hasSaved: false, hasDispatch: true },
  ]) {
    assert.deepEqual(
      evaluateRequestVisibility({
        companySnapshot,
        request: ineligibleRequest,
        grants,
      }),
      { visible: true, isLiveMatch: false, hasGrant: true },
    )
  }
})
