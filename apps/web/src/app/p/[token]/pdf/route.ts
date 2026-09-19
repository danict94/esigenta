import "server-only"

const tokenPattern = /^[A-Za-z0-9_-]{32,}$/

export async function GET(_request: Request, context: RouteContext<"/p/[token]/pdf">) {
  const { token } = await context.params
  const origin = process.env.QUOTIVO_PUBLIC_FUNCTION_URL?.replace(/\/$/, "")
  if (!origin || !tokenPattern.test(token)) return new Response("Preventivo non disponibile.", { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } })
  try {
    const upstream = await fetch(`${origin}/p/${encodeURIComponent(token)}/pdf`, { cache: "no-store" })
    return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "text/html; charset=utf-8", "Content-Disposition": upstream.headers.get("content-disposition") ?? "inline", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } })
  } catch {
    return new Response("Servizio Quotivo temporaneamente non disponibile.", { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } })
  }
}
