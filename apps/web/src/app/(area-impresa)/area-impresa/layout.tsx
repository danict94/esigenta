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
  Container,
} from "@fixpro/ui"

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

function getCompanyStatusNotice(
  status: string,
) {
  if (status === "PENDING_REVIEW") {
    return "Il tuo profilo impresa è in revisione. Potrai acquistare crediti e usare il marketplace dopo l’approvazione."
  }

  if (status === "SUSPENDED") {
    return "Il tuo profilo impresa è sospeso. Contatta l’assistenza per maggiori informazioni."
  }

  if (status === "BLOCKED") {
    return "Il tuo profilo impresa è bloccato. Le funzioni marketplace non sono disponibili."
  }

  return null
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
  const companyStatus =
    membership.company.status
  const marketplaceEnabled =
    companyStatus === "APPROVED"
  const statusNotice =
    getCompanyStatusNotice(
      companyStatus,
    )

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
        marketplaceEnabled={
          marketplaceEnabled
        }
      />
      {statusNotice ? (
        <Container
          size="xl"
          className="pt-4"
        >
          <div className="border border-border-primary bg-surface-secondary px-4 py-3 text-sm font-medium leading-6 text-text-primary">
            {statusNotice}
          </div>
        </Container>
      ) : null}
      {children}
    </div>
  )
}
