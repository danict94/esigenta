import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

import { prisma } from "../prisma/client"

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

  return origin.replace(/\/+$/, "")
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

const trustedOrigins = uniqueOrigins([
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,

  process.env.ESIGENTA_WEB_URL,
  process.env.ESIGENTA_APP_URL,
  process.env.ESIGENTA_ADMIN_URL,

  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,

  "https://esigenta-admin.vercel.app",
  "https://esigenta-web.vercel.app",

  "http://localhost:3000",
  "http://localhost:3001",
])

const baseURL = normalizeOrigin(
  process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    process.env.ESIGENTA_APP_URL ??
    process.env.ESIGENTA_WEB_URL ??
    process.env.ESIGENTA_ADMIN_URL,
)

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
  ...(baseURL
    ? {
        baseURL,
      }
    : {}),
})