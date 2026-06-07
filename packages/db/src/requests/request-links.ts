import type {
  ConversationType,
} from "@prisma/client"

function getWebUrl(): string {
  const webUrl =
    process.env.ESIGENTA_WEB_URL ??
    process.env.ESIGENTA_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (webUrl) {
    return webUrl
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000"
  }

  throw new Error(
    "ESIGENTA_WEB_URL or ESIGENTA_APP_URL is required to build public links.",
  )
}

export function buildRequestVerificationUrl({
  requestId,
  token,
}: {
  requestId: string
  token: string
}): string {
  const url =
    new URL(
      "/richiesta/verifica",
      getWebUrl(),
    )

  url.searchParams.set(
    "requestId",
    requestId,
  )

  url.searchParams.set("token", token)

  return url.toString()
}

export function buildRequestStatusUrl({
  token,
}: {
  token: string
}): string {
  const url =
    new URL(
      "/richiesta/stato",
      getWebUrl(),
    )

  url.searchParams.set("token", token)

  return url.toString()
}

export function buildCustomerRequestsUrl({
  token,
}: {
  token: string
}): string {
  const url =
    new URL(
      "/richieste/cliente",
      getWebUrl(),
    )

  url.searchParams.set("token", token)

  return url.toString()
}

export function buildCompanyConversationUrl({
  conversationId,
  conversationType,
}: {
  conversationId: string
  conversationType?: ConversationType
}): string {
  const basePath =
    conversationType === "SUPPORT"
      ? "/area-impresa/assistenza"
      : "/area-impresa/contatti"
  const url =
    new URL(
      `${basePath}/${encodeURIComponent(conversationId)}`,
      getWebUrl(),
    )

  return url.toString()
}

export function buildCustomerConversationUrl({
  token,
}: {
  token: string
}): string {
  const url =
    new URL(
      "/messaggi/accesso",
      getWebUrl(),
    )

  url.searchParams.set("token", token)

  return url.toString()
}
