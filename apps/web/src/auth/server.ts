import {
  cache,
} from "react"

import {
  headers,
} from "next/headers"

import {
  redirect,
} from "next/navigation"

import {
  AmbiguousCompanyMembershipError,
  AuthenticationRequiredError,
  CompanyAuthorizationError,
  getCurrentUserFromHeaders,
  requireCompanyMemberFromUser,
  requireCompanyOwnerFromUser,
  requireUserFromHeaders,
  resolveCompanyActorFromUser,
} from "@esigenta/auth"

import {
  areaLog,
  isAreaMonitoringEnabled,
  shortId,
} from "../lib/area-monitoring"

export const getCurrentUser = cache(
  async function getCurrentUser() {
    return getCurrentUserFromHeaders(
      await headers(),
    )
  },
)

export const requireUser = cache(
  async function requireUser() {
    return requireUserFromHeaders(
      await headers(),
    )
  },
)

export async function requireCompanyMember(
  companyId: string,
) {
  const user =
    await requireUser()

  return requireCompanyMemberFromUser(
    user,
    companyId,
  )
}

export async function requireCompanyOwner(
  companyId: string,
) {
  const user =
    await requireUser()

  return requireCompanyOwnerFromUser(
    user,
    companyId,
  )
}

export async function requireAreaImpresaAccess() {
  try {
    return await requireCompanyActor()
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/area-impresa/accedi")
    }
    if (error instanceof CompanyAuthorizationError) {
      redirect("/area-impresa")
    }
    if (error instanceof AmbiguousCompanyMembershipError) {
      redirect("/area-impresa/seleziona-impresa")
    }
    throw error
  }
}

export const requireCompanyActor = cache(
  async function requireCompanyActor() {
    const monitored = isAreaMonitoringEnabled()
    const traceStart = performance.now()

    if (monitored) {
      areaLog("area.auth.start", {
        cacheNote: "react-cache-active",
      })
    }

    try {
      const sessionStart = performance.now()
      const user = await requireUser()
      const sessionMs = Math.round(performance.now() - sessionStart)

      const actorStart = performance.now()
      const actor = await resolveCompanyActorFromUser(user)
      const actorMs = Math.round(performance.now() - actorStart)

      const totalMs = Math.round(performance.now() - traceStart)

      console.info(
        `[esigenta-perf] [require-company-actor] requireUser=${sessionMs}ms resolveCompanyActor=${actorMs}ms total=${totalMs}ms`,
      )

      if (monitored) {
        areaLog("area.auth.end", {
          durationMs: totalMs,
          result: "ok",
          actorResolved: true,
          userIdSafe: shortId(actor.user.id),
          companyIdSafe: shortId(actor.company.id),
          role: actor.role,
          cacheNote: "react-cache-active",
        })
      }

      return actor
    } catch (error) {
      if (monitored) {
        areaLog("area.auth.end", {
          durationMs: Math.round(performance.now() - traceStart),
          result:
            error instanceof Error &&
            (error.name === "AuthenticationRequiredError" ||
              error.name === "CompanyAuthorizationError" ||
              error.name === "AmbiguousCompanyMembershipError")
              ? "redirect"
              : "error",
          actorResolved: false,
          errorType: error instanceof Error ? error.name : "unknown",
          cacheNote: "react-cache-active",
        })
      }
      throw error
    }
  },
)
