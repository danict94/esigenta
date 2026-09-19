import "server-only"

const tokenPattern = /^[A-Za-z0-9_-]{32,}$/

function unavailable() {
  return new Response("Preventivo non disponibile.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

function publicFunctionUrl(token: string) {
  const origin = process.env.QUOTIVO_PUBLIC_FUNCTION_URL?.replace(/\/$/, "")
  if (!origin) return null
  return `${origin}/p/${encodeURIComponent(token)}`
}

async function proxy(request: Request, token: string) {
  if (!tokenPattern.test(token)) return unavailable()

  const destination = publicFunctionUrl(token)
  if (!destination) {
    return new Response("Servizio Quotivo temporaneamente non disponibile.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  try {
    const response = await fetch(destination, {
      method: request.method,
      headers: {
        Accept: request.headers.get("accept") ?? "text/html",
        "Content-Type": request.headers.get("content-type") ?? "",
      },
      body: request.method === "POST" ? await request.text() : undefined,
      cache: "no-store",
    })

    const responseHeaders: HeadersInit = {
      "Cache-Control": "no-store",
    }
    // The public GET contract is always an HTML document, including the
    // generic unavailable page. Do not inherit a proxy/upstream text type.
    if (request.method === "GET") {
      responseHeaders["Content-Type"] = "text/html; charset=utf-8"
    } else if (response.headers.get("content-type")) {
      responseHeaders["Content-Type"] = response.headers.get("content-type")!
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch {
    return new Response("Servizio Quotivo temporaneamente non disponibile.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}

export async function GET(request: Request, context: RouteContext<"/p/[token]">) {
  const { token } = await context.params
  return proxy(request, token)
}

export async function POST(request: Request, context: RouteContext<"/p/[token]">) {
  const { token } = await context.params
  return proxy(request, token)
}
