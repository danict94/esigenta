import { NextResponse, type NextRequest } from "next/server"

function traceAreaImpresaRequest(request: NextRequest): string {
  const path = request.nextUrl.pathname

  if (!path.startsWith("/area-impresa")) {
    return ""
  }

  const headers = request.headers
  const traceId =
    headers.get("x-vercel-id") ||
    headers.get("x-request-id") ||
    crypto.randomUUID()

  const purpose = headers.get("purpose") || ""
  const secPurpose = headers.get("sec-purpose") || ""
  const nextRouterPrefetch = headers.get("next-router-prefetch") || ""
  const rsc = headers.get("rsc") || ""
  const nextUrl = headers.get("next-url") || ""
  const nextRouterStateTree = headers.has("next-router-state-tree") ? "1" : "0"
  const accept = headers.get("accept") || ""
  const refererRaw = headers.get("referer") || ""

  let referer = "-"
  try {
    referer = refererRaw ? new URL(refererRaw).pathname : "-"
  } catch {
    referer = refererRaw || "-"
  }

  const isPrefetch =
    purpose.toLowerCase().includes("prefetch") ||
    secPurpose.toLowerCase().includes("prefetch") ||
    nextRouterPrefetch === "1"

  const isRsc =
    rsc === "1" ||
    nextRouterStateTree === "1" ||
    accept.includes("text/x-component")

  const mode = isPrefetch ? "prefetch" : isRsc ? "rsc" : "document"

  console.info(
    [
      "[esigenta-trace]",
      "[area-request]",
      `traceId=${traceId}`,
      `method=${request.method}`,
      `path=${path}`,
      `search=${request.nextUrl.search || "-"}`,
      `mode=${mode}`,
      `referer=${referer}`,
      `prefetch=${isPrefetch ? "1" : "0"}`,
      `rsc=${isRsc ? "1" : "0"}`,
      `purpose=${purpose || "-"}`,
      `secPurpose=${secPurpose || "-"}`,
      `nextRouterPrefetch=${nextRouterPrefetch || "-"}`,
      `nextUrl=${nextUrl || "-"}`,
      `nextRouterStateTree=${nextRouterStateTree}`,
      `secFetchMode=${headers.get("sec-fetch-mode") || "-"}`,
      `secFetchDest=${headers.get("sec-fetch-dest") || "-"}`,
      `secFetchSite=${headers.get("sec-fetch-site") || "-"}`,
    ].join(" "),
  )

  return traceId
}

export function middleware(request: NextRequest) {
  const traceId = traceAreaImpresaRequest(request)
  const response = NextResponse.next()

  if (traceId) {
    response.headers.set("x-esigenta-trace-id", traceId)
  }

  return response
}

export const config = {
  matcher: ["/area-impresa/:path*"],
}