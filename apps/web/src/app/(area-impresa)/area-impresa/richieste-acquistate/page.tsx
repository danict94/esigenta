import {
  Card,
  PageShell,
} from "@esigenta/ui"

import {
  listCompanyUnlockedRequests,
} from "@esigenta/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

import {
  formatDate,
  formatInterventionLabel,
  formatLocationLabel,
  getDescription,
  getStructuredData,
  getSurfaceArea,
} from "../_components/request-card-format"
import {
  RequestListCard,
  type RequestListCardProps,
} from "../_components/request-list-card"

import {
  toggleSavedRequestAction,
} from "../richieste/actions"

export const dynamic = "force-dynamic"

export default async function RichiesteAcquistatePage() {
  const membership =
    await requireDefaultCompanyMembership()
  const requests =
    await listCompanyUnlockedRequests({
      companyId: membership.companyId,
    })

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Dashboard impresa
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Richieste acquistate
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {requests.length} richieste
          </p>
        </div>

        {requests.length === 0 ? (
          <Card className="p-8">
            <p className="text-sm text-text-secondary">
              Non hai ancora acquistato richieste.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const structuredData =
                getStructuredData(
                  request.structuredData,
                )
              const description =
                getDescription(structuredData)
              const surfaceArea =
                getSurfaceArea(structuredData)
              const badges: NonNullable<
                RequestListCardProps["badges"]
              > = [
                {
                  label: "Acquistata",
                  variant: "success",
                },
              ]

              if (request.refundedAt) {
                badges.push({
                  label: "Rimborsata",
                  variant: "warning",
                })
              }

              return (
                <RequestListCard
                  key={request.requestUnlockId}
                  id={request.id}
                  intervention={formatInterventionLabel(
                    request.interventionSlug,
                  )}
                  location={formatLocationLabel({
                    city: request.city,
                    postalCode:
                      request.postalCode,
                    address: request.address,
                  })}
                  createdAt={`Sbloccata il ${formatDate(
                    request.unlockedAt,
                  )}`}
                  description={description}
                  surfaceArea={surfaceArea}
                  creditCost={request.creditCost}
                  maxUnlocks={request.maxUnlocks}
                  unlockCount={request.unlockCount}
                  isSaved={request.isSaved}
                  savedAction={
                    toggleSavedRequestAction
                  }
                  badges={badges}
                />
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
