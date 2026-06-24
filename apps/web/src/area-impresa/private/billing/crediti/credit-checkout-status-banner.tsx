"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  usePathname,
  useRouter,
} from "next/navigation"

import {
  Card,
} from "@esigenta/ui"

type CheckoutStatus =
  | "pending"
  | "fulfilled"
  | "failed"
  | "cancelled"
  | "expired"
  | "not_found"
  | "error"

type CheckoutStatusResponse = {
  status?: CheckoutStatus
  terminal?: boolean
  paymentStatus?: string | null
  orderStatus?: string | null
}

type CreditCheckoutStatusBannerProps = {
  sessionId: string
}

// Progressive backoff instead of a fixed interval: most of the time the
// Stripe webhook fulfills the order within a couple of seconds, so the first
// polls are quick, but we back off fast to avoid hammering checkout-status
// (and, transitively, Stripe) while waiting on a slow webhook (Phase 17).
const POLL_DELAYS_MS = [1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000]
const MAX_ATTEMPTS = POLL_DELAYS_MS.length + 1

const TERMINAL_STATUSES: ReadonlySet<CheckoutStatus> = new Set([
  "fulfilled",
  "failed",
  "cancelled",
  "expired",
  "not_found",
])

function getStatusMessage(
  status: CheckoutStatus,
) {
  switch (status) {
    case "fulfilled":
      return "Crediti accreditati. Il saldo include il pacchetto acquistato."
    case "failed":
      return "Pagamento non riuscito: nessun credito accreditato."
    case "cancelled":
      return "Pagamento annullato: nessun credito accreditato."
    case "expired":
      return "Sessione di pagamento scaduta: nessun credito accreditato."
    case "not_found":
      return "Sessione di pagamento non trovata: nessun credito accreditato."
    case "error":
      return "Non riusciamo a verificare il pagamento in questo momento."
    case "pending":
    default:
      return "Pagamento ricevuto, stiamo aggiornando i crediti."
  }
}

export function CreditCheckoutStatusBanner({
  sessionId,
}: CreditCheckoutStatusBannerProps) {
  const router =
    useRouter()
  const pathname =
    usePathname()
  const attemptsRef =
    useRef(0)
  const resolvedRef =
    useRef(false)
  const [
    status,
    setStatus,
  ] = useState<CheckoutStatus>("pending")

  useEffect(() => {
    let cancelled = false
    let timeout: ReturnType<
      typeof setTimeout
    > | null = null

    attemptsRef.current = 0
    resolvedRef.current = false

    function settle(nextStatus: CheckoutStatus) {
      setStatus(nextStatus)

      // Exactly one navigation, ever, per terminal outcome — and it strips
      // checkout/session_id from the URL so reloading, bookmarking, or a
      // stray back-navigation to this exact URL can never restart polling
      // again. Replacing (not router.refresh()) is what actually breaks the
      // loop: refresh() kept the same URL, so any later hit on that URL
      // remounted this banner and polled from zero (Phase 17 root cause of
      // the repeated /area-impresa/crediti?checkout=success requests).
      if (!resolvedRef.current) {
        resolvedRef.current = true
        router.replace(pathname)
      }
    }

    async function pollCheckoutStatus() {
      attemptsRef.current += 1

      try {
        const response =
          await fetch(
            `/api/credits/checkout-status?session_id=${encodeURIComponent(sessionId)}`,
            {
              cache: "no-store",
            },
          )
        const payload =
          (await response.json()) as CheckoutStatusResponse

        if (cancelled) {
          return
        }

        if (!response.ok) {
          setStatus("error")
          return
        }

        const nextStatus =
          payload.status ?? "pending"

        if (TERMINAL_STATUSES.has(nextStatus)) {
          settle(nextStatus)
          return
        }

        setStatus(nextStatus)

        if (attemptsRef.current < MAX_ATTEMPTS) {
          const delay =
            POLL_DELAYS_MS[
              Math.min(
                attemptsRef.current - 1,
                POLL_DELAYS_MS.length - 1,
              )
            ]
          timeout = setTimeout(
            pollCheckoutStatus,
            delay,
          )
        }
      } catch {
        if (!cancelled) {
          setStatus("error")
        }
      }
    }

    void pollCheckoutStatus()

    return () => {
      cancelled = true

      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [
    pathname,
    router,
    sessionId,
  ])

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-cantiere-ink">
        {getStatusMessage(status)}
      </p>
    </Card>
  )
}
