import { NextResponse } from 'next/server'

import { createRuntimeFunnel } from '@esigenta/db/funnel'

import {
  normalizeRuntimeText,
} from '@esigenta/db/funnel-normalization'

export async function POST(request: Request) {
  const body =
    (await request.json()) as Record<
      string,
      unknown
    >

  const interventionSlug =
    normalizeRuntimeText(
      body.interventionSlug,
    )

  if (!interventionSlug) {
    return NextResponse.json(
      {
        error:
          'interventionSlug is required',
      },
      {
        status: 400,
      },
    )
  }

  const payload =
    await createRuntimeFunnel({
      interventionSlug,
      query:
        normalizeRuntimeText(
          body.query,
        ),
    })

  if (!payload) {
    return NextResponse.json(
      {
        error:
          'Intervention not found',
      },
      {
        status: 404,
      },
    )
  }

  return NextResponse.json(payload)
}
