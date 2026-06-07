"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
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
  | "error"

type CheckoutStatusResponse = {
  status?: CheckoutStatus
  paymentStatus?: string | null
  orderStatus?: string | null
}

type CreditCheckoutStatusBannerProps = {
  sessionId: string
}

const POLL_INTERVAL_MS = 1500
const MAX_ATTEMPTS = 8

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
    case "error":
      return "Non riusciamo a verificare il pagamento in questo momento. Riprova tra poco."
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
  const attemptsRef =
    useRef(0)
  const refreshedRef =
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
    refreshedRef.current = false

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

        setStatus(nextStatus)

        if (
          nextStatus === "fulfilled" &&
          !refreshedRef.current
        ) {
          refreshedRef.current = true
          router.refresh()
          return
        }

        if (
          nextStatus === "pending" &&
          attemptsRef.current < MAX_ATTEMPTS
        ) {
          timeout = setTimeout(
            pollCheckoutStatus,
            POLL_INTERVAL_MS,
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
    router,
    sessionId,
  ])

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-text-primary">
        {getStatusMessage(status)}
      </p>
    </Card>
  )
}
