import Link from "next/link"
import {
  revalidatePath,
} from "next/cache"

import {
  approveCompanyForMarketplace,
  blockCompanyForMarketplace,
  getAdminCompanyStatusCounts,
  listAdminCompanies,
  normalizeAdminCompanyStatusFilter,
  suspendCompanyForMarketplace,
  type AdminCompanyListItem,
  type AdminCompanyStatusFilter,
} from "@esigenta/db"

import {
  Badge,
  Button,
  PageShell,
  cn,
} from "@esigenta/ui"

import {
  requireAdmin,
} from "../../../auth/server"

export const dynamic = "force-dynamic"

type AdminCompaniesPageProps = {
  searchParams?: Promise<{
    status?: string | string[]
  }>
}

type CompanyAction =
  | {
      label: string
      action: typeof approveCompanyAction
      variant?: "primary" | "secondary" | "ghost"
    }

function readSearchParam(
  value?: string | string[],
) {
  return Array.isArray(value)
    ? value[0]
    : value
}

function formatDate(date: Date | null) {
  if (!date) {
    return "-"
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date)
}

function formatValue(value: string | null) {
  return value && value.trim().length > 0
    ? value
    : "-"
}

function getStatusLabel(status: string) {
  if (status === "PENDING_REVIEW") {
    return "Da verificare"
  }

  if (status === "APPROVED") {
    return "Approvata"
  }

  if (status === "SUSPENDED") {
    return "Sospesa"
  }

  if (status === "BLOCKED") {
    return "Bloccata"
  }

  return status
}

function getStatusBadgeVariant(status: string) {
  if (status === "APPROVED") {
    return "success" as const
  }

  if (status === "BLOCKED") {
    return "danger" as const
  }

  if (
    status === "PENDING_REVIEW" ||
    status === "SUSPENDED"
  ) {
    return "warning" as const
  }

  return "neutral" as const
}

async function approveCompanyAction(
  formData: FormData,
) {
  "use server"

  await requireAdmin()

  const result =
    await approveCompanyForMarketplace({
      companyId:
        String(formData.get("companyId") ?? ""),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/imprese")
  revalidatePath("/")
}

async function suspendCompanyAction(
  formData: FormData,
) {
  "use server"

  await requireAdmin()

  const result =
    await suspendCompanyForMarketplace({
      companyId:
        String(formData.get("companyId") ?? ""),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/imprese")
  revalidatePath("/")
}

async function blockCompanyAction(
  formData: FormData,
) {
  "use server"

  await requireAdmin()

  const result =
    await blockCompanyForMarketplace({
      companyId:
        String(formData.get("companyId") ?? ""),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/imprese")
  revalidatePath("/")
}

function getCompanyActions(
  status: AdminCompanyListItem["status"],
): CompanyAction[] {
  if (status === "PENDING_REVIEW") {
    return [
      {
        label: "Approva",
        action: approveCompanyAction,
      },
      {
        label: "Blocca",
        action: blockCompanyAction,
        variant: "ghost",
      },
    ]
  }

  if (status === "APPROVED") {
    return [
      {
        label: "Sospendi",
        action: suspendCompanyAction,
        variant: "secondary",
      },
      {
        label: "Blocca",
        action: blockCompanyAction,
        variant: "ghost",
      },
    ]
  }

  if (status === "SUSPENDED") {
    return [
      {
        label: "Approva",
        action: approveCompanyAction,
      },
      {
        label: "Blocca",
        action: blockCompanyAction,
        variant: "ghost",
      },
    ]
  }

  if (status === "BLOCKED") {
    return [
      {
        label: "Approva",
        action: approveCompanyAction,
      },
    ]
  }

  return []
}

function CompanyActionForms({
  company,
}: {
  company: AdminCompanyListItem
}) {
  const actions =
    getCompanyActions(company.status)

  if (actions.length === 0) {
    return (
      <span className="text-sm text-text-muted">
        Nessuna azione
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((item) => (
        <form
          key={item.label}
          action={item.action}
        >
          <input
            type="hidden"
            name="companyId"
            value={company.id}
          />
          <Button
            type="submit"
            size="sm"
            variant={item.variant ?? "primary"}
          >
            {item.label}
          </Button>
        </form>
      ))}
    </div>
  )
}

function CompanyNameCell({
  company,
}: {
  company: AdminCompanyListItem
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-text-primary">
        {company.name}
      </p>
      <p className="mt-1 truncate text-xs text-text-muted">
        {company.owner
          ? company.owner.name ??
            company.owner.email
          : "Owner non disponibile"}
      </p>
    </div>
  )
}

function StatusTabs({
  activeStatus,
  counts,
}: {
  activeStatus: AdminCompanyStatusFilter
  counts: Awaited<
    ReturnType<
      typeof getAdminCompanyStatusCounts
    >
  >
}) {
  const tabs = [
    {
      label: "Tutte",
      href: "/imprese",
      count: counts.all,
      status: "ALL",
    },
    {
      label: "Da verificare",
      href: "/imprese?status=PENDING_REVIEW",
      count: counts.pendingReview,
      status: "PENDING_REVIEW",
    },
    {
      label: "Approvate",
      href: "/imprese?status=APPROVED",
      count: counts.approved,
      status: "APPROVED",
    },
    {
      label: "Sospese",
      href: "/imprese?status=SUSPENDED",
      count: counts.suspended,
      status: "SUSPENDED",
    },
    {
      label: "Bloccate",
      href: "/imprese?status=BLOCKED",
      count: counts.blocked,
      status: "BLOCKED",
    },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive =
          activeStatus === tab.status

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-primary bg-brand-primary text-brand-on-primary"
                : "border-border-primary bg-surface-primary text-text-secondary hover:text-text-primary",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-xs",
                isActive
                  ? "text-brand-on-primary"
                  : "text-text-muted",
              )}
            >
              {tab.count}
            </span>
          </Link>
        )
      })}

      <Link
        href="/imprese/modifiche-contatto"
        className="inline-flex items-center gap-2 border border-border-primary bg-surface-primary px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <span>Aggiornamenti contatto</span>
        {counts.pendingContactChangeRequests > 0 ? (
          <Badge variant="warning" size="sm">
            {counts.pendingContactChangeRequests}
          </Badge>
        ) : null}
      </Link>
    </div>
  )
}

function CompaniesDesktopTable({
  companies,
}: {
  companies: AdminCompanyListItem[]
}) {
  return (
    <div className="hidden overflow-x-auto border-y border-border-primary md:block">
      <div className="min-w-[64rem]">
        <div className="grid grid-cols-[minmax(14rem,1.4fr)_9rem_9rem_10rem_10rem_9rem_minmax(14rem,auto)] gap-4 border-b border-border-primary bg-surface-secondary px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          <span>Impresa</span>
          <span>Stato</span>
          <span>P.IVA</span>
          <span>Città</span>
          <span>Telefono</span>
          <span>Registrata</span>
          <span>Azioni</span>
        </div>

        {companies.map((company) => (
          <div
            key={company.id}
            className="grid grid-cols-[minmax(14rem,1.4fr)_9rem_9rem_10rem_10rem_9rem_minmax(14rem,auto)] gap-4 border-b border-border-primary px-4 py-4 text-sm last:border-b-0"
          >
            <CompanyNameCell company={company} />
            <div>
              <Badge variant={getStatusBadgeVariant(company.status)}>
                {getStatusLabel(company.status)}
              </Badge>
            </div>
            <span className="break-words text-text-secondary">
              {company.vatNumber}
            </span>
            <span className="text-text-secondary">
              {formatValue(company.city)}
            </span>
            <span className="break-words text-text-secondary">
              {company.phone}
            </span>
            <span className="text-text-secondary">
              {formatDate(company.createdAt)}
            </span>
            <CompanyActionForms company={company} />
          </div>
        ))}
      </div>
    </div>
  )
}

function CompaniesMobileList({
  companies,
}: {
  companies: AdminCompanyListItem[]
}) {
  return (
    <ul className="grid gap-3 md:hidden">
      {companies.map((company) => (
        <li
          key={company.id}
          className="border border-border-primary bg-surface-primary p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <CompanyNameCell company={company} />
            <Badge variant={getStatusBadgeVariant(company.status)}>
              {getStatusLabel(company.status)}
            </Badge>
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-text-secondary">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">
                Città
              </dt>
              <dd>{formatValue(company.city)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">
                Telefono
              </dt>
              <dd className="break-words text-right">
                {company.phone}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">
                P.IVA
              </dt>
              <dd className="break-words text-right">
                {company.vatNumber}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">
                Registrata
              </dt>
              <dd>{formatDate(company.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-border-primary pt-4">
            <CompanyActionForms company={company} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default async function AdminCompaniesPage({
  searchParams,
}: AdminCompaniesPageProps) {
  await requireAdmin()

  const resolvedSearchParams =
    searchParams ? await searchParams : {}
  const activeStatus =
    normalizeAdminCompanyStatusFilter(
      readSearchParam(
        resolvedSearchParams.status,
      ),
    )

  const [
    companies,
    counts,
  ] = await Promise.all([
    listAdminCompanies({
      status: activeStatus,
    }),
    getAdminCompanyStatusCounts(),
  ])

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <header className="border-b border-border-primary pb-7">
        <p className="text-sm font-medium text-text-muted">
          Control room
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          Imprese
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          Gestisci verifiche, autorizzazioni e stato operativo delle imprese.
        </p>
      </header>

      <section className="mt-6">
        <StatusTabs
          activeStatus={activeStatus}
          counts={counts}
        />
      </section>

      <section className="mt-6">
        {companies.length === 0 ? (
          <div className="border-y border-border-primary py-8">
            <p className="text-base font-semibold text-text-primary">
              Nessuna impresa da mostrare
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Cambia filtro oppure attendi nuove registrazioni.
            </p>
          </div>
        ) : (
          <>
            <CompaniesDesktopTable
              companies={companies}
            />
            <CompaniesMobileList
              companies={companies}
            />
          </>
        )}
      </section>
    </PageShell>
  )
}
