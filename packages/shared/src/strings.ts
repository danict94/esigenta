export function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

// Every character below is built from its numeric code point rather than
// typed as a literal glyph, deliberately: this avoids any encoding
// ambiguity in this source file, and (for the diacritic range) avoids a
// real bug found in FASE 8B.1 — the broad Unicode property escape
// \p{Diacritic} also matches standalone ASCII punctuation used AS a
// diacritic (backtick U+0060, circumflex, tilde carry Diacritic=Yes in
// the Unicode database), silently eating a literal backtick out of a
// name instead of leaving a separator. Scoping to the COMBINING
// DIACRITICAL MARKS block (U+0300-U+036F) — the marks NFD decomposition
// actually produces for accented letters — avoids that, and matches the
// pre-existing, in-production algorithm this is modeled on
// (normalizeSearchText in packages/taxonomy/src/queries/search-taxonomy.ts).
const COMBINING_DIACRITIC_RANGE_START = 0x0300
const COMBINING_DIACRITIC_RANGE_END = 0x036f
const COMBINING_DIACRITICS = Array.from(
  { length: COMBINING_DIACRITIC_RANGE_END - COMBINING_DIACRITIC_RANGE_START + 1 },
  (_, offset) => String.fromCharCode(COMBINING_DIACRITIC_RANGE_START + offset),
).join("")
const DIACRITIC_PATTERN = new RegExp(`[${COMBINING_DIACRITICS}]`, "g")

// Curly/backtick apostrophe variants: U+2018 (left single quote), U+2019
// (right single quote), U+0060 (backtick), U+0027 (apostrophe).
const APOSTROPHE_CHARS = [0x2018, 0x2019, 0x0060, 0x0027]
  .map((code) => String.fromCharCode(code))
  .join("")
const APOSTROPHE_PATTERN = new RegExp(`[${APOSTROPHE_CHARS}]`, "g")

/**
 * Case/accent/apostrophe/whitespace-insensitive form of a text, for
 * EQUALITY comparisons only (e.g. "does this explicit user input name the
 * same place as this resolved city?" — see
 * packages/domain/src/internal/geo/resolve-manual-location.ts). Same
 * algorithm as the pre-existing, unexported normalizeSearchText in
 * packages/taxonomy/src/queries/search-taxonomy.ts — reused here as a
 * shared, exported helper rather than duplicated ad hoc or imported
 * across an unrelated domain boundary. Deliberately not a fuzzy/partial
 * match primitive — callers still do exact string equality on the
 * result.
 */
export function normalizeComparableText(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITIC_PATTERN, "")
    .toLowerCase()
    .replace(APOSTROPHE_PATTERN, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}
