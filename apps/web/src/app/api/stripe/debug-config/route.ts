import { NextResponse } from "next/server"

import {
  isStripeDebugEnabled,
  getStripeRuntimeDebugConfig,
  STRIPE_EXPECTED_WEBHOOK_ENDPOINT,
  STRIPE_REQUIRED_WEBHOOK_EVENTS,
} from "@esigenta/billing"

export async function GET() {
  if (!isStripeDebugEnabled()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  return NextResponse.json({
    ...getStripeRuntimeDebugConfig(),
    expectedWebhookEndpoint: STRIPE_EXPECTED_WEBHOOK_ENDPOINT,
    requiredWebhookEvents: STRIPE_REQUIRED_WEBHOOK_EVENTS,
  })
}
