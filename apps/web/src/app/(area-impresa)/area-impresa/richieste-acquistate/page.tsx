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
} from "../../../../lib/area-monitoring"

import {
  createPerfTrace,
} from "../_lib/perf-log"

import {
  CompanyRequestList,
} from "../_components/company-request-list"

import {
  toggleSavedRequestAction,
} from "../richieste/actions"

export const dynamic = "force-dynamic"

export default async function RichiesteAcquistatePage() {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.purchasedRequests.start", {})
  }

  const actor = await requireAreaImpresaAccess()

  const purchasedTrace = monitored
    ? createPerfTrace({ scope: "purchased-requests" })
    : null

  const queryStart = areaTimestamp()
  const result = await getCompanyPurchasedRequestsPage(
    actor,
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
      durationMs: Math.round(areaTimestamp() - pageStart),
      queryMs,
    })
  }

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Dashboard impresa
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Richieste acquistate
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {result.requests.length} richieste
          </p>
        </div>

        <CompanyRequestList
          requests={result.requests}
          mode="purchased"
          emptyMessage="Non hai ancora acquistato richieste."
          savedAction={toggleSavedRequestAction}
        />
      </section>
    </PageShell>
  )
}
