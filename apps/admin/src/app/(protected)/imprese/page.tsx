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
  Card,
  Input,
  PageShell,
  Textarea,
  buttonClassName,
  cn,
} from "@esigenta/ui"

import {
  requireAdmin,
} from "../../../auth/server"

import {
  AdminStatusPill,
} from "../../../components/admin-status-pill"

export const dynamic = "force-dynamic"

type AdminCompaniesPageProps = {
  searchParams?: Promise<{
    status?: string | string[]
    q?: string | string[]
  }>
}

type CompanyAction =
  | {
      label: string
      action: typeof approveCompanyAction
      variant?: "primary" | "ghost"
      requiresReason?: boolean
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

/**
 * Deliberately neutral and terse in the list: only a date, no admin
 * name/reason here — those read as if they were the company's own
 * identity when placed this close to its row (see FASE ADMIN audit,
 * "Super Admin" confusion). Full moderation detail (who + why) lives only
 * on the company detail page.
 */
function StatusEventInfo({
  company,
}: {
  company: AdminCompanyListItem
}) {
  const eventDate =
    getStatusEventDate(company)

  if (!eventDate) {
    return null
  }

  return (
    <p className="mt-1 text-xs leading-5 text-eg-text-muted">
      Ultima moderazione: {formatDate(eventDate)}
    </p>
  )
}

function CompanyBadge({
  company,
}: {
  company: AdminCompanyListItem
}) {
  const badge = company.adminBadge
  const color =
    company.status === "PENDING_REVIEW"
      ? "yellow"
      : company.status === "APPROVED"
        ? "blue"
        : badge.color

  return (
    <AdminStatusPill
      color={color}
      label={badge.label}
    />
  )
}

function ProfileBadge({
  company,
}: {
  company: AdminCompanyListItem
}) {
  const isComplete = company.profileCompleteness.isComplete

  return (
    <AdminStatusPill
      color={isComplete ? "green" : "orange"}
      label={isComplete ? "Completa" : "Incompleta"}
    />
  )
}

/**
 * Deliberately text-only, no dot/badge — a small red-ish link that reads
 * as an inline note, not a status pill, per FASE DOCUMENTI 3.C ("niente
 * pallini, niente badge pesanti"). Renders nothing when there is nothing
 * pending, to avoid visual noise on the common case.
 */
function PendingDocumentsSignal({
  company,
}: {
  company: AdminCompanyListItem
}) {
  if (company.pendingDocumentsCount === 0) {
    return null
  }

  const label =
    company.pendingDocumentsCount === 1
      ? "1 documento da verificare"
      : `${company.pendingDocumentsCount} documenti da verificare`

  return (
    <Link
      href={`/imprese/${company.id}`}
      className="mt-2 block text-xs font-medium text-eg-brand-strong hover:underline"
    >
      {label}
    </Link>
  )
}

function CompanySearchForm({
  activeStatus,
  query,
}: {
  activeStatus: AdminCompanyStatusFilter
  query: string
}) {
  return (
    <form className="flex flex-col gap-2 sm:flex-row">
      {activeStatus !== "ALL" ? (
        <input type="hidden" name="status" value={activeStatus} />
      ) : null}
      <Input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Cerca per nome, P.IVA, email o telefono…"
        className="w-full sm:max-w-sm"
      />
      <Button type="submit" variant="ghost">
        Cerca
      </Button>
    </form>
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
        requiresReason: true,
      },
    ]
  }

  if (status === "APPROVED") {
    return [
      {
        label: "Sospendi",
        action: suspendCompanyAction,
        variant: "ghost",
        requiresReason: true,
      },
      {
        label: "Blocca",
        action: blockCompanyAction,
        variant: "ghost",
        requiresReason: true,
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
        requiresReason: true,
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

  return (
    <div className="grid gap-2">
      <Link
        href={`/imprese/${company.id}`}
        className={buttonClassName({
          variant: "ghost",
          size: "sm",
          className: "w-full",
        })}
      >
        Dettaglio
      </Link>

      {actions.map((item) =>
        item.requiresReason ? (
          <details
            key={item.label}
            className="group border-t border-eg-border pt-2"
          >
            <summary
              className={buttonClassName({
                variant: item.variant ?? "primary",
                size: "sm",
                className: "w-full cursor-pointer list-none",
              })}
            >
              {item.label}
            </summary>
            <form className="mt-3 grid gap-2">
              <input
                type="hidden"
                name="companyId"
                value={company.id}
              />
              <Textarea
                name="reason"
                rows={3}
                required
                placeholder={`Motivo per ${item.label.toLowerCase()}`}
                className="text-xs"
              />
              <Button
                type="submit"
                formAction={item.action}
                size="sm"
                variant={item.variant ?? "primary"}
                className="w-full"
              >
                Conferma
              </Button>
            </form>
          </details>
        ) : (
          <form key={item.label}>
            <input
              type="hidden"
              name="companyId"
              value={company.id}
            />
            <Button
              type="submit"
              formAction={item.action}
              size="sm"
              variant={item.variant ?? "primary"}
              className="w-full"
            >
              {item.label}
            </Button>
          </form>
        ),
      )}
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
      <h2 className="text-base font-semibold leading-6 text-eg-ink">
        {company.name}
      </h2>
      <p className="mt-1 text-xs leading-5 text-eg-text-muted">
        {company.owner?.name ?? company.owner?.email ?? "Owner non disponibile"}
      </p>
      <p className="mt-2 break-words text-xs text-eg-text-muted">
        P.IVA {company.vatNumber}
      </p>
    </div>
  )
}

function CompanyContactsCell({
  company,
}: {
  company: AdminCompanyListItem
}) {
  return (
    <div className="min-w-0">
      <p className="break-words text-eg-text-muted">
        {company.email ?? "—"}
      </p>
      <p className="mt-1 break-words text-xs text-eg-text-muted">
        {company.phone}
      </p>
    </div>
  )
}

function CompanyAreaCell({
  company,
}: {
  company: AdminCompanyListItem
}) {
  return (
    <div className="min-w-0">
      <p className="text-eg-text-muted">
        {company.city ?? "—"}
      </p>
      <p className="mt-1 text-xs text-eg-text-muted">
        {company.operatingRadiusKm} km
      </p>
    </div>
  )
}

function CompanyServicesCell({
  company,
}: {
  company: AdminCompanyListItem
}) {
  return (
    <div className="min-w-0">
      <p className="break-words text-eg-text-muted">
        {company.principalCategoryName ?? "—"}
      </p>
      <p className="mt-1 text-xs text-eg-text-muted">
        {company.interventionCount} interventi
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
      label: "Da approvare",
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
      label: "Incomplete",
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
                ? "border-eg-brand-strong bg-eg-brand-strong text-eg-on-brand"
                : "border-eg-border bg-eg-surface text-eg-text-muted hover:text-eg-ink",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-xs",
                isActive
                  ? "text-eg-on-brand"
                  : "text-eg-text-muted",
              )}
            >
              {tab.count}
            </span>
          </Link>
        )
      })}

      <Link
        href="/imprese/modifiche-contatto"
        className="inline-flex items-center gap-2 border border-eg-border bg-eg-surface px-3 py-2 text-sm font-medium text-eg-text-muted transition-colors hover:text-eg-ink"
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

function CompaniesList({
  companies,
}: {
  companies: AdminCompanyListItem[]
}) {
  return (
    <ul className="grid gap-4">
      {companies.map((company) => (
        <li key={company.id}>
          <Card className="p-5 transition-colors hover:border-eg-brand-strong md:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_11rem_14rem]">
              <div className="min-w-0">
                <p className="text-xs font-medium text-eg-text-muted">
                  Informazioni
                </p>
                <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <CompanyNameCell company={company} />
                  <div>
                    <p className="mb-2 text-xs font-medium text-eg-text-muted">
                      Contatti
                    </p>
                    <CompanyContactsCell company={company} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-eg-text-muted">
                      Area
                    </p>
                    <CompanyAreaCell company={company} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-eg-text-muted">
                      Servizi
                    </p>
                    <CompanyServicesCell company={company} />
                  </div>
                </div>
              </div>

              <div className="border-t border-eg-border pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className="text-xs font-medium text-eg-text-muted">
                  Stato
                </p>
                <div className="mt-3 grid gap-3">
                  <CompanyBadge company={company} />
                  <ProfileBadge company={company} />
                </div>
                <StatusEventInfo company={company} />
                <PendingDocumentsSignal company={company} />
              </div>

              <div className="border-t border-eg-border pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className="mb-3 text-xs font-medium text-eg-text-muted">
                  Azioni
                </p>
                <CompanyActionForms company={company} />
              </div>
            </div>
          </Card>
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
  const query =
    readSearchParam(resolvedSearchParams.q) ?? ""

  const [
    companies,
    counts,
  ] = await Promise.all([
    listAdminCompanies({
      status: activeStatus,
      search: query,
    }),
    getAdminCompanyStatusCounts(),
  ])

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <header className="border-b border-eg-border pb-7">
        <p className="text-sm font-medium text-eg-text-muted">
          Control room
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-ink">
          Imprese
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-text-muted">
          Gestisci verifiche, autorizzazioni e stato operativo delle imprese.
        </p>
      </header>

      <section className="mt-6">
        <StatusTabs
          activeStatus={activeStatus}
          counts={counts}
        />
      </section>

      <section className="mt-4">
        <CompanySearchForm
          activeStatus={activeStatus}
          query={query}
        />
      </section>

      <section className="mt-6">
        {companies.length === 0 ? (
          <div className="border-y border-eg-border py-8">
            <p className="text-base font-semibold text-eg-ink">
              Nessuna impresa da mostrare
            </p>
            <p className="mt-2 text-sm leading-6 text-eg-text-muted">
              Cambia filtro oppure attendi nuove registrazioni.
            </p>
          </div>
        ) : (
          <CompaniesList companies={companies} />
        )}
      </section>
    </PageShell>
  )
}
