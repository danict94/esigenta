import { notFound, redirect } from "next/navigation"

type Props = {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams
  const resolvedToken = Array.isArray(token) ? token[0] : token

  if (!resolvedToken) {
    notFound()
  }

  redirect(`/stato-richiesta/${encodeURIComponent(resolvedToken)}`)
}
