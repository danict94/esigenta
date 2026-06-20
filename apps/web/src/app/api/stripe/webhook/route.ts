import { NextResponse } from "next/server"

import { handleStripeWebhook } from "@esigenta/billing"

import {
  areaLog,
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"

export async function POST(request: Request) {
  const monitored = isAreaMonitoringEnabled()
  const start = monitored ? performance.now() : 0

  if (monitored) {
    areaLog("area.credits.webhook.start", {})
  }

  const rawBody = await request.text()
  const signature = request.headers.get("stripe-signature") ?? ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ""

  const result = await handleStripeWebhook({ rawBody, signature, webhookSecret })

  if (monitored) {
    areaLog("area.credits.webhook.end", {
      httpStatus: result.status,
      durationMs: Math.round(performance.now() - start),
    })
  }

  return NextResponse.json(result.body, { status: result.status })
}
