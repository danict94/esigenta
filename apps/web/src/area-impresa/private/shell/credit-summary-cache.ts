import "server-only"

import { cache } from "react"

import { getCompanyCreditSummary, type CompanyCreditSummaryView } from "@esigenta/billing"

/**
 * The credit balance read (packages/billing, no domain/business change here)
 * is needed by the shell topbar and, independently, by the panel/full
 * request-detail reads that decide unlock eligibility — both run inside the
 * same server render (the shell layout always wraps the page). React's
 * cache() dedupes same-argument calls within one request only (unlike
 * shell-counts-cache.ts's unstable_cache, this never persists across
 * navigations), so wrapping the single shared entry point here is enough for
 * every caller to collapse onto one query, as long as they all import this
 * function rather than @esigenta/billing directly.
 */
export const getCompanyCreditSummaryCached = cache(
  function getCompanyCreditSummaryCached(
    companyId: string,
  ): Promise<CompanyCreditSummaryView> {
    return getCompanyCreditSummary(companyId)
  },
)
