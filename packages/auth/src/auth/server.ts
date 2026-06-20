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
  const session =
    await auth.api.getSession({
      headers,
    })

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
