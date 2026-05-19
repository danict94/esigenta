import {
  listPendingEmailNotificationDeliveriesForRequest,
  markNotificationDeliveryFailed,
  markNotificationDeliverySending,
  markNotificationDeliverySent,
} from "@fixpro/db"

import type {
  PendingEmailNotificationDelivery,
} from "@fixpro/db"

import {
  sendRequestEmailWithResend,
} from "./resend-request-email-adapter"

const EMAIL_SUBJECT =
  "Nuova richiesta disponibile su FixPro"

export type ProcessRequestEmailDeliveriesForRequestResult = {
  requestId: string
  pendingCount: number
  sentCount: number
  failedCount: number
  skippedCount: number
}

function normalizeRequiredText(
  value: string,
): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Unknown request email notification error."
}

function getPublicAppUrl() {
  const rawUrl =
    process.env.FIXPRO_WEB_URL ??
    process.env.FIXPRO_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (!rawUrl) {
    return null
  }

  try {
    const url = new URL(rawUrl)

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

function buildCompanyRequestUrl(
  requestId: string,
) {
  const appUrl =
    getPublicAppUrl()

  if (!appUrl) {
    return null
  }

  return new URL(
    `/area-impresa/richieste/${encodeURIComponent(requestId)}`,
    appUrl,
  ).toString()
}

function formatIntervention(
  slug: string | null,
) {
  if (!slug) {
    return "Richiesta"
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    )
}

function formatLocation({
  city,
  postalCode,
}: {
  city: string | null
  postalCode: string | null
}) {
  const value = [
    city,
    postalCode,
  ]
    .filter(Boolean)
    .join(" ")

  return value || "Area compatibile"
}

function escapeHtml(
  value: string,
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildEmailContent(
  delivery: PendingEmailNotificationDelivery,
) {
  const request =
    delivery.request
  const intervention =
    formatIntervention(
      request.interventionSlug,
    )
  const location =
    formatLocation({
      city: request.city,
      postalCode:
        request.postalCode,
    })
  const requestCode =
    request.requestCode ?? request.id
  const requestUrl =
    buildCompanyRequestUrl(
      request.id,
    )
  const actionText =
    requestUrl
      ? `Apri la richiesta: ${requestUrl}`
      : "Accedi alla tua Area Impresa FixPro per visualizzare la richiesta."

  const text = [
    "Nuova richiesta disponibile su FixPro",
    "",
    "Una nuova richiesta compatibile con i servizi e l'area operativa della tua impresa e disponibile.",
    `Intervento: ${intervention}`,
    `Localita: ${location}`,
    `Codice richiesta: ${requestCode}`,
    "",
    actionText,
  ].join("\n")

  const htmlAction =
    requestUrl
      ? `<p><a href="${escapeHtml(requestUrl)}">Apri la richiesta nell'Area Impresa</a></p>`
      : "<p>Accedi alla tua Area Impresa FixPro per visualizzare la richiesta.</p>"

  const html = [
    "<h1>Nuova richiesta disponibile su FixPro</h1>",
    "<p>Una nuova richiesta compatibile con i servizi e l'area operativa della tua impresa e disponibile.</p>",
    "<ul>",
    `<li><strong>Intervento:</strong> ${escapeHtml(intervention)}</li>`,
    `<li><strong>Localita:</strong> ${escapeHtml(location)}</li>`,
    `<li><strong>Codice richiesta:</strong> ${escapeHtml(requestCode)}</li>`,
    "</ul>",
    htmlAction,
  ].join("")

  return {
    subject: EMAIL_SUBJECT,
    text,
    html,
  }
}

export async function processRequestEmailDeliveriesForRequest(
  requestId: string,
): Promise<ProcessRequestEmailDeliveriesForRequestResult> {
  const normalizedRequestId =
    normalizeRequiredText(requestId)

  if (!normalizedRequestId) {
    return {
      requestId,
      pendingCount: 0,
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
    }
  }

  const deliveries =
    await listPendingEmailNotificationDeliveriesForRequest(
      normalizedRequestId,
    )
  let sentCount = 0
  let failedCount = 0
  let skippedCount = 0

  for (const delivery of deliveries) {
    const sendingResult =
      await markNotificationDeliverySending(
        delivery.id,
      )

    if (!sendingResult.ok) {
      skippedCount += 1
      continue
    }

    if (!delivery.recipient) {
      await markNotificationDeliveryFailed({
        deliveryId: delivery.id,
        errorMessage:
          "Recipient email is missing.",
        retryable: false,
      })

      skippedCount += 1
      failedCount += 1
      continue
    }

    try {
      const email =
        buildEmailContent(delivery)
      const sendResult =
        await sendRequestEmailWithResend({
          to: delivery.recipient,
          subject: email.subject,
          text: email.text,
          html: email.html,
          idempotencyKey:
            delivery.idempotencyKey,
        })

      const sentResult =
        await markNotificationDeliverySent({
          deliveryId: delivery.id,
          provider:
            sendResult.provider,
          providerMessageId:
            sendResult.providerMessageId,
        })

      if (!sentResult.ok) {
        throw new Error(
          sentResult.message,
        )
      }

      sentCount += 1
    } catch (error) {
      await markNotificationDeliveryFailed({
        deliveryId: delivery.id,
        errorMessage:
          getErrorMessage(error),
        retryable: true,
      })

      failedCount += 1
    }
  }

  return {
    requestId: normalizedRequestId,
    pendingCount: deliveries.length,
    sentCount,
    failedCount,
    skippedCount,
  }
}
