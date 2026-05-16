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

const trustedOrigins =
  uniqueTextValues([
    process.env.BETTER_AUTH_URL,
    process.env.FIXPRO_APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.FIXPRO_ADMIN_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ])

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
  ...(process.env.BETTER_AUTH_SECRET
    ? {
        secret:
          process.env.BETTER_AUTH_SECRET,
      }
    : {}),
  ...(process.env.BETTER_AUTH_URL
    ? {
        baseURL:
          process.env.BETTER_AUTH_URL,
      }
    : {}),
})
