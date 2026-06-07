'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  Button,
  cn,
  tokens,
} from '@esigenta/ui'

import {
  RuntimeFunnel,
} from './runtime-funnel'

import type {
  JsonRuntimeFunnelPayload,
} from './runtime-funnel'

type RuntimeFunnelRouteProps = {
  interventionSlug: string
  query?: string
}

export function RuntimeFunnelRoute({
  interventionSlug,
  query,
}: RuntimeFunnelRouteProps) {
  const router = useRouter()

  const [
    runtimePayload,
    setRuntimePayload,
  ] =
    useState<JsonRuntimeFunnelPayload | null>(
      null,
    )

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadRuntimeFunnel() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          '/api/funnel/runtime',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              interventionSlug,
              query,
            }),
          },
        )

        if (!response.ok) {
          throw new Error()
        }

        const payload =
          (await response.json()) as JsonRuntimeFunnelPayload

        if (!cancelled) {
          setRuntimePayload(payload)
        }
      } catch {
        if (!cancelled) {
          setError(
            'Non siamo riusciti ad aprire il percorso guidato. Riprova tra poco.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadRuntimeFunnel()

    return () => {
      cancelled = true
    }
  }, [interventionSlug, query])

  if (isLoading) {
    return (
      <div
        className={cn(
          'border border-border-primary bg-surface-elevated p-5 text-sm text-text-secondary md:p-6',
          tokens.radius.lg,
          tokens.shadows.surface,
        )}
      >
        Prepariamo il percorso guidato...
      </div>
    )
  }

  if (error || !runtimePayload) {
    return (
      <div
        className={cn(
          'border border-border-primary bg-surface-elevated p-5 md:p-6',
          tokens.radius.lg,
          tokens.shadows.surface,
        )}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-brand-primary">
            {error ??
              'Percorso guidato non disponibile.'}
          </p>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              router.push('/')
            }}
          >
            Torna alla ricerca
          </Button>
        </div>
      </div>
    )
  }

  return (
    <RuntimeFunnel
      payload={runtimePayload}
      onReset={() => {
        router.push('/')
      }}
    />
  )
}
