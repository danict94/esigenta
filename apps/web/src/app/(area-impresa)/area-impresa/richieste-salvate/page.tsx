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

export default async function RichiesteSalvatePage() {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.savedRequests.start", {})
  }

  const actor = await requireAreaImpresaAccess()

  const savedTrace = monitored
    ? createPerfTrace({ scope: "saved-requests" })
    : null

  const queryStart = areaTimestamp()
  const result = await getCompanySavedRequestsPage(
    actor,
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
            Richieste salvate
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {result.requests.length} richieste
          </p>
        </div>

        <CompanyRequestList
          requests={result.requests}
          mode="saved"
          emptyMessage="Non hai ancora salvato richieste."
          savedAction={toggleSavedRequestAction}
        />
      </section>
    </PageShell>
  )
}
