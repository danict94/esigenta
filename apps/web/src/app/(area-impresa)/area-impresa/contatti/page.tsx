import {
  listCompanyConversations,
} from "@esigenta/db"
import {
  Card,
  CardContent,
  PageShell,
} from "@esigenta/ui"

import {
  requireCompanyActor,
} from "../../../../auth/server"

import {
  ContactList,
} from "../_components/contact-list"

export const dynamic = "force-dynamic"

export default async function CompanyContactsPage() {
  const actor =
    await requireCompanyActor()
  const result =
    await listCompanyConversations({
      companyId: actor.companyId,
      userId: actor.userId,
    authorizedActor: actor,
    })
  const contacts =
    result.ok
      ? result.conversations.filter(
          (conversation) =>
            conversation.type !== "SUPPORT",
        )
      : []

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="pt-4">
          <p className="text-sm font-medium text-text-secondary">
            Area impresa
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Contatti
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Clienti collegati alle richieste che hai sbloccato.
          </p>
        </div>

        {result.ok ? (
          <ContactList
            contacts={contacts}
            hrefBase="/area-impresa/contatti"
            emptyMessage="Nessun contatto disponibile. I clienti compariranno qui dopo lo sblocco di una richiesta."
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">
                {result.message}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </PageShell>
  )
}
