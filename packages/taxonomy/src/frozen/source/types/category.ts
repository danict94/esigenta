export type FrozenCategory = {
  id: string
  slug: string
  name: string
  shortDescription: string
  description?: string
  aliases?: string[]

  // Frozen public-catalog readiness only. `undefined` is intentionally
  // backward-compatible and means public; `false` keeps the profession
  // available to internal taxonomy consumers without exposing a public page.
  isPublic?: boolean

  // ProjectGroup slugs associated with this Category. Used for: onboarding
  // bootstrap, search expansion, discovery, SEO/profession pages, and
  // marketplace dashboard visibility. NOT permissions, NOT compatibility
  // rules, NOT matching rules, NOT authorization rules — Category still
  // never participates in matching/dispatch/notifications. Selecting an
  // entry here for onboarding never writes a ProjectGroup assignment
  // anywhere — it only expands into Intervention selections.
  projectGroups: string[]

  // Exceptions to the ProjectGroup-derived profession catalog. Includes may
  // reference Interventions owned by groups outside `projectGroups`; excludes
  // remove Interventions inherited from the default groups. Resolution stays
  // source-only and never changes Intervention -> ProjectGroup ownership.
  interventionOverrides?: {
    readonly include?: readonly string[]
    readonly exclude?: readonly string[]
  }

  // Initial CompanyIntervention preset shown by onboarding. When omitted the
  // complete effective profession membership is used for backward compatibility.
  readonly onboardingDefaults?: readonly string[]
}
