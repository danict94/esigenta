import { Badge, Button, Card, PageShell } from "@esigenta/ui"
import { getCompanyCreditsPage } from "@esigenta/billing"
import { isCompanyMarketplaceEnabled } from "@esigenta/domain"
import { formatCentsAsCurrency } from "@esigenta/shared"

import { requireAreaImpresaAccess } from "../../../../auth/server"
import { areaLog, isAreaMonitoringEnabled } from "../../../../platform/monitoring/area-monitoring"
import { createPerfTrace } from "../../../monitoring/area-impresa-perf-trace"

import { CreditCheckoutStatusBanner } from "./credit-checkout-status-banner"
import { createCreditPackageCheckoutAction } from "../actions/create-credit-checkout-action"

export type CreditsPageProps = {
  searchParams?: Promise<{
    checkout?: string
    orderId?: string
    session_id?: string
  }>
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(date)
}

export async function CreditsPage({ searchParams }: CreditsPageProps) {
  const actor = await requireAreaImpresaAccess()

  const monitored = isAreaMonitoringEnabled()

  if (monitored) {
    areaLog("area.credits.page.start", {})
  }

  const trace = createPerfTrace({ scope: "company-credits" })
  const params = searchParams ? await searchParams : {}
  const canBuyCredits = isCompanyMarketplaceEnabled(actor.company.status)

  const result = await getCompanyCreditsPage(actor, trace.add)

  if (monitored) {
    areaLog("area.credits.page.end", {
      result: "ok",
      canBuyCredits,
      balance: result.account.balance,
      lotCount: result.lots.length,
      packageCount: result.packages.length,
    })
  }

  trace.finish({ balance: result.account.balance, packageCount: result.packages.length })

  const checkoutMessage =
    params.checkout === "success" && !params.session_id
      ? "Pagamento ricevuto: verifica Stripe in corso."
      : params.checkout === "cancel"
        ? "Pagamento annullato o non completato."
        : params.checkout === "config"
          ? "Checkout non disponibile: configurazione applicazione mancante."
          : params.checkout === "unavailable"
            ? "Checkout non disponibile per questo pacchetto o profilo impresa."
            : params.checkout === "error"
              ? "Checkout non completato: riprova tra poco o contatta il supporto."
              : null

  return (
    <PageShell size="lg" className="py-8 md:py-10">
      <section className="grid gap-6">
        <header className="border-b border-border-primary pb-7">
          <p className="text-sm font-medium text-text-muted">Crediti impresa</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
            Acquista pacchetti crediti
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Scegli un pacchetto e completa il pagamento su Stripe. I crediti saranno accreditati
            solo dopo la conferma sicura del pagamento.
          </p>
        </header>

        {checkoutMessage ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-text-primary">{checkoutMessage}</p>
          </Card>
        ) : null}

        {params.checkout === "success" && params.session_id ? (
          <CreditCheckoutStatusBanner sessionId={params.session_id} />
        ) : null}

        {!canBuyCredits ? (
          <Card className="bg-surface-secondary p-5">
            <p className="text-sm font-semibold text-text-primary">
              Il tuo profilo impresa deve essere approvato prima di acquistare crediti.
            </p>
          </Card>
        ) : null}

        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Saldo attuale</p>

              <p className="mt-2 text-4xl font-semibold tracking-tight text-text-primary">
                {result.account.balance} crediti
              </p>
            </div>

            <div className="text-sm text-text-secondary">
              {result.nearestLotExpiresAt ? (
                <p>
                  Prossima scadenza:{" "}
                  <span className="font-medium text-text-primary">
                    {formatDate(result.nearestLotExpiresAt)}
                  </span>
                </p>
              ) : (
                <p>Nessuna scadenza attiva</p>
              )}
            </div>
          </div>

          {result.lots.length > 0 ? (
            <div className="mt-6 border-t border-border-primary pt-5">
              <p className="text-sm font-medium text-text-muted">
                Scadenza per lotto
              </p>

              <ul className="mt-3 grid gap-2">
                {result.lots.map((lot) => (
                  <li
                    key={lot.id}
                    className="flex items-center justify-between gap-4 text-sm text-text-secondary"
                  >
                    <span>{lot.creditsRemaining} crediti</span>
                    <span className="font-medium text-text-primary">
                      {formatDate(lot.expiresAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <section className="grid gap-4 lg:grid-cols-3">
          {result.packages.length === 0 ? (
            <Card className="p-6 lg:col-span-3">
              <p className="text-sm text-text-secondary">
                Nessun pacchetto crediti disponibile al momento.
              </p>
            </Card>
          ) : (
            result.packages.map((creditPackage) => (
              <Card key={creditPackage.id} className="flex h-full flex-col p-6">
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

                  <Badge variant="success">Attivo</Badge>
                </div>

                <dl className="mt-6 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">Crediti</dt>
                    <dd className="font-semibold text-text-primary">{creditPackage.credits}</dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">Validita</dt>
                    <dd className="font-semibold text-text-primary">
                      {creditPackage.validityDays} giorni
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">Prezzo</dt>
                    <dd className="font-semibold text-text-primary">
                      {formatCentsAsCurrency(
                        creditPackage.priceCents,
                        creditPackage.currency,
                      )}
                    </dd>
                  </div>
                </dl>

                {canBuyCredits ? (
                  <form action={createCreditPackageCheckoutAction} className="mt-6">
                    <input type="hidden" name="packageId" value={creditPackage.id} />
                    <Button type="submit">Acquista pacchetto</Button>
                  </form>
                ) : (
                  <Button type="button" disabled className="mt-6">
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
