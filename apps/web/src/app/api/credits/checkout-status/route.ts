import { NextResponse } from "next/server"

import { getCheckoutSessionStatus } from "@esigenta/billing"

import { requireCompanyActor } from "../../../../auth/server"

function normalizeRequiredText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function GET(request: Request) {
  let actor: Awaited<ReturnType<typeof requireCompanyActor>>

  try {
    actor = await requireCompanyActor()
  } catch {
    return NextResponse.json({ status: "error", error: "unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const sessionId = normalizeRequiredText(url.searchParams.get("session_id"))

  if (!sessionId) {
    return NextResponse.json({ status: "error", error: "missing_session_id" }, { status: 400 })
  }

  const result = await getCheckoutSessionStatus({
    sessionId,
    companyId: actor.company.id,
  })

  if (!result.ok) {
    // A 404 here means the session/order genuinely does not exist for this
    // company (wrong id, foreign session, or it was never created) — that is
    // a terminal answer, not a transient failure. Returning it as a normal
    // 200 "not_found" lets the client stop polling deterministically instead
    // of lumping it into a generic retryable "error" (Phase 17).
    if (result.httpStatus === 404) {
      return NextResponse.json({ status: "not_found", terminal: true, error: result.code })
    }

    return NextResponse.json(
      { status: "error", terminal: true, error: result.code },
      { status: result.httpStatus },
    )
  }

  const terminal = result.data.status !== "pending"

  return NextResponse.json({
    status: result.data.status,
    terminal,
    creditOrderId: result.data.creditOrderId,
    orderStatus: result.data.orderStatus,
    paymentStatus: result.data.paymentStatus,
  })
}
