"use server"

import {
  getCompanyRequestsListPage,
  type RequestDashboardFilters,
} from "@esigenta/domain"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"

/**
 * Backs the dashboard's "Carica altre richieste" button — reuses the same
 * paginated query as the initial page load (packages/domain already offsets
 * by page, so this is not a new pagination mechanism).
 */
export async function loadMoreRequestsAction({
  filters,
  page,
}: {
  filters: RequestDashboardFilters
  page: number
}) {
  const actor = await requireAreaImpresaAccess()
  const result = await getCompanyRequestsListPage(actor, filters, page)

  if (!result.ok) {
    return {
      ok: false as const,
      requests: [],
      hasNextPage: false,
      page,
    }
  }

  return {
    ok: true as const,
    requests: result.requests,
    hasNextPage: result.hasNextPage,
    page: result.page,
  }
}
