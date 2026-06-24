'use client'

import { useEffect, useState, } from 'react'

import {
  useRouter, } from 'next/navigation'

import {
  Button, cn } from '@esigenta/ui';

import {
  RequestStepper,
} from './request-stepper'

import type {
  JsonRuntimeFunnelPayload,
} from './request-stepper'

type RequestFlowShellProps = {
  interventionSlug: string
  query?: string
}

export function RequestFlowShell({
  interventionSlug,
  query,
}: RequestFlowShellProps) {
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
          'border border-cantiere-hairline bg-cantiere-paper p-5 text-sm text-cantiere-ink-secondary md:p-6',
          "rounded-[8px]",
          "shadow-cantiere-elevation",
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
          'border border-cantiere-hairline bg-cantiere-paper p-5 md:p-6',
          "rounded-[8px]",
          "shadow-cantiere-elevation",
        )}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-cantiere-accent">
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
    <RequestStepper
      payload={runtimePayload}
      onReset={() => {
        router.push('/')
      }}
    />
  )
}
