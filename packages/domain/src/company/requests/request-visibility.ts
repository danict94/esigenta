import { isCompanyMarketplaceReady } from "@esigenta/auth"
import type { CompanyMarketplaceState } from "@esigenta/auth"
import { getDistanceKm } from "@esigenta/shared"

import {
  getDefaultVisibilityInterventionIds,
  type CompanyRequestEligibility,
} from "./company-request-eligibility"

/**
 * THE canonical "can this company see this request" decision — see
 * docs/domain-invariants/03_REQUEST_VISIBILITY.md. Single definition, used
 * by the request detail page. The browse list page is a bulk-query
 * restriction of exactly the LiveMatch half of this same rule (grants are
 * intentionally not part of "what's discoverable," only of "what's
 * already yours" — see the doc for the full reasoning); saved/purchased
 * lists are each one Grant in isolation, by design.
 *
 * Visible = MarketplaceReady AND (LiveMatch OR Grant)
 *   LiveMatch = isConfigured AND interventionId in scope AND within coverage radius
 *   Grant     = already unlocked OR already saved OR already dispatched to
 *
 * MarketplaceReady is an absolute gate — a Grant never bypasses it. A
 * suspended company cannot see a request it unlocked before suspension.
 */

export type RequestVisibilityGrants = {
  hasUnlock: boolean
  hasSaved: boolean
  hasDispatch: boolean
}

export type RequestVisibilityInput = {
  company: CompanyMarketplaceState
  eligibility: CompanyRequestEligibility
  companyCoordinates: { latitude: number; longitude: number } | null
  operatingRadiusKm: number | null
  request: {
    interventionId: string | null
    coordinates: { latitude: number; longitude: number } | null
  }
  grants: RequestVisibilityGrants
}

export type RequestVisibilityResult = {
  visible: boolean
  isLiveMatch: boolean
  hasGrant: boolean
}

function isWithinCoverage({
  companyCoordinates,
  operatingRadiusKm,
  requestCoordinates,
}: {
  companyCoordinates: { latitude: number; longitude: number } | null
  operatingRadiusKm: number | null
  requestCoordinates: { latitude: number; longitude: number } | null
}): boolean {
  if (
    !companyCoordinates ||
    !requestCoordinates ||
    typeof operatingRadiusKm !== "number" ||
    !Number.isFinite(operatingRadiusKm)
  ) {
    return false
  }

  const distanceKm = getDistanceKm({
    fromLatitude: companyCoordinates.latitude,
    fromLongitude: companyCoordinates.longitude,
    toLatitude: requestCoordinates.latitude,
    toLongitude: requestCoordinates.longitude,
  })

  return distanceKm <= operatingRadiusKm
}

export function evaluateRequestVisibility({
  company,
  eligibility,
  companyCoordinates,
  operatingRadiusKm,
  request,
  grants,
}: RequestVisibilityInput): RequestVisibilityResult {
  if (!isCompanyMarketplaceReady(company)) {
    return { visible: false, isLiveMatch: false, hasGrant: false }
  }

  const visibilityInterventionIds =
    getDefaultVisibilityInterventionIds(eligibility)

  const isLiveMatch =
    eligibility.isConfigured &&
    request.interventionId !== null &&
    visibilityInterventionIds.has(request.interventionId) &&
    isWithinCoverage({
      companyCoordinates,
      operatingRadiusKm,
      requestCoordinates: request.coordinates,
    })

  const hasGrant =
    grants.hasUnlock || grants.hasSaved || grants.hasDispatch

  return {
    visible: isLiveMatch || hasGrant,
    isLiveMatch,
    hasGrant,
  }
}
