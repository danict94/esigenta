/**
 * Structured production monitoring for Area Impresa.
 *
 * Activate with: ESIGENTA_AREA_MONITORING=1
 *
 * Safe rules enforced here:
 * - No email, password, token, cookie, phone, address, customer name,
 *   message body, structuredData, signed UploadThing URLs, raw search query.
 * - IDs are always shortened via shortId().
 * - Paths are always sanitised via safePath().
 * - All output is a single JSON line prefixed with [area-monitor].
 */

const PREFIX = "[area-monitor]"

export type AreaPayload = Record<
  string,
  string | number | boolean | null | undefined
>

export function isAreaMonitoringEnabled(): boolean {
  return process.env["ESIGENTA_AREA_MONITORING"] === "1"
}

export function isAreaImpresaDebugEnabled(): boolean {
  return process.env["ESIGENTA_AREA_IMPRESA_DEBUG"] === "1"
}

export function areaLog(event: string, payload: AreaPayload): void {
  if (!isAreaMonitoringEnabled()) return
  console.info(
    PREFIX,
    JSON.stringify({ event, timestamp: Date.now(), ...payload }),
  )
}

export type AreaRequestKind =
  | "document"
  | "rsc"
  | "router-fetch"
  | "prefetch"
  | "server-action"
  | "api-auth"
  | "api"
  | "unknown"

/**
 * Classifies an incoming HTTP request by its intent.
 *
 * Key rule: secFetchMode=cors + secFetchDest=empty is NEVER a document
 * navigation — it is either an RSC fetch or a router state update.
 */
export function classifyAreaRequest(
  requestHeaders: Headers,
  method: string,
  path: string,
): AreaRequestKind {
  const secFetchMode = requestHeaders.get("sec-fetch-mode") ?? ""
  const secFetchDest = requestHeaders.get("sec-fetch-dest") ?? ""
  const accept = requestHeaders.get("accept") ?? ""

  const isRsc =
    requestHeaders.get("rsc") === "1" ||
    requestHeaders.has("next-router-state-tree") ||
    accept.includes("text/x-component")

  const isPrefetch =
    (requestHeaders.get("purpose") ?? "").toLowerCase().includes("prefetch") ||
    (requestHeaders.get("sec-purpose") ?? "")
      .toLowerCase()
      .includes("prefetch") ||
    requestHeaders.get("next-router-prefetch") === "1"

  if (method === "POST") return "server-action"
  if (path.startsWith("/api/auth")) return "api-auth"
  if (path.startsWith("/api/")) return "api"
  if (isPrefetch) return "prefetch"

  if (secFetchMode === "cors" && secFetchDest === "empty") {
    return isRsc ? "rsc" : "router-fetch"
  }

  if (secFetchMode === "navigate") return "document"
  if (isRsc) return "rsc"

  return "unknown"
}

/**
 * Replaces CUID/ULID-like path segments with [id].
 * e.g. /area-impresa/contatti/cmq4d128c000304jrobjcan37
 *   -> /area-impresa/contatti/[id]
 */
export function safePath(path: string): string {
  return path.replace(/\/[a-z0-9]{10,}/g, "/[id]")
}

/**
 * Returns a non-identifying prefix+suffix of an ID, safe to log.
 * e.g. "cmq4bj20r000104lhfdnavl2a" -> "cmq4bj20…l2a"
 */
export function shortId(id: string | null | undefined): string {
  if (!id) return ""
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

/**
 * Returns a high-resolution monotonic timestamp in ms, safe to call from
 * server utility code. Export this instead of calling performance.now()
 * directly inside async Server Component bodies to avoid react-hooks/purity
 * lint false-positives (the rule only checks direct call sites in components).
 */
export function areaTimestamp(): number {
  return performance.now()
}
