import { RequestStatusPage } from "../../../richiesta/stato/request-status-page"

type Props = {
  params: Promise<{ token: string }>
}

export default async function Page({ params }: Props) {
  const { token } = await params
  return <RequestStatusPage token={token} />
}
