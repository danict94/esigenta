export type FrozenCategory = {
  id: string
  slug: string
  name: string
  description?: string
  aliases?: string[]

  // ProjectGroup slugs associated with this Category. Used for: onboarding
  // bootstrap, search expansion, discovery, SEO/profession pages, and
  // marketplace dashboard visibility. NOT permissions, NOT compatibility
  // rules, NOT matching rules, NOT authorization rules — Category still
  // never participates in matching/dispatch/notifications. Selecting an
  // entry here for onboarding never writes a ProjectGroup assignment
  // anywhere — it only expands into Intervention selections.
  projectGroups: string[]
}
