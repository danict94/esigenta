import {
  Container,
  cn,
  tokens,
} from '@fixpro/ui'

import {
  RequestFlowError,
  verifyRequestEmail,
} from '@fixpro/db'

import { PublicShell } from '../../../../components/layout/public-shell'
import { CustomerRequestsNav } from '../../richieste/_components/customer-requests-nav'

export const dynamic = 'force-dynamic'

type RequestVerificationPageProps = {
  searchParams: Promise<{
    requestId?: string
    token?: string
  }>
}

function buildStatusUrl(token: string) {
  const params =
    new URLSearchParams({
      token,
    })

  return `/richiesta/stato?${params.toString()}`
}

async function verifyFromSearchParams({
  requestId,
  token,
}: {
  requestId?: string
  token?: string
}) {
  if (!requestId || !token) {
    return {
      ok: false as const,
      title:
        'Link non valido',
      message:
        'Il link di conferma non contiene tutti i dati necessari.',
    }
  }

  try {
    const result =
      await verifyRequestEmail({
        requestId,
        token,
      })

    if (
      result.status ===
      'ALREADY_VERIFIED'
    ) {
      return {
        ok: true as const,
        title:
          'Richiesta già confermata',
        message:
          'Ora è in attesa di revisione.',
        historyAccessToken: null,
      }
    }

    return {
      ok: true as const,
      title:
        'Richiesta confermata',
      message:
        'Ora è in attesa di revisione.',
      statusUrl:
        result.statusAccessToken
          ? buildStatusUrl(
              result.statusAccessToken,
            )
          : undefined,
      historyAccessToken:
        result.historyAccessToken ?? null,
    }
  } catch (error) {
    if (error instanceof RequestFlowError) {
      return {
        ok: false as const,
        title:
          'Conferma non riuscita',
        message:
          error.message,
      }
    }

    return {
      ok: false as const,
      title:
        'Conferma non riuscita',
      message:
        'Non siamo riusciti a confermare la richiesta. Riprova tra poco.',
    }
  }
}

export default async function RequestVerificationPage({
  searchParams,
}: RequestVerificationPageProps) {
  const params = await searchParams
  const result =
    await verifyFromSearchParams(params)

  const primaryLinkClass =
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
            <div className="flex flex-col gap-5">
              {result.ok ? (
                <CustomerRequestsNav
                  token={
                    result.historyAccessToken ??
                    undefined
                  }
                />
              ) : null}

              <p
                className={cn(
                  'text-sm font-medium',
                  result.ok
                    ? 'text-brand-primary'
                    : 'text-text-muted',
                )}
              >
                Conferma richiesta
              </p>

              <div className="space-y-3">
                <h1
                  className={cn(
                    'text-text-primary',
                    tokens.typography.title,
                  )}
                >
                  {result.title}
                </h1>

                <p
                  className={cn(
                    tokens.typography.body,
                    'text-text-secondary',
                  )}
                >
                  {result.message}
                </p>
              </div>

              {result.ok ? (
                <>
                  <p className="text-sm leading-6 text-text-secondary">
                    In futuro puoi tornare dalla voce Storico richieste e vedere le richieste inviate con questa email.
                  </p>

                  {result.statusUrl ? (
                    <a
                      href={result.statusUrl}
                      className={primaryLinkClass}
                    >
                      Vedi stato richiesta
                    </a>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    </PublicShell>
  )
}
