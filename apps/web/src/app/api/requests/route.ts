import { NextResponse } from 'next/server'

import {
  submitRuntimeRequest,
} from '@esigenta/db'

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body =
      (await request.json()) as Record<
      string,
      unknown
    >
  } catch (error) {
    console.error(
      '[api/requests] Invalid JSON payload',
      {
        error: serializeError(error),
      },
    )

    return NextResponse.json(
      {
        error:
          'Invalid request payload',
        code: 'invalid_json_payload',
      },
      {
        status: 400,
      },
    )
  }

  const result =
    await submitRuntimeRequest(body)

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

  return NextResponse.json({
    requestDraft:
      result.requestDraft,

    request:
      result.request,
  })
}
