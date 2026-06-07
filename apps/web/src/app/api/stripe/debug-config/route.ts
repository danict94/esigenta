import {
  NextResponse,
} from "next/server"

import {
  getStripeRuntimeDebugConfig,
  isStripeDebugEnabled,
  STRIPE_EXPECTED_WEBHOOK_ENDPOINT,
  STRIPE_REQUIRED_WEBHOOK_EVENTS,
} from "../../../../lib/stripe/debug"

export async function GET() {
  if (!isStripeDebugEnabled()) {
    return NextResponse.json(
      {
        error: "not_found",
      },
      {
        status: 404,
      },
    )
  }

  return NextResponse.json({
    ...getStripeRuntimeDebugConfig(),
    expectedWebhookEndpoint:
      STRIPE_EXPECTED_WEBHOOK_ENDPOINT,
    requiredWebhookEvents:
      STRIPE_REQUIRED_WEBHOOK_EVENTS,
  })
}
