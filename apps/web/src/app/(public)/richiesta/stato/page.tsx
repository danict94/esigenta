import Link from "next/link"
import {
  Container,
  cn,
  tokens,
} from '@esigenta/ui'

import {
  RequestFlowError,
  getRequestStatusByToken,
} from '@esigenta/domain'

import { PublicShell } from '../../../../components/layout/public-shell'
import { CustomerRequestsNav } from '../../richieste/_components/customer-requests-nav'

export const dynamic = 'force-dynamic'

type RequestStatusPageProps = {
  searchParams: Promise<{
    token?: string
  }>
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
  }).format(date)
}

function formatIntervention(slug: string | null) {
  if (!slug) {
    return 'Richiesta'
  }

  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    )
}

function formatStatus(status: string) {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return 'In attesa di conferma'
    case 'PENDING_REVIEW':
      return 'In revisione'
    case 'APPROVED':
      return 'Approvata'
    case 'PUBLISHED':
      return 'Pubblicata'
    case 'CLOSED':
      return 'Chiusa'
    case 'REJECTED':
      return 'Non approvata'
    default:
      return status
  }
}

function getStatusMessage(status: string) {
  switch (status) {
    case 'PENDING_REVIEW':
      return 'La richiesta è in revisione. Ti aggiorneremo quando sarà pronta.'
    case 'APPROVED':
      return 'La richiesta è stata approvata ed è pronta per la pubblicazione.'
    case 'PUBLISHED':
      return 'La richiesta è pubblicata e visibile ai professionisti disponibili.'
    case 'CLOSED':
      return 'La richiesta è stata chiusa.'
    case 'REJECTED':
      return 'La richiesta non è stata approvata dopo la revisione.'
    default:
      return 'Stiamo elaborando lo stato della richiesta.'
  }
}

function getFinalTimelineLabel(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'Approvata'
    case 'PUBLISHED':
      return 'Pubblicata'
    case 'CLOSED':
      return 'Chiusa'
    case 'REJECTED':
      return 'Non approvata'
    default:
      return 'Approvata, pubblicata o chiusa'
  }
}

function isReviewStarted(status: string) {
  return [
    'PENDING_REVIEW',
    'APPROVED',
    'PUBLISHED',
    'CLOSED',
    'REJECTED',
  ].includes(status)
}

function isFinal(status: string) {
  return [
    'APPROVED',
    'PUBLISHED',
    'CLOSED',
    'REJECTED',
  ].includes(status)
}

function buildTimeline({
  status,
  verifiedAt,
}: {
  status: string
  verifiedAt: Date | null
}) {
  return [
    {
      label: 'Richiesta inviata',
      active: true,
    },
    {
      label: 'Email confermata',
      active:
        Boolean(verifiedAt) ||
        status !== 'PENDING_VERIFICATION',
    },
    {
      label: 'In revisione',
      active: isReviewStarted(status),
    },
    {
      label: getFinalTimelineLabel(status),
      active: isFinal(status),
    },
  ]
}

async function loadStatus(token?: string) {
  if (!token) {
    return {
      ok: false as const,
      title: 'Link non valido',
      message:
        'Il link non contiene il token necessario.',
    }
  }

  try {
    const request =
      await getRequestStatusByToken({
        token,
      })

    return {
      ok: true as const,
      request,
    }
  } catch (error) {
    return {
      ok: false as const,
      title:
        'Stato non disponibile',
      message:
        error instanceof RequestFlowError
          ? error.message
          : 'Non siamo riusciti a recuperare lo stato della richiesta.',
    }
  }
}

export default async function RequestStatusPage({
  searchParams,
}: RequestStatusPageProps) {
  const { token } =
    await searchParams
  const result =
    await loadStatus(token)

  const actionLinkClass =
    'inline-flex h-11 items-center justify-center rounded-md border border-brand-primary bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover'

  return (
    <PublicShell>
      <section className={tokens.spacing.sectionLg}>
        <Container size="sm">
          <div
            className={cn(
              'border border-border-primary bg-surface-elevated p-6',
              tokens.radius.lg,
              tokens.shadows.surface,
            )}
          >
            {result.ok ? (
              <div className="flex flex-col gap-6">
                <CustomerRequestsNav
                  token={
                    result.request.historyAccessToken ??
                    undefined
                  }
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-brand-primary">
                    Stato richiesta
                  </p>

                  <h1
                    className={cn(
                      'text-text-primary',
                      tokens.typography.title,
                    )}
                  >
                    {formatStatus(
                      result.request.status,
                    )}
                  </h1>

                  <p className="text-sm leading-6 text-text-secondary">
                    {getStatusMessage(
                      result.request.status,
                    )}
                  </p>
                </div>

                <dl className="grid gap-3 text-sm">
                  <div className="border border-border-primary bg-surface-primary p-3">
                    <dt className="text-xs text-text-muted">
                      Codice richiesta
                    </dt>
                    <dd className="mt-1 font-medium text-text-primary">
                      {result.request.requestCode ??
                        result.request.requestId}
                    </dd>
                  </div>

                  <div className="border border-border-primary bg-surface-primary p-3">
                    <dt className="text-xs text-text-muted">
                      Intervento
                    </dt>
                    <dd className="mt-1 text-text-primary">
                      {formatIntervention(
                        result.request
                          .interventionSlug,
                      )}
                    </dd>
                  </div>

                  <div className="border border-border-primary bg-surface-primary p-3">
                    <dt className="text-xs text-text-muted">
                      Città
                    </dt>
                    <dd className="mt-1 text-text-primary">
                      {result.request.city ??
                        'Non specificata'}
                    </dd>
                  </div>

                  <div className="border border-border-primary bg-surface-primary p-3">
                    <dt className="text-xs text-text-muted">
                      Data invio
                    </dt>
                    <dd className="mt-1 text-text-primary">
                      {formatDate(
                        result.request.createdAt,
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="border border-border-primary bg-surface-primary p-4">
                  <h2 className="text-sm font-semibold text-text-primary">
                    Avanzamento
                  </h2>
                  <ol className="mt-4 space-y-3">
                    {buildTimeline({
                      status:
                        result.request.status,
                      verifiedAt:
                        result.request.verifiedAt,
                    }).map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={cn(
                            'h-2.5 w-2.5 rounded-full border',
                            item.active
                              ? 'border-brand-primary bg-brand-primary'
                              : 'border-border-secondary bg-surface-elevated',
                          )}
                        />
                        <span
                          className={cn(
                            item.active
                              ? 'text-text-primary'
                              : 'text-text-muted',
                          )}
                        >
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/"
                    className={actionLinkClass}
                  >
                    Richiedi un nuovo intervento
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-text-muted">
                  Stato richiesta
                </p>
                <h1
                  className={cn(
                    'text-text-primary',
                    tokens.typography.title,
                  )}
                >
                  {result.title}
                </h1>
                <p className="text-sm leading-6 text-text-secondary">
                  {result.message}
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </PublicShell>
  )
}
