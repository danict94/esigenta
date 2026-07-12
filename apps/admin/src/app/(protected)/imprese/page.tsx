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
} from "@esigenta/domain"

import {
  Badge,
  Button,
  PageShell,
  Textarea,
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
      variant?: "primary" | "ghost"
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

function getStatusEventDate(
  company: AdminCompanyListItem,
) {
  if (company.status === "APPROVED") {
    return company.approvedAt
  }

  if (company.status === "SUSPENDED") {
    return company.suspendedAt
  }

  if (company.status === "BLOCKED") {
    return company.blockedAt
  }

  return null
}

function StatusEventInfo({
  company,
}: {
  company: AdminCompanyListItem
}) {
  const eventDate =
    getStatusEventDate(company)

  if (!eventDate && !company.statusChangedByAdmin) {
    return null
  }

  return (
    <p className="mt-1 text-xs leading-5 text-eg-ardesia">
      {eventDate ? formatDate(eventDate) : null}
      {company.statusChangedByAdmin
        ? ` — ${
            company.statusChangedByAdmin.name ??
            company.statusChangedByAdmin.email
          }`
        : null}
      {company.statusChangeReason
        ? ` — ${company.statusChangeReason}`
        : null}
    </p>
  )
}

function badgeVariantForColor(
  color: AdminCompanyListItem["adminBadge"]["color"],
) {
  if (color === "green") {
    return "success" as const
  }

  if (color === "red") {
    return "danger" as const
  }

  if (color === "orange" || color === "yellow") {
    return "warning" as const
  }

  return "neutral" as const
}

function CompanyBadge({
  company,
}: {
  company: AdminCompanyListItem
}) {
  const badge = company.adminBadge
  const visibleReasons = badge.reasons.slice(0, 2)
  const remainingCount = badge.reasons.length - visibleReasons.length

  return (
    <div>
      <Badge variant={badgeVariantForColor(badge.color)}>
        {badge.label}
      </Badge>
      {visibleReasons.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-eg-ardesia">
          {visibleReasons.join(" · ")}
          {remainingCount > 0 ? ` (+${remainingCount})` : ""}
        </p>
      ) : null}
    </div>
  )
}

async function approveCompanyAction(
  formData: FormData,
) {
  "use server"

  const admin = await requireAdmin()

  const result =
    await approveCompanyForMarketplace({
      companyId:
        String(formData.get("companyId") ?? ""),
      adminUserId: admin.userId,
      reason:
        String(formData.get("reason") ?? ""),
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

  const admin = await requireAdmin()

  const result =
    await suspendCompanyForMarketplace({
      companyId:
        String(formData.get("companyId") ?? ""),
      adminUserId: admin.userId,
      reason:
        String(formData.get("reason") ?? ""),
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

  const admin = await requireAdmin()

  const result =
    await blockCompanyForMarketplace({
      companyId:
        String(formData.get("companyId") ?? ""),
      adminUserId: admin.userId,
      reason:
        String(formData.get("reason") ?? ""),
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
        variant: "ghost",
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
      <span className="text-sm text-eg-ardesia">
        Nessuna azione
      </span>
    )
  }

  return (
    <form className="grid gap-2">
      <input
        type="hidden"
        name="companyId"
        value={company.id}
      />

      <Textarea
        name="reason"
        rows={2}
        placeholder="Motivo (obbligatorio per sospendi/blocca, facoltativo per approva)"
        className="text-xs"
      />

      <div className="flex flex-wrap gap-2">
        {actions.map((item) => (
          <Button
            key={item.label}
            type="submit"
            formAction={item.action}
            size="sm"
            variant={item.variant ?? "primary"}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </form>
  )
}

function CompanyNameCell({
  company,
}: {
  company: AdminCompanyListItem
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-eg-terra">
        {company.name}
      </p>
      <p className="mt-1 truncate text-xs text-eg-ardesia">
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
      label: "Approvate incomplete",
      href: "/imprese?status=APPROVED_INCOMPLETE",
      count: counts.approvedIncomplete,
      status: "APPROVED_INCOMPLETE",
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
                ? "border-eg-cotto bg-eg-cotto text-eg-calce"
                : "border-eg-hairline bg-eg-calce text-eg-ardesia hover:text-eg-terra",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-xs",
                isActive
                  ? "text-eg-calce"
                  : "text-eg-ardesia",
              )}
            >
              {tab.count}
            </span>
          </Link>
        )
      })}

      <Link
        href="/imprese/modifiche-contatto"
        className="inline-flex items-center gap-2 border border-eg-hairline bg-eg-calce px-3 py-2 text-sm font-medium text-eg-ardesia transition-colors hover:text-eg-terra"
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
    <div className="hidden overflow-x-auto border-y border-eg-hairline md:block">
      <div className="min-w-[64rem]">
        <div className="grid grid-cols-[minmax(14rem,1.4fr)_9rem_9rem_10rem_10rem_9rem_minmax(14rem,auto)] gap-4 border-b border-eg-hairline bg-eg-calce-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-eg-ardesia">
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
            className="grid grid-cols-[minmax(14rem,1.4fr)_9rem_9rem_10rem_10rem_9rem_minmax(14rem,auto)] gap-4 border-b border-eg-hairline px-4 py-4 text-sm last:border-b-0"
          >
            <CompanyNameCell company={company} />
            <div>
              <CompanyBadge company={company} />
              <StatusEventInfo company={company} />
            </div>
            <span className="break-words text-eg-ardesia">
              {company.vatNumber}
            </span>
            <span className="text-eg-ardesia">
              {formatValue(company.city)}
            </span>
            <span className="break-words text-eg-ardesia">
              {company.phone}
            </span>
            <span className="text-eg-ardesia">
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
          className="border border-eg-hairline bg-eg-calce p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <CompanyNameCell company={company} />
            <div className="text-right">
              <CompanyBadge company={company} />
              <StatusEventInfo company={company} />
            </div>
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-eg-ardesia">
            <div className="flex justify-between gap-4">
              <dt className="text-eg-ardesia">
                Città
              </dt>
              <dd>{formatValue(company.city)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-eg-ardesia">
                Telefono
              </dt>
              <dd className="break-words text-right">
                {company.phone}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-eg-ardesia">
                P.IVA
              </dt>
              <dd className="break-words text-right">
                {company.vatNumber}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-eg-ardesia">
                Registrata
              </dt>
              <dd>{formatDate(company.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-eg-hairline pt-4">
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
      <header className="border-b border-eg-hairline pb-7">
        <p className="text-sm font-medium text-eg-ardesia">
          Control room
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-terra">
          Imprese
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-ardesia">
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
          <div className="border-y border-eg-hairline py-8">
            <p className="text-base font-semibold text-eg-terra">
              Nessuna impresa da mostrare
            </p>
            <p className="mt-2 text-sm leading-6 text-eg-ardesia">
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
