import { RequestVerificationPage } from "../../../richiesta/verifica/request-verification-page"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ token: string }>
}

export default async function Page({ params }: Props) {
  const { token } = await params
  return <RequestVerificationPage token={token} />
}
