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
    return NextResponse.json(
      { status: "error", error: result.code },
      { status: result.httpStatus },
    )
  }

  return NextResponse.json({
    status: result.data.status,
    creditOrderId: result.data.creditOrderId,
    orderStatus: result.data.orderStatus,
    paymentStatus: result.data.paymentStatus,
  })
}
