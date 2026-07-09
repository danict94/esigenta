/**
 * Origin pubblico del sito, unico punto da cui derivare URL assoluti
 * (metadataBase, sitemap, robots). Stessa convenzione di
 * packages/domain/src/internal/request/request-links.ts: env esplicita,
 * localhost solo fuori produzione, errore esplicito in produzione — mai un
 * fallback silenzioso a localhost che produrrebbe canonical/OG rotti.
 */
export function resolveSiteOrigin(): string {
  const origin =
    process.env.ESIGENTA_WEB_URL ??
    process.env.ESIGENTA_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (origin) return origin.replace(/\/+$/, "")

  if (process.env.NODE_ENV !== "production") return "http://localhost:3000"

  throw new Error(
    "NEXT_PUBLIC_APP_URL (or ESIGENTA_WEB_URL/ESIGENTA_APP_URL) is required in production to build absolute public URLs.",
  )
}

export function toAbsoluteUrl(path: string): string {
  const origin = resolveSiteOrigin()
  return path === "/" ? origin : `${origin}${path}`
}
