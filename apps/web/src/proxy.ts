import { NextResponse, type NextRequest } from "next/server"

import {
  areaLog,
  classifyAreaRequest,
  isAreaMonitoringEnabled,
  safePath,
} from "./platform/monitoring/area-monitoring"

// Paths that, when navigated to from /area-impresa/accedi, indicate
// likely noise from the login page (prefetch or programmatic navigation).
const LOGIN_NOISE_DESTINATIONS = new Set([
  "/area-impresa/iscriviti",
  "/area-impresa/recupera-password",
  "/privacy",
  "/termini",
  "/area-impresa/richieste",
])

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

  let refererPath = "-"
  try {
    refererPath = refererRaw ? new URL(refererRaw).pathname : "-"
  } catch {
    refererPath = refererRaw || "-"
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

  const secFetchMode = headers.get("sec-fetch-mode") || "-"
  const secFetchDest = headers.get("sec-fetch-dest") || "-"
  const secFetchSite = headers.get("sec-fetch-site") || "-"

  if (isAreaMonitoringEnabled()) {
    console.info(
      [
        "[esigenta-trace]",
        "[area-request]",
        `traceId=${traceId}`,
        `method=${request.method}`,
        `path=${path}`,
        `search=${request.nextUrl.search || "-"}`,
        `mode=${mode}`,
        `referer=${refererPath}`,
        `prefetch=${isPrefetch ? "1" : "0"}`,
        `rsc=${isRsc ? "1" : "0"}`,
        `purpose=${purpose || "-"}`,
        `secPurpose=${secPurpose || "-"}`,
        `nextRouterPrefetch=${nextRouterPrefetch || "-"}`,
        `nextUrl=${nextUrl || "-"}`,
        `nextRouterStateTree=${nextRouterStateTree}`,
        `secFetchMode=${secFetchMode}`,
        `secFetchDest=${secFetchDest}`,
        `secFetchSite=${secFetchSite}`,
      ].join(" "),
    )

    const requestKind = classifyAreaRequest(headers, request.method, path)

    areaLog("area.request.edge", {
      traceId,
      path: safePath(path),
      method: request.method,
      requestKind,
      refererPath: safePath(refererPath),
      nextUrl: nextUrl ? safePath(nextUrl) : null,
      secFetchMode,
      secFetchDest,
      rsc: isRsc,
      prefetch: isPrefetch,
    })

    // Detect navigation noise from the login page.
    if (
      refererPath === "/area-impresa/accedi" &&
      LOGIN_NOISE_DESTINATIONS.has(path)
    ) {
      areaLog("area.navigation.noise", {
        traceId,
        from: "/area-impresa/accedi",
        to: path,
        requestKind,
        nextUrl: nextUrl ? safePath(nextUrl) : null,
        reason: "request_from_login_page_to_unexpected_destination",
        shouldInvestigate: true,
      })
    }
  }

  return traceId
}

export function proxy(request: NextRequest) {
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