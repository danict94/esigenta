import { prisma } from "@esigenta/database"

import type { TaxonomySearchResult } from "../shared/types"

type SearchParams = {
  query: string
}

type SearchQuery = {
  contentTokens: string[]
  normalizedText: string
  tokens: string[]
  /** Terms eligible to drive the DB candidate-retrieval filter (see MIN_PREFIX_TOKEN_LENGTH). */
  dbFilterTerms: string[]
}

/**
 * Tier hierarchy, strictly ordered. Each tier occupies its own numeric band
 * (see TIER_GAP) so that no amount of intra-tier text score can let a lower
 * tier outrank a higher one.
 */
const RANK_TIER = {
  EXACT: 8,
  ALIAS_EXACT: 7,
  NORMALIZED: 6,
  PREFIX: 5,
  CATEGORY: 4,
  PROJECT_GROUP: 3,
  RELATED: 2,
} as const

type RankTier = (typeof RANK_TIER)[keyof typeof RANK_TIER]

const TIER_GAP = 1_000_000

function tierBase(tier: RankTier): number {
  return tier * TIER_GAP
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

/**
 * Tokens that are technically content-bearing but carry almost no
 * discriminating power across the catalog ("casa", "lavori"...). They are
 * never enough, on their own, to justify a high-confidence tier - a match
 * resting only on these gets pinned to RANK_TIER.RELATED regardless of how
 * many of them matched.
 */
const GENERIC_CONTENT_TOKENS = new Set([
  "casa",
  "lavori",
  "lavoro",
  "servizio",
  "servizi",
  "intervento",
  "interventi",
  "appartamento",
  "edile",
  "edili",
])

/**
 * Prefix matching is only attempted for tokens at least this long, in BOTH
 * the DB candidate-retrieval filter and the JS scoring layer. Below this
 * length, a token only ever contributes via an exact whole-word match on a
 * candidate already retrieved through some other (longer) term - it never
 * drives DB retrieval on its own. This keeps the two layers in agreement:
 * previously the DB filter had no length floor at all (issuing `contains`
 * for any 2+ char token) while the JS scorer required length >= 4 for its
 * prefix rule, so short tokens silently fetched candidates that were always
 * discarded with score 0.
 */
const MIN_PREFIX_TOKEN_LENGTH = 4

const POPULAR_INTERVENTION_SLUGS = [
  "ristrutturare-bagno",
  "riparare-perdita-acqua",
  "fare-impianto-elettrico-nuovo",
  "installare-climatizzatore",
  "installare-fotovoltaico",
  "tinteggiare-interni",
  "rifare-tetto",
  "riparare-tetto",
  "realizzare-parete-cartongesso",
  "disostruire-scarichi",
] as const

const POPULAR_INTERVENTION_BASE_RELEVANCE = 1500

function unique<T>(values: T[]): T[] {
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

/**
 * Stopword-stripped normalization of a stored value, using the SAME pipeline as
 * the query's normalizedText (tokenize -> drop stopwords -> join). Lets a stored
 * alias like "fotovoltaico con accumulo" be recognised as a phrase-exact hit for
 * the query "fotovoltaico con accumulo" (both reduce to "fotovoltaico accumulo"),
 * instead of silently dropping to a token-coincidence tier because the stopword
 * "con" is removed from the query but kept in the stored value.
 */
function stripStopwordsPhrase(value: string): string {
  return tokenizeSearchText(value).join(" ")
}

function buildSearchQuery(value: string): SearchQuery {
  const tokens = tokenizeSearchText(value)
  const normalizedText = tokens.join(" ")
  const contentTokens = tokens.filter(
    (token) => !ITALIAN_SEARCH_ACTION_TOKENS.has(token),
  )

  const dbFilterTerms = unique(
    [normalizedText, ...tokens].filter(
      (term) => term.length >= MIN_PREFIX_TOKEN_LENGTH,
    ),
  )

  return {
    contentTokens,
    normalizedText,
    tokens,
    dbFilterTerms,
  }
}

type TokenMatchKind = "exact" | "prefix" | "none"

function matchTokenAgainstFieldToken(
  queryToken: string,
  fieldToken: string,
): TokenMatchKind {
  if (fieldToken === queryToken) {
    return "exact"
  }

  if (
    queryToken.length >= MIN_PREFIX_TOKEN_LENGTH &&
    fieldToken.startsWith(queryToken)
  ) {
    return "prefix"
  }

  return "none"
}

function matchTokenAgainstFieldTokens(
  queryToken: string,
  fieldTokens: string[],
): TokenMatchKind {
  let best: TokenMatchKind = "none"

  for (const fieldToken of fieldTokens) {
    const kind = matchTokenAgainstFieldToken(queryToken, fieldToken)

    if (kind === "exact") {
      return "exact"
    }

    if (kind === "prefix") {
      best = "prefix"
    }
  }

  return best
}

/**
 * Per-request specificity weights: how much a single matched content token
 * should count toward a candidate's score. Tokens that show up across many
 * of the candidates fetched for *this* query (e.g. "casa" appearing in both
 * the intervention the user actually meant and an unrelated alias) are
 * discounted, the same way a corpus-wide IDF would discount a common word -
 * computed over the request's own candidate pool rather than a precomputed
 * corpus-wide table, so no new storage/infrastructure is introduced.
 */
function buildSpecificityWeights(
  contentTokens: string[],
  candidateTextGroups: string[][],
): Map<string, number> {
  const weights = new Map<string, number>()

  for (const token of contentTokens) {
    const docFrequency = candidateTextGroups.filter(
      (fieldTokens) =>
        matchTokenAgainstFieldTokens(token, fieldTokens) !== "none",
    ).length

    const genericPenalty = GENERIC_CONTENT_TOKENS.has(token) ? 0.3 : 1

    const specificityWeight =
      docFrequency > 0 ? (1 / docFrequency) * genericPenalty : genericPenalty

    weights.set(token, specificityWeight)
  }

  return weights
}

type SearchTextScore = {
  score: number
  matchedTokenCount: number
  hasExactPhrase: boolean
  hasPrefixOnlyMatch: boolean
  allTokensMatchedExactly: boolean
}

const NO_MATCH: SearchTextScore = {
  score: 0,
  matchedTokenCount: 0,
  hasExactPhrase: false,
  hasPrefixOnlyMatch: false,
  allTokensMatchedExactly: false,
}

function scoreSearchTexts(
  searchQuery: SearchQuery,
  values: string[],
  specificityWeights: Map<string, number>,
): SearchTextScore {
  const normalizedValues = values.map(normalizeSearchText).filter(Boolean)

  if (normalizedValues.length === 0 || searchQuery.tokens.length === 0) {
    return NO_MATCH
  }

  // Stopword-stripped forms of the stored values, compared the same way the
  // query's normalizedText is built, so phrase-exactness survives stopwords.
  const strippedValues = values.map(stripStopwordsPhrase).filter(Boolean)

  const matchesPhrase = (predicate: (value: string) => boolean) =>
    normalizedValues.some(predicate) || strippedValues.some(predicate)

  const fieldTokens = unique(
    normalizedValues.flatMap((value) => value.split(" ")),
  )

  let matchedTokenCount = 0
  let hasPrefixOnlyMatch = false
  let allTokensMatchedExactly = true

  for (const queryToken of searchQuery.tokens) {
    const kind = matchTokenAgainstFieldTokens(queryToken, fieldTokens)

    if (kind === "none") {
      allTokensMatchedExactly = false
      continue
    }

    matchedTokenCount += 1

    if (kind === "prefix") {
      hasPrefixOnlyMatch = true
      allTokensMatchedExactly = false
    }
  }

  let matchedContentTokenCount = 0
  let matchedContentWeight = 0

  for (const queryToken of searchQuery.contentTokens) {
    const kind = matchTokenAgainstFieldTokens(queryToken, fieldTokens)

    if (kind === "none") {
      continue
    }

    matchedContentTokenCount += 1
    matchedContentWeight += specificityWeights.get(queryToken) ?? 1
  }

  if (
    matchedTokenCount === 0 ||
    (searchQuery.contentTokens.length > 0 && matchedContentTokenCount === 0)
  ) {
    return NO_MATCH
  }

  const hasExactPhrase = matchesPhrase(
    (value) => value === searchQuery.normalizedText,
  )

  const hasStartingPhrase =
    !hasExactPhrase &&
    matchesPhrase((value) =>
      value.startsWith(searchQuery.normalizedText),
    )

  const hasContainedPhrase =
    !hasExactPhrase &&
    !hasStartingPhrase &&
    matchesPhrase((value) =>
      value.includes(searchQuery.normalizedText),
    )

  const allTokensMatched = matchedTokenCount === searchQuery.tokens.length

  const coverageScore = allTokensMatched
    ? 900
    : Math.round((matchedTokenCount / searchQuery.tokens.length) * 400)

  const phraseScore = hasExactPhrase
    ? 500
    : hasStartingPhrase
      ? 350
      : hasContainedPhrase
        ? 250
        : 0

  const firstContentToken = searchQuery.contentTokens[0]

  const firstContentTokenWeight =
    firstContentToken &&
    matchTokenAgainstFieldTokens(firstContentToken, fieldTokens) !== "none"
      ? (specificityWeights.get(firstContentToken) ?? 1)
      : 0

  const score =
    coverageScore +
    phraseScore +
    firstContentTokenWeight * 180 +
    matchedContentWeight * 120 +
    matchedTokenCount * 80

  return {
    score,
    matchedTokenCount,
    hasExactPhrase,
    hasPrefixOnlyMatch,
    allTokensMatchedExactly: allTokensMatchedExactly && allTokensMatched,
  }
}

/**
 * Maps a raw text score onto the ordered tier hierarchy. An exact phrase
 * match always wins outright, regardless of how generic its tokens are -
 * phrase exactness is a corpus-specific signal (this is the one stored
 * string that equals what the user typed), not a generic one. Below that,
 * a match resting only on generic, low-specificity content tokens (per
 * isMatchedOnlyGeneric) is pinned to RELATED no matter how it would
 * otherwise classify - this is what stops a query like "ristrutturare
 * casa" from letting an unrelated intervention (matched only through the
 * shared word "casa") rank inside the same confidence band as the real
 * match, while still letting the real match ("Ristrutturare casa", an
 * exact phrase) land in EXACT/ALIAS_EXACT even though "casa" alone is
 * generic.
 */
function resolveTier(
  textScore: SearchTextScore,
  matchedOnlyGenericContent: boolean,
): RankTier {
  if (textScore.hasExactPhrase) {
    return RANK_TIER.EXACT
  }

  if (matchedOnlyGenericContent) {
    return RANK_TIER.RELATED
  }

  if (textScore.allTokensMatchedExactly) {
    return RANK_TIER.NORMALIZED
  }

  if (textScore.hasPrefixOnlyMatch) {
    return RANK_TIER.PREFIX
  }

  return RANK_TIER.RELATED
}

function isMatchedOnlyGeneric(
  searchQuery: SearchQuery,
  fieldTokensFlat: string[],
): boolean {
  if (searchQuery.contentTokens.length === 0) {
    return false
  }

  const matchedContentTokens = searchQuery.contentTokens.filter(
    (token) =>
      matchTokenAgainstFieldTokens(token, fieldTokensFlat) !== "none",
  )

  if (matchedContentTokens.length === 0) {
    return false
  }

  return matchedContentTokens.every((token) =>
    GENERIC_CONTENT_TOKENS.has(token),
  )
}

function buildRelevance(tier: RankTier, score: number): number {
  return tierBase(tier) + score
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

function getTypeSortWeight(type: TaxonomySearchResult["type"]): number {
  return type === "INTERVENTION" ? 0 : 1
}

function sortSearchResults(
  results: TaxonomySearchResult[],
): TaxonomySearchResult[] {
  return [...results].sort(
    (first, second) =>
      second.relevance - first.relevance ||
      getTypeSortWeight(first.type) - getTypeSortWeight(second.type) ||
      first.name.localeCompare(second.name, "it") ||
      first.slug.localeCompare(second.slug, "it"),
  )
}

export async function getPopularInterventions(): Promise<
  TaxonomySearchResult[]
> {
  const interventions = await prisma.intervention.findMany({
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
    interventions.map((intervention) => [intervention.slug, intervention]),
  )

  return POPULAR_INTERVENTION_SLUGS.flatMap((slug, index) => {
    const intervention = interventionsBySlug.get(slug)

    if (!intervention) {
      return []
    }

    return [
      {
        id: intervention.id,
        type: "INTERVENTION" as const,
        slug: intervention.slug,
        name: intervention.name,
        description: intervention.description,
        relevance: POPULAR_INTERVENTION_BASE_RELEVANCE - index,
      },
    ]
  })
}

export async function searchTaxonomy({
  query,
}: SearchParams): Promise<TaxonomySearchResult[]> {
  const searchQuery = buildSearchQuery(query)

  if (!searchQuery.normalizedText || searchQuery.dbFilterTerms.length === 0) {
    return getPopularInterventions()
  }

  const resultMap = new Map<string, TaxonomySearchResult>()

  const [interventionAliases, categoryAliases, projectGroupAliases] =
    await Promise.all([
      prisma.interventionAlias.findMany({
        where: {
          OR: buildTextFilters("value", searchQuery.dbFilterTerms),
        },
        select: {
          interventionId: true,
        },
      }),

      prisma.categoryAlias.findMany({
        where: {
          OR: buildTextFilters("value", searchQuery.dbFilterTerms),
        },
        select: {
          categoryId: true,
        },
      }),

      prisma.projectGroupAlias.findMany({
        where: {
          OR: buildTextFilters("value", searchQuery.dbFilterTerms),
        },
        select: {
          projectGroupId: true,
        },
      }),
    ])

  const interventionAliasIds = interventionAliases.map(
    (alias) => alias.interventionId,
  )

  const categoryAliasIds = categoryAliases.map((alias) => alias.categoryId)

  const projectGroupAliasIds = projectGroupAliases.map(
    (alias) => alias.projectGroupId,
  )

  const [directInterventions, matchedCategories, matchedProjectGroups] =
    await Promise.all([
      prisma.intervention.findMany({
        where: {
          OR: [
            ...buildTextFilters("name", searchQuery.dbFilterTerms),
            ...buildTextFilters("slug", searchQuery.dbFilterTerms),
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
      }),

      prisma.category.findMany({
        where: {
          OR: [
            ...buildTextFilters("name", searchQuery.dbFilterTerms),
            ...buildTextFilters("slug", searchQuery.dbFilterTerms),
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
          projectGroupIds: true,
          aliases: {
            select: {
              value: true,
            },
          },
        },
      }),

      prisma.projectGroup.findMany({
        where: {
          OR: [
            ...buildTextFilters("name", searchQuery.dbFilterTerms),
            ...buildTextFilters("slug", searchQuery.dbFilterTerms),
            {
              id: {
                in: projectGroupAliasIds,
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
      }),
    ])

  // Specificity weights are computed once, over every candidate fetched for
  // this request (direct interventions + matched categories + matched
  // project groups), so a token's weight reflects how generic it is *for
  // this query* rather than relying on a precomputed corpus-wide table.
  const candidateTextGroups: string[][] = [
    ...directInterventions.map((intervention) =>
      unique(
        [
          intervention.name,
          intervention.slug,
          ...intervention.aliases.map((alias) => alias.value),
        ]
          .map(normalizeSearchText)
          .flatMap((value) => value.split(" ")),
      ),
    ),
    ...matchedCategories.map((category) =>
      unique(
        [
          category.name,
          category.slug,
          ...category.aliases.map((alias) => alias.value),
        ]
          .map(normalizeSearchText)
          .flatMap((value) => value.split(" ")),
      ),
    ),
    ...matchedProjectGroups.map((projectGroup) =>
      unique(
        [
          projectGroup.name,
          projectGroup.slug,
          ...projectGroup.aliases.map((alias) => alias.value),
        ]
          .map(normalizeSearchText)
          .flatMap((value) => value.split(" ")),
      ),
    ),
  ]

  const specificityWeights = buildSpecificityWeights(
    searchQuery.contentTokens,
    candidateTextGroups,
  )

  for (const intervention of directInterventions) {
    const fieldValues = [
      intervention.name,
      intervention.slug,
      ...intervention.aliases.map((alias) => alias.value),
    ]

    const textScore = scoreSearchTexts(
      searchQuery,
      fieldValues,
      specificityWeights,
    )

    if (textScore.score === 0) {
      continue
    }

    const fieldTokensFlat = unique(
      fieldValues
        .map(normalizeSearchText)
        .flatMap((value) => value.split(" ")),
    )

    // "Alias Exact" outranks a generic exact phrase found only via an alias
    // but should still rank below an exact match against the primary
    // name/slug - detected by checking whether the exact phrase exists in
    // name/slug specifically, separate from the alias-inclusive score above.
    const primaryValues = [intervention.name, intervention.slug]
    const hasExactPhraseInPrimary = [
      ...primaryValues.map(normalizeSearchText),
      ...primaryValues.map(stripStopwordsPhrase),
    ].some((value) => value === searchQuery.normalizedText)

    const matchedOnlyGenericContent = isMatchedOnlyGeneric(
      searchQuery,
      fieldTokensFlat,
    )

    let tier = resolveTier(textScore, matchedOnlyGenericContent)

    if (tier === RANK_TIER.EXACT && !hasExactPhraseInPrimary) {
      tier = RANK_TIER.ALIAS_EXACT
    }

    addResult(resultMap, {
      id: intervention.id,
      type: "INTERVENTION",
      slug: intervention.slug,
      name: intervention.name,
      description: intervention.description,
      relevance: buildRelevance(tier, textScore.score),
    })
  }

  // CATEGORY e' solo un meccanismo interno di discovery: una query che
  // matcha una Category (es. "impresa edile") espande direttamente ai suoi
  // Intervention come risultati INTERVENTION, attraverso ProjectGroup - non
  // viene mai restituita/mostrata una Category come risultato cliccabile a
  // se'. Category -> Service -> Intervention non esiste piu': Category.
  // projectGroupIds e' gia' caricato con la riga (nessun join), e una sola
  // query batch su Intervention.projectGroupId chiude l'espansione per
  // TUTTE le categorie matchate insieme, non una per categoria.
  const matchedCategoriesWithScore = matchedCategories
    .map((category) => ({
      category,
      textScore: scoreSearchTexts(
        searchQuery,
        [
          category.name,
          category.slug,
          ...category.aliases.map((alias) => alias.value),
        ],
        specificityWeights,
      ),
    }))
    .filter(({ textScore }) => textScore.score > 0)

  const matchedProjectGroupsWithScore = matchedProjectGroups
    .map((projectGroup) => ({
      projectGroup,
      textScore: scoreSearchTexts(
        searchQuery,
        [
          projectGroup.name,
          projectGroup.slug,
          ...projectGroup.aliases.map((alias) => alias.value),
        ],
        specificityWeights,
      ),
    }))
    .filter(({ textScore }) => textScore.score > 0)

  const allMatchedProjectGroupIds = unique([
    ...matchedCategoriesWithScore.flatMap(
      ({ category }) => category.projectGroupIds,
    ),
    ...matchedProjectGroupsWithScore.map(
      ({ projectGroup }) => projectGroup.id,
    ),
  ])

  const projectGroupInterventions =
    allMatchedProjectGroupIds.length > 0
      ? await prisma.intervention.findMany({
          where: {
            projectGroupId: {
              in: allMatchedProjectGroupIds,
            },
          },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            projectGroupId: true,
          },
        })
      : []

  const interventionsByProjectGroupId = new Map<
    string,
    typeof projectGroupInterventions
  >()

  for (const intervention of projectGroupInterventions) {
    if (!intervention.projectGroupId) {
      continue
    }

    const existing =
      interventionsByProjectGroupId.get(intervention.projectGroupId) ?? []

    existing.push(intervention)
    interventionsByProjectGroupId.set(intervention.projectGroupId, existing)
  }

  for (const { category, textScore } of matchedCategoriesWithScore) {
    for (const projectGroupId of category.projectGroupIds) {
      for (const intervention of interventionsByProjectGroupId.get(
        projectGroupId,
      ) ?? []) {
        addResult(resultMap, {
          id: intervention.id,
          type: "INTERVENTION",
          slug: intervention.slug,
          name: intervention.name,
          description: intervention.description,
          relevance: buildRelevance(RANK_TIER.CATEGORY, textScore.score),
        })
      }
    }
  }

  // ProjectGroup matched directly (not via a Category) ranks one tier below
  // Category discovery: it is a narrower, more structural signal with no
  // curated "professional identity" framing behind it.
  for (const { projectGroup, textScore } of matchedProjectGroupsWithScore) {
    for (const intervention of interventionsByProjectGroupId.get(
      projectGroup.id,
    ) ?? []) {
      addResult(resultMap, {
        id: intervention.id,
        type: "INTERVENTION",
        slug: intervention.slug,
        name: intervention.name,
        description: intervention.description,
        relevance: buildRelevance(RANK_TIER.PROJECT_GROUP, textScore.score),
      })
    }
  }

  return sortSearchResults(Array.from(resultMap.values())).slice(0, 10)
}
