import {
  PageShell,
} from "@esigenta/ui"

import {
  listCompanyUnlockedRequests,
} from "@esigenta/db"

import {
  requireCompanyActor,
} from "../../../../auth/server"

import {
  CompanyRequestList,
} from "../_components/company-request-list"

import {
  toggleSavedRequestAction,
} from "../richieste/actions"

export const dynamic = "force-dynamic"

export default async function RichiesteAcquistatePage() {
  const actor = await requireCompanyActor()
  const requests = await listCompanyUnlockedRequests({
    companyId: actor.company.id,
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

        <CompanyRequestList
          requests={requests}
          mode="purchased"
          emptyMessage="Non hai ancora acquistato richieste."
          savedAction={toggleSavedRequestAction}
        />
      </section>
    </PageShell>
  )
}