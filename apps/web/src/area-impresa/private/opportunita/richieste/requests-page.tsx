import type { ReactNode } from "react"
import Link from "next/link"

import {
  cn,
} from "@esigenta/ui"

import {
  deriveCompanyRequestAccess,
  getCompanyRequestsListPage,
  listCompanyRequestPreviews,
  type RequestDashboardFilters,
  type RequestDashboardSort,
} from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"

import {
  createPerfTrace,
} from "../../../monitoring/area-impresa-perf-trace"

import {
  CompanyRequestList,
} from "../components/company-request-list"
import {
  AvailableRequestsList,
} from "../components/available-requests-list"
import {
  RequestFiltersPanel,
} from "../components/request-filters-panel"
import {
  KpiStrip,
} from "../components/kpi-strip"
import {
  PANEL_TOP_OFFSET,
} from "../components/dashboard-layout-constants"

import {
  toggleSavedRequestAction,
} from "../actions/toggle-saved-request-action"

export type RequestsPageProps = {
  searchParams: Promise<{
    q?: string | string[]
    radiusKm?: string | string[]
    categoryId?: string | string[]
    interventionId?: string | string[]
    sort?: string | string[]
    page?: string | string[]
  }>
}

const allowedRadiusKm = new Set([
  "10",
  "20",
  "30",
  "50",
  "75",
  "100",
])

const allowedSort =
  new Set<RequestDashboardSort>([
    "recommended",
    "newest",
    "nearest",
  ])

function readSearchParam(
  value?: string | string[],
) {
  return Array.isArray(value)
    ? value[0]
    : value
}

function normalizeRequestDashboardFilters(
  searchParams: Awaited<
    RequestsPageProps["searchParams"]
  >,
): RequestDashboardFilters {
  const q =
    readSearchParam(searchParams.q)
      ?.trim()
      .slice(0, 80)

  const radiusValue =
    readSearchParam(searchParams.radiusKm)

  const sortValue =
    readSearchParam(searchParams.sort)

  const categoryId =
    readSearchParam(searchParams.categoryId)
      ?.trim()

  const interventionId =
    readSearchParam(searchParams.interventionId)
      ?.trim()

  return {
    q: q || null,
    radiusKm:
      radiusValue &&
      allowedRadiusKm.has(radiusValue)
        ? Number(radiusValue)
        : null,
    categoryId: categoryId || null,
    interventionId: interventionId || null,
    sort:
      sortValue &&
      allowedSort.has(
        sortValue as RequestDashboardSort,
      )
        ? (sortValue as RequestDashboardSort)
        : "recommended",
  }
}

type ActiveFilters = {
  q: string | null
  radiusKm: number | null
  categoryId: string | null
  interventionId: string | null
  sort: RequestDashboardSort
}

function hasActiveFilters(
  active: ActiveFilters,
) {
  return Boolean(
    active.q ||
      active.radiusKm ||
      active.categoryId ||
      active.interventionId ||
      active.sort !== "recommended",
  )
}

/**
 * The one visual shell for the requests dashboard — reused by every company
 * access mode (full, preview_locked, unavailable). Full-bleed (no centered
 * PageShell container) to match the approved reference: edge-to-edge KPI
 * strip, list column and docked detail-panel rail, exactly like the HTML
 * mockup at docs/design/mockups/pro-dashboard.html.
 */
function RequestsDashboardShell({
  kpi,
  children,
  showPanelRail,
}: {
  kpi?: ReactNode
  children: ReactNode
  showPanelRail: boolean
}) {
  return (
    <>
      <div className="bg-eg-surface">
        {kpi}

        <div className={cn(showPanelRail && "min-[900px]:pr-[460px]")}>
          {children}
        </div>
      </div>

      {showPanelRail ? (
        <aside
          className="hidden min-[900px]:fixed min-[900px]:inset-y-0 min-[900px]:right-0 min-[900px]:flex min-[900px]:w-[460px] min-[900px]:flex-col min-[900px]:items-center min-[900px]:justify-center min-[900px]:border-l min-[900px]:border-eg-border min-[900px]:bg-eg-surface min-[900px]:px-10 min-[900px]:text-center"
          style={{ top: PANEL_TOP_OFFSET }}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="flex gap-[5px]" aria-hidden="true">
              <span className="h-[18px] w-[6px] rounded-[3px] bg-eg-border" />
              <span className="h-[24px] w-[6px] rounded-[3px] bg-eg-border" />
              <span className="h-[18px] w-[6px] rounded-[3px] bg-eg-border" />
            </div>
            <p className="max-w-[24ch] text-sm leading-6 text-eg-text-muted">
              Seleziona una richiesta per vederne i dettagli e sbloccare il
              contatto.
            </p>
          </div>
        </aside>
      ) : null}
    </>
  )
}

function ListHead({
  title,
  count,
}: {
  title: string
  count?: number
}) {
  return (
    <div className="flex items-center justify-between border-b border-eg-border px-7 py-5">
      <h2 className="text-[17px] font-semibold text-eg-ink">{title}</h2>
      {count !== undefined ? (
        <span className="eg-metadata text-[11px]">
          {count} {count === 1 ? "richiesta" : "richieste"}
        </span>
      ) : null}
    </div>
  )
}

function NoticeBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-eg-border bg-eg-surface-muted px-7 py-4">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-eg-brand-strong"
        aria-hidden="true"
      />
      <p className="text-sm leading-6 text-eg-ink">{children}</p>
    </div>
  )
}

function UnavailableNotice({
  title,
  message,
  ctaHref,
  ctaLabel,
}: {
  title: string
  message: string
  ctaHref?: string | null
  ctaLabel?: string
}) {
  return (
    <div className="px-7 py-10">
      <p className="text-base font-semibold text-eg-ink">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-eg-text-muted">
        {message}
      </p>
      {ctaHref ? (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex text-sm font-medium text-eg-brand-strong"
          prefetch={false}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  )
}

export async function RequestsPage({
  searchParams,
}: RequestsPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.requestsList.start", {})
  }

  const [
    resolvedSearchParams,
    actor,
  ] = await Promise.all([
    searchParams,
    requireAreaImpresaAccess(),
  ])

  const filters =
    normalizeRequestDashboardFilters(
      resolvedSearchParams,
    )

  const pageParam = Number(
    readSearchParam(resolvedSearchParams.page) ?? "1",
  )
  const currentPage =
    Number.isFinite(pageParam) && pageParam >= 1
      ? Math.floor(pageParam)
      : 1

  const requestAccess =
    deriveCompanyRequestAccess(actor.company)

  // ── preview_locked: same dashboard shell/list/panel components, ─────────
  // limited data (no cost, no interest count, no filters) and no save
  // action — canSaveRequests/canUnlockRequests are false for this mode.
  if (requestAccess.mode === "preview_locked") {
    const previewResult =
      await listCompanyRequestPreviews(actor)

    if (monitored) {
      areaLog("area.model.requestsList.end", {
        durationMs: Math.round(
          areaTimestamp() - pageStart,
        ),
        result: previewResult.ok
          ? "preview-locked"
          : previewResult.code,
        dbFetchedCount: previewResult.ok
          ? previewResult.requests.length
          : 0,
        returnedCount: previewResult.ok
          ? previewResult.requests.length
          : 0,
        previewLocked: true,
      })
    }

    if (!previewResult.ok) {
      return (
        <RequestsDashboardShell showPanelRail={false}>
          <ListHead title="Richieste per te" />
          <UnavailableNotice
            title="Preview non disponibile"
            message={previewResult.message}
            ctaHref={
              previewResult.code === "missing_category"
                ? "/area-impresa/configura-servizi"
                : previewResult.code === "missing_location"
                  ? "/area-impresa/profilo"
                  : null
            }
            ctaLabel={
              previewResult.code === "missing_category"
                ? "Configura servizi"
                : "Completa il profilo"
            }
          />
        </RequestsDashboardShell>
      )
    }

    const previewItems = previewResult.requests.map((request) => ({
      id: request.id,
      interventionSlug: request.interventionSlug,
      city: request.city,
      postalCode: null,
      creditCost: null,
      maxUnlocks: null,
      unlockCount: 0,
      createdAt: request.createdAt,
      matchLevel: request.matchLevel,
    }))

    return (
      <RequestsDashboardShell
        showPanelRail
        kpi={
          <KpiStrip
            items={[
              { value: previewItems.length, label: "anteprime compatibili" },
            ]}
          />
        }
      >
        <ListHead title="Richieste per te" count={previewItems.length} />

        <NoticeBar>
          <span className="font-semibold">Il tuo profilo è in revisione.</span>{" "}
          <span className="text-eg-text-muted">
            Apri una richiesta per vedere l&rsquo;anteprima: dettagli, foto e
            contatti si sbloccano dopo l&rsquo;approvazione.
          </span>
        </NoticeBar>

        <CompanyRequestList
          requests={previewItems}
          mode="preview"
          emptyMessage="Nessuna richiesta compatibile al momento."
        />

        {previewResult.hasMore ? (
          <p className="px-7 py-4 text-center text-sm text-eg-text-muted">
            Altre richieste compatibili saranno disponibili dopo
            l&rsquo;approvazione del profilo.
          </p>
        ) : null}
      </RequestsDashboardShell>
    )
  }

  const requestTrace = monitored
    ? createPerfTrace({ scope: "request-list" })
    : null

  const requestQueryStart = areaTimestamp()
  const result = await getCompanyRequestsListPage(
    actor,
    filters,
    currentPage,
    requestTrace !== null ? requestTrace.add : undefined,
  )
  const requestQueryMs = Math.round(areaTimestamp() - requestQueryStart)

  if (monitored) {
    requestTrace?.finish({
      result: result.ok ? "ok" : result.code,
      dbFetchedCount: result.ok ? result.dbFetchedCount : 0,
      returnedCount: result.ok ? result.returnedCount : 0,
    })
    areaLog("area.model.requestsList.end", {
      durationMs: Math.round(areaTimestamp() - pageStart),
      hasSearch: Boolean(filters.q),
      hasCategory: Boolean(filters.categoryId),
      hasRadius: Boolean(filters.radiusKm),
      sort: filters.sort ?? "recommended",
      page: result.ok ? result.page : currentPage,
      pageSize: result.ok ? result.pageSize : 50,
      dbFetchedCount: result.ok ? result.dbFetchedCount : 0,
      returnedCount: result.ok ? result.returnedCount : 0,
      hasNextPage: result.ok ? result.hasNextPage : false,
      boundingBoxApplied: result.ok ? result.boundingBoxApplied : false,
      result: result.ok ? "ok" : result.code,
      requestQueryMs,
    })
  }

  const activeFilters =
    result.filters.active

  const activeFilterCount =
    hasActiveFilters(activeFilters)
  const requestCount =
    result.ok ? result.requests.length : 0
  const unavailableTitle =
    !result.ok &&
    result.code ===
      "company_not_approved_for_marketplace"
      ? actor.company.status === "SUSPENDED"
        ? "Profilo impresa sospeso"
        : actor.company.status === "BLOCKED"
          ? "Profilo impresa bloccato"
          : "Marketplace non disponibile"
      : !result.ok &&
          result.code === "missing_category"
        ? "Categoria impresa non configurata"
        : "Sede operativa incompleta"
  const unavailableHref =
    !result.ok &&
    result.code ===
      "company_not_approved_for_marketplace"
      ? null
      : !result.ok &&
          result.code === "missing_category"
        ? "/area-impresa/configura-servizi"
        : "/area-impresa/profilo"
  const unavailableCta =
    !result.ok &&
    result.code === "missing_category"
      ? "Vai alla configurazione servizi"
      : "Completa sede e raggio operativo"

  return (
    <RequestsDashboardShell
      showPanelRail={result.ok}
      kpi={
        result.ok ? (
          <KpiStrip
            items={[
              { value: requestCount, label: "richieste disponibili" },
            ]}
          />
        ) : undefined
      }
    >
      <ListHead
        title="Richieste per te"
        count={result.ok ? requestCount : undefined}
      />

      {result.ok ? (
        <div className="border-b border-eg-border px-7 py-4">
          <RequestFiltersPanel
            active={activeFilters}
            categories={result.filters.categories}
            interventions={result.filters.interventions}
            activeCategoryIsConfigured={
              result.filters.activeCategoryIsConfigured
            }
            activeFilterCount={activeFilterCount}
          />
        </div>
      ) : null}

      {!result.ok ? (
        <UnavailableNotice
          title={unavailableTitle}
          message={result.message}
          ctaHref={unavailableHref}
          ctaLabel={unavailableCta}
        />
      ) : (
        <>
          {!result.hasSelectedInterventions ? (
            <NoticeBar>
              <span className="font-semibold">
                Seleziona gli interventi che offri
              </span>{" "}
              <span className="text-eg-text-muted">
                per vedere prima le richieste più adatte.
              </span>{" "}
              <Link
                href="/area-impresa/configura-servizi"
                className="font-medium text-eg-brand-strong"
                prefetch={false}
              >
                Configura servizi
              </Link>
            </NoticeBar>
          ) : null}

          <AvailableRequestsList
            key={JSON.stringify(activeFilters)}
            initialRequests={result.requests}
            initialHasNextPage={result.hasNextPage}
            initialPage={result.page}
            filters={activeFilters}
            emptyMessage="Nessuna richiesta disponibile al momento."
            savedAction={toggleSavedRequestAction}
          />
        </>
      )}
    </RequestsDashboardShell>
  )
}
