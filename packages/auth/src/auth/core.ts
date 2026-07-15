import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

import { prisma } from "@esigenta/database"

const defaultAdminOrigin =
  "https://esigenta-admin.vercel.app"

const defaultWebOrigin =
  "https://www.esigenta.it"

function normalizeOrigin(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim()

  if (!trimmed) {
    return undefined
  }

  let origin = trimmed

  if (!/^https?:\/\//i.test(origin)) {
    origin =
      origin.startsWith("localhost") ||
      origin.startsWith("127.0.0.1")
        ? `http://${origin}`
        : `https://${origin}`
  }

  try {
    return new URL(origin).origin
  } catch {
    return origin.replace(/\/+$/, "")
  }
}

function uniqueOrigins(
  values: Array<string | undefined>,
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeOrigin(value))
        .filter(
          (value): value is string =>
            Boolean(value),
        ),
    ),
  )
}

function resolveVercelOrigin(
  value: string | undefined,
): string | undefined {
  return normalizeOrigin(value)
}

function getTrustedOrigins(): string[] {
  return uniqueOrigins([
    defaultAdminOrigin,
    defaultWebOrigin,

    "http://localhost:3000",
    "http://localhost:3001",

    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,

    process.env.ESIGENTA_ADMIN_URL,
    process.env.ESIGENTA_WEB_URL,
    process.env.ESIGENTA_APP_URL,

    resolveVercelOrigin(
      process.env.VERCEL_URL,
    ),
    resolveVercelOrigin(
      process.env
        .VERCEL_PROJECT_PRODUCTION_URL,
    ),
  ])
}

function getAllowedHost(
  origin: string,
): string | undefined {
  return origin.replace(/^https?:\/\//i, "")
}

const trustedOrigins = getTrustedOrigins()

const baseURLFallback = normalizeOrigin(
  process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    process.env.ESIGENTA_APP_URL ??
    process.env.ESIGENTA_WEB_URL ??
    process.env.ESIGENTA_ADMIN_URL ??
    defaultWebOrigin,
)

const baseURL = {
  allowedHosts: trustedOrigins
    .map(getAllowedHost)
    .filter(
      (host): host is string =>
        Boolean(host),
    ),
  fallback: baseURLFallback,
  protocol: "auto" as const,
}

const betterAuthSecret =
  process.env.BETTER_AUTH_SECRET?.trim()

if (
  !betterAuthSecret &&
  process.env.NODE_ENV === "production"
) {
  throw new Error(
    "BETTER_AUTH_SECRET is required in production.",
  )
}

if (
  process.env.ESIGENTA_DEBUG_AUTH_ORIGINS ===
  "true"
) {
  console.info("[esigenta-auth]", {
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_URL_PRESENT: Boolean(
      process.env.BETTER_AUTH_URL?.trim(),
    ),
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL,
    ESIGENTA_ADMIN_URL:
      process.env.ESIGENTA_ADMIN_URL,
    ESIGENTA_WEB_URL:
      process.env.ESIGENTA_WEB_URL,
    ESIGENTA_APP_URL:
      process.env.ESIGENTA_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL:
      process.env
        .VERCEL_PROJECT_PRODUCTION_URL,
    trustedOrigins,
    baseURL,
  })
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
  ...(betterAuthSecret
    ? {
        secret: betterAuthSecret,
      }
    : {}),
  baseURL,
  // cookieCache: feature ufficiale Better Auth (session.cookieCache).
  // Firma session+user in un cookie HMAC-SHA256 (strategia "compact").
  // NON cachea CompanyActor, companyId, role né company status:
  // resolveCompanyActorFromUser interroga il DB a ogni request (RT2 sempre live).
  // Company sospesa, ruolo modificato o membership rimossa sono rilevati
  // immediatamente al prossimo request, indipendentemente da maxAge.
  // Se in futuro si introduce admin force-logout, considerare di invalidare
  // anche il cookie session_data lato client, oppure ridurre maxAge.
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
})
