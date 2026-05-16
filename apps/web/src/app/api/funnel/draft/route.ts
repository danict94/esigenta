import { NextResponse } from 'next/server'

import { buildRuntimeRequestDraft } from '@fixpro/db'

import type {
  RuntimeAnswers,
} from '@fixpro/db'

function readText(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : undefined
}

function readAnswers(
  value: unknown,
): RuntimeAnswers {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return {}
  }

  return value as RuntimeAnswers
}

export async function POST(request: Request) {
  const body =
    (await request.json()) as Record<
      string,
      unknown
    >

  const interventionSlug =
    readText(body.interventionSlug)

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
      query: readText(body.query),
      customerDescription:
        readText(
          body.customerDescription,
        ),
      answers:
        readAnswers(body.answers),
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
