import { NextResponse } from 'next/server'

import { createRuntimeFunnel } from '@fixpro/db'

function readText(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : undefined
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

  const payload =
    await createRuntimeFunnel({
      interventionSlug,
      query: readText(body.query),
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
