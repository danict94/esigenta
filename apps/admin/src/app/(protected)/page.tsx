import type {
  ReactNode,
} from "react"
import Link from "next/link"

import {
  type AdminDashboardMetrics,
  getAdminDashboardMetrics,
} from "@fixpro/db"
import {
  Badge,
  PageShell,
  cn,
  tokens,
} from "@fixpro/ui"

import { requireAdmin } from "../../auth/server"

export const dynamic = "force-dynamic"

type VisualTone =
  | "primary"
  | "warm"
  | "neutral"
  | "danger"

type QueueItem = {
  label: string
  value: number
  description: string
  href: string
  ctaLabel: string
  icon: "requests" | "companies" | "refresh" | "refunds" | "messages"
  tone: VisualTone
}

type MarketplaceMetric = {
  label: string
  value: number
  description: string
  icon: "requests" | "published" | "companies" | "credits"
  tone: VisualTone
}

type AttentionItem = {
  label: string
  value: number
  description: string
  href?: string
}

type DistributionItem = {
  label: string
  value: number
  tone: VisualTone
}

function formatCount(count: number) {
  return new Intl.NumberFormat("it-IT").format(count)
}

function getToneClasses(tone: VisualTone) {
  if (tone === "warm") {
    return {
      frame:
        "border-accent-warm bg-surface-tertiary text-accent-warm",
      fill: "bg-accent-warm",
      soft: "bg-surface-tertiary",
    }
  }

  if (tone === "danger") {
    return {
      frame:
        "border-border-focus bg-surface-primary text-text-primary",
      fill: "bg-text-primary",
      soft: "bg-surface-secondary",
    }
  }

  if (tone === "primary") {
    return {
      frame:
        "border-brand-primary bg-surface-secondary text-brand-primary",
      fill: "bg-brand-primary",
      soft: "bg-surface-secondary",
    }
  }

  return {
    frame:
      "border-border-secondary bg-surface-primary text-text-secondary",
    fill: "bg-text-muted",
    soft: "bg-surface-muted",
  }
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
        tokens.radius.lg,
        tokens.shadows.sm,
        "border border-border-primary bg-surface-elevated p-5 md:p-6",
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
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function IconMark({
  icon,
  tone,
}: {
  icon:
    | QueueItem["icon"]
    | MarketplaceMetric["icon"]
    | "attention"
    | "ok"
  tone: VisualTone
}) {
  const toneClasses =
    getToneClasses(tone)

  return (
    <span
      aria-hidden="true"
      className={cn(
        tokens.radius.md,
        "grid size-9 shrink-0 place-items-center border",
        toneClasses.frame,
      )}
    >
      <span className="relative block size-4">
        {icon === "requests" ? (
          <>
            <span className="absolute left-0 top-0 h-0.5 w-4 bg-current" />
            <span className="absolute left-0 top-1.5 h-0.5 w-3 bg-current" />
            <span className="absolute left-0 top-3 h-0.5 w-4 bg-current" />
          </>
        ) : icon === "companies" ? (
          <>
            <span className="absolute bottom-0 left-0 h-4 w-1.5 bg-current" />
            <span className="absolute bottom-0 left-2 h-3 w-1.5 bg-current" />
            <span className="absolute bottom-0 right-0 h-2 w-1.5 bg-current" />
          </>
        ) : icon === "refresh" ? (
          <>
            <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-current" />
            <span className="absolute right-0 top-0 h-1.5 w-1.5 border-r-2 border-t-2 border-current" />
          </>
        ) : icon === "refunds" ? (
          <>
            <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-current" />
            <span className="absolute left-1 top-0 h-1.5 w-1.5 border-l-2 border-t-2 border-current" />
          </>
        ) : icon === "messages" ? (
          <>
            <span className="absolute left-0 top-0 h-3 w-4 rounded-md border-2 border-current" />
            <span className="absolute bottom-0 left-2 h-1.5 w-1.5 rotate-45 bg-current" />
          </>
        ) : icon === "published" ? (
          <>
            <span className="absolute bottom-0 left-0 h-2 w-1.5 bg-current" />
            <span className="absolute bottom-0 left-2 h-4 w-1.5 bg-current" />
            <span className="absolute bottom-0 right-0 h-3 w-1.5 bg-current" />
          </>
        ) : icon === "credits" ? (
          <>
            <span className="absolute left-0 top-1 h-3 w-4 rounded-full border-2 border-current" />
            <span className="absolute left-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-current" />
          </>
        ) : icon === "ok" ? (
          <>
            <span className="absolute left-1 top-2.5 h-2 w-0.5 rotate-[-45deg] bg-current" />
            <span className="absolute left-2 top-1 h-3 w-0.5 rotate-45 bg-current" />
          </>
        ) : (
          <>
            <span className="absolute left-2 top-0 h-2.5 w-0.5 bg-current" />
            <span className="absolute bottom-0 left-2 h-0.5 w-0.5 bg-current" />
          </>
        )}
      </span>
    </span>
  )
}

function InlineCta({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
    >
      <span>{children}</span>
      <span aria-hidden="true">-&gt;</span>
    </Link>
  )
}

function QueueRow({ item }: { item: QueueItem }) {
  const hasWork = item.value > 0

  return (
    <div
      className={cn(
        "grid gap-4 border-b border-border-primary px-1 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_5.5rem_auto] sm:items-center sm:gap-5",
        hasWork && "bg-surface-secondary/60",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <IconMark
          icon={item.icon}
          tone={hasWork ? item.tone : "neutral"}
        />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {item.label}
          </p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {item.description}
          </p>
        </div>
      </div>

      <p
        className={cn(
          "text-3xl font-semibold leading-none tracking-tight sm:text-right",
          hasWork ? "text-text-primary" : "text-text-muted",
        )}
      >
        {formatCount(item.value)}
      </p>

      <InlineCta href={item.href}>
        {item.ctaLabel}
      </InlineCta>
    </div>
  )
}

function MarketplaceMetricItem({
  metric,
}: {
  metric: MarketplaceMetric
}) {
  return (
    <div className="min-w-0 border-b border-border-primary pb-4 last:border-b-0 sm:border-b-0 sm:pb-0">
      <div className="flex items-center gap-3">
        <IconMark
          icon={metric.icon}
          tone={metric.tone}
        />

        <p className="text-3xl font-semibold leading-none tracking-tight text-text-primary">
          {formatCount(metric.value)}
        </p>
      </div>

      <p className="mt-3 text-sm font-semibold text-text-primary">
        {metric.label}
      </p>
      <p className="mt-1 text-xs leading-5 text-text-secondary">
        {metric.description}
      </p>
    </div>
  )
}

function MicroBar({
  item,
  total,
}: {
  item: DistributionItem
  total: number
}) {
  const percent =
    total > 0 ? (item.value / total) * 100 : 0
  const toneClasses =
    getToneClasses(item.tone)

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-text-secondary">
          {item.label}
        </span>
        <span className="font-semibold text-text-primary">
          {formatCount(item.value)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
        <div
          className={cn(
            "h-full rounded-full",
            item.value > 0
              ? toneClasses.fill
              : "bg-transparent",
          )}
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  )
}

function DistributionPanel({
  title,
  total,
  items,
}: {
  title: string
  total: number
  items: DistributionItem[]
}) {
  return (
    <div className="border-t border-border-primary pt-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {title}
        </h3>
        <Badge variant="neutral" size="sm">
          {formatCount(total)}
        </Badge>
      </div>

      {total > 0 ? (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <MicroBar
              key={item.label}
              item={item}
              total={total}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          Nessun dato disponibile per questa distribuzione.
        </p>
      )}
    </div>
  )
}

function AttentionRow({ item }: { item: AttentionItem }) {
  return (
    <div className="flex gap-3 border-b border-border-primary py-4 last:border-b-0">
      <IconMark icon="attention" tone="warm" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text-primary">
            {item.label}
          </p>
          <span className="text-xl font-semibold leading-none text-text-primary">
            {formatCount(item.value)}
          </span>
        </div>

        <p className="mt-1 text-sm leading-5 text-text-secondary">
          {item.description}
        </p>

        {item.href ? (
          <div className="mt-3">
            <InlineCta href={item.href}>
              Apri
            </InlineCta>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function EmptyAttentionState() {
  return (
    <div className="mt-4 flex gap-3 border-y border-border-primary py-5">
      <IconMark icon="ok" tone="primary" />
      <div>
        <p className="text-sm font-semibold text-text-primary">
          Nessuna criticità operativa.
        </p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Non risultano blocchi da gestire ora.
        </p>
      </div>
    </div>
  )
}

function buildRequestDistribution(
  metrics: AdminDashboardMetrics,
): DistributionItem[] {
  return [
    {
      label: "Bozze",
      value: metrics.requestStatusCounts.DRAFT,
      tone: "neutral",
    },
    {
      label: "Da verificare",
      value:
        metrics.requestStatusCounts.PENDING_VERIFICATION,
      tone: "warm",
    },
    {
      label: "Da revisionare",
      value:
        metrics.requestStatusCounts.PENDING_REVIEW,
      tone: "warm",
    },
    {
      label: "Approvate",
      value: metrics.requestStatusCounts.APPROVED,
      tone: "primary",
    },
    {
      label: "Pubblicate",
      value: metrics.requestStatusCounts.PUBLISHED,
      tone: "primary",
    },
    {
      label: "Rifiutate",
      value: metrics.requestStatusCounts.REJECTED,
      tone: "danger",
    },
    {
      label: "Chiuse",
      value: metrics.requestStatusCounts.CLOSED,
      tone: "neutral",
    },
  ]
}

function buildCompanyDistribution(
  metrics: AdminDashboardMetrics,
): DistributionItem[] {
  return [
    {
      label: "Da verificare",
      value:
        metrics.companyStatusCounts.PENDING_REVIEW,
      tone: "warm",
    },
    {
      label: "Approvate",
      value: metrics.companyStatusCounts.APPROVED,
      tone: "primary",
    },
    {
      label: "Sospese",
      value: metrics.companyStatusCounts.SUSPENDED,
      tone: "neutral",
    },
    {
      label: "Bloccate",
      value: metrics.companyStatusCounts.BLOCKED,
      tone: "danger",
    },
  ]
}

export default async function AdminHomePage() {
  const admin = await requireAdmin()
  const metrics = await getAdminDashboardMetrics({
    userId: admin.userId,
  })

  const queueItems: QueueItem[] = [
    {
      label: "Richieste da revisionare",
      value: metrics.pendingRequests,
      description: "Richieste verificate in attesa di decisione.",
      href: "/requests",
      ctaLabel: "Apri richieste",
      icon: "requests",
      tone: "warm",
    },
    {
      label: "Imprese da verificare",
      value: metrics.pendingCompanyReviews,
      description: "Nuove imprese in attesa di autorizzazione marketplace.",
      href: "/imprese?status=PENDING_REVIEW",
      ctaLabel: "Apri imprese",
      icon: "companies",
      tone: "primary",
    },
    {
      label: "Aggiornamenti contatto imprese",
      value: metrics.pendingCompanyContactChangeRequests,
      description: "Modifiche contatto impresa da approvare.",
      href: "/imprese/modifiche-contatto",
      ctaLabel: "Apri aggiornamenti",
      icon: "refresh",
      tone: "neutral",
    },
    {
      label: "Rimborsi in revisione",
      value: metrics.pendingCreditRefundRequests,
      description: "Richieste rimborso crediti da valutare.",
      href: "/crediti/rimborsi/richieste",
      ctaLabel: "Apri rimborsi",
      icon: "refunds",
      tone: "warm",
    },
    {
      label: "Assistenza non letta",
      value: metrics.unreadSupportConversations,
      description: "Conversazioni admin con messaggi da leggere.",
      href: "/support",
      ctaLabel: "Apri assistenza",
      icon: "messages",
      tone: "primary",
    },
  ]

  const marketplaceMetrics: MarketplaceMetric[] = [
    {
      label: "Richieste totali",
      value: metrics.totalRequests,
      description: "Nel sistema.",
      icon: "requests",
      tone: "neutral",
    },
    {
      label: "Richieste pubblicate",
      value: metrics.publishedRequests,
      description: "Visibili nel marketplace.",
      icon: "published",
      tone: "primary",
    },
    {
      label: "Imprese approvate",
      value: metrics.approvedCompanies,
      description: "Autorizzate al marketplace.",
      icon: "companies",
      tone: "primary",
    },
    {
      label: "Ordini credito pagati",
      value: metrics.paidCreditOrders,
      description: "Completati.",
      icon: "credits",
      tone: "warm",
    },
  ]

  const attentionItems: AttentionItem[] = [
    ...(metrics.incompletePublishedRequests > 0
      ? [
          {
            label: "Richieste pubblicate senza configurazione commerciale",
            value: metrics.incompletePublishedRequests,
            description:
              "Mancano costo crediti o limite imprese.",
            href: "/requests",
          },
        ]
      : []),
    ...(metrics.failedCreditOrders > 0
      ? [
          {
            label: "Pagamenti falliti",
            value: metrics.failedCreditOrders,
            description: "Ordini credito marcati come falliti.",
          },
        ]
      : []),
  ]

  const requestDistribution =
    buildRequestDistribution(metrics)
  const companyDistribution =
    buildCompanyDistribution(metrics)

  return (
    <PageShell size="lg" className="py-7 md:py-9">
      <header className="max-w-3xl">
        <p className={tokens.home.sectionLabel}>
          Control room
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Dashboard
        </h1>

        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Controllo operativo di richieste, imprese, crediti e assistenza.
        </p>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-12 lg:items-start">
        <Panel className="lg:col-span-7">
          <SectionHeader
            title="Code operative"
            description="Le attività che richiedono attenzione del team."
          />

          <div className="mt-4">
            {queueItems.map((item) => (
              <QueueRow key={item.label} item={item} />
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:col-span-5">
          <Panel>
            <SectionHeader title="Stato marketplace" />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {marketplaceMetrics.map((metric) => (
                <MarketplaceMetricItem
                  key={metric.label}
                  metric={metric}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-6">
              <DistributionPanel
                title="Richieste per stato"
                total={metrics.totalRequests}
                items={requestDistribution}
              />
              <DistributionPanel
                title="Imprese per stato"
                total={metrics.activeCompanies}
                items={companyDistribution}
              />
            </div>
          </Panel>

          <Panel>
            <SectionHeader title="Attenzioni" />

            {attentionItems.length > 0 ? (
              <div className="mt-2">
                {attentionItems.map((item) => (
                  <AttentionRow key={item.label} item={item} />
                ))}
              </div>
            ) : (
              <EmptyAttentionState />
            )}
          </Panel>
        </div>
      </div>
    </PageShell>
  )
}
