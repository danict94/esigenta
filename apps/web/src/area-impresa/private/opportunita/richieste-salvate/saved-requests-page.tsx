import Link from "next/link"

import {
  PageShell,
} from "@esigenta/ui"

import {
  getCompanySavedRequestsPage,
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

export type SavedRequestsPageProps = {
  searchParams: Promise<{
    page?: string | string[]
  }>
}

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function buildPageHref(targetPage: number) {
  return targetPage > 1
    ? `/area-impresa/richieste-salvate?page=${targetPage}`
    : "/area-impresa/richieste-salvate"
}

export async function SavedRequestsPage({
  searchParams,
}: SavedRequestsPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.savedRequests.start", {})
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

  const savedTrace = monitored
    ? createPerfTrace({ scope: "saved-requests" })
    : null

  const queryStart = areaTimestamp()
  const result = await getCompanySavedRequestsPage(
    actor,
    currentPage,
    savedTrace !== null ? savedTrace.add : undefined,
  )
  const queryMs = Math.round(areaTimestamp() - queryStart)

  if (monitored) {
    savedTrace?.finish({
      count: result.requests.length,
    })
    areaLog("area.model.savedRequests.end", {
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
          <p className="text-sm font-medium text-eg-ardesia">
            Dashboard impresa
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-eg-terra">
            Richieste salvate
          </h1>

          <p className="mt-1 text-sm text-eg-ardesia">
            {result.requests.length} richieste
          </p>
        </div>

        <CompanyRequestList
          requests={result.requests}
          mode="saved"
          emptyMessage="Non hai ancora salvato richieste."
          savedAction={toggleSavedRequestAction}
        />

        {(result.page > 1 || result.hasNextPage) ? (
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              {result.page > 1 ? (
                <Link
                  href={buildPageHref(result.page - 1)}
                  className="text-sm font-medium text-eg-cotto"
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
                  className="text-sm font-medium text-eg-cotto"
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
