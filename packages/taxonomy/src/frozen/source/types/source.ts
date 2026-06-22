import type { FrozenCategory } from "./category"
import type { FrozenProjectGroup } from "./project-group"

export type FrozenTaxonomySource = {
  categories: FrozenCategory[]
  projectGroups: FrozenProjectGroup[]
}
