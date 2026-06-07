import {
  redirect,
} from "next/navigation"

import {
  Badge,
  Button,
  Card,
  PageShell,
} from "@fixpro/ui"

import {
  createPendingCreditOrder,
  getCompanyCreditAccountSummary,
  listActiveCreditPackagesForPurchase,
  markCreditOrderCheckoutCreated,
} from "@fixpro/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

import {
  getStripeServerClient,
} from "../../../../lib/stripe/server"

export const dynamic = "force-dynamic"

type CreditsPageProps = {
  searchParams?: Promise<{
    checkout?: string
    orderId?: string
  }>
}

function getAppUrl() {
  const appUrl =
    process.env.FIXPRO_WEB_URL ??
    process.env.FIXPRO_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (!appUrl) {
    throw new Error(
      "FIXPRO_WEB_URL o FIXPRO_APP_URL non configurata.",
    )
  }

  return appUrl
}

function buildCheckoutReturnUrl({
  appUrl,
  checkout,
  orderId,
}: {
  appUrl: string
  checkout: "success" | "cancel"
  orderId: string
}) {
  const url = new URL(
    "/area-impresa/crediti",
    appUrl,
  )

  url.searchParams.set(
    "checkout",
    checkout,
  )
  url.searchParams.set(
    "orderId",
    orderId,
  )

  return url.toString()
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
  const stripe =
    getStripeServerClient()

  const orderResult =
    await createPendingCreditOrder({
      companyId:
        membership.companyId,
      packageId,
    })

  if (!orderResult.ok) {
    throw new Error(orderResult.message)
  }

  const order =
    orderResult.data
  const idempotencyKey =
    `credit-checkout:${order.orderId}`

  const session =
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
                  `FixPro Crediti - ${order.name}`,
                description:
                  `${order.credits} crediti · validità ${order.validityDays} giorni`,
              },
            },
            quantity: 1,
          },
        ],
        success_url:
          buildCheckoutReturnUrl({
            appUrl,
            checkout: "success",
            orderId: order.orderId,
          }),
        cancel_url:
          buildCheckoutReturnUrl({
            appUrl,
            checkout: "cancel",
            orderId: order.orderId,
          }),
        metadata: {
          creditOrderId:
            order.orderId,
          companyId:
            membership.companyId,
          packageId:
            order.packageId,
          credits:
            String(order.credits),
        },
        client_reference_id:
          order.orderId,
      },
      {
        idempotencyKey,
      },
    )

  const providerPaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : null

  const markResult =
    await markCreditOrderCheckoutCreated({
      creditOrderId:
        order.orderId,
      providerCheckoutId:
        session.id,
      providerPaymentIntentId,
    })

  if (!markResult.ok) {
    throw new Error(markResult.message)
  }

  if (!session.url) {
    throw new Error(
      "Stripe Checkout Session senza URL.",
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
    params.checkout === "success"
      ? "Pagamento ricevuto: i crediti saranno disponibili dopo la conferma Stripe."
      : params.checkout === "cancel"
        ? "Pagamento annullato o non completato."
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
