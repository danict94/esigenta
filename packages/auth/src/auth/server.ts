import {
  auth,
} from "./core"

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication required.")
    this.name =
      "AuthenticationRequiredError"
  }
}

export type CurrentAuthSession =
  NonNullable<
    Awaited<
      ReturnType<
        typeof auth.api.getSession
      >
    >
  >

export type CurrentAuthUser =
  CurrentAuthSession["user"]

export async function getCurrentUserFromHeaders(
  headers: Headers,
): Promise<CurrentAuthUser | null> {
  const start = performance.now()

  const session =
    await auth.api.getSession({
      headers,
    })

  console.info(
    "[esigenta-perf] [auth]",
    `getSession ${(performance.now() - start).toFixed(1)}ms`,
  )

  return session?.user ?? null
}

export async function requireUserFromHeaders(
  headers: Headers,
): Promise<CurrentAuthUser> {
  const user =
    await getCurrentUserFromHeaders(
      headers,
    )

  if (!user) {
    throw new AuthenticationRequiredError()
  }

  return user
}
