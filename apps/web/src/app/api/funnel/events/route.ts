import { NextResponse } from 'next/server'

import { recordFunnelEvent } from '@esigenta/domain'

/**
 * FASE 6C — first-party funnel step-progress telemetry. Accepts ONLY the
 * 3 events defined in recordFunnelEvent's allow-list; no free-form
 * payload. A rejection here is a normal outcome for malformed input, not
 * a server fault — the funnel itself never depends on this endpoint (see
 * apps/web/src/richiesta/flow/components/track-funnel-event.ts, which
 * fires-and-forgets and ignores the response entirely).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid request payload',
        code: 'invalid_json_payload',
      },
      {
        status: 400,
      },
    )
  }

  const result = await recordFunnelEvent(body)

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        code: result.code,
      },
      {
        status: result.status,
      },
    )
  }

  return NextResponse.json(
    {
      outcome: result.outcome,
    },
    {
      status: 202,
    },
  )
}
