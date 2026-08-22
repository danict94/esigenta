import type { ReactNode } from "react"

import {
  type AdminFunnelAbandonmentRow,
  type AdminFunnelAttributionRow,
  type AdminFunnelErrorRow,
  type AdminFunnelPeriod,
  type AdminFunnelProvenance,
  type AdminFunnelSessionSummary,
  type AdminFunnelSessionStatus,
  type AdminFunnelStepRow,
  getAdminFunnelMetrics,
} from "@esigenta/domain"
import {
  Badge,
  Button,
  PageShell,
  Select,
  buttonClassName,
  cn,
} from "@esigenta/ui"

export const dynamic = "force-dynamic"

// FASE 6F — pagina admin READ-ONLY: legge solo FunnelEvent (via
// getAdminFunnelMetrics), non scrive mai nulla, non introduce nuovi eventi
// né tabelle. L'autenticazione admin è già garantita dal layout
// (protected) che avvolge questa route — vedi
// apps/admin/src/app/(protected)/layout.tsx — questa pagina non la
// reimplementa. Nessun dato personale mostrato: solo funnelSessionId
// (UUID casuale lato client), interventionSlug, step id/question,
// errorCode, provenienza marketing. Vedi report FASE 6F.

const PERIOD_OPTIONS: { value: AdminFunnelPeriod; label: string }[] = [
  { value: "7d", label: "Ultimi 7 giorni" },
  { value: "30d", label: "Ultimi 30 giorni" },
  { value: "90d", label: "Ultimi 90 giorni" },
  { value: "all", label: "Da sempre" },
]

const PROVENANCE_OPTIONS: { value: AdminFunnelProvenance; label: string }[] = [
  { value: "google_ads", label: "Google Ads (gclid/gbraid/wbraid)" },
  { value: "campaign", label: "Campagna (UTM)" },
  { value: "direct", label: "Diretto / organico" },
  // FASE 7E: distinta da "direct" — cattura fallita per un errore tecnico, non semplicemente assente.
  { value: "unknown", label: "Non determinabile (errore tecnico)" },
]

const SESSION_STATUS_LABELS: Record<AdminFunnelSessionStatus, string> = {
  converted: "Convertita",
  submitting: "In invio",
  abandoned: "Abbandonata",
}

type FunnelPageProps = {
  searchParams?: Promise<{
    period?: string | string[]
    intervento?: string | string[]
    provenienza?: string | string[]
  }>
}

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function normalizePeriod(value?: string): AdminFunnelPeriod {
  return value === "7d" || value === "30d" || value === "90d" || value === "all"
    ? value
    : "30d"
}

function normalizeProvenance(value?: string): AdminFunnelProvenance | undefined {
  return value === "google_ads" ||
    value === "campaign" ||
    value === "direct" ||
    value === "unknown"
    ? value
    : undefined
}

function formatCount(count: number) {
  return new Intl.NumberFormat("it-IT").format(count)
}

function formatPercent(rate: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(rate)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatInterventionLabel(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function Panel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-eg-lg shadow-eg-elevation border border-eg-border bg-eg-surface p-5 md:p-6",
        className,
      )}
    >
      {children}
    </section>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-lg font-semibold tracking-tight text-eg-ink">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-eg-text-muted">
          {description}
        </p>
      ) : null}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="mt-4 text-sm leading-6 text-eg-text-muted">{message}</p>
  )
}

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="min-w-0 border-b border-eg-border pb-4 last:border-b-0 sm:border-b-0 sm:pb-0">
      <p className="text-3xl font-semibold leading-none tracking-tight text-eg-ink">
        {value}
      </p>
      <p className="mt-3 text-sm font-semibold text-eg-ink">{label}</p>
      {helper ? (
        <p className="mt-1 text-xs leading-5 text-eg-text-muted">{helper}</p>
      ) : null}
    </div>
  )
}

function FiltersForm({
  period,
  interventionSlug,
  provenance,
  interventionOptions,
}: {
  period: AdminFunnelPeriod
  interventionSlug?: string
  provenance?: AdminFunnelProvenance
  interventionOptions: string[]
}) {
  return (
    <form className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-eg-text-muted">Periodo</span>
        <Select name="period" defaultValue={period}>
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-eg-text-muted">Intervento</span>
        <Select name="intervento" defaultValue={interventionSlug ?? ""}>
          <option value="">Tutti gli interventi</option>
          {interventionOptions.map((slug) => (
            <option key={slug} value={slug}>
              {formatInterventionLabel(slug)}
            </option>
          ))}
        </Select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-eg-text-muted">Provenienza</span>
        <Select name="provenienza" defaultValue={provenance ?? ""}>
          <option value="">Tutte le provenienze</option>
          {PROVENANCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>

      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          Applica
        </Button>
        <a href="/funnel" className={buttonClassName({ variant: "ghost" })}>
          Azzera
        </a>
      </div>
    </form>
  )
}

function StepTable({ steps }: { steps: AdminFunnelStepRow[] }) {
  if (steps.length === 0) {
    return (
      <EmptyState message="Nessun dato di avanzamento step disponibile per questo periodo/filtro." />
    )
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-eg-border text-left text-xs font-medium uppercase tracking-wide text-eg-text-muted">
            <th className="py-2 pr-4">Step</th>
            <th className="py-2 pr-4">Visualizzato</th>
            <th className="py-2 pr-4">Completato</th>
            <th className="py-2">Tasso completamento</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => (
            <tr key={step.stepKey} className="border-b border-eg-border last:border-b-0">
              <td className="py-3 pr-4 text-eg-ink">{step.stepLabel}</td>
              <td className="py-3 pr-4 text-eg-ink">{formatCount(step.viewedCount)}</td>
              <td className="py-3 pr-4 text-eg-ink">{formatCount(step.completedCount)}</td>
              <td className="py-3 text-eg-ink">{formatPercent(step.completionRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ErrorTable({ errors }: { errors: AdminFunnelErrorRow[] }) {
  if (errors.length === 0) {
    return <EmptyState message="Nessun invio fallito registrato per questo periodo/filtro." />
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[24rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-eg-border text-left text-xs font-medium uppercase tracking-wide text-eg-text-muted">
            <th className="py-2 pr-4">Codice errore</th>
            <th className="py-2">Occorrenze</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((error) => (
            <tr key={error.errorCode} className="border-b border-eg-border last:border-b-0">
              <td className="py-3 pr-4 font-(family-name:--eg-font-mono) text-xs text-eg-ink">
                {error.errorCode}
              </td>
              <td className="py-3 text-eg-ink">{formatCount(error.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AbandonmentTable({ rows }: { rows: AdminFunnelAbandonmentRow[] }) {
  if (rows.length === 0) {
    return <EmptyState message="Nessun abbandono registrato per questo periodo/filtro." />
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-eg-border text-left text-xs font-medium uppercase tracking-wide text-eg-text-muted">
            <th className="py-2 pr-4">Ultimo step raggiunto</th>
            <th className="py-2">Sessioni abbandonate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stepKey ?? "__none__"} className="border-b border-eg-border last:border-b-0">
              <td className="py-3 pr-4 text-eg-ink">{row.stepLabel}</td>
              <td className="py-3 text-eg-ink">{formatCount(row.sessionCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AttributionTable({ rows }: { rows: AdminFunnelAttributionRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.sessionCount, 0)

  if (total === 0) {
    return <EmptyState message="Nessuna sessione con dati di provenienza per questo periodo/filtro." />
  }

  return (
    <div className="mt-4 grid gap-3">
      {rows.map((row) => {
        const percent = total > 0 ? row.sessionCount / total : 0

        return (
          <div key={row.source}>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-medium text-eg-text-muted">{row.label}</span>
              <span className="font-semibold text-eg-ink">{formatCount(row.sessionCount)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-eg-surface-muted">
              <div
                className={cn("h-full rounded-full", row.sessionCount > 0 ? "bg-eg-brand-strong" : "bg-transparent")}
                style={{ width: `${percent * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SessionStatusBadge({ status }: { status: AdminFunnelSessionStatus }) {
  const variant = status === "converted" ? "success" : status === "submitting" ? "warning" : "neutral"

  return (
    <Badge variant={variant} size="sm">
      {SESSION_STATUS_LABELS[status]}
    </Badge>
  )
}

function RecentSessionsTable({ sessions }: { sessions: AdminFunnelSessionSummary[] }) {
  if (sessions.length === 0) {
    return <EmptyState message="Nessuna sessione funnel registrata per questo periodo/filtro." />
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-eg-border text-left text-xs font-medium uppercase tracking-wide text-eg-text-muted">
            <th className="py-2 pr-4">Sessione</th>
            <th className="py-2 pr-4">Intervento</th>
            <th className="py-2 pr-4">Avviata</th>
            <th className="py-2 pr-4">Stato</th>
            <th className="py-2">Ultimo step</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.funnelSessionId} className="border-b border-eg-border last:border-b-0">
              <td className="py-3 pr-4 font-(family-name:--eg-font-mono) text-xs text-eg-text-muted">
                {session.funnelSessionId.slice(0, 8)}…
              </td>
              <td className="py-3 pr-4 text-eg-ink">{formatInterventionLabel(session.interventionSlug)}</td>
              <td className="py-3 pr-4 text-eg-ink">{formatDate(session.startedAt)}</td>
              <td className="py-3 pr-4">
                <SessionStatusBadge status={session.status} />
              </td>
              <td className="py-3 text-eg-ink">{session.lastStepLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function AdminFunnelPage({ searchParams }: FunnelPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const period = normalizePeriod(readSearchParam(resolvedSearchParams.period))
  const interventionSlug = readSearchParam(resolvedSearchParams.intervento) || undefined
  const provenance = normalizeProvenance(readSearchParam(resolvedSearchParams.provenienza))

  const metrics = await getAdminFunnelMetrics({
    period,
    ...(interventionSlug ? { interventionSlug } : {}),
    ...(provenance ? { provenance } : {}),
  })

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <header className="border-b border-eg-border pb-7">
        <p className="text-sm font-medium text-eg-text-muted">Control room</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-ink">
          Funnel
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-text-muted">
          Avanzamento, abbandoni e provenienza delle sessioni di richiesta,
          calcolati esclusivamente dagli eventi first-party di FunnelEvent.
        </p>
      </header>

      <section className="mt-6">
        <FiltersForm
          period={period}
          interventionOptions={metrics.interventionOptions}
          {...(interventionSlug ? { interventionSlug } : {})}
          {...(provenance ? { provenance } : {})}
        />
      </section>

      <div className="mt-6 grid gap-6">
        <Panel>
          <SectionHeader
            title="Panoramica"
            description="Sessioni avviate, conversioni e tentativi di invio nel periodo selezionato."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <KpiCard label="Sessioni avviate" value={formatCount(metrics.totalStarted)} />
            <KpiCard
              label="Richieste create"
              value={formatCount(metrics.totalConverted)}
              helper={`Conversione ${formatPercent(metrics.conversionRate)}`}
            />
            <KpiCard
              label="Abbandoni"
              value={formatCount(metrics.totalAbandoned)}
              helper={`${formatPercent(metrics.abandonmentRate)} delle sessioni avviate`}
            />
            <KpiCard label="Invii tentati" value={formatCount(metrics.totalSubmitStarted)} />
            <KpiCard
              label="Invii falliti"
              value={formatCount(metrics.totalSubmitFailed)}
              helper={`${formatPercent(metrics.submitFailureRate)} dei tentativi`}
            />
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            title="Avanzamento per step"
            description={
              interventionSlug
                ? "Domande reali del modello selezionato."
                : "Id step aggregati su tutti gli interventi: filtra per un intervento per vedere le domande reali."
            }
          />
          <StepTable steps={metrics.steps} />
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <SectionHeader
              title="Errori di invio"
              description="Motivo dell'ultimo tentativo fallito, per codice applicativo."
            />
            <ErrorTable errors={metrics.errors} />
          </Panel>

          <Panel>
            <SectionHeader
              title="Abbandoni per ultimo step"
              description="Sessioni avviate senza una richiesta creata, raggruppate per l'ultimo step visto."
            />
            <AbandonmentTable rows={metrics.abandonmentByLastStep} />
          </Panel>
        </div>

        <Panel>
          <SectionHeader
            title="Provenienza"
            description="Sessioni avviate per canale di provenienza (gclid/gbraid/wbraid, UTM o diretto)."
          />
          <AttributionTable rows={metrics.attribution} />
        </Panel>

        <Panel>
          <SectionHeader
            title="Sessioni recenti"
            description="Le ultime sessioni funnel avviate. Nessun dato personale: solo id sessione, intervento e avanzamento."
          />
          <RecentSessionsTable sessions={metrics.recentSessions} />
        </Panel>
      </div>
    </PageShell>
  )
}
