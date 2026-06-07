import {
  redirect,
} from "next/navigation"

import {
  Badge,
  Button,
  Card,
  PageShell,
} from "@esigenta/ui"

import {
  createPendingCreditOrder,
  getCompanyCreditAccountSummary,
  listActiveCreditPackagesForPurchase,
  markCreditOrderCheckoutCreated,
} from "@esigenta/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

import {
  getStripeServerClient,
} from "../../../../lib/stripe/server"

import {
  getStripeRuntimeDebugConfig,
  getUrlHost,
  logStripeDebug,
} from "../../../../lib/stripe/debug"

import {
  CreditCheckoutStatusBanner,
} from "./credit-checkout-status-banner"

export const dynamic = "force-dynamic"

type CreditsPageProps = {
  searchParams?: Promise<{
    checkout?: string
    orderId?: string
    session_id?: string
  }>
}

type AppUrlCandidate = {
  value: string | undefined
  source: "standard" | "vercel"
}

function normalizeAppUrl({
  source,
  value,
}: AppUrlCandidate) {
  const trimmed =
    value?.trim()

  if (!trimmed) {
    return null
  }

  const withProtocol =
    source === "vercel" &&
    !/^https?:\/\//i.test(trimmed)
      ? `https://${trimmed}`
      : trimmed

  return withProtocol.replace(
    /\/+$/,
    "",
  )
}

function getAppUrl() {
  const candidates: AppUrlCandidate[] = [
    {
      value:
        process.env.ESIGENTA_WEB_URL,
      source: "standard",
    },
    {
      value:
        process.env.ESIGENTA_APP_URL,
      source: "standard",
    },
    {
      value:
        process.env.NEXT_PUBLIC_APP_URL,
      source: "standard",
    },
    {
      value:
        process.env.BETTER_AUTH_URL,
      source: "standard",
    },
    {
      value:
        process.env
          .VERCEL_PROJECT_PRODUCTION_URL,
      source: "vercel",
    },
    {
      value:
        process.env.VERCEL_URL,
      source: "vercel",
    },
  ]

  for (const candidate of candidates) {
    const normalized =
      normalizeAppUrl(candidate)

    if (normalized) {
      return normalized
    }
  }

  return null
}

function buildCheckoutReturnUrl({
  appUrl,
  checkout,
  orderId,
  sessionId,
}: {
  appUrl: string
  checkout: "success" | "cancel"
  orderId?: string
  sessionId?: string
}) {
  const url = new URL(
    "/area-impresa/crediti",
    appUrl,
  )

  url.searchParams.set(
    "checkout",
    checkout,
  )

  if (orderId) {
    url.searchParams.set(
      "orderId",
      orderId,
    )
  }

  if (sessionId) {
    url.searchParams.set(
      "session_id",
      sessionId,
    )
  }

  return url
    .toString()
    .replace(
      "%7BCHECKOUT_SESSION_ID%7D",
      "{CHECKOUT_SESSION_ID}",
    )
}

function formatPrice({
  amountCents,
  currency,
}: {
  amountCents: number
  currency: string
}) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(amountCents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date)
}

async function createCreditPackageCheckoutAction(
  formData: FormData,
) {
  "use server"

  const membership =
    await requireDefaultCompanyMembership()

  const packageId =
    String(
      formData.get("packageId") ?? "",
    ).trim()

  const appUrl =
    getAppUrl()
  if (!appUrl) {
    logStripeDebug(
      "checkout.base_url_missing",
      {
        companyId:
          membership.companyId,
        ...getStripeRuntimeDebugConfig(),
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=config",
    )
  }

  let stripe: ReturnType<
    typeof getStripeServerClient
  >

  try {
    stripe =
      getStripeServerClient()
  } catch (error) {
    logStripeDebug(
      "checkout.stripe_client_unavailable",
      {
        companyId:
          membership.companyId,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=config",
    )
  }

  const orderResult =
    await createPendingCreditOrder({
      companyId:
        membership.companyId,
      packageId,
    })

  if (!orderResult.ok) {
    logStripeDebug(
      "checkout.order_creation_failed",
      {
        companyId:
          membership.companyId,
        packageId,
        code: orderResult.code,
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=unavailable",
    )
  }

  const order =
    orderResult.data
  const idempotencyKey =
    `credit-checkout:${order.orderId}`
  const checkoutMetadata = {
    creditOrderId:
      order.orderId,
    companyId:
      membership.companyId,
    packageId:
      order.packageId,
    credits:
      String(order.credits),
  }
  const successUrl =
    buildCheckoutReturnUrl({
      appUrl,
      checkout: "success",
      sessionId:
        "{CHECKOUT_SESSION_ID}",
    })
  const cancelUrl =
    buildCheckoutReturnUrl({
      appUrl,
      checkout: "cancel",
    })

  let session: Awaited<
    ReturnType<
      typeof stripe.checkout.sessions.create
    >
  >

  try {
    session =
      await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency:
                order.currency,
              unit_amount:
                order.priceCents,
              product_data: {
                name:
                  `Esigenta Crediti - ${order.name}`,
                description:
                  `${order.credits} crediti · validità ${order.validityDays} giorni`,
              },
            },
            quantity: 1,
          },
        ],
        success_url:
          successUrl,
        cancel_url:
          cancelUrl,
        metadata:
          checkoutMetadata,
        payment_intent_data: {
          metadata:
            checkoutMetadata,
        },
        client_reference_id:
          order.orderId,
      },
      {
        idempotencyKey,
      },
    )
  } catch (error) {
    logStripeDebug(
      "checkout.session_creation_failed",
      {
        companyId:
          membership.companyId,
        creditOrderId:
          order.orderId,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  const providerPaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : null

  logStripeDebug(
    "checkout.session_created",
    {
      companyId:
        membership.companyId,
      creditOrderId:
        order.orderId,
      packageId:
        order.packageId,
      checkoutSessionId:
        session.id,
      providerPaymentIntentId,
      baseUrl:
        appUrl,
      successUrlHost:
        getUrlHost(successUrl),
      cancelUrlHost:
        getUrlHost(cancelUrl),
      ...getStripeRuntimeDebugConfig(),
    },
  )

  const markResult =
    await markCreditOrderCheckoutCreated({
      creditOrderId:
        order.orderId,
      providerCheckoutId:
        session.id,
      providerPaymentIntentId,
    })

  if (!markResult.ok) {
    logStripeDebug(
      "checkout.order_attach_failed",
      {
        companyId:
          membership.companyId,
        creditOrderId:
          order.orderId,
        checkoutSessionId:
          session.id,
        code: markResult.code,
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  if (!session.url) {
    logStripeDebug(
      "checkout.session_url_missing",
      {
        companyId:
          membership.companyId,
        creditOrderId:
          order.orderId,
        checkoutSessionId:
          session.id,
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  redirect(session.url)
}

export default async function CompanyCreditsPage({
  searchParams,
}: CreditsPageProps) {
  const membership =
    await requireDefaultCompanyMembership()
  const params =
    searchParams ? await searchParams : {}
  const canBuyCredits =
    membership.company.status ===
    "APPROVED"

  const [
    accountSummary,
    creditPackages,
  ] = await Promise.all([
    getCompanyCreditAccountSummary({
      companyId:
        membership.companyId,
    }),
    listActiveCreditPackagesForPurchase(),
  ])

  if (!accountSummary.ok) {
    throw new Error(accountSummary.message)
  }

  const checkoutMessage =
    params.checkout === "success" &&
    !params.session_id
      ? "Pagamento ricevuto: verifica Stripe in corso."
      : params.checkout === "cancel"
        ? "Pagamento annullato o non completato."
        : params.checkout === "config"
          ? "Checkout non disponibile: configurazione URL applicazione mancante."
          : params.checkout === "unavailable"
            ? "Checkout non disponibile per questo pacchetto o profilo impresa."
            : params.checkout === "error"
              ? "Checkout non completato: riprova tra poco o contatta il supporto."
              : null

  return (
    <PageShell
      size="lg"
      className="py-8 md:py-10"
    >
      <section className="grid gap-6">
        <header className="border-b border-border-primary pb-7">
          <p className="text-sm font-medium text-text-muted">
            Crediti impresa
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
            Acquista pacchetti crediti
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Scegli un pacchetto e completa il pagamento su Stripe. I crediti
            saranno accreditati solo dopo la conferma sicura del pagamento.
          </p>
        </header>

        {checkoutMessage ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-text-primary">
              {checkoutMessage}
            </p>
          </Card>
        ) : null}

        {params.checkout === "success" &&
        params.session_id ? (
          <CreditCheckoutStatusBanner
            sessionId={params.session_id}
          />
        ) : null}

        {!canBuyCredits ? (
          <Card className="bg-surface-secondary p-5">
            <p className="text-sm font-semibold text-text-primary">
              Il tuo profilo impresa deve essere approvato prima di acquistare
              crediti.
            </p>
          </Card>
        ) : null}

        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">
                Saldo attuale
              </p>

              <p className="mt-2 text-4xl font-semibold tracking-tight text-text-primary">
                {accountSummary.data.balance} crediti
              </p>
            </div>

            <div className="text-sm text-text-secondary">
              {accountSummary.data.expiresAt ? (
                <p>
                  Scadenza:{" "}
                  <span className="font-medium text-text-primary">
                    {formatDate(
                      accountSummary.data.expiresAt,
                    )}
                  </span>
                </p>
              ) : (
                <p>Nessuna scadenza attiva</p>
              )}
            </div>
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-3">
          {creditPackages.length === 0 ? (
            <Card className="p-6 lg:col-span-3">
              <p className="text-sm text-text-secondary">
                Nessun pacchetto crediti disponibile al momento.
              </p>
            </Card>
          ) : (
            creditPackages.map((creditPackage) => (
              <Card
                key={creditPackage.id}
                className="flex h-full flex-col p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                      {creditPackage.name}
                    </h2>

                    {creditPackage.description ? (
                      <p className="mt-3 text-sm leading-6 text-text-secondary">
                        {creditPackage.description}
                      </p>
                    ) : null}
                  </div>

                  <Badge variant="success">
                    Attivo
                  </Badge>
                </div>

                <dl className="mt-6 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">
                      Crediti
                    </dt>
                    <dd className="font-semibold text-text-primary">
                      {creditPackage.credits}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">
                      Validità
                    </dt>
                    <dd className="font-semibold text-text-primary">
                      {creditPackage.validityDays} giorni
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">
                      Prezzo
                    </dt>
                    <dd className="font-semibold text-text-primary">
                      {formatPrice({
                        amountCents:
                          creditPackage.priceCents,
                        currency:
                          creditPackage.currency,
                      })}
                    </dd>
                  </div>
                </dl>

                {canBuyCredits ? (
                  <form
                    action={createCreditPackageCheckoutAction}
                    className="mt-6"
                  >
                    <input
                      type="hidden"
                      name="packageId"
                      value={creditPackage.id}
                    />

                    <Button type="submit">
                      Acquista pacchetto
                    </Button>
                  </form>
                ) : (
                  <Button
                    type="button"
                    disabled
                    className="mt-6"
                  >
                    Acquisto non disponibile
                  </Button>
                )}
              </Card>
            ))
          )}
        </section>
      </section>
    </PageShell>
  )
}
