type CompanyConversationRouteType =
  | "SUPPORT"
  | "COMPANY_CUSTOMER"
  | string

export function buildCompanyConversationHref({
  conversationId,
  conversationType,
}: {
  conversationId: string
  conversationType: CompanyConversationRouteType
}) {
  const encodedConversationId =
    encodeURIComponent(conversationId)

  if (conversationType === "SUPPORT") {
    return `/area-impresa/assistenza/${encodedConversationId}`
  }

  return `/area-impresa/contatti/${encodedConversationId}`
}

export function buildThreadHref({
  hrefBase,
  conversationId,
  params,
}: {
  hrefBase: string
  conversationId: string
  params?: Record<string, string>
}) {
  const query =
    params &&
    new URLSearchParams(params).toString()

  return query
    ? `${hrefBase}/${encodeURIComponent(
        conversationId,
      )}?${query}`
    : `${hrefBase}/${encodeURIComponent(
        conversationId,
      )}`
}

export function readSearchParam(
  value?: string | string[],
) {
  return Array.isArray(value)
    ? value[0]
    : value
}

export function getThreadStatusMessage({
  sent,
  error,
}: {
  sent: string | undefined
  error: string | undefined
}) {
  if (sent === "1") {
    return "Messaggio inviato."
  }

  if (error) {
    return "Non siamo riusciti a inviare il messaggio."
  }

  return null
}
