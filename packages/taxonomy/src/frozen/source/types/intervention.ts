// runtimePresetSlugs is the sole integration point between taxonomy and
// the funnel package. Taxonomy stays independent from funnel internals:
// it only carries opaque preset identifiers, never funnel capability logic.
export type FrozenIntervention = {
  id: string
  slug: string
  name: string
  description?: string
  runtimePresetSlugs?: string[]
  aliases?: string[]
}
