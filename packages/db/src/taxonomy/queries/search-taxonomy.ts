import { prisma } from "../../prisma/client"

import {
  listInterventionsForCategory,
} from "../domain"

import type { TaxonomySearchResult } from "../shared/types"

type SearchParams = {
  query: string
}

type SearchQuery = {
  contentTokens: string[]
  normalizedText: string
  tokens: string[]
  terms: string[]
}

type SearchTextScore = {
  matchedTokenCount: number
  score: number
}

const ITALIAN_SEARCH_STOPWORDS = new Set([
  "a",
  "ad",
  "al",
  "alla",
  "alle",
  "allo",
  "all",
  "ai",
  "agli",
  "che",
  "con",
  "d",
  "da",
  "dai",
  "dal",
  "dalla",
  "dalle",
  "dallo",
  "dei",
  "del",
  "della",
  "delle",
  "dello",
  "di",
  "e",
  "ed",
  "fare",
  "gli",
  "ho",
  "i",
  "il",
  "in",
  "l",
  "la",
  "le",
  "lo",
  "mi",
  "nel",
  "nella",
  "per",
  "su",
  "sul",
  "sulla",
  "un",
  "una",
  "uno",
])

const ITALIAN_SEARCH_ACTION_TOKENS = new Set([
  "cambiare",
  "installare",
  "mettere",
  "montare",
  "posare",
  "realizzare",
  "rifare",
  "riparare",
  "ripristinare",
  "ristrutturare",
  "sistemare",
  "sostituire",
])

const SEARCH_LAYER_RELEVANCE = {
  directIntervention: 4000,
  categoryDiscovery: 3000,
  serviceDiscovery: 2500,
  domainDiscovery: 2000,
  category: 1000,
} as const

const POPULAR_INTERVENTION_SLUGS = [
  "rifare-bagno",
  "perdita-acqua",
  "impianto-elettrico-nuovo",
  "installare-climatizzatore",
  "installare-fotovoltaico",
  "tinteggiare-pareti",
  "rifare-tetto",
  "rifare-facciata",
  "posare-pavimento",
  "rifare-balcone",
] as const

const POPULAR_INTERVENTION_BASE_RELEVANCE = 1500

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u0060']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function tokenizeSearchText(value: string): string[] {
  const normalizedText = normalizeSearchText(value)

  if (!normalizedText) {
    return []
  }

  return unique(
    normalizedText
      .split(" ")
      .filter(
        (token) =>
          token.length > 1 &&
          !ITALIAN_SEARCH_STOPWORDS.has(token),
      ),
  )
}

function buildSearchQuery(value: string): SearchQuery {
  const tokens = tokenizeSearchText(value)
  const normalizedText = tokens.join(" ")
  const contentTokens = tokens.filter(
    (token) =>
      !ITALIAN_SEARCH_ACTION_TOKENS.has(token),
  )

  return {
    contentTokens,
    normalizedText,
    tokens,
    terms: unique(
      [normalizedText, ...tokens].filter(
        (term) => term.length > 1,
      ),
    ),
  }
}

function tokenMatchesFieldToken(
  queryToken: string,
  fieldToken: string,
): boolean {
  return (
    fieldToken === queryToken ||
    (queryToken.length >= 4 &&
      fieldToken.startsWith(queryToken))
  )
}

function scoreSearchTexts(
  searchQuery: SearchQuery,
  values: string[],
): SearchTextScore {
  const normalizedValues = values
    .map(normalizeSearchText)
    .filter(Boolean)

  if (
    normalizedValues.length === 0 ||
    searchQuery.tokens.length === 0
  ) {
    return {
      matchedTokenCount: 0,
      score: 0,
    }
  }

  const fieldTokens = unique(
    normalizedValues.flatMap((value) =>
      value.split(" "),
    ),
  )

  const matchedTokenCount =
    searchQuery.tokens.filter((queryToken) =>
      fieldTokens.some((fieldToken) =>
        tokenMatchesFieldToken(
          queryToken,
          fieldToken,
        ),
      ),
    ).length

  const matchedContentTokenCount =
    searchQuery.contentTokens.filter(
      (queryToken) =>
        fieldTokens.some((fieldToken) =>
          tokenMatchesFieldToken(
            queryToken,
            fieldToken,
          ),
        ),
    ).length

  if (
    matchedTokenCount === 0 ||
    (searchQuery.contentTokens.length > 0 &&
      matchedContentTokenCount === 0)
  ) {
    return {
      matchedTokenCount: 0,
      score: 0,
    }
  }

  const hasExactPhrase =
    normalizedValues.some(
      (value) =>
        value ===
        searchQuery.normalizedText,
    )

  const hasStartingPhrase =
    !hasExactPhrase &&
    normalizedValues.some((value) =>
      value.startsWith(
        searchQuery.normalizedText,
      ),
    )

  const hasContainedPhrase =
    !hasExactPhrase &&
    !hasStartingPhrase &&
    normalizedValues.some((value) =>
      value.includes(
        searchQuery.normalizedText,
      ),
    )

  const allTokensMatched =
    matchedTokenCount ===
    searchQuery.tokens.length

  const coverageScore =
    allTokensMatched
      ? 900
      : Math.round(
          (matchedTokenCount /
            searchQuery.tokens.length) *
            400,
        )

  const phraseScore =
    hasExactPhrase
      ? 500
      : hasStartingPhrase
        ? 350
        : hasContainedPhrase
          ? 250
          : 0

  const firstContentToken =
    searchQuery.contentTokens[0]

  const firstContentTokenScore =
    firstContentToken &&
    fieldTokens.some((fieldToken) =>
      tokenMatchesFieldToken(
        firstContentToken,
        fieldToken,
      ),
    )
      ? 180
      : 0

  return {
    matchedTokenCount,
    score:
      coverageScore +
      phraseScore +
      firstContentTokenScore +
      matchedContentTokenCount * 120 +
      matchedTokenCount * 80,
  }
}

function buildRelevance(
  layerRelevance: number,
  textScore: SearchTextScore,
): number {
  return (
    layerRelevance +
    textScore.score +
    textScore.matchedTokenCount
  )
}

function buildTextFilters(
  fieldName: "name" | "slug" | "value",
  terms: string[],
) {
  return terms.map((term) => ({
    [fieldName]: {
      contains: term,
      mode: "insensitive" as const,
    },
  }))
}

function addResult(
  map: Map<string, TaxonomySearchResult>,
  result: TaxonomySearchResult,
) {
  const key = `${result.type}-${result.id}`
  const existing = map.get(key)

  if (!existing || result.relevance > existing.relevance) {
    map.set(key, result)
  }
}

function getTypeSortWeight(
  type: TaxonomySearchResult["type"],
): number {
  return type === "INTERVENTION" ? 0 : 1
}

function sortSearchResults(
  results: TaxonomySearchResult[],
): TaxonomySearchResult[] {
  return [...results].sort(
    (first, second) =>
      second.relevance - first.relevance ||
      getTypeSortWeight(first.type) -
        getTypeSortWeight(second.type) ||
      first.name.localeCompare(
        second.name,
        "it",
      ) ||
      first.slug.localeCompare(
        second.slug,
        "it",
      ),
  )
}

export async function getPopularInterventions(): Promise<
  TaxonomySearchResult[]
> {
  const interventions =
    await prisma.intervention.findMany({
      where: {
        slug: {
          in: [...POPULAR_INTERVENTION_SLUGS],
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
      },
    })

  const interventionsBySlug = new Map(
    interventions.map((intervention) => [
      intervention.slug,
      intervention,
    ]),
  )

  return POPULAR_INTERVENTION_SLUGS.flatMap(
    (slug, index) => {
      const intervention =
        interventionsBySlug.get(slug)

      if (!intervention) {
        return []
      }

      return [
        {
          id: intervention.id,
          type: "INTERVENTION" as const,
          slug: intervention.slug,
          name: intervention.name,
          description:
            intervention.description,
          relevance:
            POPULAR_INTERVENTION_BASE_RELEVANCE -
            index,
        },
      ]
    },
  )
}

export async function searchTaxonomy({
  query,
}: SearchParams): Promise<TaxonomySearchResult[]> {
  const searchQuery = buildSearchQuery(query)

  if (
    !searchQuery.normalizedText ||
    searchQuery.terms.length === 0
  ) {
    return getPopularInterventions()
  }

  const resultMap = new Map<string, TaxonomySearchResult>()

  const [
    interventionAliases,
    categoryAliases,
    serviceAliases,
    domainAliases,
  ] = await Promise.all([
    prisma.interventionAlias.findMany({
      where: {
        OR: buildTextFilters(
          "value",
          searchQuery.terms,
        ),
      },
      select: {
        interventionId: true,
      },
    }),

    prisma.categoryAlias.findMany({
      where: {
        OR: buildTextFilters(
          "value",
          searchQuery.terms,
        ),
      },
      select: {
        categoryId: true,
      },
    }),

    prisma.serviceAlias.findMany({
      where: {
        OR: buildTextFilters(
          "value",
          searchQuery.terms,
        ),
      },
      select: {
        serviceId: true,
      },
    }),

    prisma.domainAlias.findMany({
      where: {
        OR: buildTextFilters(
          "value",
          searchQuery.terms,
        ),
      },
      select: {
        domainId: true,
      },
    }),
  ])

  const interventionAliasIds = interventionAliases.map(
    (alias) => alias.interventionId,
  )

  const categoryAliasIds = categoryAliases.map(
    (alias) => alias.categoryId,
  )

  const serviceAliasIds = serviceAliases.map(
    (alias) => alias.serviceId,
  )

  const domainAliasIds = domainAliases.map(
    (alias) => alias.domainId,
  )

  const directInterventions = await prisma.intervention.findMany({
    where: {
      OR: [
        ...buildTextFilters(
          "name",
          searchQuery.terms,
        ),
        ...buildTextFilters(
          "slug",
          searchQuery.terms,
        ),
        {
          id: {
            in: interventionAliasIds,
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      aliases: {
        select: {
          value: true,
        },
      },
    },
  })

  for (const intervention of directInterventions) {
    const textScore = scoreSearchTexts(
      searchQuery,
      [
        intervention.name,
        intervention.slug,
        ...intervention.aliases.map(
          (alias) => alias.value,
        ),
      ],
    )

    if (textScore.score === 0) {
      continue
    }

    addResult(resultMap, {
      id: intervention.id,
      type: "INTERVENTION",
      slug: intervention.slug,
      name: intervention.name,
      description: intervention.description,
      relevance: buildRelevance(
        SEARCH_LAYER_RELEVANCE.directIntervention,
        textScore,
      ),
    })
  }

  const matchedCategories = await prisma.category.findMany({
    where: {
      OR: [
        ...buildTextFilters(
          "name",
          searchQuery.terms,
        ),
        ...buildTextFilters(
          "slug",
          searchQuery.terms,
        ),
        {
          id: {
            in: categoryAliasIds,
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      aliases: {
        select: {
          value: true,
        },
      },
    },
  })

  const categoryDiscoveryResults =
    await Promise.all(
      matchedCategories.map(
        async (category) => ({
          category,
          interventions:
            await listInterventionsForCategory(
              category.slug,
            ),
        }),
      ),
    )

  for (const {
    category,
    interventions,
  } of categoryDiscoveryResults) {
    const textScore = scoreSearchTexts(
      searchQuery,
      [
        category.name,
        category.slug,
        ...category.aliases.map(
          (alias) => alias.value,
        ),
      ],
    )

    if (textScore.score === 0) {
      continue
    }

    for (const intervention of interventions) {
      addResult(resultMap, {
        id: intervention.id,
        type: "INTERVENTION",
        slug: intervention.slug,
        name: intervention.name,
        description: intervention.description,
        relevance: buildRelevance(
          SEARCH_LAYER_RELEVANCE.categoryDiscovery,
          textScore,
        ),
      })
    }

    addResult(resultMap, {
      id: category.id,
      type: "CATEGORY",
      slug: category.slug,
      name: category.name,
      description: category.description,
      relevance: buildRelevance(
        SEARCH_LAYER_RELEVANCE.category,
        textScore,
      ),
    })
  }

  const matchedServices = await prisma.service.findMany({
    where: {
      OR: [
        ...buildTextFilters(
          "name",
          searchQuery.terms,
        ),
        ...buildTextFilters(
          "slug",
          searchQuery.terms,
        ),
        {
          id: {
            in: serviceAliasIds,
          },
        },
      ],
    },
    select: {
      name: true,
      slug: true,
      aliases: {
        select: {
          value: true,
        },
      },
      interventions: {
        select: {
          intervention: {
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

  for (const service of matchedServices) {
    const textScore = scoreSearchTexts(
      searchQuery,
      [
        service.name,
        service.slug,
        ...service.aliases.map(
          (alias) => alias.value,
        ),
      ],
    )

    if (textScore.score === 0) {
      continue
    }

    for (const relation of service.interventions) {
      const intervention = relation.intervention

      addResult(resultMap, {
        id: intervention.id,
        type: "INTERVENTION",
        slug: intervention.slug,
        name: intervention.name,
        description: intervention.description,
        relevance: buildRelevance(
          SEARCH_LAYER_RELEVANCE.serviceDiscovery,
          textScore,
        ),
      })
    }
  }

  const matchedDomains = await prisma.domain.findMany({
    where: {
      OR: [
        ...buildTextFilters(
          "name",
          searchQuery.terms,
        ),
        ...buildTextFilters(
          "slug",
          searchQuery.terms,
        ),
        {
          id: {
            in: domainAliasIds,
          },
        },
      ],
    },
    select: {
      name: true,
      slug: true,
      aliases: {
        select: {
          value: true,
        },
      },
      interventions: {
        select: {
          intervention: {
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

  for (const domain of matchedDomains) {
    const textScore = scoreSearchTexts(
      searchQuery,
      [
        domain.name,
        domain.slug,
        ...domain.aliases.map(
          (alias) => alias.value,
        ),
      ],
    )

    if (textScore.score === 0) {
      continue
    }

    for (const relation of domain.interventions) {
      const intervention = relation.intervention

      addResult(resultMap, {
        id: intervention.id,
        type: "INTERVENTION",
        slug: intervention.slug,
        name: intervention.name,
        description: intervention.description,
        relevance: buildRelevance(
          SEARCH_LAYER_RELEVANCE.domainDiscovery,
          textScore,
        ),
      })
    }
  }

  return sortSearchResults(
    Array.from(resultMap.values()),
  ).slice(0, 10)
}
