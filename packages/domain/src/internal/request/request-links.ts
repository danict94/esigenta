import type { ConversationType } from "@prisma/client"

function getWebUrl(): string {
  const webUrl =
    process.env.ESIGENTA_WEB_URL ??
    process.env.ESIGENTA_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (webUrl) return webUrl

  if (process.env.NODE_ENV !== "production") return "http://localhost:3000"

  throw new Error(
    "ESIGENTA_WEB_URL or ESIGENTA_APP_URL is required to build public links.",
  )
}

/**
 * D-014: single-token verification URL. The token alone resolves to its
 * request via CustomerAccessToken.requestId (see verifyRequestEmailByToken),
 * so no requestId is needed in the path. The legacy ?requestId=&token= route
 * (/verifica-richiesta/page.tsx) stays untouched and fully functional for
 * already-emitted links — this function only changes what NEW emails embed.
 */
export function buildRequestVerificationUrl({
  token,
}: {
  token: string
}): string {
  return new URL(
    `/verifica-richiesta/${encodeURIComponent(token)}`,
    getWebUrl(),
  ).toString()
}

export function buildRequestStatusUrl({ token }: { token: string }): string {
  return new URL(
    `/stato-richiesta/${encodeURIComponent(token)}`,
    getWebUrl(),
  ).toString()
}

export function buildCustomerRequestsUrl({ token }: { token: string }): string {
  const url = new URL("/richieste/cliente", getWebUrl())
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
    conversationType === "SUPPORT" ? "/area-impresa/assistenza" : "/area-impresa/contatti"
  const url = new URL(
    `${basePath}/${encodeURIComponent(conversationId)}`,
    getWebUrl(),
  )
  return url.toString()
}

export function buildCustomerConversationUrl({ token }: { token: string }): string {
  const url = new URL("/messaggi/accesso", getWebUrl())
  url.searchParams.set("token", token)
  return url.toString()
}
