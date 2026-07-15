import { notFound } from "next/navigation"

import type { CompanyActor } from "@esigenta/auth"
import { getCompanyFullRequestDetail } from "@esigenta/domain"

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../platform/monitoring/area-monitoring"
import { createPerfTrace } from "../../../monitoring/area-impresa-perf-trace"

import { getCompanyCreditSummaryCached } from "../../shell/credit-summary-cache"
import { getRequestUnlockError } from "../view-models/request-detail-view-model"

/**
 * Next adapter for the dedicated full-detail page. Domain owns the read model;
 * this layer only maps route errors and signs the full photo collection.
 */
export async function loadFullRequestDetailPageData({
  actor,
  requestId,
  errorParam,
}: {
  actor: CompanyActor
  requestId: string
  errorParam?: string | string[]
}) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()
  const trace = createPerfTrace({ scope: "request-detail" })

  if (monitored) {
    areaLog("area.model.requestDetail.start", {
      requestIdSafe: shortId(requestId),
    })
  }

  const detailStart = areaTimestamp()
  const creditSummary = await getCompanyCreditSummaryCached(actor.company.id)
  const pageData = await getCompanyFullRequestDetail(
    actor,
    requestId,
    creditSummary.balance,
    trace.add,
  )
  const detailMs = Math.round(areaTimestamp() - detailStart)

  if (!pageData.ok) {
    if (monitored) {
      areaLog("area.model.requestDetail.end", {
        requestIdSafe: shortId(requestId),
        result: "not-found",
        durationMs: Math.round(areaTimestamp() - pageStart),
        detailMs,
      })
    }
    trace.finish({ requestId, status: "not-found" })
    return null
  }

  const detail = pageData.detail
  const photos =
    detail.photoCount > 0
      ? await trace.measure("uploadthing-sign", async () => {
          const { loadFullRequestPhotos } = await import("./load-request-photos")
          return loadFullRequestPhotos(detail.photos)
        })
      : []
  const unlockError = getRequestUnlockError(errorParam)

  if (monitored) {
    areaLog("area.model.requestDetail.end", {
      requestIdSafe: shortId(requestId),
      result: "ok",
      hasUnlocked: detail.hasUnlocked,
      durationMs: Math.round(areaTimestamp() - pageStart),
      detailMs,
    })
  }

  trace.finish({ requestId, status: "ok" })

  return {
    detail,
    photos,
    unlockError,
  }
}

export async function requireFullRequestDetailPageData({
  actor,
  requestId,
  errorParam,
}: {
  actor: CompanyActor
  requestId: string
  errorParam?: string | string[]
}) {
  const data = await loadFullRequestDetailPageData({ actor, requestId, errorParam })

  if (!data) {
    notFound()
  }

  return data
}
