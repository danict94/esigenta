import { CustomerRequestsAccessPage } from "../../../richiesta/comunicazioni/customer-requests-access-page"

type Props = {
  searchParams: Promise<{ sent?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { sent } = await searchParams
  return <CustomerRequestsAccessPage hasSent={sent === "1"} />
}
