import type {
  ReactNode,
} from "react"
import {
  redirect,
} from "next/navigation"

import {
  requireUser,
  requireDefaultCompanyMembership,
} from "../../../auth/server"

import {
  countUnreadCompanyConversationSummary,
  countUnreadCompanyNotifications,
} from "@fixpro/db"

import {
  ImpresaSidebar,
} from "./_components/impresa-sidebar"

function isNamedError(
  error: unknown,
  name: string,
): boolean {
  return (
    error instanceof Error &&
    error.name === name
  )
}

async function requireAreaImpresaAccess() {
  try {
    return await requireDefaultCompanyMembership()
  } catch (error) {
    if (
      isNamedError(
        error,
        "AuthenticationRequiredError",
      )
    ) {
      redirect("/area-impresa/accedi")
    }

    if (
      isNamedError(
        error,
        "CompanyAuthorizationError",
      )
    ) {
      redirect("/area-impresa")
    }

    if (
      isNamedError(
        error,
        "AmbiguousCompanyMembershipError",
      )
    ) {
      redirect("/area-impresa/seleziona-impresa")
    }

    throw error
  }
}

export default async function AreaImpresaLayout({
  children,
}: {
  children: ReactNode
}) {
  const membership =
    await requireAreaImpresaAccess()
  const [
    user,
    unreadNotificationCount,
    unreadMessageSummary,
  ] = await Promise.all([
    requireUser(),
    countUnreadCompanyNotifications(
      membership.companyId,
    ),
    countUnreadCompanyConversationSummary({
      companyId: membership.companyId,
      userId: membership.userId,
    }),
  ])
  const accountLabel =
    user.name || user.email
  const unreadContactCount =
    unreadMessageSummary.ok
      ? unreadMessageSummary.contactsCount
      : 0
  const unreadSupportCount =
    unreadMessageSummary.ok
      ? unreadMessageSummary.supportCount
      : 0

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <ImpresaSidebar
        accountLabel={accountLabel}
        unreadNotificationCount={
          unreadNotificationCount
        }
        unreadContactCount={
          unreadContactCount
        }
        unreadSupportCount={
          unreadSupportCount
        }
      />
      {children}
    </div>
  )
}
