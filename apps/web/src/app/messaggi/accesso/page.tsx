import { CustomerConversationPage } from "../../../richiesta/comunicazioni/customer-conversation-page"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{
    token?: string
    sent?: string
    error?: string
  }>
}

export default async function Page({ searchParams }: Props) {
  const { token, sent, error } = await searchParams
  return (
    <CustomerConversationPage token={token ?? ""} sent={sent} error={error} />
  )
}
