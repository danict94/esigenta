import Link from "next/link"
import {
  Container,
  cn,
  tokens,
} from '@esigenta/ui'

import {
  RequestFlowError,
  getCustomerRequestsByHistoryToken,
} from '@esigenta/domain'

import { PublicShell } from '../../../../components/layout/public-shell'
import { CustomerRequestsNav } from '../_components/customer-requests-nav'

export const dynamic = 'force-dynamic'

type CustomerRequestsPageProps = {
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

function buildDetailHref({
  requestId,
  token,
}: {
  requestId: string
  token: string
}) {
  const params =
    new URLSearchParams({
      token,
    })

  return `/richieste/cliente/richiesta/${encodeURIComponent(requestId)}?${params.toString()}`
}

async function loadRequests(token?: string) {
  if (!token) {
    return {
      ok: false as const,
      message:
        'Il link non contiene il token necessario.',
    }
  }

  try {
    return {
      ok: true as const,
      requests:
        await getCustomerRequestsByHistoryToken(
          token,
        ),
    }
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof RequestFlowError
          ? error.message
          : 'Non siamo riusciti a recuperare le richieste.',
    }
  }
}

export default async function CustomerRequestsPage({
  searchParams,
}: CustomerRequestsPageProps) {
  const { token } =
    await searchParams
  const result =
    await loadRequests(token)

  const primaryLinkClass =
    'inline-flex h-11 items-center justify-center rounded-md border border-brand-primary bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover'
  const secondaryLinkClass =
    'inline-flex h-11 items-center justify-center rounded-md border border-border-primary bg-surface-primary px-5 text-sm font-semibold text-text-primary transition-colors hover:border-border-focus'

  return (
    <PublicShell>
      <section className={tokens.spacing.sectionLg}>
        <Container size="md">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1
                  className={cn(
                    'text-text-primary',
                    tokens.typography.title,
                  )}
                >
                  Storico richieste
                </h1>
                <p className="text-sm leading-6 text-text-secondary">
                  Qui trovi le richieste inviate con questa email.
                </p>
              </div>

              <CustomerRequestsNav token={token} />
            </div>

            {!result.ok ? (
              <div className="border border-border-primary bg-surface-elevated p-6">
                <p className="text-sm text-text-secondary">
                  {result.message}
                </p>
              </div>
            ) : result.requests.length === 0 ? (
              <div className="space-y-4 border border-border-primary bg-surface-elevated p-6">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-text-primary">
                    Nessuna richiesta trovata
                  </h2>
                  <p className="text-sm leading-6 text-text-secondary">
                    Non ci sono richieste associate a questa email oppure il link non contiene ancora uno storico aggiornato.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/"
                    className={primaryLinkClass}
                  >
                    Richiedi un intervento
                  </Link>
                  <Link
                    href="/richieste/accesso"
                    className={secondaryLinkClass}
                  >
                    Ricevi un nuovo link
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {result.requests.map((request) => (
                  <Link
                    key={request.requestId}
                    href={buildDetailHref({
                      requestId:
                        request.requestId,
                      token: token ?? '',
                    })}
                    className="block border border-border-primary bg-surface-elevated p-4 transition-colors hover:bg-surface-secondary"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-text-primary">
                          {formatIntervention(
                            request.interventionSlug,
                          )}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {request.city ??
                            'Città non specificata'}
                          {' - '}
                          {formatDate(
                            request.createdAt,
                          )}
                        </p>
                        <p className="text-xs text-text-muted">
                          Codice richiesta:{' '}
                          {request.requestCode ??
                            request.requestId}
                        </p>
                      </div>

                      <div className="text-sm text-text-secondary sm:text-right">
                        <p className="font-medium text-text-primary">
                          {formatStatus(
                            request.status,
                          )}
                        </p>
                        <p className="mt-3 font-semibold text-brand-primary">
                          Vedi dettagli
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </PublicShell>
  )
}
