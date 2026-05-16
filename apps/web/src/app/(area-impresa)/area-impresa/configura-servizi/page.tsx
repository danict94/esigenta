import Link from "next/link"

import {
  Badge,
  Button,
  Card,
  PageShell,
} from "@fixpro/ui"
import {
  prisma,
} from "@fixpro/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

import {
  saveCompanyServicesAction,
} from "./actions"

export const dynamic = "force-dynamic"

type ConfiguraServiziPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  missing_services:
    "Seleziona almeno un servizio prima di continuare.",
  invalid_services:
    "Uno o più servizi selezionati non appartengono alla categoria iniziale.",
  missing_category:
    "Non troviamo la categoria iniziale del profilo impresa.",
  company_not_found:
    "Non troviamo il profilo impresa collegato a questo account.",
}

export default async function ConfiguraServiziPage({
  searchParams,
}: ConfiguraServiziPageProps) {
  const [{ error }, membership] =
    await Promise.all([
      searchParams,
      requireDefaultCompanyMembership(),
    ])

  const company =
    await prisma.company.findUnique({
      where: {
        id: membership.companyId,
      },
      select: {
        id: true,
        name: true,
        onboardingCategorySlug: true,
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

  if (!company) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">
            Profilo non disponibile
          </Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Non troviamo il tuo profilo impresa
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            L'account risulta autenticato, ma non è collegato a un profilo
            impresa valido.
          </p>
        </Card>
      </PageShell>
    )
  }

  if (!company.onboardingCategorySlug) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">
            Categoria non disponibile
          </Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Configurazione servizi non disponibile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Questo profilo non ha una categoria di onboarding collegata.
            Puoi comunque entrare nell'area impresa; la configurazione
            guidata dei servizi verrà completata in un passaggio successivo.
          </p>

          <Link
            href="/area-impresa/richieste"
            className="mt-6 inline-flex text-sm font-medium text-brand-primary"
          >
            Vai alle richieste
          </Link>
        </Card>
      </PageShell>
    )
  }

  const category =
    await prisma.category.findUnique({
      where: {
        slug:
          company.onboardingCategorySlug,
      },
      select: {
        slug: true,
        name: true,
        services: {
          orderBy: {
            service: {
              name: "asc",
            },
          },
          select: {
            service: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

  if (!category || category.services.length === 0) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">
            Servizi non disponibili
          </Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Nessun servizio collegato alla categoria
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Non ci sono servizi configurabili per la categoria selezionata
            durante l'iscrizione. Puoi proseguire nell'area impresa.
          </p>

          <Link
            href="/area-impresa/richieste"
            className="mt-6 inline-flex text-sm font-medium text-brand-primary"
          >
            Vai alle richieste
          </Link>
        </Card>
      </PageShell>
    )
  }

  const selectedServiceIds =
    new Set(
      company.services.map(
        (service) => service.serviceId,
      ),
    )

  const errorMessage =
    error ? errorMessages[error] : null

  return (
    <PageShell size="lg">
      <div className="max-w-4xl">
        <Badge>
          Configurazione impresa
        </Badge>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text-primary">
          Conferma i servizi che offri
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
          Abbiamo usato la categoria scelta in fase di iscrizione come punto
          di partenza. Il matching con le richieste userà i servizi
          confermati qui, non la categoria iniziale.
        </p>

        <Card className="mt-8 p-6">
          <div className="flex flex-col gap-3 border-b border-border-primary pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">
                Profilo impresa
              </p>

              <h2 className="mt-1 text-xl font-semibold text-text-primary">
                {company.name}
              </h2>
            </div>

            <Badge variant="success">
              {category.name}
            </Badge>
          </div>

          {errorMessage ? (
            <div className="mt-5 border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
              {errorMessage}
            </div>
          ) : null}

          <form
            action={saveCompanyServicesAction}
            className="mt-6 space-y-6"
          >
            <div className="grid gap-3">
              {category.services.map(
                ({ service }) => (
                  <label
                    key={service.id}
                    className="flex cursor-pointer gap-4 border border-border-primary bg-surface-primary p-4 transition-colors hover:border-border-focus"
                  >
                    <input
                      type="checkbox"
                      name="serviceIds"
                      value={service.id}
                      defaultChecked={selectedServiceIds.has(
                        service.id,
                      )}
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-text-primary">
                        {service.name}
                      </span>

                      {service.description ? (
                        <span className="mt-1 block text-sm leading-6 text-text-secondary">
                          {service.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ),
              )}
            </div>

            <div className="flex justify-end border-t border-border-primary pt-6">
              <Button type="submit">
                Salva servizi
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}
