import {
  revalidatePath,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  createSupportConversation,
  listCompanyConversations,
} from "@esigenta/db"
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
  requireCompanyActor,
} from "../../../../auth/server"

export const dynamic = "force-dynamic"

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export default async function CompanySupportPage() {
  const actor =
    await requireCompanyActor()
  const result =
    await listCompanyConversations({
      companyId: actor.company.id,
      userId: actor.user.id,
    authorizedActor: actor,
    })
  const supportConversation =
    result.ok
      ? result.conversations.find(
          (conversation) =>
            conversation.type === "SUPPORT",
        ) ?? null
      : null

  async function contactSupportAction() {
    "use server"

    const currentActor =
      await requireCompanyActor()
    const supportResult =
      await createSupportConversation({
        companyId:
          currentActor.company.id,
        userId:
          currentActor.user.id,
      })

    if (!supportResult.ok) {
      redirect(
        `/area-impresa/assistenza?error=${encodeURIComponent(
          supportResult.code,
        )}`,
      )
    }

    revalidatePath("/area-impresa/assistenza")
    revalidatePath(
      "/area-impresa",
      "layout",
    )

    redirect(
      `/area-impresa/assistenza/${encodeURIComponent(
        supportResult.conversationId,
      )}`,
    )
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
                {formatDateTime(
                  supportConversation.updatedAt,
                )}
              </time>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-text-secondary">
              {supportConversation?.lastMessage?.body ??
                "Scrivi al team Esigenta se hai bisogno di supporto su richieste, crediti o profilo impresa."}
            </p>

            <form action={contactSupportAction}>
              <Button type="submit">
                {supportConversation
                  ? "Apri assistenza"
                  : "Contatta assistenza"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!result.ok ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">
                {result.message}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </PageShell>
  )
}
