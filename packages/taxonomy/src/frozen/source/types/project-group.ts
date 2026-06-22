import type { FrozenIntervention } from "./intervention"

// ProjectGroup is a persisted, first-class taxonomy entity: catalog
// organization, public navigation, SEO hubs, discovery, analytics and
// reporting. It is NON-operational — it must never participate in
// matching, dispatch, notifications, requests, or funnel routing.
export type FrozenProjectGroup = {
  id: string
  slug: string
  name: string
  description?: string
  aliases?: string[]
  interventions: FrozenIntervention[]
}
