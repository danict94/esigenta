import {
  buildRuntimeRequestDraft,
} from "@esigenta/funnel/server"

import {
  describeRuntimeContactAnswerPresence,
  describeRuntimeLocationAnswerPresence,
  normalizeRuntimeText,
  readRuntimeAnswers,
} from "@esigenta/funnel"

import { RequestFlowError } from "../../internal/request/request-errors"
import { createRequestFromDraft } from "./create-request"

export type SubmitRuntimeRequestInput = Record<string, unknown>

export type SubmitRuntimeRequestResult =
  | {
      ok: true
      requestDraft: Awaited<ReturnType<typeof buildRuntimeRequestDraft>>
      request: Awaited<ReturnType<typeof createRequestFromDraft>>
    }
  | {
      ok: false
      status: number
      error: string
      code: string
    }

export async function submitRuntimeRequest(
  body: SubmitRuntimeRequestInput,
): Promise<SubmitRuntimeRequestResult> {
  const interventionSlug = normalizeRuntimeText(body.interventionSlug)
  const query = normalizeRuntimeText(body.query)
  const customerDescription = normalizeRuntimeText(body.customerDescription)
  const answers = readRuntimeAnswers(body.answers)

  if (!interventionSlug) {
    return {
      ok: false,
      status: 400,
      error: "interventionSlug is required",
      code: "missing_intervention_slug",
    }
  }

  let requestDraft: Awaited<ReturnType<typeof buildRuntimeRequestDraft>> = null

  try {
    requestDraft = await buildRuntimeRequestDraft({
      interventionSlug,
      ...(query ? { query } : {}),
      ...(customerDescription ? { customerDescription } : {}),
      answers,
    })

    if (!requestDraft) {
      return {
        ok: false,
        status: 404,
        error: "Intervention not found",
        code: "intervention_not_found",
      }
    }

    const createdRequest = await createRequestFromDraft({ draft: requestDraft })

    return {
      ok: true,
      requestDraft,
      request: createdRequest,
    }
  } catch (error) {
    if (error instanceof RequestFlowError) {
      console.warn("[submitRuntimeRequest] Request creation rejected", {
        code: error.code,
        statusCode: error.statusCode,
        interventionSlug,
        answerKeys: Object.keys(answers),
        contact: describeRuntimeContactAnswerPresence(answers.contact),
        location: describeRuntimeLocationAnswerPresence(answers.location),
        message: error.message,
      })

      return {
        ok: false,
        status: error.statusCode,
        error: error.message,
        code: error.code,
      }
    }

    console.error(
      "[submitRuntimeRequest] Unexpected request creation failure",
      {
        interventionSlug,
        answerKeys: Object.keys(answers),
        contact: describeRuntimeContactAnswerPresence(answers.contact),
        location: describeRuntimeLocationAnswerPresence(answers.location),
        error,
      },
    )

    return {
      ok: false,
      status: 500,
      error: "Unable to create request",
      code: "request_creation_failed",
    }
  }
}
