import { NextResponse } from 'next/server'

import {
  RequestFlowError,
  buildRuntimeRequestDraft,
  createRequestFromDraft,
} from '@fixpro/db'

import type {
  RuntimeAnswers,
} from '@fixpro/db'

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

function readContactPresence(
  answers: RuntimeAnswers,
) {
  const contact = answers.contact

  if (
    !contact ||
    typeof contact !== 'object' ||
    Array.isArray(contact)
  ) {
    return {
      shape: typeof contact,
      hasName: false,
      hasFirstName: false,
      hasLastName: false,
      hasPhone: false,
      hasEmail: false,
    }
  }

  const record =
    contact as Record<string, unknown>

  return {
    shape: 'object',
    hasName:
      Boolean(readText(record.name)),
    hasFirstName:
      Boolean(readText(record.firstName)),
    hasLastName:
      Boolean(readText(record.lastName)),
    hasPhone:
      Boolean(readText(record.phone)),
    hasEmail:
      Boolean(readText(record.email)),
  }
}

function readLocationPresence(
  answers: RuntimeAnswers,
) {
  const location = answers.location

  if (
    !location ||
    typeof location !== 'object' ||
    Array.isArray(location)
  ) {
    return {
      shape: typeof location,
      hasAddress:
        Boolean(readText(location)),
      hasCity: false,
      hasCoordinates: false,
    }
  }

  const record =
    location as Record<string, unknown>

  return {
    shape: 'object',
    hasAddress:
      Boolean(readText(record.address)),
    hasCity:
      Boolean(readText(record.city)),
    hasCoordinates:
      typeof record.latitude ===
        'number' &&
      Number.isFinite(
        record.latitude,
      ) &&
      typeof record.longitude ===
        'number' &&
      Number.isFinite(
        record.longitude,
      ),
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

  const interventionSlug =
    readText(body.interventionSlug)

  const query =
    readText(body.query)

  const customerDescription =
    readText(body.customerDescription)

  const answers =
    readAnswers(body.answers)

  if (!interventionSlug) {
    console.warn(
      '[api/requests] Missing intervention slug',
      {
        answerKeys:
          Object.keys(answers),
      },
    )

    return NextResponse.json(
      {
        error:
          'interventionSlug is required',
        code:
          'missing_intervention_slug',
      },
      {
        status: 400,
      },
    )
  }

  let requestDraft: Awaited<
    ReturnType<
      typeof buildRuntimeRequestDraft
    >
  > = null

  try {
    requestDraft =
      await buildRuntimeRequestDraft({
        interventionSlug,
        query,
        customerDescription,
        answers,
    })

    if (!requestDraft) {
      console.warn(
        '[api/requests] Intervention not found',
        {
          interventionSlug,
          answerKeys:
            Object.keys(answers),
        },
      )

      return NextResponse.json(
        {
          error:
            'Intervention not found',
          code:
            'intervention_not_found',
        },
        {
          status: 404,
        },
      )
    }

    const createdRequest =
      await createRequestFromDraft({
        draft: requestDraft,
      })

    return NextResponse.json({
      requestDraft,
      request: createdRequest,
    })
  } catch (error) {
    if (error instanceof RequestFlowError) {
      console.warn(
        '[api/requests] Request creation rejected',
        {
          code: error.code,
          statusCode:
            error.statusCode,
          interventionSlug,
          answerKeys:
            Object.keys(answers),
          contact:
            readContactPresence(
              answers,
            ),
          location:
            readLocationPresence(
              answers,
            ),
          requiredServiceSlugs:
            requestDraft
              ?.matchingSignals
              .requiredServiceSlugs ??
            [],
          message: error.message,
        },
      )

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        {
          status: error.statusCode,
        },
      )
    }

    console.error(
      '[api/requests] Unexpected request creation failure',
      {
        interventionSlug,
        answerKeys:
          Object.keys(answers),
        contact:
          readContactPresence(
            answers,
          ),
        location:
          readLocationPresence(
            answers,
          ),
        requiredServiceSlugs:
          requestDraft
            ?.matchingSignals
            .requiredServiceSlugs ??
          [],
        error:
          serializeError(error),
      },
    )

    return NextResponse.json(
      {
        error:
          'Unable to create request',
        code:
          'request_creation_failed',
      },
      {
        status: 500,
      },
    )
  }
}
