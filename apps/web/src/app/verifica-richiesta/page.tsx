import { RequestVerificationPage } from "../../richiesta/verifica/request-verification-page"

type Props = {
  searchParams: Promise<{ requestId?: string; token?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { requestId, token } = await searchParams
  return (
    <RequestVerificationPage requestId={requestId} token={token} />
  )
}
