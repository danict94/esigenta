import Link from "next/link"

import { Badge, Card, PageShell } from "@esigenta/ui"

import {
  getCompanyServicesConfigurationPage,
} from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../lib/area-monitoring"

import {
  createPerfTrace,
} from "../_lib/perf-log"

import { saveCompanyServicesAction } from "./actions"
import {
  CategoryServicesSelector,
  type CategoryOption,
} from "./category-services-selector"

export const dynamic = "force-dynamic"

type ConfiguraServiziPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  missing_categories: "Seleziona almeno una categoria prima di continuare.",
  too_many_categories: "Puoi selezionare al massimo 6 categorie operative.",
  invalid_services:
    "Alcuni servizi non sono collegati alle categorie selezionate.",
}

export default async function ConfiguraServiziPage({
  searchParams,
}: ConfiguraServiziPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.servicesConfiguration.start", {})
  }

  const [{ error }, actor] = await Promise.all([
    searchParams,
    requireAreaImpresaAccess(),
  ])

  const configTrace = monitored
    ? createPerfTrace({ scope: "services-config" })
    : null

  const queryStart = areaTimestamp()
  const result = await getCompanyServicesConfigurationPage(
    actor,
    configTrace !== null ? configTrace.add : undefined,
  )
  const queryMs = Math.round(areaTimestamp() - queryStart)

  if (monitored) {
    configTrace?.finish({
      hasCompany: result.company !== null,
      categoryCount: result.categories.length,
    })
    areaLog("area.model.servicesConfiguration.end", {
      result: "ok",
      hasCompany: result.company !== null,
      categoryCount: result.categories.length,
      durationMs: Math.round(areaTimestamp() - pageStart),
      queryMs,
    })
  }

  const { company, categories } = result

  if (!company) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">Profilo non disponibile</Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Non troviamo il tuo profilo impresa
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            L&apos;account risulta autenticato, ma non è collegato a un profilo
            impresa valido.
          </p>
        </Card>
      </PageShell>
    )
  }

  if (categories.length === 0) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">Categorie non disponibili</Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Configurazione servizi non disponibile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Non ci sono categorie operative configurabili. Puoi comunque
            entrare nell&apos;area impresa.
          </p>

          <Link
            href="/area-impresa/richieste"
            className="mt-6 inline-flex text-sm font-medium text-brand-primary"
            prefetch={false}
          >
            Vai alle richieste
          </Link>
        </Card>
      </PageShell>
    )
  }

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    sectorName: category.sector?.name ?? null,
    services: category.services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      description: svc.description,
    })),
  }))

  const savedCategoryIds = company.categoryIds
  const onboardingCategoryId =
    categories.find((cat) => cat.slug === company.onboardingCategorySlug)?.id ?? null
  const initialCategoryIds =
    savedCategoryIds.length > 0
      ? savedCategoryIds
      : onboardingCategoryId
        ? [onboardingCategoryId]
        : []
  const selectedServiceIds = company.serviceIds
  const errorMessage = error ? (errorMessages[error] ?? null) : null

  return (
    <PageShell size="lg">
      <div className="max-w-4xl">
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text-primary">
          Configura categorie e servizi
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
          Le categorie determinano quali richieste puoi vedere. I servizi sono
          opzionali: aiutano Esigenta a mostrarti prima le richieste più
          pertinenti.
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

            {onboardingCategoryId ? (
              <Badge variant="success">Categoria suggerita</Badge>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="mt-5 border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
              {errorMessage}
            </div>
          ) : null}

          <CategoryServicesSelector
            categories={categoryOptions}
            initialCategoryIds={initialCategoryIds}
            initialServiceIds={selectedServiceIds}
            action={saveCompanyServicesAction}
          />
        </Card>
      </div>
    </PageShell>
  )
}
