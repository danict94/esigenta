"use server"

import {
  revalidatePath,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  contactCustomerForRequest,
  unlockCompanyRequest,
} from "@esigenta/domain"

import {
  requestCompanyCreditRefund,
} from "@esigenta/billing"

import {
  requireAreaImpresaAccess,
} from "../../../../../../../auth/server"

import {
  areaLog,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../../../../lib/area-monitoring"

import {
  createPerfTrace,
} from "../../../../_lib/perf-log"

function buildRequestDetailHref({
  requestId,
  error,
  unlocked,
}: {
  requestId: string
  error?: string
  unlocked?: boolean
}) {
  const search = new URLSearchParams()

  if (error) {
    search.set("error", error)
  }

  if (unlocked) {
    search.set("unlocked", "1")
  }

  const queryString = search.toString()
  const path =
    `/area-impresa/richieste/${encodeURIComponent(requestId)}`

  return queryString ? `${path}?${queryString}` : path
}

function revalidateRequestSurfaces(requestId: string) {
  revalidatePath("/area-impresa/richieste")
  revalidatePath("/area-impresa/richieste-salvate")
  revalidatePath("/area-impresa/richieste-acquistate")
  revalidatePath(`/area-impresa/richieste/${requestId}`)
}

export async function unlockRequestAction(formData: FormData) {
  const monitored = isAreaMonitoringEnabled()
  const actionStart = performance.now()

  const actor = await requireAreaImpresaAccess()
  const requestId = String(
    formData.get("requestId") ?? "",
  ).trim()

  if (monitored) {
    areaLog("area.unlock.start", {
      requestIdSafe: shortId(requestId),
      companyIdSafe: shortId(actor.company.id),
    })
  }

  const result = await unlockCompanyRequest(actor, requestId)

  if (!result.ok) {
    if (monitored) {
      areaLog("area.unlock.end", {
        requestIdSafe: shortId(requestId),
        result: result.code,
        durationMs: Math.round(performance.now() - actionStart),
      })
    }
    redirect(
      buildRequestDetailHref({
        requestId,
        error:
          result.code === "insufficient_credits"
            ? "insufficient_credits"
            : result.code,
      }),
    )
  }

  if (monitored) {
    areaLog("area.unlock.end", {
      requestIdSafe: shortId(requestId),
      result: "ok",
      durationMs: Math.round(performance.now() - actionStart),
    })
  }

  revalidateRequestSurfaces(requestId)
  revalidatePath("/area-impresa/contatti")
  redirect(buildRequestDetailHref({ requestId, unlocked: true }))
}

export async function contactCustomerAction(formData: FormData) {
  const monitored = isAreaMonitoringEnabled()
  const actionStart = performance.now()

  const trace = createPerfTrace({
    scope: "contact-customer-action",
  })
  const requestId = String(
    formData.get("requestId") ?? "",
  ).trim()

  if (monitored) {
    areaLog("area.action.contactCustomer.start", {
      requestIdSafe: shortId(requestId),
    })
  }

  const actor = await trace.measure("actor", () =>
    requireAreaImpresaAccess(),
  )

  const result = await contactCustomerForRequest(actor, requestId, trace.add)

  if (!result.ok) {
    const redirectHref = trace.measureSync("redirect", () =>
      buildRequestDetailHref({ requestId, error: result.code }),
    )

    if (monitored) {
      areaLog("area.action.contactCustomer.end", {
        requestIdSafe: shortId(requestId),
        result: result.code,
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

    trace.finish({
      requestId,
      redirect: redirectHref,
      status: result.code,
    })
    redirect(redirectHref)
  }

  const redirectHref = trace.measureSync(
    "redirect",
    () => `/area-impresa/contatti/${result.conversationId}`,
  )

  if (monitored) {
    areaLog("area.action.contactCustomer.end", {
      requestIdSafe: shortId(requestId),
      result: result.created ? "created" : "existing",
      durationMs: Math.round(performance.now() - actionStart),
      conversationIdSafe: shortId(result.conversationId),
    })
  }

  trace.finish({
    requestId,
    redirect: redirectHref,
    status: result.created ? "created" : "existing",
  })
  redirect(redirectHref)
}

export async function createRefundRequestAction(
  formData: FormData,
) {
  const actor = await requireAreaImpresaAccess()
  const requestId = String(
    formData.get("requestId") ?? "",
  ).trim()
  const requestUnlockId = String(
    formData.get("requestUnlockId") ?? "",
  ).trim()
  const lastContactAttemptValue = String(
    formData.get("lastContactAttemptAt") ?? "",
  ).trim()
  const lastContactAttemptAt = lastContactAttemptValue
    ? new Date(`${lastContactAttemptValue}T00:00:00`)
    : null

  const result = await requestCompanyCreditRefund(actor, {
    requestUnlockId,
    reason: String(formData.get("reason") ?? ""),
    description: String(formData.get("description") ?? ""),
    companyContactAttempted: formData.get("companyContactAttempted") === "on",
    lastContactAttemptAt,
  })

  if (!result.ok) {
    redirect(buildRequestDetailHref({ requestId, error: result.code }))
  }

  revalidateRequestSurfaces(requestId)
}
