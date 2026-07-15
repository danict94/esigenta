import { isCompanyMarketplaceReady } from "@esigenta/auth"
import { getDistanceKm } from "@esigenta/shared"

import type { CompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"

export type CompanyRequestEligibilityRequestSnapshot = {
  interventionId: string | null
  interventionProjectGroupId: string | null
  coordinates: {
    latitude: number
    longitude: number
  } | null
}

export type CompanyRequestEligibilityReason =
  | "eligible_by_selected_intervention"
  | "eligible_by_category"
  | "company_not_marketplace_ready"
  | "company_not_configured"
  | "company_location_missing"
  | "request_location_missing"
  | "no_compatible_intervention"
  | "outside_operating_radius"

export type CompanyRequestEligibilityResult = {
  eligible: boolean
  reason: CompanyRequestEligibilityReason
  isConfigured: boolean
  matchesSelectedIntervention: boolean
  matchesCategory: boolean
  withinOperatingRadius: boolean
}

export function isCompanyMarketplaceCapabilityConfigured(
  snapshot: CompanyMarketplaceCapabilitySnapshot,
): boolean {
  return (
    snapshot.enabledCategoryIds.length > 0 &&
    snapshot.enabledCategoryProjectGroupIds.length > 0
  )
}

export function evaluateCompanyRequestEligibility({
  companySnapshot,
  requestSnapshot,
}: {
  companySnapshot: CompanyMarketplaceCapabilitySnapshot
  requestSnapshot: CompanyRequestEligibilityRequestSnapshot
}): CompanyRequestEligibilityResult {
  const isConfigured =
    isCompanyMarketplaceCapabilityConfigured(companySnapshot)
  const matchesSelectedIntervention =
    requestSnapshot.interventionId !== null &&
    companySnapshot.selectedInterventionIds.includes(
      requestSnapshot.interventionId,
    )
  const matchesCategory =
    requestSnapshot.interventionProjectGroupId !== null &&
    companySnapshot.enabledCategoryProjectGroupIds.includes(
      requestSnapshot.interventionProjectGroupId,
    )

  const base = {
    isConfigured,
    matchesSelectedIntervention,
    matchesCategory,
  }

  if (!isCompanyMarketplaceReady(companySnapshot.marketplaceState)) {
    return {
      ...base,
      eligible: false,
      reason: "company_not_marketplace_ready",
      withinOperatingRadius: false,
    }
  }

  if (!isConfigured) {
    return {
      ...base,
      eligible: false,
      reason: "company_not_configured",
      withinOperatingRadius: false,
    }
  }

  if (!companySnapshot.coordinates) {
    return {
      ...base,
      eligible: false,
      reason: "company_location_missing",
      withinOperatingRadius: false,
    }
  }

  if (!requestSnapshot.coordinates) {
    return {
      ...base,
      eligible: false,
      reason: "request_location_missing",
      withinOperatingRadius: false,
    }
  }

  if (!matchesSelectedIntervention && !matchesCategory) {
    return {
      ...base,
      eligible: false,
      reason: "no_compatible_intervention",
      withinOperatingRadius: false,
    }
  }

  const distanceKm = getDistanceKm({
    fromLatitude: companySnapshot.coordinates.latitude,
    fromLongitude: companySnapshot.coordinates.longitude,
    toLatitude: requestSnapshot.coordinates.latitude,
    toLongitude: requestSnapshot.coordinates.longitude,
  })
  const withinOperatingRadius =
    Number.isFinite(companySnapshot.operatingRadiusKm) &&
    distanceKm <= companySnapshot.operatingRadiusKm

  if (!withinOperatingRadius) {
    return {
      ...base,
      eligible: false,
      reason: "outside_operating_radius",
      withinOperatingRadius,
    }
  }

  return {
    ...base,
    eligible: true,
    reason: matchesSelectedIntervention
      ? "eligible_by_selected_intervention"
      : "eligible_by_category",
    withinOperatingRadius,
  }
}
