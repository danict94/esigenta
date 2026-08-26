import type { ReactNode } from "react"
import { revalidatePath } from "next/cache"

import {
  type AdminFunnelAbandonmentRow,
  type AdminFunnelAttributionRow,
  type AdminFunnelErrorRow,
  type AdminFunnelExitFeedbackOriginCounts,
  type AdminFunnelExitFeedbackReasonRow,
  type AdminFunnelPeriod,
  type AdminFunnelProvenance,
  type AdminFunnelSessionSummary,
  type AdminFunnelV2SessionStatus,
  type AdminFunnelStepRow,
  type AdminFunnelValidationFailureRow,
  deleteAllFunnelEvents,
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

import { requireAdmin } from "../../../auth/server"
import { DeleteFunnelDataButton } from "./delete-funnel-data-button"

export const dynamic = "force-dynamic"

// FASE 9G — Server Action distruttiva: elimina TUTTI i record FunnelEvent.
// requireAdmin() è la PRIMA istruzione, come ogni altra azione mutante in
// questa app (vedi es. approveCompanyAction in
// apps/admin/.../imprese/[companyId]/page.tsx) — il layout (protected)
// protegge solo il RENDER della pagina, mai l'invocazione di una Server
// Action, che è un endpoint POST separato e va riverificata qui
// esplicitamente. Nessun'altra tabella toccata: deleteAllFunnelEvents
// (vedi packages/domain/src/admin/funnel/delete-all-funnel-events.ts) è
// isolata per costruzione, FunnelEvent non ha alcuna relazione con
// Request né con nessun'altra tabella.
async function deleteAllFunnelEventsAction(): Promise<
  { ok: true; deletedCount: number } | { ok: false; message: string }
> {
  "use server"

  const admin = await requireAdmin()

  const result = await deleteAllFunnelEvents({ adminUserId: admin.userId })

  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  revalidatePath("/funnel")

  return { ok: true, deletedCount: result.deletedCount }
}

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

// FASE 9D — converted/in_progress/abandoned/invalid, non più
// converted/submitting/abandoned: "in_progress" è ora basato sul tempo
// (ultima attività significativa entro la soglia di inattività), non
// sulla semplice presenza di un evento submit_started. "invalid" è un
// caso difensivo (dato incompleto), non dovrebbe mai comparire in
// pratica — vedi classifySessionStatus in @esigenta/domain.
const SESSION_STATUS_LABELS: Record<AdminFunnelV2SessionStatus, string> = {
  converted: "Convertita",
  in_progress: "In corso",
  abandoned: "Abbandonata",
  invalid: "Dato incompleto",
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
  onDeleteFunnelData,
}: {
  period: AdminFunnelPeriod
  interventionSlug?: string
  provenance?: AdminFunnelProvenance
  interventionOptions: string[]
  onDeleteFunnelData: () => Promise<
    { ok: true; deletedCount: number } | { ok: false; message: string }
  >
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

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary">
          Applica
        </Button>
        <a href="/funnel" className={buttonClassName({ variant: "ghost" })}>
          Azzera
        </a>
        {/* FASE 9G: azione distruttiva, volutamente separata dal resto del
            form (nessun name/value inviato con "Applica") — il modal di
            conferma vive interamente nel componente client, vedi
            delete-funnel-data-button.tsx. */}
        <DeleteFunnelDataButton onDelete={onDeleteFunnelData} />
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

function ValidationFailureTable({
  rows,
}: {
  rows: AdminFunnelValidationFailureRow[]
}) {
  if (rows.length === 0) {
    return (
      <EmptyState message="Nessun dato di validazione disponibile per questo periodo/filtro." />
    )
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-eg-border text-left text-xs font-medium uppercase tracking-wide text-eg-text-muted">
            <th className="py-2 pr-4">Step</th>
            <th className="py-2 pr-4">Visualizzato</th>
            <th className="py-2 pr-4">Bloccato da validazione</th>
            <th className="py-2">% delle sessioni visualizzate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stepKey} className="border-b border-eg-border last:border-b-0">
              <td className="py-3 pr-4 text-eg-ink">{row.stepLabel}</td>
              <td className="py-3 pr-4 text-eg-ink">{formatCount(row.viewedCount)}</td>
              <td className="py-3 pr-4 text-eg-ink">{formatCount(row.validationFailedCount)}</td>
              <td className="py-3 text-eg-ink">{formatPercent(row.validationFailureRate)}</td>
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

// FASE 9K — "Motivi di uscita dichiarati": una riga per ciascuno dei 7
// reasonCode (sempre tutti, anche a 0 — vedi AdminFunnelExitFeedbackReasonRow),
// il breakdown per step reso come elenco compatto in un'unica cella
// ("Contact: 8 · Location: 1"), stessa idea dell'esempio nel brief ma senza
// una sotto-tabella annidata — mantiene la UI semplice, coerente con ogni
// altra tabella di questa pagina.
//
// FASE 9K.1 — byOrigin è un riepilogo VOLUTAMENTE separato dalla tabella
// (mai una colonna in più lì, per non complicarla): quanti dei feedback
// sotto vengono da chi non aveva mai davvero iniziato (solo funnel_opened)
// contro chi aveva già funnel_started. Non è un giudizio sullo stato della
// sessione (vedi lo status "Abbandonata" nel pannello Sessioni recenti,
// invariato) — solo un'etichetta su QUESTA sezione.
function ExitFeedbackReasonTable({
  rows,
  byOrigin,
}: {
  rows: AdminFunnelExitFeedbackReasonRow[]
  byOrigin: AdminFunnelExitFeedbackOriginCounts
}) {
  const total = rows.reduce((sum, row) => sum + row.sessionCount, 0)

  if (total === 0) {
    return (
      <EmptyState message="Nessun feedback di uscita registrato per questo periodo/filtro." />
    )
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-eg-text-muted">
        Prima di iniziare:{" "}
        <span className="font-semibold text-eg-ink">{formatCount(byOrigin.preStart)}</span>
        {" · "}
        Dopo aver iniziato:{" "}
        <span className="font-semibold text-eg-ink">{formatCount(byOrigin.started)}</span>
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-eg-border text-left text-xs font-medium uppercase tracking-wide text-eg-text-muted">
              <th className="py-2 pr-4">Motivo</th>
              <th className="py-2 pr-4">Sessioni</th>
              <th className="py-2 pr-4">% dei feedback</th>
              <th className="py-2">Per step</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.reasonCode} className="border-b border-eg-border last:border-b-0">
                <td className="py-3 pr-4 text-eg-ink">{row.label}</td>
                <td className="py-3 pr-4 text-eg-ink">{formatCount(row.sessionCount)}</td>
                <td className="py-3 pr-4 text-eg-ink">{formatPercent(row.percentage)}</td>
                <td className="py-3 text-eg-text-muted">
                  {row.byStep.length > 0
                    ? row.byStep
                        .map((step) => `${step.stepLabel}: ${formatCount(step.sessionCount)}`)
                        .join(" · ")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function SessionStatusBadge({ status }: { status: AdminFunnelV2SessionStatus }) {
  const variant =
    status === "converted"
      ? "success"
      : status === "in_progress"
        ? "warning"
        : status === "invalid"
          ? "danger"
          : "neutral"

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
          onDeleteFunnelData={deleteAllFunnelEventsAction}
          {...(interventionSlug ? { interventionSlug } : {})}
          {...(provenance ? { provenance } : {})}
        />
      </section>

      <div className="mt-6 grid gap-6">
        <Panel>
          <SectionHeader
            title="Panoramica"
            description="Sessioni avviate → Convertite → In corso → Abbandonate. Conversione e abbandono sono calcolati solo sulle sessioni risolte (esclude quelle ancora in corso)."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Aperture funnel"
              value={formatCount(metrics.totalOpened)}
              helper="Tracking V2 — funnel_opened, volume complessivo (non filtrato da Provenienza)"
            />
            <KpiCard
              label="Sessioni avviate"
              value={formatCount(metrics.totalStarted)}
              helper={
                metrics.legacyStartedCount > 0
                  ? `Tracking V2 — ${formatCount(metrics.legacyStartedCount)} sessioni legacy non incluse`
                  : "Tracking V2 — funnel_started"
              }
            />
            <KpiCard
              label="Richieste create"
              value={formatCount(metrics.totalConverted)}
              helper={`Conversione ${formatPercent(metrics.conversionRate)} delle risolte`}
            />
            <KpiCard
              label="In corso"
              value={formatCount(metrics.totalInProgress)}
              helper="Attività recente, non ancora convertita né abbandonata"
            />
            <KpiCard
              label="Abbandoni"
              value={formatCount(metrics.totalAbandoned)}
              helper={`${formatPercent(metrics.abandonmentRate)} delle risolte (esclude le sessioni in corso)`}
            />
            <KpiCard label="Invii tentati" value={formatCount(metrics.totalSubmitStarted)} />
            <KpiCard
              label="Invii falliti"
              value={formatCount(metrics.totalSubmitFailed)}
              helper={`${formatPercent(metrics.submitFailureRate)} dei tentativi`}
            />
            {metrics.totalInvalid > 0 ? (
              <KpiCard
                label="Dati incompleti"
                value={formatCount(metrics.totalInvalid)}
                helper="Sessioni V2 senza alcuna attività registrata — anomalia, da indagare"
              />
            ) : null}
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

        <Panel>
          <SectionHeader
            title="Tentativi bloccati dalla validazione"
            description="Sessioni V2 che hanno premuto Avanti/Prepara richiesta senza superare la validazione dello step corrente. Stesso scope di Sessioni avviate (periodo, intervento, provenienza)."
          />
          <ValidationFailureTable rows={metrics.validationFailures} />
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
              description="Solo sessioni classificate Abbandonata (inattive da oltre la soglia, mai le sessioni ancora In corso), raggruppate per l'ultimo step visto."
            />
            <AbandonmentTable rows={metrics.abandonmentByLastStep} />
          </Panel>
        </div>

        <Panel>
          <SectionHeader
            title="Motivi di uscita dichiarati"
            description="Sessioni V2 che hanno scelto un motivo nel modal di uscita dal funnel (exit_feedback_submitted) — incluse quelle che hanno aperto il funnel senza mai iniziarlo davvero. Periodo, intervento e provenienza si applicano come altrove."
          />
          <ExitFeedbackReasonTable
            rows={metrics.exitFeedbackReasons}
            byOrigin={metrics.exitFeedbackByOrigin}
          />
        </Panel>

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
