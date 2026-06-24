import { CustomerRequestDetailPage } from "../../../../../richiesta/comunicazioni/customer-request-detail-page"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params
  const { token } = await searchParams
  return <CustomerRequestDetailPage requestId={id} token={token} />
}
