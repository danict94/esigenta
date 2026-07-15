import { isCompanyMarketplaceReady } from "@esigenta/auth"

import {
  evaluateCompanyRequestEligibility,
  type CompanyRequestEligibilityRequestSnapshot,
} from "./company-request-eligibility"
import type { CompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"

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

type RequestVisibilityGrants = {
  hasUnlock: boolean
  hasSaved: boolean
  hasDispatch: boolean
}

export type RequestVisibilityInput = {
  companySnapshot: CompanyMarketplaceCapabilitySnapshot
  request: CompanyRequestEligibilityRequestSnapshot
  grants: RequestVisibilityGrants
}

export type RequestVisibilityResult = {
  visible: boolean
  isLiveMatch: boolean
  hasGrant: boolean
}

export function evaluateRequestVisibility({
  companySnapshot,
  request,
  grants,
}: RequestVisibilityInput): RequestVisibilityResult {
  if (!isCompanyMarketplaceReady(companySnapshot.marketplaceState)) {
    return { visible: false, isLiveMatch: false, hasGrant: false }
  }

  const eligibility = evaluateCompanyRequestEligibility({
    companySnapshot,
    requestSnapshot: request,
  })
  const isLiveMatch = eligibility.eligible

  const hasGrant =
    grants.hasUnlock || grants.hasSaved || grants.hasDispatch

  return {
    visible: isLiveMatch || hasGrant,
    isLiveMatch,
    hasGrant,
  }
}
