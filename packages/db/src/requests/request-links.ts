function getWebUrl(): string {
  return (
    process.env.FIXPRO_WEB_URL ??
    process.env.FIXPRO_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  )
}

export function buildRequestVerificationUrl({
  requestId,
  token,
}: {
  requestId: string
  token: string
}): string {
  const url =
    new URL(
      "/richiesta/verifica",
      getWebUrl(),
    )

  url.searchParams.set(
    "requestId",
    requestId,
  )

  url.searchParams.set("token", token)

  return url.toString()
}

export function buildRequestStatusUrl({
  token,
}: {
  token: string
}): string {
  const url =
    new URL(
      "/richiesta/stato",
      getWebUrl(),
    )

  url.searchParams.set("token", token)

  return url.toString()
}

export function buildCustomerRequestsUrl({
  token,
}: {
  token: string
}): string {
  const url =
    new URL(
      "/richieste/cliente",
      getWebUrl(),
    )

  url.searchParams.set("token", token)

  return url.toString()
}
