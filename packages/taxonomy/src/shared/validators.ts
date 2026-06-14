import {
  MAX_ALIAS_PER_ENTITY,
  MAX_SERVICES_PER_CATEGORY,
  MAX_SERVICES_PER_INTERVENTION,
} from "./constants"
import { invariant } from "./guards"

import type {
  TaxonomyCategory,
  TaxonomyDomain,
  TaxonomyIntervention,
  TaxonomyService,
  TaxonomySource,
} from "./types"

type EntityWithSlug = {
  slug: string
}

type EntityWithName = {
  name: string
}

type EntityWithAliases = {
  aliases?: string[]
}

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function normalizeSlug(value: string): string {
  return normalizeComparable(value).replace(/[\s_]+/g, "-")
}

function warn(message: string) {
  console.warn(`[taxonomy warning] ${message}`)
}

function assertNonEmptyString(
  value: string,
  label: string,
) {
  invariant(
    value.trim().length > 0,
    `${label} cannot be empty.`,
  )
}

function assertNonEmptyArray<T>(
  values: T[],
  label: string,
) {
  invariant(
    values.length > 0,
    `${label} cannot be empty.`,
  )
}

export function validateUniqueSlugs(
  entities: EntityWithSlug[],
  entityName: string,
) {
  const seen = new Map<string, string>()

  for (const entity of entities) {
    const normalizedSlug = normalizeSlug(entity.slug)
    const existingSlug = seen.get(normalizedSlug)

    invariant(
      !existingSlug,
      `[${entityName}] Duplicate normalized slug: ${entity.slug} collides with ${existingSlug}`,
    )

    seen.set(normalizedSlug, entity.slug)
  }
}

export function validateUniqueNames(
  entities: EntityWithName[],
  entityName: string,
) {
  const seen = new Set<string>()

  for (const entity of entities) {
    const normalized = normalizeComparable(entity.name)

    invariant(
      !seen.has(normalized),
      `[${entityName}] Duplicate name: ${entity.name}`,
    )

    seen.add(normalized)
  }
}

export function validateUniqueAliases(
  entities: Array<EntityWithSlug & EntityWithAliases>,
  entityName: string,
) {
  const seen = new Map<string, string>()

  for (const entity of entities) {
    for (const alias of entity.aliases ?? []) {
      const normalizedAlias = normalizeComparable(alias)
      const existingOwner = seen.get(normalizedAlias)

      assertNonEmptyString(
        alias,
        `[${entityName}:${entity.slug}] alias`,
      )

      invariant(
        !existingOwner,
        `[${entityName}] Duplicate alias "${alias}" on ${entity.slug}; first seen on ${existingOwner}`,
      )

      seen.set(normalizedAlias, entity.slug)
    }
  }
}

function validateAliasHygiene(
  aliases: string[] | undefined,
  params: {
    owner: string
    slug: string
    name: string
  },
) {
  for (const alias of aliases ?? []) {
    const normalizedAlias = normalizeComparable(alias)

    invariant(
      normalizedAlias.length > 0,
      `[${params.owner}] Empty normalized alias.`,
    )

    invariant(
      normalizeSlug(alias) !== normalizeSlug(params.slug),
      `[${params.owner}] Alias "${alias}" must not equal slug "${params.slug}".`,
    )

    invariant(
      normalizedAlias !== normalizeComparable(params.name),
      `[${params.owner}] Alias "${alias}" must not equal name "${params.name}".`,
    )
  }
}

function validateUniqueReferences(
  references: string[],
  owner: string,
) {
  const seen = new Map<string, string>()

  for (const reference of references) {
    const normalizedReference = normalizeSlug(reference)
    const existingReference = seen.get(normalizedReference)

    invariant(
      !existingReference,
      `[${owner}] Duplicate normalized reference: ${reference} collides with ${existingReference}`,
    )

    seen.set(normalizedReference, reference)
  }
}

export function validateServiceReferences(
  references: string[],
  validServices: Set<string>,
  owner: string,
) {
  for (const serviceSlug of references) {
    invariant(
      validServices.has(serviceSlug),
      `[${owner}] Missing service reference: ${serviceSlug}`,
    )
  }
}

export function validateInterventionReferences(
  references: string[],
  validInterventions: Set<string>,
  owner: string,
) {
  for (const interventionSlug of references) {
    invariant(
      validInterventions.has(interventionSlug),
      `[${owner}] Missing intervention reference: ${interventionSlug}`,
    )
  }
}

function validateServiceEntity(service: TaxonomyService) {
  assertNonEmptyString(service.slug, "[service] slug")
  assertNonEmptyString(service.name, `[service:${service.slug}] name`)

  invariant(
    (service.aliases ?? []).length <= MAX_ALIAS_PER_ENTITY,
    `[service:${service.slug}] Too many aliases.`,
  )

  validateAliasHygiene(service.aliases, {
    owner: `service:${service.slug}`,
    slug: service.slug,
    name: service.name,
  })
}

function validateCategoryEntity(
  category: TaxonomyCategory,
  validServices: Set<string>,
  validSectors: Set<string>,
) {
  assertNonEmptyString(category.slug, "[category] slug")
  assertNonEmptyString(category.name, `[category:${category.slug}] name`)
  assertNonEmptyString(
    category.sectorSlug,
    `[category:${category.slug}] sectorSlug`,
  )
  assertNonEmptyArray(
    category.services,
    `[category:${category.slug}] services`,
  )
  validateUniqueReferences(
    category.services,
    `category:${category.slug}:services`,
  )

  invariant(
    validSectors.has(category.sectorSlug),
    `[category:${category.slug}] Missing sector reference: ${category.sectorSlug}`,
  )

  invariant(
    category.services.length <= MAX_SERVICES_PER_CATEGORY,
    `[category:${category.slug}] Too many services.`,
  )

  invariant(
    (category.aliases ?? []).length <= MAX_ALIAS_PER_ENTITY,
    `[category:${category.slug}] Too many aliases.`,
  )

  validateAliasHygiene(category.aliases, {
    owner: `category:${category.slug}`,
    slug: category.slug,
    name: category.name,
  })

  validateServiceReferences(
    category.services,
    validServices,
    `category:${category.slug}`,
  )
}

function validateDomainEntity(
  domain: TaxonomyDomain,
  validInterventions: Set<string>,
) {
  assertNonEmptyString(domain.slug, "[domain] slug")
  assertNonEmptyString(domain.name, `[domain:${domain.slug}] name`)

  if (domain.interventions.length === 0) {
    warn(`[domain:${domain.slug}] has no interventions.`)
  }

  validateUniqueReferences(
    domain.interventions,
    `domain:${domain.slug}:interventions`,
  )

  invariant(
    (domain.aliases ?? []).length <= MAX_ALIAS_PER_ENTITY,
    `[domain:${domain.slug}] Too many aliases.`,
  )

  validateAliasHygiene(domain.aliases, {
    owner: `domain:${domain.slug}`,
    slug: domain.slug,
    name: domain.name,
  })

  validateInterventionReferences(
    domain.interventions,
    validInterventions,
    `domain:${domain.slug}`,
  )
}

function validateInterventionEntity(
  intervention: TaxonomyIntervention,
  validServices: Set<string>,
  categoryServiceSlugs: Set<string>,
  domainInterventionSlugs: Set<string>,
) {
  assertNonEmptyString(intervention.slug, "[intervention] slug")
  assertNonEmptyString(
    intervention.name,
    `[intervention:${intervention.slug}] name`,
  )
  assertNonEmptyArray(
    intervention.services,
    `[intervention:${intervention.slug}] services`,
  )
  validateUniqueReferences(
    intervention.services,
    `intervention:${intervention.slug}:services`,
  )

  invariant(
    intervention.services.length <= MAX_SERVICES_PER_INTERVENTION,
    `[intervention:${intervention.slug}] Too many services.`,
  )

  invariant(
    (intervention.aliases ?? []).length <= MAX_ALIAS_PER_ENTITY,
    `[intervention:${intervention.slug}] Too many aliases.`,
  )

  validateAliasHygiene(intervention.aliases, {
    owner: `intervention:${intervention.slug}`,
    slug: intervention.slug,
    name: intervention.name,
  })

  validateServiceReferences(
    intervention.services,
    validServices,
    `intervention:${intervention.slug}`,
  )

  invariant(
    intervention.services.some((serviceSlug) =>
      categoryServiceSlugs.has(serviceSlug),
    ),
    `[intervention:${intervention.slug}] Orphan intervention: no category exposes any required service.`,
  )

  if (!domainInterventionSlugs.has(intervention.slug)) {
    warn(
      `[intervention:${intervention.slug}] is not referenced by any domain.`,
    )
  }
}

export function validateTaxonomySource(source: TaxonomySource) {
  assertNonEmptyArray(source.sectors, "[taxonomy] sectors")
  assertNonEmptyArray(source.services, "[taxonomy] services")
  assertNonEmptyArray(source.interventions, "[taxonomy] interventions")
  assertNonEmptyArray(source.categories, "[taxonomy] categories")

  if (source.domains.length === 0) {
    warn("[taxonomy] domains is empty.")
  }

  validateUniqueSlugs(source.sectors, "sectors")
  validateUniqueSlugs(source.services, "services")
  validateUniqueSlugs(source.interventions, "interventions")
  validateUniqueSlugs(source.categories, "categories")
  validateUniqueSlugs(source.domains, "domains")

  validateUniqueNames(source.sectors, "sectors")
  validateUniqueNames(source.services, "services")
  validateUniqueNames(source.interventions, "interventions")
  validateUniqueNames(source.categories, "categories")
  validateUniqueNames(source.domains, "domains")

  validateUniqueAliases(source.services, "services")
  validateUniqueAliases(source.interventions, "interventions")
  validateUniqueAliases(source.categories, "categories")
  validateUniqueAliases(source.domains, "domains")

  const allAliasOwners = [
    ...source.services.flatMap((entity) =>
      (entity.aliases ?? []).map((alias) => ({
        alias,
        owner: `service:${entity.slug}`,
      })),
    ),
    ...source.interventions.flatMap((entity) =>
      (entity.aliases ?? []).map((alias) => ({
        alias,
        owner: `intervention:${entity.slug}`,
      })),
    ),
    ...source.categories.flatMap((entity) =>
      (entity.aliases ?? []).map((alias) => ({
        alias,
        owner: `category:${entity.slug}`,
      })),
    ),
    ...source.domains.flatMap((entity) =>
      (entity.aliases ?? []).map((alias) => ({
        alias,
        owner: `domain:${entity.slug}`,
      })),
    ),
  ]

  const globalAliasMap = new Map<string, string>()

  for (const entity of allAliasOwners) {
    const normalizedAlias = normalizeComparable(entity.alias)
    const existingOwner = globalAliasMap.get(normalizedAlias)

    invariant(
      !existingOwner,
      `[taxonomy] Global alias collision: "${entity.alias}" on ${entity.owner} collides with ${existingOwner}`,
    )

    globalAliasMap.set(normalizedAlias, entity.owner)
  }

  const allSlugOwners = [
    ...source.sectors.map((entity) => ({
      slug: entity.slug,
      owner: `sector:${entity.slug}`,
    })),
    ...source.services.map((entity) => ({
      slug: entity.slug,
      owner: `service:${entity.slug}`,
    })),
    ...source.interventions.map((entity) => ({
      slug: entity.slug,
      owner: `intervention:${entity.slug}`,
    })),
    ...source.categories.map((entity) => ({
      slug: entity.slug,
      owner: `category:${entity.slug}`,
    })),
    ...source.domains.map((entity) => ({
      slug: entity.slug,
      owner: `domain:${entity.slug}`,
    })),
  ]

  const globalSlugMap = new Map<string, string>()

  for (const entity of allSlugOwners) {
    const normalizedSlug = normalizeSlug(entity.slug)
    const existingOwner = globalSlugMap.get(normalizedSlug)

    invariant(
      !existingOwner,
      `[taxonomy] Global slug collision: ${entity.owner} collides with ${existingOwner}`,
    )

    globalSlugMap.set(normalizedSlug, entity.owner)
  }

  const sectorSlugs = new Set(
    source.sectors.map((sector) => sector.slug),
  )

  const serviceSlugs = new Set(
    source.services.map((service) => service.slug),
  )

  const interventionSlugs = new Set(
    source.interventions.map((intervention) => intervention.slug),
  )

  const interventionServiceSlugs = new Set(
    source.interventions.flatMap((intervention) => intervention.services),
  )

  const categoryServiceSlugs = new Set(
    source.categories.flatMap((category) => category.services),
  )

  const domainInterventionSlugs = new Set(
    source.domains.flatMap((domain) => domain.interventions),
  )

  for (const service of source.services) {
    validateServiceEntity(service)
  }

  const runtimeDeadServices = source.services
    .filter((service) => !interventionServiceSlugs.has(service.slug))
    .map((service) => service.slug)

  invariant(
    runtimeDeadServices.length === 0,
    `[taxonomy] Runtime-dead services: ${runtimeDeadServices.join(", ")}. Every service must be referenced by at least one intervention.`,
  )

  for (const category of source.categories) {
    validateCategoryEntity(category, serviceSlugs, sectorSlugs)
  }

  for (const domain of source.domains) {
    validateDomainEntity(domain, interventionSlugs)
  }

  for (const intervention of source.interventions) {
    validateInterventionEntity(
      intervention,
      serviceSlugs,
      categoryServiceSlugs,
      domainInterventionSlugs,
    )
  }
}
