import type { ReactNode } from "react"

import { Button, Card, PageShell, cn } from "@esigenta/ui"
import {
  getCompanyCreditsPage,
  type PurchasableCreditPackage,
} from "@esigenta/billing"
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

type PackageTier = "base" | "standard" | "premium"

/**
 * Tiers are derived from a package's position in the already-sorted
 * (sortOrder) list, not from a stored field — there is no "tier" column
 * in CreditPackage. With 1 package there is no ladder to show; with 2 the
 * first is "base" and the second "premium"; with 3+ everything between
 * the first and last is "standard".
 */
function getPackageTier(index: number, total: number): PackageTier {
  if (total <= 1) {
    return "standard"
  }

  if (index === total - 1) {
    return "premium"
  }

  if (index === 0) {
    return "base"
  }

  return "standard"
}

const packageTierCopy: Record<PackageTier, { label: string }> = {
  base: { label: "Base" },
  standard: { label: "Standard" },
  premium: { label: "Premium" },
}

/**
 * Same hand as site/shell/icons.tsx and area-impresa/public/marketing/
 * marketing-glyphs.tsx: 24x24 grid, 1.5px stroke, round caps/joins,
 * structural lines on currentColor, with a single colored detail carrying
 * the meaning. Here the medal ring is always currentColor (the package
 * "earns" a ribbon regardless of tier); the star is the one detail that
 * escalates: absent for base, accent-soft for standard, bronze for
 * premium. Color (not shape) is what separates standard from premium, so
 * the three tiers read as one consistent family, not three different icons.
 */
function PackageTierGlyph({ tier }: { tier: PackageTier }) {
  const starFill =
    tier === "premium"
      ? "var(--color-eg-miele)"
      : tier === "standard"
        ? "var(--color-eg-salvia)"
        : null

  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-eg-ardesia"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
        <circle cx="12" cy="9.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8.8 14.3 6.5 21l5.5-3 5.5 3-2.3-6.7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {starFill ? (
          <path
            d="M12 6.8l1.1 2.2 2.4.3-1.8 1.7.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.8-1.7 2.4-.3Z"
            fill={starFill}
          />
        ) : null}
      </svg>
    </span>
  )
}

function formatPricePerCredit(creditPackage: PurchasableCreditPackage) {
  if (creditPackage.credits <= 0) {
    return null
  }

  return formatCentsAsCurrency(
    Math.round(creditPackage.priceCents / creditPackage.credits),
    creditPackage.currency,
  )
}

/**
 * The "best value" claim must stay truthful: it is the package with the
 * lowest real price-per-credit (priceCents/credits), computed from actual
 * data — not assumed from list position. Ties are not flagged (no single
 * package is strictly the cheapest), to avoid an unsupported claim.
 */
function getBestValuePackageId(packages: PurchasableCreditPackage[]) {
  const withRatio = packages
    .filter((p) => p.credits > 0)
    .map((p) => ({ id: p.id, ratio: p.priceCents / p.credits }))

  if (withRatio.length < 2) {
    return null
  }

  const lowest = Math.min(...withRatio.map((p) => p.ratio))
  const cheapest = withRatio.filter((p) => p.ratio === lowest)

  return cheapest.length === 1 ? cheapest[0]?.id ?? null : null
}

function PackageBenefit({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-6 text-eg-terra">
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 h-4 w-4 shrink-0 text-eg-cotto"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
      <span>{children}</span>
    </li>
  )
}

/**
 * Every bullet below states something true and already present in the
 * data (credits, validityDays, computed price-per-credit) or a true fact
 * about how the product works (one-off Stripe purchase, credits spend on
 * any request you choose). None of this is invented per-package
 * marketing copy — there is no feature flag/content field on
 * CreditPackage to draw from.
 */
function getPackageBenefits(
  creditPackage: PurchasableCreditPackage,
  isBestValue: boolean,
  pricePerCredit: string | null,
) {
  const benefits = [
    `${creditPackage.credits} crediti da spendere sulle richieste che scegli`,
    `Validità ${creditPackage.validityDays} giorni dall'acquisto`,
  ]

  if (isBestValue && pricePerCredit) {
    benefits.push(`${pricePerCredit} a credito: il prezzo più conveniente`)
  } else {
    benefits.push("Pagamento singolo via Stripe, nessun abbonamento")
  }

  return benefits
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
        <header className="border-b border-eg-hairline pb-7">
          <p className="text-sm font-medium text-eg-ardesia">Crediti impresa</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-terra">
            Acquista pacchetti crediti
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-ardesia">
            Scegli un pacchetto e completa il pagamento su Stripe. I crediti saranno accreditati
            solo dopo la conferma sicura del pagamento.
          </p>
        </header>

        {checkoutMessage ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-eg-terra">{checkoutMessage}</p>
          </Card>
        ) : null}

        {params.checkout === "success" && params.session_id ? (
          <CreditCheckoutStatusBanner sessionId={params.session_id} />
        ) : null}

        {!canBuyCredits ? (
          <Card className="bg-eg-calce-2 p-5">
            <p className="text-sm font-semibold text-eg-terra">
              Il tuo profilo impresa deve essere approvato prima di acquistare crediti.
            </p>
          </Card>
        ) : null}

        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-eg-ardesia">Saldo attuale</p>

              <p className="mt-2 text-4xl font-semibold tracking-tight text-eg-terra">
                {result.account.balance} crediti
              </p>
            </div>

            <div className="text-sm text-eg-ardesia">
              {result.nearestLotExpiresAt ? (
                <p>
                  Prossima scadenza:{" "}
                  <span className="font-medium text-eg-terra">
                    {formatDate(result.nearestLotExpiresAt)}
                  </span>
                </p>
              ) : (
                <p>Nessuna scadenza attiva</p>
              )}
            </div>
          </div>

          {result.lots.length > 0 ? (
            <div className="mt-6 border-t border-eg-hairline pt-5">
              <p className="text-sm font-medium text-eg-ardesia">
                Scadenza per lotto
              </p>

              <ul className="mt-3 grid gap-2">
                {result.lots.map((lot) => (
                  <li
                    key={lot.id}
                    className="flex items-center justify-between gap-4 text-sm text-eg-ardesia"
                  >
                    <span>{lot.creditsRemaining} crediti</span>
                    <span className="font-medium text-eg-terra">
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
              <p className="text-sm text-eg-ardesia">
                Nessun pacchetto crediti disponibile al momento.
              </p>
            </Card>
          ) : (
            (() => {
              const bestValuePackageId = getBestValuePackageId(result.packages)

              return result.packages.map((creditPackage, index) => {
              const tier = getPackageTier(index, result.packages.length)
              const isPremium = tier === "premium"
              const pricePerCredit = formatPricePerCredit(creditPackage)
              const isBestValue = creditPackage.id === bestValuePackageId
              const benefits = getPackageBenefits(
                creditPackage,
                isBestValue,
                pricePerCredit,
              )

              return (
                <Card
                  key={creditPackage.id}
                  className={cn(
                    "flex h-full flex-col p-6",
                    isPremium
                      ? // Featured tier: accent border + deeper lift instead of the
                        // default hairline + base elevation, so it visibly sits
                        // above its siblings in the same-size grid.
                        "border-eg-cotto shadow-eg-elevation-lg lg:-translate-y-1"
                      : "",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <PackageTierGlyph tier={tier} />

                    {isPremium ? (
                      <span className="rounded-full bg-eg-miele-tint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-eg-terra">
                        Più scelto
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-eg-ardesia">
                    {packageTierCopy[tier].label}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-eg-terra">
                    {creditPackage.name}
                  </h2>

                  {creditPackage.description ? (
                    <p className="mt-2 text-sm leading-6 text-eg-ardesia">
                      {creditPackage.description}
                    </p>
                  ) : null}

                  <div className="mt-6 border-t border-eg-hairline pt-5">
                    <p className="text-3xl font-semibold tracking-tight text-eg-terra">
                      {creditPackage.credits}
                      <span className="ml-1.5 text-base font-medium text-eg-ardesia">
                        crediti
                      </span>
                    </p>

                    <p className="mt-1 text-lg font-semibold text-eg-terra">
                      {formatCentsAsCurrency(
                        creditPackage.priceCents,
                        creditPackage.currency,
                      )}
                    </p>
                  </div>

                  <ul className="mt-5 grid gap-2">
                    {benefits.map((benefit) => (
                      <PackageBenefit key={benefit}>{benefit}</PackageBenefit>
                    ))}
                  </ul>

                  {canBuyCredits ? (
                    <form action={createCreditPackageCheckoutAction} className="mt-6">
                      <input type="hidden" name="packageId" value={creditPackage.id} />
                      <Button
                        type="submit"
                        variant={isPremium ? "primary" : "ghost"}
                        className="w-full"
                      >
                        Acquista pacchetto
                      </Button>
                    </form>
                  ) : (
                    <Button type="button" disabled className="mt-6 w-full">
                      Acquisto non disponibile
                    </Button>
                  )}
                </Card>
              )
              })
            })()
          )}
        </section>
      </section>
    </PageShell>
  )
}
