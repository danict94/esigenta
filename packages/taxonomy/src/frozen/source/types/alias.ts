type FrozenAliasOwnerType = "intervention" | "category" | "projectGroup"

export type FrozenAlias = {
  value: string
  ownerType: FrozenAliasOwnerType
  ownerSlug: string
}
