"use server"

import {
  revalidatePath,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  createCompanyCustomerConversation,
  createCreditRefundRequest,
  unlockRequestForCompany,
  type CreateCreditRefundRequestInput,
} from "@esigenta/db"

import {
  requireCompanyActor,
} from "../../../../../auth/server"

import {
  createPerfTrace,
} from "../../_lib/perf-log"

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
  const actor = await requireCompanyActor()
  const requestId = String(
    formData.get("requestId") ?? "",
  ).trim()

  const result = await unlockRequestForCompany({
    companyId: actor.company.id,
    requestId,
  })

  if (!result.ok) {
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

  revalidateRequestSurfaces(requestId)
  revalidatePath("/area-impresa/contatti")
  redirect(buildRequestDetailHref({ requestId, unlocked: true }))
}

export async function contactCustomerAction(formData: FormData) {
  const trace = createPerfTrace({
    scope: "contact-customer-action",
  })
  const requestId = String(
    formData.get("requestId") ?? "",
  ).trim()
  const actor = await trace.measure("actor", () =>
    requireCompanyActor(),
  )

  const result = await createCompanyCustomerConversation({
    companyId: actor.company.id,
    userId: actor.user.id,
    authorizedActor: actor,
    requestId,
    recordPerf: trace.add,
  })

  if (!result.ok) {
    const redirectHref = trace.measureSync("redirect", () =>
      buildRequestDetailHref({ requestId, error: result.code }),
    )

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
  const actor = await requireCompanyActor()
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

  const result = await createCreditRefundRequest({
    companyId: actor.company.id,
    requestUnlockId,
    reason: String(
      formData.get("reason") ?? "",
    ) as CreateCreditRefundRequestInput["reason"],
    description: String(formData.get("description") ?? ""),
    companyContactAttempted:
      formData.get("companyContactAttempted") === "on",
    lastContactAttemptAt,
  })

  if (!result.ok) {
    redirect(buildRequestDetailHref({ requestId, error: result.code }))
  }

  revalidateRequestSurfaces(requestId)
}