import {
  listCompanyConversations,
} from "@esigenta/domain"
import {
  Card,
  CardContent,
  PageShell,
} from "@esigenta/ui"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"

import {
  ContactsList,
} from "./contacts-list"

export async function ContactsPage() {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()
  if (monitored) areaLog("area.model.contacts.start", {})

  const actor =
    await requireAreaImpresaAccess()
  const result =
    await listCompanyConversations({
      companyId: actor.company.id,
      userId: actor.user.id,
      authorizedActor: actor,
      excludeType: "SUPPORT",
    })

  if (monitored) areaLog("area.model.contacts.end", {
    result: result.ok ? "ok" : "error",
    durationMs: Math.round(areaTimestamp() - pageStart),
  })

  const contacts =
    result.ok ? result.conversations : []

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="pt-4">
          <p className="text-sm font-medium text-cantiere-ink-secondary">
            Area impresa
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-cantiere-ink">
            Contatti
          </h1>

          <p className="mt-1 text-sm text-cantiere-ink-secondary">
            Clienti collegati alle richieste che hai sbloccato.
          </p>
        </div>

        {result.ok ? (
          <ContactsList
            contacts={contacts}
            hrefBase="/area-impresa/contatti"
            emptyMessage="Nessun contatto disponibile. I clienti compariranno qui dopo lo sblocco di una richiesta."
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-cantiere-ink-secondary">
                {result.message}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </PageShell>
  )
}
