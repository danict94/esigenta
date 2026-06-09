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
