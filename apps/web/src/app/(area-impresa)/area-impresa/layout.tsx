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
      redirect("/area-impresa/iscriviti")
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
  await requireAreaImpresaAccess()
  const user =
    await requireUser()
  const accountLabel =
    user.name || user.email

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <ImpresaSidebar
        accountLabel={accountLabel}
      />
      {children}
    </div>
  )
}
