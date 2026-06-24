import { CustomerRequestsPage } from "../../../richiesta/comunicazioni/customer-requests-page"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams
  return <CustomerRequestsPage token={token} />
}
