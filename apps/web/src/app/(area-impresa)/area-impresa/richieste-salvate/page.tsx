import {
  Card,
  PageShell,
} from "@esigenta/ui"

import {
  listCompanySavedRequests,
} from "@esigenta/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

import {
  formatFreshness,
  formatInterventionLabel,
  formatLocationLabel,
  getDescription,
  getStructuredData,
  getSurfaceArea,
} from "../_components/request-card-format"
import {
  RequestListCard,
} from "../_components/request-list-card"

import {
  toggleSavedRequestAction,
} from "../richieste/actions"

export const dynamic = "force-dynamic"

export default async function RichiesteSalvatePage() {
  const membership =
    await requireDefaultCompanyMembership()
  const requests =
    await listCompanySavedRequests({
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
            Richieste salvate
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {requests.length} richieste
          </p>
        </div>

        {requests.length === 0 ? (
          <Card className="p-8">
            <p className="text-sm text-text-secondary">
              Non hai ancora salvato richieste.
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

              return (
                <RequestListCard
                  key={request.id}
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
                  createdAt={formatFreshness(
                    request.createdAt,
                  )}
                  matchLabel="Salvata"
                  description={description}
                  surfaceArea={surfaceArea}
                  creditCost={request.creditCost}
                  maxUnlocks={request.maxUnlocks}
                  unlockCount={request.unlockCount}
                  isSaved={request.isSaved}
                  savedAction={
                    toggleSavedRequestAction
                  }
                  badges={
                    request.hasUnlocked
                      ? [
                          {
                            label: "Acquistata",
                            variant: "success",
                          },
                        ]
                      : []
                  }
                />
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
