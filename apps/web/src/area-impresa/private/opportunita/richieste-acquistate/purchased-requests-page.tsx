import Link from "next/link"

import {
  PageShell,
} from "@esigenta/ui"

import {
  getCompanyPurchasedRequestsPage,
} from "@esigenta/domain"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"

import {
  createPerfTrace,
} from "../../../monitoring/area-impresa-perf-trace"

import {
  CompanyRequestList,
} from "../components/company-request-list"

import {
  toggleSavedRequestAction,
} from "../actions/toggle-saved-request-action"

export type PurchasedRequestsPageProps = {
  searchParams: Promise<{
    page?: string | string[]
  }>
}

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function buildPageHref(targetPage: number) {
  return targetPage > 1
    ? `/area-impresa/richieste-acquistate?page=${targetPage}`
    : "/area-impresa/richieste-acquistate"
}

export async function PurchasedRequestsPage({
  searchParams,
}: PurchasedRequestsPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.purchasedRequests.start", {})
  }

  const [resolvedSearchParams, actor] = await Promise.all([
    searchParams,
    requireAreaImpresaAccess(),
  ])

  const pageParam = Number(
    readSearchParam(resolvedSearchParams.page) ?? "1",
  )
  const currentPage =
    Number.isFinite(pageParam) && pageParam >= 1
      ? Math.floor(pageParam)
      : 1

  const purchasedTrace = monitored
    ? createPerfTrace({ scope: "purchased-requests" })
    : null

  const queryStart = areaTimestamp()
  const result = await getCompanyPurchasedRequestsPage(
    actor,
    currentPage,
    purchasedTrace !== null ? purchasedTrace.add : undefined,
  )
  const queryMs = Math.round(areaTimestamp() - queryStart)

  if (monitored) {
    purchasedTrace?.finish({
      count: result.requests.length,
    })
    areaLog("area.model.purchasedRequests.end", {
      result: "ok",
      count: result.requests.length,
      page: result.page,
      hasNextPage: result.hasNextPage,
      durationMs: Math.round(areaTimestamp() - pageStart),
      queryMs,
    })
  }

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div>
          <p className="text-sm font-medium text-cantiere-ink-secondary">
            Dashboard impresa
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-cantiere-ink">
            Richieste acquistate
          </h1>

          <p className="mt-1 text-sm text-cantiere-ink-secondary">
            {result.requests.length} richieste
          </p>
        </div>

        <CompanyRequestList
          requests={result.requests}
          mode="purchased"
          emptyMessage="Non hai ancora acquistato richieste."
          savedAction={toggleSavedRequestAction}
        />

        {(result.page > 1 || result.hasNextPage) ? (
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              {result.page > 1 ? (
                <Link
                  href={buildPageHref(result.page - 1)}
                  className="text-sm font-medium text-cantiere-accent"
                  prefetch={false}
                >
                  &larr; Pagina precedente
                </Link>
              ) : null}
            </div>
            <div>
              {result.hasNextPage ? (
                <Link
                  href={buildPageHref(result.page + 1)}
                  className="text-sm font-medium text-cantiere-accent"
                  prefetch={false}
                >
                  Pagina successiva &rarr;
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </PageShell>
  )
}
