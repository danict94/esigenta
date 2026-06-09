import {
  CompanyConversationThreadPage,
} from "../../_components/company-conversation-thread-page"

export const dynamic = "force-dynamic"

type CompanySupportThreadPageProps = {
  params: Promise<{
    conversationId: string
  }>
  searchParams: Promise<{
    sent?: string | string[]
    error?: string | string[]
  }>
}

export default async function CompanySupportThreadPage({
  params,
  searchParams,
}: CompanySupportThreadPageProps) {
  return (
    <CompanyConversationThreadPage
      params={params}
      searchParams={searchParams}
      kind="SUPPORT"
      eyebrow="Assistenza"
      title="Messaggi con Esigenta"
      hrefBase="/area-impresa/assistenza"
      listPath="/area-impresa/assistenza"
    />
  )
}
