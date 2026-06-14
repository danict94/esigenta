import {
  getCompanySupportPage,
} from "@esigenta/domain"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageShell,
} from "@esigenta/ui"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../lib/area-monitoring"
import {
  createPerfTrace,
} from "../_lib/perf-log"

import {
  openSupportAction,
} from "./actions"

export const dynamic = "force-dynamic"

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export default async function CompanySupportPage() {
  const actor = await requireAreaImpresaAccess()

  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()
  const trace = createPerfTrace({ scope: "support-page" })

  if (monitored) {
    areaLog("area.model.support.start", {})
  }

  const { supportConversation } = await trace.measure("data", () =>
    getCompanySupportPage(actor, trace.add),
  )

  trace.finish({})

  if (monitored) {
    areaLog("area.model.support.end", {
      result: "ok",
      hasConversation: Boolean(supportConversation),
      durationMs: Math.round(areaTimestamp() - pageStart),
    })
  }

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="pt-4">
          <p className="text-sm font-medium text-text-secondary">
            Area impresa
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Assistenza
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Scrivi al team Esigenta per dubbi operativi sulla piattaforma.
          </p>
        </div>

        <Card>
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  Assistenza Esigenta
                </CardTitle>

                <Badge
                  variant={
                    supportConversation?.hasUnread
                      ? "danger"
                      : "neutral"
                  }
                  size="sm"
                >
                  {supportConversation?.hasUnread
                    ? "Nuovo"
                    : "Sempre disponibile"}
                </Badge>
              </div>

              <CardDescription>
                Un solo canale diretto con il team operativo.
              </CardDescription>
            </div>

            {supportConversation ? (
              <time className="text-sm text-text-muted">
                {formatDateTime(supportConversation.updatedAt)}
              </time>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-text-secondary">
              {supportConversation?.lastMessage?.body ??
                "Scrivi al team Esigenta se hai bisogno di supporto su richieste, crediti o profilo impresa."}
            </p>

            <form action={openSupportAction}>
              <Button type="submit">
                {supportConversation
                  ? "Apri assistenza"
                  : "Contatta assistenza"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  )
}
