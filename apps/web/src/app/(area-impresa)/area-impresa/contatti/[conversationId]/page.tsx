import {
  CompanyConversationThreadPage,
} from "../../_components/company-conversation-thread-page"

export const dynamic = "force-dynamic"

type CompanyContactThreadPageProps = {
  params: Promise<{
    conversationId: string
  }>
  searchParams: Promise<{
    sent?: string | string[]
    error?: string | string[]
  }>
}

export default async function CompanyContactThreadPage({
  params,
  searchParams,
}: CompanyContactThreadPageProps) {
  return (
    <CompanyConversationThreadPage
      params={params}
      searchParams={searchParams}
      kind="CUSTOMER"
      eyebrow="Contatti"
      title="Messaggi cliente"
      hrefBase="/area-impresa/contatti"
      listPath="/area-impresa/contatti"
    />
  )
}
