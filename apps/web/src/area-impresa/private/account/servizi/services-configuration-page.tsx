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
} from "../../../../platform/monitoring/area-monitoring"

import {
  createPerfTrace,
} from "../../../monitoring/area-impresa-perf-trace"

import { updateServicesAction } from "../actions/update-services-action"
import {
  CategoryInterventionsSelector,
  type CategoryOption,
  type ProjectGroupOption,
} from "./category-interventions-selector"

export type ServicesConfigurationPageProps = {
  searchParams: Promise<{
    error?: string
    saved?: string
  }>
}

const errorMessages: Record<string, string> = {
  missing_categories: "Seleziona almeno una categoria prima di continuare.",
  too_many_categories: "Puoi selezionare al massimo 6 categorie operative.",
  invalid_categories: "Una o più categorie selezionate non sono valide.",
  missing_interventions: "Seleziona almeno un intervento prima di continuare.",
  invalid_interventions: "Uno o più interventi selezionati non sono validi.",
}

export async function ServicesConfigurationPage({
  searchParams,
}: ServicesConfigurationPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.servicesConfiguration.start", {})
  }

  const [{ error, saved }, actor] = await Promise.all([
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

  const { company, categories, projectGroups } = result

  if (!company) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">Profilo non disponibile</Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-eg-ink">
            Non troviamo il tuo profilo impresa
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-text-muted">
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

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-eg-ink">
            Configurazione servizi non disponibile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-text-muted">
            Non ci sono categorie operative configurabili. Puoi comunque
            entrare nell&apos;area impresa.
          </p>

          <Link
            href="/area-impresa/richieste"
            className="mt-6 inline-flex text-sm font-medium text-eg-brand-strong"
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
    projectGroupIds: category.projectGroupIds,
  }))

  const projectGroupOptions: ProjectGroupOption[] = projectGroups.map(
    (projectGroup) => ({
      id: projectGroup.id,
      name: projectGroup.name,
      interventions: projectGroup.interventions,
    }),
  )

  // Real saved configuration only (docs/domain-invariants/01_CONFIGURATION_CONSOLIDATION.md).
  // Never pre-fill from onboardingCategorySlug — a checkbox that appears
  // checked must mean it is actually saved in CompanyCategory/CompanyIntervention.
  const initialCategoryIds = company.categoryIds
  const initialInterventionIds = company.interventionIds

  // Onboarding suggestion: display-only, shown unapplied, never fed into
  // initialCategoryIds/initialInterventionIds above.
  const onboardingCategory =
    categories.find((cat) => cat.slug === company.onboardingCategorySlug) ??
    null

  const errorMessage = error ? (errorMessages[error] ?? null) : null
  const savedMessage = saved === "1" ? "Configurazione salvata." : null

  // Edit mode opens directly for an unconfigured company (nothing to
  // summarize yet) or right after a failed save (the error needs the form
  // visible to be actionable) — otherwise the page opens on the calm
  // read-only summary. See category-interventions-selector.tsx.
  const startInEditMode = !company.isConfigured || errorMessage !== null

  return (
    <PageShell size="lg">
      <div className="max-w-4xl">
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-eg-ink">
          Configura categorie e interventi
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-eg-text-muted">
          Le categorie determinano la tua identità professionale. Gli
          interventi determinano quali richieste puoi vedere.
        </p>

        <Card className="mt-8 p-6">
          <div className="flex flex-col gap-3 border-b border-eg-border pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-eg-text-muted">
                Profilo impresa
              </p>

              <h2 className="mt-1 text-xl font-semibold text-eg-ink">
                {company.name}
              </h2>
            </div>

            <Badge variant={company.isConfigured ? "success" : "warning"}>
              {company.isConfigured ? "Configurato" : "Non configurato"}
            </Badge>
          </div>

          {!company.isConfigured && onboardingCategory ? (
            <p className="mt-5 text-sm leading-6 text-eg-text-muted">
              Suggerimento dalla registrazione:{" "}
              <span className="font-medium text-eg-ink">
                {onboardingCategory.name}
              </span>
              . Non è ancora salvato — selezionalo qui sotto e premi
              &quot;Salva configurazione&quot; per applicarlo.
            </p>
          ) : null}

          {errorMessage ? (
            <div className="mt-5 border border-eg-error-border bg-eg-error-soft px-4 py-3 text-sm text-eg-error">
              {errorMessage}
            </div>
          ) : null}

          {savedMessage ? (
            <div className="mt-5 border border-eg-success-border bg-eg-success-soft px-4 py-3 text-sm font-medium text-eg-success">
              {savedMessage}
            </div>
          ) : null}

          <CategoryInterventionsSelector
            categories={categoryOptions}
            projectGroups={projectGroupOptions}
            initialCategoryIds={initialCategoryIds}
            initialInterventionIds={initialInterventionIds}
            action={updateServicesAction}
            startInEditMode={startInEditMode}
          />
        </Card>
      </div>
    </PageShell>
  )
}
