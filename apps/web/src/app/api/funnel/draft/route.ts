import { NextResponse } from 'next/server'

import { buildRuntimeRequestDraft } from '@esigenta/funnel'

import {
  normalizeRuntimeText,
  readRuntimeAnswers,
} from '@esigenta/funnel'

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

  const requestDraft =
    await buildRuntimeRequestDraft({
      interventionSlug,
      query:
        normalizeRuntimeText(
          body.query,
        ),
      customerDescription:
        normalizeRuntimeText(
          body.customerDescription,
        ),
      answers:
        readRuntimeAnswers(
          body.answers,
        ),
    })

  if (!requestDraft) {
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

  return NextResponse.json({
    requestDraft,
  })
}
