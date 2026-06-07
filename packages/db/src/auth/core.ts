import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

import { prisma } from "../prisma/client"

function uniqueTextValues(
  values: Array<string | undefined>,
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter(
          (value): value is string =>
            Boolean(value),
        ),
    ),
  )
}

const localTrustedOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : [
        "http://localhost:3000",
        "http://localhost:3001",
      ]

const trustedOrigins =
  uniqueTextValues([
    process.env.BETTER_AUTH_URL,
    process.env.ESIGENTA_WEB_URL,
    process.env.ESIGENTA_APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.ESIGENTA_ADMIN_URL,
    ...localTrustedOrigins,
  ])

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
  ...(process.env.BETTER_AUTH_URL
    ? {
        baseURL:
          process.env.BETTER_AUTH_URL,
      }
    : {}),
})
