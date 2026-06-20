'use client'

import {
  useRouter,
} from 'next/navigation'

import {
  SearchBar,
} from './search-bar'

import type {
  SearchBarVariant,
  SearchBarSelection,
} from './search-bar'

type FunnelEntryProps = {
  searchVariant?: SearchBarVariant
}

export function FunnelEntry({
  searchVariant = 'default',
}: FunnelEntryProps = {}) {
  const router = useRouter()

  // searchTaxonomy non restituisce più risultati CATEGORY (Phase 20.9G): una
  // Category matchata espande già direttamente ai suoi Intervention lato
  // server. Ogni risultato qui è quindi sempre un Intervention selezionabile
  // che porta dritto al funnel esistente, senza step intermedi.
  function handleSearchSelect({
    result,
    query,
  }: SearchBarSelection) {
    const searchParams = new URLSearchParams()

    if (query.trim()) {
      searchParams.set('q', query.trim())
    }

    const queryString = searchParams.toString()

    router.push(
      `/richiesta/${encodeURIComponent(
        result.slug,
      )}${queryString ? `?${queryString}` : ''}`,
    )
  }

  return (
    <SearchBar
      variant={searchVariant}
      onSelect={handleSearchSelect}
    />
  )
}
