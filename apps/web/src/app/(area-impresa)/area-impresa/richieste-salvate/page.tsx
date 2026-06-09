import {
  PageShell,
} from "@esigenta/ui"

import {
  listCompanySavedRequests,
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

export default async function RichiesteSalvatePage() {
  const actor = await requireCompanyActor()
  const requests = await listCompanySavedRequests({
    companyId: actor.companyId,
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

        <CompanyRequestList
          requests={requests}
          mode="saved"
          emptyMessage="Non hai ancora salvato richieste."
          savedAction={toggleSavedRequestAction}
        />
      </section>
    </PageShell>
  )
}